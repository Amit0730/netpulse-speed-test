'use client';

import React from 'react';
import { TestPhase, LiveProgress } from '@/types/speedtest';
import { Check, Clock, Cpu, Gauge, Radio, UploadCloud } from 'lucide-react';

interface StageProgressProps {
  phase: TestPhase;
  liveProgress: LiveProgress;
}

export const StageProgress: React.FC<StageProgressProps> = ({
  phase,
  liveProgress,
}) => {
  const stages = [
    { key: 'preparing', label: 'Preparing', icon: Cpu },
    { key: 'ping', label: 'Testing Latency', icon: Radio },
    { key: 'download', label: 'Testing Download', icon: Gauge },
    { key: 'upload', label: 'Testing Upload', icon: UploadCloud },
    { key: 'calculating', label: 'Calculating Results', icon: Clock },
    { key: 'completed', label: 'Complete', icon: Check },
  ];

  // Helper to determine stage state
  const getStageStatus = (stageIndex: number) => {
    const stageOrder: Record<TestPhase, number> = {
      idle: -1,
      preparing: 0,
      ping: 1,
      download: 2,
      upload: 3,
      calculating: 4,
      completed: 5,
      error: -1,
    };

    const currentIdx = stageOrder[phase];

    if (currentIdx === -1) {
      return 'pending';
    }
    if (stageIndex < currentIdx || phase === 'completed') {
      return 'completed';
    }
    if (stageIndex === currentIdx) {
      return 'active';
    }
    return 'pending';
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      {/* Progress Bar Container */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-xl">
        {/* Top Info Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              {phase !== 'idle' && phase !== 'completed' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  phase === 'completed'
                    ? 'bg-emerald-400'
                    : phase === 'idle'
                    ? 'bg-slate-500'
                    : 'bg-cyan-400'
                }`}
              />
            </span>
            <span className="text-xs font-semibold text-slate-300">
              {liveProgress.currentPhaseText}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
            <div>
              Elapsed: <span className="text-slate-200 font-semibold">{liveProgress.elapsedSeconds}s</span>
            </div>
            <div>
              Progress: <span className="text-cyan-400 font-semibold">{liveProgress.progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar Line */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-400 transition-all duration-300 ease-out"
            style={{ width: `${liveProgress.progressPercent}%` }}
          />
        </div>

        {/* Step Icons & Labels */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {stages.map((stage, idx) => {
            const status = getStageStatus(idx);
            const Icon = stage.icon;

            return (
              <div
                key={stage.key}
                className={`flex flex-col items-center text-center p-2 rounded-xl transition-all duration-300 ${
                  status === 'active'
                    ? 'bg-cyan-500/10 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                    : status === 'completed'
                    ? 'bg-emerald-500/5 border border-emerald-500/20'
                    : 'bg-slate-900/40 border border-slate-800/40 opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                    status === 'active'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {status === 'completed' ? (
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${status === 'active' ? 'animate-pulse' : ''}`} />
                  )}
                </div>

                <span
                  className={`text-[11px] font-medium leading-tight ${
                    status === 'active'
                      ? 'text-cyan-300 font-bold'
                      : status === 'completed'
                      ? 'text-emerald-300'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
