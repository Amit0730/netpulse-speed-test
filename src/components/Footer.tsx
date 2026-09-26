'use client';

import { Activity, Shield } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

interface FooterProps {
  onOpenMethodology: () => void;
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenMethodology,
  onOpenPrivacy,
}) => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md mt-16 text-slate-400 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight">
                NetPulse
              </span>
              <p className="text-xs text-slate-400">
                Modern browser-based internet speed and network diagnostics dashboard
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <button
              onClick={onOpenMethodology}
              className="hover:text-cyan-400 transition-colors"
            >
              Methodology & Accuracy
            </button>
            <span>•</span>
            <button
              onClick={onOpenPrivacy}
              className="hover:text-emerald-400 transition-colors"
            >
              Privacy Guarantee
            </button>
            <span>•</span>
            <a
              href="https://github.com/Amit0730/netpulse-speed-test"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        {/* Bottom Credits & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            Built with Next.js, React, TypeScript, and Tailwind CSS.
          </p>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Client-Side Privacy — Zero Data Collection</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
