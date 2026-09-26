import { BrowserNetworkInfo, PerformanceRating } from '@/types/speedtest';

/**
 * Calculates RFC 3550 telecommunication jitter from consecutive round-trip times.
 * Jitter measures the statistical variance in latency over time.
 */
export function calculateJitter(rtts: number[]): number {
  if (rtts.length < 2) return 0;
  let diffSum = 0;
  for (let i = 1; i < rtts.length; i++) {
    diffSum += Math.abs(rtts[i] - rtts[i - 1]);
  }
  return Number((diffSum / (rtts.length - 1)).toFixed(1));
}

/**
 * Classifies network quality based on modern broadband and mobile benchmarks.
 * Clearly designated as an approximate heuristic.
 */
export function classifyPerformance(
  downloadMbps: number,
  pingMs: number,
  jitterMs: number
): {
  rating: PerformanceRating;
  description: string;
  activities: { label: string; supported: boolean }[];
  color: string;
  bgGlow: string;
} {
  if (downloadMbps >= 90 && pingMs <= 35 && jitterMs <= 10) {
    return {
      rating: 'Excellent',
      description: 'Ultra-fast throughput with minimal latency. Ideal for high-demand simultaneous workloads.',
      activities: [
        { label: '4K / 8K Ultra HD Streaming', supported: true },
        { label: 'Low-latency Competitive Gaming', supported: true },
        { label: 'HD Multi-party Video Conferences', supported: true },
        { label: 'Large File & Cloud Backups', supported: true },
      ],
      color: 'text-emerald-400',
      bgGlow: 'bg-emerald-500/10 border-emerald-500/30',
    };
  }

  if (downloadMbps >= 30 && pingMs <= 65 && jitterMs <= 25) {
    return {
      rating: 'Good',
      description: 'Reliable and responsive connection for high-quality everyday streaming, work, and gaming.',
      activities: [
        { label: '4K Ultra HD Streaming', supported: true },
        { label: 'Casual Online Gaming', supported: true },
        { label: 'HD Video Conferences', supported: true },
        { label: 'Large File & Cloud Backups', supported: downloadMbps >= 50 },
      ],
      color: 'text-cyan-400',
      bgGlow: 'bg-cyan-500/10 border-cyan-500/30',
    };
  }

  if (downloadMbps >= 10 && pingMs <= 120) {
    return {
      rating: 'Fair',
      description: 'Adequate for standard browsing and single-stream video, but may buffer during peak congestion.',
      activities: [
        { label: '1080p HD Video Streaming', supported: true },
        { label: 'Casual Online Gaming', supported: false },
        { label: 'Standard Definition Video Calls', supported: true },
        { label: 'Large File & Cloud Backups', supported: false },
      ],
      color: 'text-amber-400',
      bgGlow: 'bg-amber-500/10 border-amber-500/30',
    };
  }

  return {
    rating: 'Poor',
    description: 'Significant bandwidth constraints or latency detected. Frequent buffering or lag expected.',
    activities: [
      { label: 'Standard Web Browsing', supported: true },
      { label: 'HD Video Streaming', supported: false },
      { label: 'Real-time Gaming / Audio Calls', supported: false },
      { label: 'Large File & Cloud Backups', supported: false },
    ],
    color: 'text-rose-400',
    bgGlow: 'bg-rose-500/10 border-rose-500/30',
  };
}

/**
 * Safely inspects the browser's Network Information API (navigator.connection)
 * Never fabricates values; strictly returns "Unavailable" if not exposed by the browser.
 */
export function getBrowserNetworkInfo(): BrowserNetworkInfo {
  if (typeof window === 'undefined') {
    return {
      supported: false,
      effectiveType: 'Unavailable',
      downlink: 'Unavailable',
      rtt: 'Unavailable',
      saveData: 'Unavailable',
      type: 'Unavailable',
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

  if (!conn) {
    return {
      supported: false,
      effectiveType: 'Unavailable',
      downlink: 'Unavailable',
      rtt: 'Unavailable',
      saveData: 'Unavailable',
      type: 'Unavailable',
    };
  }

  return {
    supported: true,
    effectiveType: conn.effectiveType ? `${conn.effectiveType.toUpperCase()}` : 'Unavailable',
    downlink: typeof conn.downlink === 'number' ? `~${conn.downlink} Mbps` : 'Unavailable',
    rtt: typeof conn.rtt === 'number' ? `${conn.rtt} ms` : 'Unavailable',
    saveData: typeof conn.saveData === 'boolean' ? (conn.saveData ? 'Enabled' : 'Disabled') : 'Unavailable',
    type: conn.type ? `${conn.type}` : 'Unavailable',
  };
}

export function formatSpeed(val: number): string {
  if (isNaN(val) || val <= 0) return '0.00';
  if (val >= 100) return val.toFixed(1);
  return val.toFixed(2);
}

export function formatMs(val: number): string {
  if (isNaN(val) || val <= 0) return '0';
  return Math.round(val).toString();
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
