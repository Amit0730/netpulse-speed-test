'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { Header } from '@/components/Header';
import { SpeedometerGauge } from '@/components/SpeedometerGauge';
import { PulseWaveform } from '@/components/PulseWaveform';
import { StageProgress } from '@/components/StageProgress';
import { MetricsGrid } from '@/components/MetricsGrid';
import { PerformanceClassification } from '@/components/PerformanceClassification';
import { NetworkInfoPanel } from '@/components/NetworkInfoPanel';
import { HistorySection } from '@/components/HistorySection';
import { MethodologyModal } from '@/components/MethodologyModal';
import { PrivacyModal } from '@/components/PrivacyModal';
import { Footer } from '@/components/Footer';

import { useSpeedTest } from '@/hooks/useSpeedTest';
import { useTestHistory } from '@/hooks/useTestHistory';
import {
  AlertTriangle,
  RotateCcw,
  Zap,
  ShieldCheck,
  Info,
} from 'lucide-react';

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getServerOnlineSnapshot() {
  return true;
}

export default function Home() {
  const isOnline = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getServerOnlineSnapshot);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // History hook
  const {
    history,
    addTestResult,
    deleteTestResult,
    clearAllHistory,
    exportAsJSON,
    exportAsCSV,
    stats,
  } = useTestHistory();

  // Speed test hook with callback to save to history
  const {
    phase,
    liveProgress,
    metrics,
    finalResult,
    error,
    browserInfo,
    startTest,
    cancelTest,
    resetTest,
  } = useSpeedTest({
    onTestComplete: (result) => {
      addTestResult(result);
    },
  });

  const isTesting = ['preparing', 'ping', 'download', 'upload', 'calculating'].includes(phase);

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Header */}
      <Header
        isOnline={isOnline}
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Section: Speed Test Gauge */}
        <section aria-label="Internet Speed Test" className="relative flex flex-col items-center pt-2 pb-4">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-gradient-to-tr from-cyan-600/10 via-emerald-600/5 to-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Heading and Tagline */}
          <div className="text-center max-w-2xl mx-auto mb-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
              <Zap className="w-3.5 h-3.5 fill-cyan-400" />
              <span>Real-Time Diagnostic Engine</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Measure Your <span className="bg-gradient-to-r from-cyan-400 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">Internet Speed</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">
              Accurate browser-based throughput, round-trip latency, and packet jitter analysis.
            </p>
          </div>

          {/* Speedometer Gauge (Central Focus) */}
          <SpeedometerGauge
            phase={phase}
            liveProgress={liveProgress}
            onStart={startTest}
            onCancel={cancelTest}
            onReset={resetTest}
          />

          {/* Animated Canvas Waveform */}
          <div className="w-full max-w-3xl -mt-6">
            <PulseWaveform phase={phase} speed={liveProgress.currentSpeed} />
          </div>

          {/* Error Message Alert Card */}
          {error && (
            <div className="w-full max-w-xl mx-auto mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 shadow-xl flex items-start space-x-3 animate-in fade-in zoom-in-95">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-rose-200">{error.title}</h4>
                <p className="text-xs text-rose-300/90 mt-1 leading-relaxed">{error.message}</p>
                {error.canRetry && (
                  <button
                    onClick={startTest}
                    className="mt-3 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Live Testing Phase Progression Indicator */}
        {(isTesting || phase === 'completed') && (
          <section aria-label="Testing Stage Progress">
            <StageProgress phase={phase} liveProgress={liveProgress} />
          </section>
        )}

        {/* 4 Metric Cards (Download, Upload, Ping, Jitter) */}
        <section aria-label="Speed Metrics">
          <MetricsGrid
            phase={phase}
            metrics={metrics}
            finalResult={finalResult}
            connectionType={browserInfo.type}
          />
        </section>

        {/* Performance Classification Card (Appears upon completion) */}
        {phase === 'completed' && finalResult && (
          <section aria-label="Performance Classification">
            <PerformanceClassification result={finalResult} />
          </section>
        )}

        {/* Network & Client Diagnostics Telemetry Panel */}
        <section aria-label="Network Information">
          <NetworkInfoPanel browserInfo={browserInfo} />
        </section>

        {/* Test History & Analytics Timeline Section */}
        <section aria-label="Speed Test History">
          <HistorySection
            history={history}
            onDelete={deleteTestResult}
            onClearAll={clearAllHistory}
            onExportJSON={exportAsJSON}
            onExportCSV={exportAsCSV}
            stats={stats}
          />
        </section>

        {/* Educational Privacy & Methodology Banner */}
        <section aria-label="Privacy and Methodology Note" className="w-full max-w-4xl mx-auto px-4">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="text-white block font-medium">Privacy Guaranteed: 100% Client-Side History</strong>
                <span>All measurements stay strictly within your local browser. Zero IP logging or personal data collection.</span>
              </div>
            </div>

            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 shrink-0 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Testing Methodology</span>
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer
        onOpenMethodology={() => setIsMethodologyOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Methodology & Privacy Modals */}
      <MethodologyModal
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
      />
      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />
    </div>
  );
}
