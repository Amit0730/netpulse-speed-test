'use client';

import React, { useState } from 'react';
import { SpeedMetrics } from '@/types/speedtest';
import { HistoryChart } from './HistoryChart';
import {
  History,
  Trash2,
  FileJson,
  FileSpreadsheet,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Radio,
  Activity,
  Layers,
} from 'lucide-react';
import { formatSpeed, formatTimestamp } from '@/utils/speedtest';

interface HistorySectionProps {
  history: SpeedMetrics[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
  stats: {
    totalTests: number;
    maxDownload: number;
    maxUpload: number;
    minPing: number;
    avgDownload: number;
    avgUpload: number;
  };
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onDelete,
  onClearAll,
  onExportJSON,
  onExportCSV,
  stats,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const getRatingBadgeColor = (rating: string) => {
    switch (rating) {
      case 'Excellent':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Good':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'Fair':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6" id="test-history">
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Speed Test History
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-medium">
                  {history.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Persistent local test records saved securely in your browser
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {history.length > 0 && (
            <div className="flex items-center space-x-2">
              {/* Export Dropdown / Buttons */}
              <button
                onClick={onExportJSON}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
                title="Export history as JSON"
              >
                <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">JSON</span>
              </button>

              <button
                onClick={onExportCSV}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all shadow-sm"
                title="Export history as CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">CSV</span>
              </button>

              {/* Clear All */}
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-semibold text-rose-400 transition-all shadow-sm"
                title="Clear all test records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            </div>
          )}
        </div>

        {/* Aggregate Stats Cards */}
        {history.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Max Download
              </span>
              <div className="text-lg font-black font-mono text-cyan-400 mt-0.5">
                {formatSpeed(stats.maxDownload)} <span className="text-xs font-normal text-slate-400">Mbps</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Max Upload
              </span>
              <div className="text-lg font-black font-mono text-emerald-400 mt-0.5">
                {formatSpeed(stats.maxUpload)} <span className="text-xs font-normal text-slate-400">Mbps</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Best Ping
              </span>
              <div className="text-lg font-black font-mono text-purple-400 mt-0.5">
                {stats.minPing} <span className="text-xs font-normal text-slate-400">ms</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Avg Download
              </span>
              <div className="text-lg font-black font-mono text-white mt-0.5">
                {formatSpeed(stats.avgDownload)} <span className="text-xs font-normal text-slate-400">Mbps</span>
              </div>
            </div>
          </div>
        )}

        {/* Comparison History Chart */}
        {history.length > 0 && (
          <div className="mb-6">
            <HistoryChart history={history} />
          </div>
        )}

        {/* History Table or Empty State */}
        {history.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No test history yet</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Run your first network speed test above. Your measurements will automatically appear here with full diagnostic metrics.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Date / Time</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">
                    <span className="flex items-center gap-1">
                      <ArrowDown className="w-3 h-3 text-cyan-400" /> Download
                    </span>
                  </th>
                  <th className="py-3 px-3">
                    <span className="flex items-center gap-1">
                      <ArrowUp className="w-3 h-3 text-emerald-400" /> Upload
                    </span>
                  </th>
                  <th className="py-3 px-3">
                    <span className="flex items-center gap-1">
                      <Radio className="w-3 h-3 text-purple-400" /> Ping
                    </span>
                  </th>
                  <th className="py-3 px-3">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-pink-400" /> Jitter
                    </span>
                  </th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3 px-3 text-slate-300 font-sans">
                      {formatTimestamp(item.timestamp)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getRatingBadgeColor(
                          item.rating
                        )}`}
                      >
                        {item.rating}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-cyan-400 font-bold">
                      {formatSpeed(item.downloadSpeed)} <span className="text-[10px] text-slate-400">Mbps</span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-bold">
                      {formatSpeed(item.uploadSpeed)} <span className="text-[10px] text-slate-400">Mbps</span>
                    </td>
                    <td className="py-3 px-3 text-purple-400 font-semibold">
                      {item.ping} <span className="text-[10px] text-slate-400">ms</span>
                    </td>
                    <td className="py-3 px-3 text-pink-400">
                      {item.jitter.toFixed(1)} <span className="text-[10px] text-slate-400">ms</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete test result"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white mb-2">Clear Speed Test History?</h4>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              This will permanently delete all {history.length} saved network performance records from your browser’s local storage. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
