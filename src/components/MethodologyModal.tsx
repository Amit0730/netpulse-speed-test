'use client';

import React from 'react';
import { X, Activity, Server, Cpu, ShieldAlert } from 'lucide-react';

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MethodologyModal: React.FC<MethodologyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Speed Test Methodology & Accuracy</h3>
            <p className="text-xs text-slate-400">How NetPulse measures your network and key technical limitations</p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="space-y-5 text-xs text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          {/* Section 1: Testing Techniques */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" /> Realistic Browser Measurement Techniques
            </h4>
            <p className="mb-2">
              NetPulse executes authentic HTTP/2 data transfers directly between your browser engine and our edge servers:
            </p>
            <ul className="space-y-1.5 pl-4 list-disc text-slate-400">
              <li>
                <strong className="text-slate-200">Latency (Ping):</strong> Measured via a series of consecutive lightweight HTTP probes with strict anti-caching headers (`no-store`), calculating round-trip duration with sub-millisecond precision (`performance.now()`).
              </li>
              <li>
                <strong className="text-slate-200">Jitter:</strong> Calculated using the standard RFC 3550 variance formula: the average difference between arrival times of consecutive latency probes.
              </li>
              <li>
                <strong className="text-slate-200">Download Speed:</strong> Streams binary chunks across multiple parallel channels using the Fetch API `ReadableStream` reader, calculating instantaneous throughput over sliding windows.
              </li>
              <li>
                <strong className="text-slate-200">Upload Speed:</strong> Transmits binary chunks using `XMLHttpRequest` with native hardware-level `upload.onprogress` listeners to capture exact uploaded byte counts.
              </li>
            </ul>
          </div>

          {/* Section 2: Important Technical Limitations */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Technical & Accuracy Limitations
            </h4>
            <p className="mb-2">
              <strong>NetPulse does not claim ISP-grade or hardware-level accuracy.</strong> Key factors affecting browser-based speed testing:
            </p>
            <ul className="space-y-1.5 pl-4 list-disc text-amber-300/80">
              <li>
                <strong>Browser JavaScript Sandboxing:</strong> Browsers enforce security boundaries, garbage collection cycles, and main-thread scheduling that can introduce minor overhead during multi-gigabit transfers.
              </li>
              <li>
                <strong>Edge Server Distance:</strong> Your throughput is measured to the application server deployment region, not necessarily an ISP server located within your local neighborhood exchange.
              </li>
              <li>
                <strong>HTTP Protocol Overhead:</strong> Browser tests operate at the HTTP/Application layer (Layer 7) rather than raw TCP/IP or socket layer (Layer 4), meaning TLS handshakes and frame encapsulation are accounted for.
              </li>
              <li>
                <strong>Wi-Fi & Local Congestion:</strong> Signal interference, router bufferbloat, and background OS updates directly impact test results.
              </li>
            </ul>
          </div>

          {/* Section 3: Browser Network Information API */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Zero Fabrication Policy
            </h4>
            <p className="text-slate-400">
              When querying browser network telemetry (such as connection type, estimated downlink, and RTT), NetPulse never guesses or fabricates placeholder figures. If a browser (such as Safari or Firefox) does not implement the experimental Network Information API, values are explicitly reported as <strong className="text-white">Unavailable</strong>.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-cyan-500/20"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
