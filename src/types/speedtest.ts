export type TestPhase =
  | 'idle'
  | 'preparing'
  | 'ping'
  | 'download'
  | 'upload'
  | 'calculating'
  | 'completed'
  | 'error';

export type PerformanceRating = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface SpeedMetrics {
  id: string;
  timestamp: number;
  downloadSpeed: number; // in Mbps
  uploadSpeed: number; // in Mbps
  ping: number; // in ms
  jitter: number; // in ms
  rating: PerformanceRating;
  duration: number; // in seconds
  connectionType: string;
  effectiveType?: string;
  serverRegion?: string;
}

export interface LiveProgress {
  phase: TestPhase;
  progressPercent: number; // 0 to 100
  currentSpeed: number; // in Mbps or ms
  currentPhaseText: string;
  elapsedSeconds: number;
  stageStep: number; // 1 to 5
}

export interface BrowserNetworkInfo {
  supported: boolean;
  effectiveType: string; // '4g', '3g', '2g', 'slow-2g' or 'Unavailable'
  downlink: string; // e.g. "10 Mbps" or 'Unavailable'
  rtt: string; // e.g. "50 ms" or 'Unavailable'
  saveData: string; // 'Enabled' | 'Disabled' | 'Unavailable'
  type: string; // 'wifi' | 'cellular' | 'ethernet' | 'Unavailable'
}

export interface ClientServerDiagnostics {
  ip: string;
  location: string;
  serverRegion: string;
  userAgent: string;
}

export interface TestError {
  title: string;
  message: string;
  canRetry: boolean;
}
