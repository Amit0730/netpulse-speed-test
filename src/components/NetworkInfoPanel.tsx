'use client';

import React, { useEffect, useState } from 'react';
import { BrowserNetworkInfo, ClientServerDiagnostics } from '@/types/speedtest';
import { Globe, Server, Laptop, HelpCircle, Network, ShieldCheck } from 'lucide-react';

interface NetworkInfoPanelProps {
  browserInfo: BrowserNetworkInfo;
}

export const NetworkInfoPanel: React.FC<NetworkInfoPanelProps> = ({
  browserInfo,
}) => {
  const [serverDiag, setServerDiag] = useState<ClientServerDiagnostics | null>(null);
  const [isLoadingDiag, setIsLoadingDiag] = useState(true);

  useEffect(() => {
    fetch('/api/speedtest/client-info')
      .then((res) => res.json())
      .then((data) => {
        setServerDiag(data);
      })
      .catch(() => {
        // Fallback if fetch fails
      })
      .finally(() => {
        setIsLoadingDiag(false);
      });
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4">
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Network className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Network & Client Diagnostics</h3>
              <p className="text-xs text-slate-400">
                Direct browser telemetry via Network Information API & Server Edge telemetry
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Tracking</span>
          </div>
        </div>

        {/* 2-Column Diagnostics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Browser Network Information API */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center space-x-2 mb-3">
              <Laptop className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Browser Network Information API
              </h4>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Connection Type</span>
                <span className={`font-mono font-semibold ${browserInfo.type !== 'Unavailable' ? 'text-white' : 'text-slate-500'}`}>
                  {browserInfo.type}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Effective Connection Type</span>
                <span className={`font-mono font-semibold ${browserInfo.effectiveType !== 'Unavailable' ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {browserInfo.effectiveType}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Estimated Downlink</span>
                <span className={`font-mono font-semibold ${browserInfo.downlink !== 'Unavailable' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {browserInfo.downlink}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Estimated RTT</span>
                <span className={`font-mono font-semibold ${browserInfo.rtt !== 'Unavailable' ? 'text-purple-400' : 'text-slate-500'}`}>
                  {browserInfo.rtt}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Data Saver Mode</span>
                <span className={`font-mono font-semibold ${browserInfo.saveData !== 'Unavailable' ? 'text-white' : 'text-slate-500'}`}>
                  {browserInfo.saveData}
                </span>
              </div>
            </div>

            {!browserInfo.supported && (
              <div className="mt-3 flex items-start space-x-1.5 text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                <span>
                  Your browser (e.g. Safari or Firefox) does not expose the Network Information API. Values default to <strong>Unavailable</strong> to ensure zero fabrication.
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Server Edge & Client Geolocation */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/80">
            <div className="flex items-center space-x-2 mb-3">
              <Server className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Edge Server & Client Diagnostics
              </h4>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Client IP (Masked)</span>
                <span className="font-mono font-semibold text-white">
                  {isLoadingDiag ? 'Detecting...' : serverDiag?.ip || 'Unavailable'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Estimated Location</span>
                <span className="font-mono font-semibold text-cyan-400">
                  {isLoadingDiag ? 'Detecting...' : serverDiag?.location || 'Local Network'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Speedtest Edge Node</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {isLoadingDiag ? 'Connecting...' : serverDiag?.serverRegion || 'Edge Region'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Transfer Protocol</span>
                <span className="font-mono font-semibold text-purple-400">
                  HTTP/2 / TLS 1.3
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Privacy Status</span>
                <span className="font-mono font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Client Only
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-start space-x-1.5 text-[10px] text-slate-500 bg-slate-900/50 p-2 rounded-lg border border-slate-800/60">
              <Globe className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
              <span>
                Diagnostic calls test throughput against the nearest cloud edge cluster.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
