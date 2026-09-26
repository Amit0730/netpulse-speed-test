'use client';

import React from 'react';
import { ArrowDown, ArrowUp, Activity, Radio, Clock, Wifi } from 'lucide-react';
import { TestPhase, SpeedMetrics } from '@/types/speedtest';
import { formatSpeed, formatMs } from '@/utils/speedtest';

interface MetricsGridProps {
  phase: TestPhase;
  metrics: {
    downloadSpeed: number;
    uploadSpeed: number;
    ping: number;
    jitter: number;
    duration: number;
  };
  finalResult: SpeedMetrics | null;
  connectionType?: string;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  phase,
  metrics,
  finalResult,
  connectionType,
}) => {
  const isCompleted = phase === 'completed';

  const downloadVal = isCompleted && finalResult ? finalResult.downloadSpeed : metrics.downloadSpeed;
  const uploadVal = isCompleted && finalResult ? finalResult.uploadSpeed : metrics.uploadSpeed;
  const pingVal = isCompleted && finalResult ? finalResult.ping : metrics.ping;
  const jitterVal = isCompleted && finalResult ? finalResult.jitter : metrics.jitter;
  const durationVal = isCompleted && finalResult ? finalResult.duration : metrics.duration;

  const cards = [
    {
      id: 'metric-download',
      title: 'DOWNLOAD',
      value: formatSpeed(downloadVal),
      unit: 'Mbps',
      icon: ArrowDown,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      glow: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
      active: phase === 'download',
      description: 'Incoming data throughput',
    },
    {
      id: 'metric-upload',
      title: 'UPLOAD',
      value: formatSpeed(uploadVal),
      unit: 'Mbps',
      icon: ArrowUp,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      glow: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
      active: phase === 'upload',
      description: 'Outgoing transmission speed',
    },
    {
      id: 'metric-ping',
      title: 'LATENCY (PING)',
      value: formatMs(pingVal),
      unit: 'ms',
      icon: Radio,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      glow: 'hover:border-purple-500/40 hover:shadow-purple-500/10',
      active: phase === 'ping',
      description: 'Round-trip response time',
    },
    {
      id: 'metric-jitter',
      title: 'JITTER',
      value: jitterVal > 0 ? jitterVal.toFixed(1) : '0.0',
      unit: 'ms',
      icon: Activity,
      iconColor: 'text-pink-400',
      iconBg: 'bg-pink-500/10 border-pink-500/20',
      glow: 'hover:border-pink-500/40 hover:shadow-pink-500/10',
      active: phase === 'ping',
      description: 'Latency variance stability',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      {/* 4 Diagnostic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={card.id}
              className={`relative bg-slate-900/70 backdrop-blur-md border rounded-2xl p-5 transition-all duration-300 shadow-lg ${
                card.active
                  ? 'border-cyan-500/60 shadow-cyan-500/20 bg-slate-900/90 scale-[1.02]'
                  : 'border-slate-800/80 hover:border-slate-700'
              } ${card.glow}`}
            >
              {/* Header inside card */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.iconBg}`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
                </div>
              </div>

              {/* Main value */}
              <div className="flex items-baseline space-x-1 mb-1">
                <span className="text-3xl font-black font-mono tracking-tight text-white">
                  {card.value}
                </span>
                <span className="text-xs font-bold font-mono text-slate-400">
                  {card.unit}
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                {card.description}
              </p>

              {/* Live status dot */}
              {card.active && (
                <div className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Auxiliary Metadata Bar (Connection Type & Test Duration) */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-slate-900/40 border border-slate-800/50 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Wifi className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Connection Type:{' '}
            <strong className="text-slate-200 uppercase font-mono">
              {connectionType && connectionType !== 'Unavailable' ? connectionType : 'Unavailable'}
            </strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Approx Duration:{' '}
            <strong className="text-slate-200 font-mono">
              {durationVal > 0 ? `${durationVal}s` : '—'}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
};
