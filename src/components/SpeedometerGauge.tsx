'use client';

import React, { useMemo } from 'react';
import { TestPhase, LiveProgress } from '@/types/speedtest';
import { Play, RotateCcw, XCircle, ArrowDown, ArrowUp, Activity } from 'lucide-react';
import { formatSpeed, formatMs } from '@/utils/speedtest';

interface SpeedometerGaugeProps {
  phase: TestPhase;
  liveProgress: LiveProgress;
  onStart: () => void;
  onCancel: () => void;
  onReset: () => void;
}

export const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({
  phase,
  liveProgress,
  onStart,
  onCancel,
  onReset,
}) => {
  const isIdle = phase === 'idle';
  const isTesting = ['preparing', 'ping', 'download', 'upload', 'calculating'].includes(phase);
  const isCompleted = phase === 'completed';

  // Speedometer geometry
  const radius = 145;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Arc angle spans 260 degrees (from 140deg to 400deg)
  const arcLength = circumference * (260 / 360);

  // Convert speed value (0 to 1000 Mbps) to an arc fraction [0, 1] using a logarithmic-like response
  const arcFraction = useMemo(() => {
    if (isIdle) return 0;
    if (phase === 'ping') {
      // Latency scale: 0 to 200 ms (lower is better, but show progress based on step)
      return Math.min(liveProgress.progressPercent / 100, 1);
    }
    const val = liveProgress.currentSpeed;
    if (val <= 0) return 0;
    // Logarithmic scaling for intuitive representation: 10Mbps ~ 25%, 50Mbps ~ 50%, 200Mbps ~ 75%, 1000Mbps ~ 100%
    if (val <= 10) return (val / 10) * 0.25;
    if (val <= 50) return 0.25 + ((val - 10) / 40) * 0.25;
    if (val <= 200) return 0.50 + ((val - 50) / 150) * 0.25;
    return Math.min(0.75 + ((val - 200) / 800) * 0.25, 1);
  }, [isIdle, phase, liveProgress.currentSpeed, liveProgress.progressPercent]);

  // Dash offset for SVG stroke
  const strokeDashoffset = arcLength - arcLength * arcFraction;

  // Active theme colors
  const activeColor = useMemo(() => {
    switch (phase) {
      case 'ping':
        return '#a855f7'; // Purple
      case 'download':
        return '#06b6d4'; // Cyan
      case 'upload':
        return '#10b981'; // Emerald
      case 'calculating':
        return '#f59e0b'; // Amber
      case 'completed':
        return '#22d3ee'; // Bright Cyan
      default:
        return '#38bdf8';
    }
  }, [phase]);

  // Tick marks definition (label + angle on the 260 deg arc)
  const ticks = [
    { label: '0', frac: 0 },
    { label: '10', frac: 0.25 },
    { label: '50', frac: 0.50 },
    { label: '200', frac: 0.75 },
    { label: '500', frac: 0.88 },
    { label: '1G', frac: 1.0 },
  ];

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* Outer Glow Halo */}
      <div
        className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{
          backgroundColor: activeColor,
          transform: isTesting ? 'scale(1.15)' : 'scale(0.9)',
        }}
      />

      {/* SVG Speedometer Arc */}
      <div className="relative w-[300px] h-[280px] sm:w-[360px] sm:h-[320px] flex items-center justify-center">
        <svg
          className="w-full h-full transform -rotate-130 overflow-visible"
          viewBox="0 0 340 340"
        >
          <defs>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="activeArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              {phase === 'ping' ? (
                <>
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </>
              ) : phase === 'upload' ? (
                <>
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#34d399" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#0284c7" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </>
              )}
            </linearGradient>

            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track Arc */}
          <circle
            cx="170"
            cy="170"
            r={radius}
            fill="none"
            stroke="url(#trackGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
          />

          {/* Active Progress Arc */}
          <circle
            cx="170"
            cy="170"
            r={radius}
            fill="none"
            stroke="url(#activeArcGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter={isTesting ? 'url(#gaugeGlow)' : undefined}
            className="transition-[stroke-dashoffset] duration-200 ease-out"
          />
        </svg>

        {/* Outer Scale Labels & Ticks */}
        <div className="absolute inset-0 pointer-events-none">
          {ticks.map((t, idx) => {
            // Arc goes from 140 to 400 degrees (-130 to 130)
            const angle = 140 + t.frac * 260;
            const rad = (angle * Math.PI) / 180;
            const x = 170 + (radius + 22) * Math.cos(rad);
            const y = 170 + (radius + 22) * Math.sin(rad);

            return (
              <div
                key={idx}
                className="absolute text-[10px] sm:text-xs font-semibold text-slate-500 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${(x / 340) * 100}%`,
                  top: `${(y / 340) * 100}%`,
                }}
              >
                {t.label}
              </div>
            );
          })}
        </div>

        {/* Center Display / Interactive Dial */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4">
          {isIdle ? (
            /* Start Test Central Button */
            <div className="flex flex-col items-center">
              <button
                onClick={onStart}
                id="start-speedtest-btn"
                className="group relative flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/40 hover:border-cyan-400 p-2 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                aria-label="Start Internet Speed Test"
              >
                <div className="absolute inset-2 rounded-full border border-cyan-500/20 group-hover:border-cyan-400/40 transition-colors" />
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <Play className="w-5 h-5 text-cyan-400 fill-cyan-400 ml-0.5 group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="text-base sm:text-lg font-black tracking-wider uppercase text-white group-hover:text-cyan-300 transition-colors">
                    Start Test
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                    NetPulse
                  </span>
                </div>
              </button>
            </div>
          ) : (
            /* Live Speed / Completed Readout */
            <div className="flex flex-col items-center justify-center">
              {/* Active Stage Indicator Pill */}
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-medium mb-1 shadow-sm">
                {phase === 'ping' && <Activity className="w-3.5 h-3.5 text-purple-400 animate-spin" />}
                {phase === 'download' && <ArrowDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />}
                {phase === 'upload' && <ArrowUp className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />}
                {phase === 'calculating' && <RotateCcw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                {phase === 'completed' && <span className="w-2 h-2 rounded-full bg-emerald-400" />}

                <span
                  className="font-semibold uppercase tracking-wider text-[11px]"
                  style={{ color: activeColor }}
                >
                  {phase === 'ping'
                    ? 'Latency Test'
                    : phase === 'download'
                    ? 'Download Test'
                    : phase === 'upload'
                    ? 'Upload Test'
                    : phase === 'calculating'
                    ? 'Analyzing...'
                    : 'Results Complete'}
                </span>
              </div>

              {/* Numerical Value Readout */}
              <div className="flex items-baseline space-x-1 my-1">
                <span className="text-4xl sm:text-6xl font-black tracking-tight font-mono text-white drop-shadow-md">
                  {phase === 'ping'
                    ? formatMs(liveProgress.currentSpeed)
                    : formatSpeed(liveProgress.currentSpeed)}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-400 font-mono">
                  {phase === 'ping' ? 'ms' : 'Mbps'}
                </span>
              </div>

              {/* Progress & Elapsed Time */}
              <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                <span>{liveProgress.progressPercent}%</span>
                <span>•</span>
                <span>{liveProgress.elapsedSeconds}s</span>
              </div>

              {/* Actions below dial */}
              <div className="mt-3 flex items-center space-x-2">
                {isTesting && (
                  <button
                    onClick={onCancel}
                    id="cancel-speedtest-btn"
                    className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}

                {isCompleted && (
                  <button
                    onClick={onReset}
                    id="reset-speedtest-btn"
                    className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Test Again</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
