'use client';

import { useState, useCallback } from 'react';
import { SpeedMetrics } from '@/types/speedtest';

const STORAGE_KEY = 'netpulse_speedtest_history_v1';

export function useTestHistory() {
  const [history, setHistory] = useState<SpeedMetrics[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load speed test history from localStorage', e);
    }
    return [];
  });
  const [isLoaded] = useState(true);

  // Save to localStorage whenever history changes
  const saveToStorage = useCallback((items: SpeedMetrics[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, []);

  const addTestResult = useCallback((result: SpeedMetrics) => {
    setHistory((prev) => {
      // Keep up to 50 most recent tests
      const updated = [result, ...prev].slice(0, 50);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const deleteTestResult = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const clearAllHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear history from localStorage', e);
    }
  }, []);

  const exportAsJSON = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `netpulse-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [history]);

  const exportAsCSV = useCallback(() => {
    if (history.length === 0) return;
    const headers = ['Date', 'Download (Mbps)', 'Upload (Mbps)', 'Ping (ms)', 'Jitter (ms)', 'Rating', 'Connection'];
    const rows = history.map((item) => [
      new Date(item.timestamp).toISOString(),
      item.downloadSpeed,
      item.uploadSpeed,
      item.ping,
      item.jitter,
      item.rating,
      `"${item.connectionType || 'Unknown'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `netpulse-history-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [history]);

  // Aggregate analytics
  const stats = {
    totalTests: history.length,
    maxDownload: history.length > 0 ? Math.max(...history.map((h) => h.downloadSpeed)) : 0,
    maxUpload: history.length > 0 ? Math.max(...history.map((h) => h.uploadSpeed)) : 0,
    minPing: history.length > 0 ? Math.min(...history.map((h) => h.ping)) : 0,
    avgDownload:
      history.length > 0
        ? Number((history.reduce((acc, h) => acc + h.downloadSpeed, 0) / history.length).toFixed(1))
        : 0,
    avgUpload:
      history.length > 0
        ? Number((history.reduce((acc, h) => acc + h.uploadSpeed, 0) / history.length).toFixed(1))
        : 0,
  };

  return {
    history,
    isLoaded,
    addTestResult,
    deleteTestResult,
    clearAllHistory,
    exportAsJSON,
    exportAsCSV,
    stats,
  };
}
