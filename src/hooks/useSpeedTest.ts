'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  TestPhase,
  LiveProgress,
  SpeedMetrics,
  BrowserNetworkInfo,
  TestError,
} from '@/types/speedtest';
import {
  calculateJitter,
  classifyPerformance,
  getBrowserNetworkInfo,
} from '@/utils/speedtest';

interface UseSpeedTestProps {
  onTestComplete?: (result: SpeedMetrics) => void;
}

export function useSpeedTest({ onTestComplete }: UseSpeedTestProps = {}) {
  const [phase, setPhase] = useState<TestPhase>('idle');
  const [error, setError] = useState<TestError | null>(null);
  const [browserInfo, setBrowserInfo] = useState<BrowserNetworkInfo>(() => getBrowserNetworkInfo());

  // Live progress metrics
  const [liveProgress, setLiveProgress] = useState<LiveProgress>({
    phase: 'idle',
    progressPercent: 0,
    currentSpeed: 0,
    currentPhaseText: 'Ready',
    elapsedSeconds: 0,
    stageStep: 0,
  });

  // Final / active test metrics
  const [metrics, setMetrics] = useState<{
    downloadSpeed: number;
    uploadSpeed: number;
    ping: number;
    jitter: number;
    duration: number;
  }>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    ping: 0,
    jitter: 0,
    duration: 0,
  });

  const [finalResult, setFinalResult] = useState<SpeedMetrics | null>(null);

  // Abort controller and timers ref
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeXhrsRef = useRef<XMLHttpRequest[]>([]);
  const isCancelledRef = useRef<boolean>(false);
  const testStartTimeRef = useRef<number>(0);

  // Update browser network info on mount and when connection changes
  useEffect(() => {
    const updateInfo = () => setBrowserInfo(getBrowserNetworkInfo());
    updateInfo();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn && conn.addEventListener) {
      conn.addEventListener('change', updateInfo);
      return () => conn.removeEventListener('change', updateInfo);
    }
  }, []);

  // Helper to cleanup any ongoing network requests
  const abortAllRequests = useCallback(() => {
    isCancelledRef.current = true;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    activeXhrsRef.current.forEach((xhr) => {
      try {
        xhr.abort();
      } catch {
        // Ignore abort error
      }
    });
    activeXhrsRef.current = [];
  }, []);

  // Cancel the active test
  const cancelTest = useCallback(() => {
    abortAllRequests();
    setPhase('idle');
    setLiveProgress({
      phase: 'idle',
      progressPercent: 0,
      currentSpeed: 0,
      currentPhaseText: 'Test cancelled',
      elapsedSeconds: 0,
      stageStep: 0,
    });
  }, [abortAllRequests]);

  // Reset test state for a fresh run
  const resetTest = useCallback(() => {
    abortAllRequests();
    setError(null);
    setFinalResult(null);
    setPhase('idle');
    setMetrics({
      downloadSpeed: 0,
      uploadSpeed: 0,
      ping: 0,
      jitter: 0,
      duration: 0,
    });
    setLiveProgress({
      phase: 'idle',
      progressPercent: 0,
      currentSpeed: 0,
      currentPhaseText: 'Ready',
      elapsedSeconds: 0,
      stageStep: 0,
    });
  }, [abortAllRequests]);

  // Main Test Runner
  const startTest = useCallback(async () => {
    abortAllRequests();
    isCancelledRef.current = false;
    setError(null);
    setFinalResult(null);

    // Initial check for offline status
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError({
        title: 'Offline',
        message: 'No active internet connection detected. Please check your network and try again.',
        canRetry: true,
      });
      setPhase('error');
      return;
    }

    testStartTimeRef.current = performance.now();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // -------------------------------------------------------------
      // STAGE 1: PREPARING
      // -------------------------------------------------------------
      setPhase('preparing');
      setLiveProgress({
        phase: 'preparing',
        progressPercent: 5,
        currentSpeed: 0,
        currentPhaseText: 'Preparing test server & warm-up...',
        elapsedSeconds: 0,
        stageStep: 1,
      });

      // Quick warm-up probe to verify API server availability
      try {
        const probeRes = await fetch(`/api/speedtest/ping?probe=${Date.now()}`, {
          method: 'GET',
          cache: 'no-store',
          signal: abortController.signal,
        });
        if (!probeRes.ok && probeRes.status !== 204) {
          throw new Error('Speedtest server returned unexpected status code: ' + probeRes.status);
        }
        // Small brief pause so the user sees the preparing phase
        await new Promise((r) => setTimeout(r, 400));
      } catch (err: unknown) {
        if (isCancelledRef.current) return;
        const msg = err instanceof Error ? err.message : 'Speedtest server unreachable';
        setError({
          title: 'Server Unreachable',
          message: `Could not reach diagnostics server: ${msg}. Check if your network blocks API requests.`,
          canRetry: true,
        });
        setPhase('error');
        return;
      }

      if (isCancelledRef.current) return;

      // -------------------------------------------------------------
      // STAGE 2: TESTING LATENCY & JITTER
      // -------------------------------------------------------------
      setPhase('ping');
      setLiveProgress((prev) => ({
        ...prev,
        phase: 'ping',
        progressPercent: 12,
        currentPhaseText: 'Testing Latency & Jitter...',
        stageStep: 2,
      }));

      const rtts: number[] = [];
      const totalPings = 10;

      for (let i = 0; i < totalPings; i++) {
        if (isCancelledRef.current) return;

        const pStart = performance.now();
        await fetch(`/api/speedtest/ping?t=${Date.now()}&seq=${i}`, {
          method: 'GET',
          cache: 'no-store',
          signal: abortController.signal,
        });
        const rtt = Math.max(performance.now() - pStart, 1);
        rtts.push(rtt);

        // Update live progress during ping probes
        const runningAvg = rtts.reduce((a, b) => a + b, 0) / rtts.length;
        const elapsed = (performance.now() - testStartTimeRef.current) / 1000;
        const stepProgress = 12 + ((i + 1) / totalPings) * 16; // 12% to 28%

        setMetrics((prev) => ({
          ...prev,
          ping: Math.round(runningAvg),
        }));

        setLiveProgress({
          phase: 'ping',
          progressPercent: Math.round(stepProgress),
          currentSpeed: Math.round(rtt),
          currentPhaseText: `Testing Latency (${i + 1}/${totalPings}): ${Math.round(rtt)} ms`,
          elapsedSeconds: Number(elapsed.toFixed(1)),
          stageStep: 2,
        });

        // Small interval between pings to simulate natural packet intervals
        await new Promise((r) => setTimeout(r, 50));
      }

      // Compute ping & jitter (disregarding initial TCP handshake outlier if > 3 pings)
      const validRtts = rtts.length > 3 ? rtts.slice(1) : rtts;
      const finalPing = Math.round(validRtts.reduce((a, b) => a + b, 0) / validRtts.length);
      const finalJitter = calculateJitter(validRtts);

      setMetrics((prev) => ({
        ...prev,
        ping: finalPing,
        jitter: finalJitter,
      }));

      if (isCancelledRef.current) return;

      // -------------------------------------------------------------
      // STAGE 3: TESTING DOWNLOAD
      // -------------------------------------------------------------
      setPhase('download');
      setLiveProgress((prev) => ({
        ...prev,
        phase: 'download',
        progressPercent: 30,
        currentPhaseText: 'Testing Download Speed...',
        stageStep: 3,
      }));

      // Multi-stream download to saturate bandwidth
      const downloadStreams = 3;
      const targetDurationMs = 7000; // 7 seconds
      const downloadStart = performance.now();
      let totalBytesReceived = 0;
      let lastWindowBytes = 0;
      let lastWindowTime = downloadStart;
      let currentDownloadMbps = 0;

      // Helper function to stream chunks from one endpoint
      const streamDownload = async (streamId: number) => {
        while (performance.now() - downloadStart < targetDurationMs && !isCancelledRef.current) {
          try {
            const res = await fetch(`/api/speedtest/download?mb=15&s=${streamId}&t=${Date.now()}`, {
              cache: 'no-store',
              signal: abortController.signal,
            });

            if (!res.body) break;
            const reader = res.body.getReader();

            while (performance.now() - downloadStart < targetDurationMs && !isCancelledRef.current) {
              const { done, value } = await reader.read();
              if (done) break;
              if (value) {
                totalBytesReceived += value.byteLength;
              }
            }
            reader.cancel().catch(() => {});
          } catch {
            // Stream loop catches abort or finish
            break;
          }
        }
      };

      // Progress tracker ticker
      const downloadInterval = setInterval(() => {
        if (isCancelledRef.current) {
          clearInterval(downloadInterval);
          return;
        }

        const now = performance.now();
        const durationSec = (now - downloadStart) / 1000;
        const windowDurationSec = (now - lastWindowTime) / 1000;

        if (windowDurationSec >= 0.25) {
          const bytesInWindow = totalBytesReceived - lastWindowBytes;
          const instMbps = (bytesInWindow * 8) / (windowDurationSec * 1_000_000);
          lastWindowBytes = totalBytesReceived;
          lastWindowTime = now;

          // Rolling smoothing
          currentDownloadMbps = currentDownloadMbps === 0 ? instMbps : currentDownloadMbps * 0.4 + instMbps * 0.6;
        }

        const cumulativeMbps = durationSec > 0.3 ? (totalBytesReceived * 8) / (durationSec * 1_000_000) : currentDownloadMbps;
        const displayMbps = Number(Math.max(currentDownloadMbps, cumulativeMbps * 0.9).toFixed(2));
        const progressFrac = Math.min(durationSec / (targetDurationMs / 1000), 1);
        const percent = 30 + progressFrac * 35; // 30% to 65%

        setMetrics((prev) => ({
          ...prev,
          downloadSpeed: displayMbps,
        }));

        setLiveProgress({
          phase: 'download',
          progressPercent: Math.round(percent),
          currentSpeed: displayMbps,
          currentPhaseText: `Testing Download: ${displayMbps} Mbps`,
          elapsedSeconds: Number(((now - testStartTimeRef.current) / 1000).toFixed(1)),
          stageStep: 3,
        });
      }, 100);

      // Run parallel download streams
      await Promise.all(
        Array.from({ length: downloadStreams }, (_, i) => streamDownload(i))
      );
      clearInterval(downloadInterval);

      if (isCancelledRef.current) return;

      const totalDownloadDurationSec = Math.max((performance.now() - downloadStart) / 1000, 0.5);
      const finalDownloadSpeed = Number(
        ((totalBytesReceived * 8) / (totalDownloadDurationSec * 1_000_000)).toFixed(2)
      );

      setMetrics((prev) => ({
        ...prev,
        downloadSpeed: finalDownloadSpeed,
      }));

      // -------------------------------------------------------------
      // STAGE 4: TESTING UPLOAD
      // -------------------------------------------------------------
      setPhase('upload');
      setLiveProgress((prev) => ({
        ...prev,
        phase: 'upload',
        progressPercent: 66,
        currentPhaseText: 'Testing Upload Speed...',
        stageStep: 4,
      }));

      // Pre-create 1MB random payload for realistic upload without client bottleneck
      const payloadSize = 1024 * 1024; // 1 MB
      const payload = new Uint8Array(payloadSize);
      for (let i = 0; i < payloadSize; i++) {
        payload[i] = (i * 47 + 13) & 0xff;
      }

      const uploadStart = performance.now();
      const uploadDurationMs = 6000; // 6 seconds
      let totalBytesUploaded = 0;
      let lastUploadWindowBytes = 0;
      let lastUploadWindowTime = uploadStart;
      let currentUploadMbps = 0;

      // Use XMLHttpRequest for accurate byte-level hardware upload events
      const sendUploadChunk = (): Promise<void> => {
        return new Promise((resolve) => {
          if (isCancelledRef.current || performance.now() - uploadStart >= uploadDurationMs) {
            resolve();
            return;
          }

          const xhr = new XMLHttpRequest();
          activeXhrsRef.current.push(xhr);
          let prevLoaded = 0;

          xhr.upload.onprogress = (evt) => {
            if (evt.loaded) {
              const delta = evt.loaded - prevLoaded;
              prevLoaded = evt.loaded;
              totalBytesUploaded += delta;
            }
          };

          xhr.onload = () => {
            activeXhrsRef.current = activeXhrsRef.current.filter((x) => x !== xhr);
            resolve();
          };

          xhr.onerror = () => {
            activeXhrsRef.current = activeXhrsRef.current.filter((x) => x !== xhr);
            resolve();
          };

          xhr.onabort = () => {
            activeXhrsRef.current = activeXhrsRef.current.filter((x) => x !== xhr);
            resolve();
          };

          xhr.open('POST', `/api/speedtest/upload?t=${Date.now()}`, true);
          xhr.setRequestHeader('Cache-Control', 'no-store, no-cache');
          xhr.send(payload);
        });
      };

      // Upload ticker
      const uploadInterval = setInterval(() => {
        if (isCancelledRef.current) {
          clearInterval(uploadInterval);
          return;
        }

        const now = performance.now();
        const durationSec = (now - uploadStart) / 1000;
        const windowSec = (now - lastUploadWindowTime) / 1000;

        if (windowSec >= 0.25) {
          const delta = totalBytesUploaded - lastUploadWindowBytes;
          const instMbps = (delta * 8) / (windowSec * 1_000_000);
          lastUploadWindowBytes = totalBytesUploaded;
          lastUploadWindowTime = now;
          currentUploadMbps = currentUploadMbps === 0 ? instMbps : currentUploadMbps * 0.4 + instMbps * 0.6;
        }

        const cumulativeMbps = durationSec > 0.3 ? (totalBytesUploaded * 8) / (durationSec * 1_000_000) : currentUploadMbps;
        const displayMbps = Number(Math.max(currentUploadMbps, cumulativeMbps * 0.9).toFixed(2));
        const progressFrac = Math.min(durationSec / (uploadDurationMs / 1000), 1);
        const percent = 66 + progressFrac * 26; // 66% to 92%

        setMetrics((prev) => ({
          ...prev,
          uploadSpeed: displayMbps,
        }));

        setLiveProgress({
          phase: 'upload',
          progressPercent: Math.round(percent),
          currentSpeed: displayMbps,
          currentPhaseText: `Testing Upload: ${displayMbps} Mbps`,
          elapsedSeconds: Number(((now - testStartTimeRef.current) / 1000).toFixed(1)),
          stageStep: 4,
        });
      }, 100);

      // Concurrently dispatch uploads in bursts until duration is met
      const uploadWorker = async () => {
        while (performance.now() - uploadStart < uploadDurationMs && !isCancelledRef.current) {
          await sendUploadChunk();
        }
      };

      // 2 parallel upload workers
      await Promise.all([uploadWorker(), uploadWorker()]);
      clearInterval(uploadInterval);

      if (isCancelledRef.current) return;

      const totalUploadDurationSec = Math.max((performance.now() - uploadStart) / 1000, 0.5);
      const finalUploadSpeed = Number(
        ((totalBytesUploaded * 8) / (totalUploadDurationSec * 1_000_000)).toFixed(2)
      );

      setMetrics((prev) => ({
        ...prev,
        uploadSpeed: finalUploadSpeed,
      }));

      // -------------------------------------------------------------
      // STAGE 5: CALCULATING RESULTS
      // -------------------------------------------------------------
      setPhase('calculating');
      setLiveProgress((prev) => ({
        ...prev,
        phase: 'calculating',
        progressPercent: 96,
        currentPhaseText: 'Calculating Performance Metrics...',
        stageStep: 5,
      }));

      await new Promise((r) => setTimeout(r, 600));

      if (isCancelledRef.current) return;

      // -------------------------------------------------------------
      // STAGE 6: COMPLETE
      // -------------------------------------------------------------
      const totalTestDuration = Number(
        ((performance.now() - testStartTimeRef.current) / 1000).toFixed(1)
      );

      const classification = classifyPerformance(finalDownloadSpeed, finalPing, finalJitter);

      const result: SpeedMetrics = {
        id: `np_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        downloadSpeed: finalDownloadSpeed,
        uploadSpeed: finalUploadSpeed,
        ping: finalPing,
        jitter: finalJitter,
        rating: classification.rating,
        duration: totalTestDuration,
        connectionType: browserInfo.type !== 'Unavailable' ? browserInfo.type : browserInfo.effectiveType,
        effectiveType: browserInfo.effectiveType,
      };

      setFinalResult(result);
      setPhase('completed');
      setLiveProgress({
        phase: 'completed',
        progressPercent: 100,
        currentSpeed: finalDownloadSpeed,
        currentPhaseText: 'Test Complete',
        elapsedSeconds: totalTestDuration,
        stageStep: 5,
      });

      if (onTestComplete) {
        onTestComplete(result);
      }
    } catch (err: unknown) {
      if (isCancelledRef.current) return;
      const msg = err instanceof Error ? err.message : 'Speed test encountered an unexpected issue';
      setError({
        title: 'Test Interrupted',
        message: msg,
        canRetry: true,
      });
      setPhase('error');
    } finally {
      activeXhrsRef.current = [];
      abortControllerRef.current = null;
    }
  }, [abortAllRequests, browserInfo, onTestComplete]);

  return {
    phase,
    liveProgress,
    metrics,
    finalResult,
    error,
    browserInfo,
    startTest,
    cancelTest,
    resetTest,
  };
}
