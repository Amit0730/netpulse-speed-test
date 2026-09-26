'use client';

import { Activity, Shield, Wifi, WifiOff } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

interface HeaderProps {
  isOnline: boolean;
  onOpenMethodology: () => void;
  onOpenPrivacy: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  onOpenMethodology,
  onOpenPrivacy,
}) => {
  return (
    <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                NetPulse
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Internet Speed & Network Diagnostics
            </p>
          </div>
        </div>

        {/* Right Nav & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Connection Status Pill */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              isOnline
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">Network Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Methodology Trigger */}
          <button
            onClick={onOpenMethodology}
            className="text-xs font-medium text-slate-300 hover:text-cyan-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all flex items-center space-x-1.5"
            title="How testing works and accuracy limitations"
          >
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Methodology</span>
          </button>

          {/* Privacy Trigger */}
          <button
            onClick={onOpenPrivacy}
            className="text-xs font-medium text-slate-300 hover:text-emerald-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all flex items-center space-x-1.5"
            title="Privacy and data storage policy"
          >
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Privacy</span>
          </button>

          {/* GitHub Repo Link */}
          <a
            href="https://github.com/Amit0730/netpulse-speed-test"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all shadow-sm"
            aria-label="GitHub Repository"
            title="View Source on GitHub"
          >
            <GithubIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
};
