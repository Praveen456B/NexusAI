import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  ArrowRight, 
  Briefcase, 
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ExecutiveBrief, RoleType } from '../types';

interface ExecutiveBriefCardProps {
  brief: ExecutiveBrief | null;
  userRole: RoleType;
  isLoading: boolean;
  onRefresh: () => void;
}

export const ExecutiveBriefCard: React.FC<ExecutiveBriefCardProps> = ({
  brief,
  userRole,
  isLoading,
  onRefresh,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  if (!brief && !isLoading) return null;

  const handleToggleAudio = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const textToSpeak = `${brief?.headline}. Executive summary: ${brief?.tldr}. Action for your role as ${userRole}: ${brief?.actionForRole}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 1.05;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Decorative ambient glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-inner">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold tracking-tight text-white uppercase">
                3-Minute Executive AI Brief
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Calibrated for {userRole}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              High-signal synthesis of what changed today & tactical guidance
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Audio narration button */}
          <button
            onClick={handleToggleAudio}
            className={`p-2 rounded-lg border text-xs flex items-center space-x-1.5 transition-all ${
              isPlayingAudio
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={isPlayingAudio ? 'Stop audio' : 'Listen to 60s summary'}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-[11px] font-medium hidden sm:inline">Stop</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium hidden sm:inline">Listen</span>
              </>
            )}
          </button>

          {/* Refresh Brief */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            title="Regenerate with latest feed intelligence"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          {/* Collapse/Expand */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-3 text-slate-400">
          <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-slate-300">
            Synthesizing latest feeds with Gemini 3.8 Flash for {userRole}...
          </p>
        </div>
      ) : brief && isExpanded ? (
        <div className="mt-4 space-y-4 relative z-10 text-xs sm:text-sm">
          {/* Main Headline & TLDR */}
          <div className="bg-slate-950/50 border border-indigo-500/20 rounded-xl p-3.5">
            <h3 className="font-extrabold text-base text-white leading-snug">
              {brief.headline}
            </h3>
            <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
              {brief.tldr}
            </p>
          </div>

          {/* Grid: Key Takeaways & Action for Role */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* 3 Key Takeaways */}
            <div className="md:col-span-7 bg-slate-950/40 border border-slate-800/80 rounded-xl p-3.5">
              <span className="text-[11px] font-bold tracking-wider text-indigo-400 uppercase flex items-center mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Strategic Technical Takeaways
              </span>
              <ul className="space-y-2">
                {brief.keyTakeaways?.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start text-xs text-slate-300 leading-normal">
                    <span className="text-indigo-400 font-bold mr-2 mt-0.5">•</span>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tactical Action for Role */}
            <div className="md:col-span-5 bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-3.5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase flex items-center mb-2">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                  Tactical Action for {userRole}
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {brief.actionForRole}
                </p>
              </div>

              {/* Technologies to watch chips */}
              {brief.techToWatch && brief.techToWatch.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-indigo-500/20">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase">
                    Key Tech to Watch Today:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {brief.techToWatch.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-indigo-500/30 text-indigo-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
