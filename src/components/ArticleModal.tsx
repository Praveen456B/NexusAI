import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Sparkles, 
  Copy, 
  Check, 
  Bookmark, 
  CheckCircle2, 
  FileEdit, 
  Cpu, 
  ShieldAlert, 
  TrendingUp,
  Brain,
  Terminal
} from 'lucide-react';
import { FeedItem, RoleType } from '../types';

interface ArticleModalProps {
  article: FeedItem | null;
  userRole: RoleType;
  isBookmarked: boolean;
  isRead: boolean;
  userNote: string;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
  onToggleRead: (id: string) => void;
  onSaveNote: (id: string, note: string) => void;
  onGainXp: (amount: number, reason: string) => void;
}

interface AnalysisData {
  executiveSummary: string;
  architecturalImpact: string;
  codeTakeaway: string;
  productionReadinessScore: number;
  verdict: string;
  skillToLearn: string;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  userRole,
  isBookmarked,
  isRead,
  userNote,
  onClose,
  onToggleBookmark,
  onToggleRead,
  onSaveNote,
  onGainXp,
}) => {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(true);
  const [noteText, setNoteText] = useState<string>(userNote || '');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  useEffect(() => {
    if (!article) return;
    setNoteText(userNote || '');
    setLoadingAnalysis(true);

    // Call server AI deep-dive endpoint
    fetch('/api/ai/analyze-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: article.title,
        summary: article.summary,
        link: article.link,
        role: userRole,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.analysis) {
          setAnalysis(data.analysis);
          onGainXp(20, 'Analyzed AI Article');
        }
      })
      .catch((err) => {
        console.error('Failed to analyze article:', err);
      })
      .finally(() => {
        setLoadingAnalysis(false);
      });
  }, [article, userRole]);

  if (!article) return null;

  const handleCopyCode = () => {
    if (!analysis?.codeTakeaway) return;
    navigator.clipboard.writeText(analysis.codeTakeaway);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSaveNote = () => {
    onSaveNote(article.id, noteText);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative my-auto"
      >
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {article.source}
            </span>
            <span className="text-xs text-slate-400">
              {article.readTime}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleBookmark(article.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Bookmark article"
            >
              <Bookmark className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={() => onToggleRead(article.id)}
              className={`p-2 rounded-xl border transition-colors ${
                isRead
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Mark as read"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Article Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {article.title}
            </h2>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              {article.summary}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 items-center">
              {article.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded bg-slate-950 text-slate-400 text-xs border border-slate-800">
                  #{t}
                </span>
              ))}
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 ml-auto"
              >
                <span>Read Original Article</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>

          {/* AI Architectural Deep Dive Card */}
          <div className="bg-gradient-to-br from-indigo-950/60 via-slate-950 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold tracking-tight text-white uppercase">
                  Architectural Synthesis for {userRole}
                </h3>
              </div>

              {analysis && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Readiness Score:</span>
                  <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-900 border border-indigo-500/30">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-extrabold text-white">
                      {analysis.productionReadinessScore}/100
                    </span>
                  </div>
                </div>
              )}
            </div>

            {loadingAnalysis ? (
              <div className="py-10 flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs">
                <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <p>Generating architectural impact & code snippet...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-4 text-xs sm:text-sm">
                {/* Executive Summary */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block mb-1">
                    What Broke / What Changed:
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {analysis.executiveSummary}
                  </p>
                </div>

                {/* Architectural & Infrastructure Impact */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1 flex items-center">
                    <Cpu className="w-3.5 h-3.5 mr-1" />
                    System & Infrastructure Impact:
                  </span>
                  <p className="text-slate-200 leading-relaxed">
                    {analysis.architecturalImpact}
                  </p>
                </div>

                {/* Practical Python Code Snippet */}
                {analysis.codeTakeaway && (
                  <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/80 border-b border-slate-800 text-xs">
                      <div className="flex items-center space-x-2 text-slate-300 font-mono">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span>implementation_pattern.py</span>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-4 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                      {analysis.codeTakeaway}
                    </pre>
                  </div>
                )}

                {/* Verdict & Skill to Learn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Adoption Verdict:
                    </span>
                    <p className="text-xs font-semibold text-emerald-300">
                      {analysis.verdict}
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Skill to Level Up:
                    </span>
                    <p className="text-xs font-semibold text-indigo-300">
                      {analysis.skillToLearn}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Personal Working Notes */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <FileEdit className="w-3.5 h-3.5 text-indigo-400" />
                <span>My Personal Career Notes & Ideas for Work:</span>
              </label>
              {noteSaved && (
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center">
                  <Check className="w-3 h-3 mr-1" /> Saved
                </span>
              )}
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Discuss with Tech Lead about implementing this MCP pattern for our billing microservice..."
              rows={3}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSaveNote}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
