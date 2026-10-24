import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Terminal, 
  ChevronRight,
  BookOpen,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, LearningTrack } from '../types';

interface LessonModalProps {
  lesson: Lesson | null;
  track: LearningTrack | null;
  isCompleted: boolean;
  onClose: () => void;
  onCompleteLesson: (lessonId: string) => void;
  onOpenPythonLab: (code?: string) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  track,
  isCompleted,
  onClose,
  onCompleteLesson,
  onOpenPythonLab,
}) => {
  const [copied, setCopied] = useState(false);

  if (!lesson) return null;

  const handleComplete = () => {
    onCompleteLesson(lesson.id);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCopyCode = () => {
    if (!lesson.codeSnippet?.code) return;
    navigator.clipboard.writeText(lesson.codeSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative my-auto"
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {track?.title.split(' ')[0] || 'Curriculum'}
            </span>
            <span className="text-xs text-slate-400 flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {lesson.readingTime}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleComplete}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isCompleted
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed (+50 XP)' : 'Mark Complete'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Title & Summary */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {lesson.title}
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
              {lesson.summary}
            </p>
          </div>

          {/* Key Takeaways Box */}
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-5 space-y-2.5">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center">
              <Sparkles className="w-4 h-4 mr-1.5 text-indigo-400" />
              Core Engineering Takeaways
            </span>
            <ul className="space-y-2">
              {lesson.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start text-xs sm:text-sm text-slate-200">
                  <span className="text-indigo-400 font-bold mr-2 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Concept Explanation */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white uppercase tracking-wider text-xs">
              Deep Architectural Explanation
            </h3>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-3 font-normal">
              {lesson.conceptExplanation}
            </div>
          </div>

          {/* Python Code Snippet with Run in Python Lab CTA */}
          {lesson.codeSnippet && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-slate-300 font-semibold">
                    {lesson.codeSnippet.caption}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                    Python 3.10
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-1 text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenPythonLab(lesson.codeSnippet?.code);
                      onClose();
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                  >
                    <span>Run in Python Lab</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <pre className="p-4 sm:p-5 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto leading-relaxed">
                {lesson.codeSnippet.code}
              </pre>
            </div>
          )}

          {/* Architectural Notes & Pitfalls to Avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Architecture Notes */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Production System Design Rules:
              </span>
              <ul className="space-y-1.5">
                {lesson.architecturalNotes.map((note, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5 mt-0.5 shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pitfalls to Avoid */}
            <div className="bg-rose-950/20 border border-rose-500/20 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                Common Production Pitfalls:
              </span>
              <ul className="space-y-1.5">
                {lesson.pitfallsToAvoid.map((pitfall, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start">
                    <span className="text-rose-400 font-bold mr-1.5">•</span>
                    <span>{pitfall}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Earn <span className="text-indigo-400 font-bold">+50 XP</span> upon completion
          </span>
          <button
            onClick={handleComplete}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              isCompleted
                ? 'bg-slate-800 text-emerald-400'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
            }`}
          >
            {isCompleted ? 'Completed ✓' : 'Mark Complete & Earn XP'}
          </button>
        </div>
      </div>
    </div>
  );
};
