import React, { useState } from 'react';
import { Download, Smartphone, Monitor, Share, X, CheckCircle2, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  // If already running in standalone mode, hide button
  if (isInstalled) {
    return (
      <span className="hidden lg:inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>App Installed</span>
      </span>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all cursor-pointer active:scale-95 animate-pulse"
        title="Download and install NexusAI as a standalone app"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Download App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 p-0.5 mx-auto mb-4">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-indigo-400" />
                </div>
              </div>

              <h3 className="text-base font-bold text-white text-center">
                Install NexusAI on iPhone / iPad
              </h3>
              <p className="mt-1 text-xs text-slate-400 text-center">
                Add to Home Screen for native offline access and full-screen experience.
              </p>

              <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">1</span>
                  <span>Tap the <strong className="text-white">Share</strong> button in Safari toolbar</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>Scroll down and tap <strong className="text-white">Add to Home Screen</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px]">3</span>
                  <span>Tap <strong className="text-white">Add</strong> in the top right corner</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback for browsers before prompt fires or desktop browsers
  return (
    <>
      <button
        onClick={() => setShowDesktopGuide(true)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
        title="Download NexusAI App"
      >
        <Download className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {showDesktopGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <button
              onClick={() => setShowDesktopGuide(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 p-0.5 mx-auto mb-4">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Monitor className="w-6 h-6 text-cyan-400" />
              </div>
            </div>

            <h3 className="text-base font-bold text-white text-center">
              Install NexusAI on Desktop
            </h3>
            <p className="mt-1 text-xs text-slate-400 text-center">
              Run NexusAI as a standalone desktop application.
            </p>

            <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] mt-0.5">1</span>
                <span>In Chrome / Edge, click the <strong>Install</strong> icon in the address bar (or Menu &gt; Install NexusAI).</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] mt-0.5">2</span>
                <span>The app launches in an isolated native window without browser clutter.</span>
              </div>
            </div>

            <button
              onClick={() => setShowDesktopGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
