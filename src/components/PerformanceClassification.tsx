'use client';

import React from 'react';
import { SpeedMetrics } from '@/types/speedtest';
import { classifyPerformance, formatSpeed, formatMs } from '@/utils/speedtest';
import { CheckCircle2, XCircle, Award, AlertCircle, Sparkles } from 'lucide-react';

interface PerformanceClassificationProps {
  result: SpeedMetrics;
}

export const PerformanceClassification: React.FC<PerformanceClassificationProps> = ({
  result,
}) => {
  const analysis = classifyPerformance(result.downloadSpeed, result.ping, result.jitter);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`relative bg-slate-900/80 backdrop-blur-xl border rounded-2xl p-6 sm:p-8 shadow-2xl ${analysis.bgGlow}`}>
        {/* Header with Classification Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Internet Performance Evaluation
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Overall Rating:
              <span className={`px-3 py-1 rounded-xl text-lg sm:text-xl font-extrabold border ${analysis.color} bg-slate-950/80 border-current shadow-sm`}>
                {analysis.rating}
              </span>
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400 max-w-xs">
            <Award className="w-8 h-8 text-cyan-400 shrink-0" />
            <p className="leading-snug">{analysis.description}</p>
          </div>
        </div>

        {/* 4 Summary Result Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Download</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-cyan-400">
              {formatSpeed(result.downloadSpeed)} <span className="text-xs font-normal text-slate-400">Mbps</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Upload</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
              {formatSpeed(result.uploadSpeed)} <span className="text-xs font-normal text-slate-400">Mbps</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Ping (RTT)</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-purple-400">
              {formatMs(result.ping)} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="text-[11px] font-semibold text-slate-400 uppercase mb-1">Jitter</div>
            <div className="text-xl sm:text-2xl font-black font-mono text-pink-400">
              {result.jitter.toFixed(1)} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
          </div>
        </div>

        {/* Workload / Activities Suitability Matrix */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Supported Online Activities
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {analysis.activities.map((act, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-3 p-3 rounded-xl bg-slate-950/40 border border-slate-800/60"
              >
                {act.supported ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className={`text-xs font-medium ${act.supported ? 'text-slate-200' : 'text-slate-500'}`}>
                  {act.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mandatory Approximate Disclaimer Note */}
        <div className="mt-6 flex items-start space-x-2.5 p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/20 text-[11px] text-amber-300/90 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>Approximate Evaluation:</strong> These classifications and performance tiers are approximate estimates based on modern browser throughput to server edge nodes. Actual hardware line capacity from your Internet Service Provider (ISP) may differ due to Wi-Fi signal interference, browser sandboxing, and edge routing.
          </p>
        </div>
      </div>
    </div>
  );
};
