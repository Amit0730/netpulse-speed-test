'use client';

import React, { useState, useMemo } from 'react';
import { SpeedMetrics } from '@/types/speedtest';
import { formatSpeed, formatTimestamp } from '@/utils/speedtest';
import { TrendingUp } from 'lucide-react';

interface HistoryChartProps {
  history: SpeedMetrics[];
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ history }) => {
  const [showDownload, setShowDownload] = useState(true);
  const [showUpload, setShowUpload] = useState(true);
  const [showPing, setShowPing] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take up to 15 most recent tests and sort chronologically (oldest to newest for the chart timeline)
  const chartData = useMemo(() => {
    return [...history].slice(0, 15).reverse();
  }, [history]);

  if (chartData.length < 2) {
    return (
      <div className="w-full bg-slate-950/60 rounded-xl p-8 border border-slate-800 text-center">
        <TrendingUp className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-300">Trend Chart Needs More Data</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Complete at least 2 speed tests to unlock the network performance trend comparison chart.
        </p>
      </div>
    );
  }

  // Chart dimensions
  const width = 640;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  // Max values for auto-scaling
  const maxSpeed = Math.max(
    ...chartData.map((d) => Math.max(d.downloadSpeed, d.uploadSpeed)),
    10
  );
  const maxPing = Math.max(...chartData.map((d) => d.ping), 20);

  // Coordinate mapping
  const getX = (index: number) => {
    return paddingX + (index / (chartData.length - 1)) * (width - 2 * paddingX);
  };

  const getSpeedY = (val: number) => {
    return height - paddingY - (val / (maxSpeed * 1.15)) * (height - 2 * paddingY);
  };

  const getPingY = (val: number) => {
    return height - paddingY - (val / (maxPing * 1.15)) * (height - 2 * paddingY);
  };

  // Build SVG path strings
  const downloadPoints = chartData.map((d, i) => `${getX(i)},${getSpeedY(d.downloadSpeed)}`).join(' ');
  const uploadPoints = chartData.map((d, i) => `${getX(i)},${getSpeedY(d.uploadSpeed)}`).join(' ');
  const pingPoints = chartData.map((d, i) => `${getX(i)},${getPingY(d.ping)}`).join(' ');

  return (
    <div className="w-full bg-slate-950/60 rounded-xl p-4 sm:p-5 border border-slate-800">
      {/* Chart Header & Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Performance Trend Timeline
          </h4>
          <p className="text-xs text-slate-400">Comparing last {chartData.length} tests over time</p>
        </div>

        {/* Toggle Pills */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDownload(!showDownload)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              showDownload
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Download
          </button>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              showUpload
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Upload
          </button>
          <button
            onClick={() => setShowPing(!showPing)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              showPing
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-400'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            Ping
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full aspect-[21/9] min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = height - paddingY - pct * (height - 2 * paddingY);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#64748b"
                  fontFamily="monospace"
                >
                  {Math.round(pct * maxSpeed)}M
                </text>
              </g>
            );
          })}

          {/* Download Path & Area */}
          {showDownload && (
            <>
              <polygon
                points={`${getX(0)},${height - paddingY} ${downloadPoints} ${getX(chartData.length - 1)},${height - paddingY}`}
                fill="url(#downloadGrad)"
              />
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={downloadPoints}
              />
              {chartData.map((d, i) => (
                <circle
                  key={`dl-${i}`}
                  cx={getX(i)}
                  cy={getSpeedY(d.downloadSpeed)}
                  r={hoveredIndex === i ? 5 : 3.5}
                  fill="#0891b2"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                  className="transition-all"
                />
              ))}
            </>
          )}

          {/* Upload Path & Area */}
          {showUpload && (
            <>
              <polygon
                points={`${getX(0)},${height - paddingY} ${uploadPoints} ${getX(chartData.length - 1)},${height - paddingY}`}
                fill="url(#uploadGrad)"
              />
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={uploadPoints}
              />
              {chartData.map((d, i) => (
                <circle
                  key={`ul-${i}`}
                  cx={getX(i)}
                  cy={getSpeedY(d.uploadSpeed)}
                  r={hoveredIndex === i ? 5 : 3.5}
                  fill="#059669"
                  stroke="#34d399"
                  strokeWidth="1.5"
                  className="transition-all"
                />
              ))}
            </>
          )}

          {/* Ping Path */}
          {showPing && (
            <>
              <polyline
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
                strokeDasharray="3 3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pingPoints}
              />
              {chartData.map((d, i) => (
                <circle
                  key={`p-${i}`}
                  cx={getX(i)}
                  cy={getPingY(d.ping)}
                  r={hoveredIndex === i ? 4.5 : 3}
                  fill="#7c3aed"
                  stroke="#c084fc"
                  strokeWidth="1.5"
                  className="transition-all"
                />
              ))}
            </>
          )}

          {/* Transparent Hover Interactivity Pillars */}
          {chartData.map((d, i) => {
            const x = getX(i);
            return (
              <g
                key={`hover-${i}`}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x - (width / chartData.length) / 2}
                  y={paddingY}
                  width={width / chartData.length}
                  height={height - 2 * paddingY}
                  fill="transparent"
                />
                {hoveredIndex === i && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={height - paddingY}
                    stroke="#475569"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div
            className="absolute top-2 pointer-events-none bg-slate-900/95 border border-slate-700/80 rounded-xl p-2.5 shadow-xl text-xs space-y-1 transform -translate-x-1/2 transition-all duration-150 z-20"
            style={{
              left: `${(getX(hoveredIndex) / width) * 100}%`,
            }}
          >
            <div className="text-[10px] text-slate-400 font-mono pb-1 border-b border-slate-800">
              {formatTimestamp(chartData[hoveredIndex].timestamp)}
            </div>
            {showDownload && (
              <div className="flex items-center justify-between space-x-3 text-cyan-400 font-mono">
                <span>Download:</span>
                <span className="font-bold">{formatSpeed(chartData[hoveredIndex].downloadSpeed)} Mbps</span>
              </div>
            )}
            {showUpload && (
              <div className="flex items-center justify-between space-x-3 text-emerald-400 font-mono">
                <span>Upload:</span>
                <span className="font-bold">{formatSpeed(chartData[hoveredIndex].uploadSpeed)} Mbps</span>
              </div>
            )}
            {showPing && (
              <div className="flex items-center justify-between space-x-3 text-purple-400 font-mono">
                <span>Ping:</span>
                <span className="font-bold">{chartData[hoveredIndex].ping} ms</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
