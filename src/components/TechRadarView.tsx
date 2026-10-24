import React, { useState, useMemo } from 'react';
import { 
  Compass, 
  Search, 
  ExternalLink, 
  Copy, 
  Check, 
  Scale, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  Terminal, 
  Layers, 
  Cpu, 
  Zap,
  Bookmark
} from 'lucide-react';
import { TechTool } from '../types';
import { TECH_RADAR_TOOLS } from '../data/techRadar';
import { ToolCompareModal } from './ToolCompareModal';

interface TechRadarViewProps {
  onOpenPythonLab: (initialCode?: string) => void;
  onBookmarkTool: (toolId: string) => void;
  bookmarkedToolIds: string[];
}

export const TechRadarView: React.FC<TechRadarViewProps> = ({
  onOpenPythonLab,
  onBookmarkTool,
  bookmarkedToolIds,
}) => {
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const stages = ['All', 'Adopt', 'Trial', 'Assess', 'Hold'];
  const categories = [
    'All',
    'Agents & Protocol',
    'Inference & Serving',
    'RAG & Storage',
    'Fine-Tuning & Training',
    'Evals & Guardrails',
    'Dev Productivity',
  ];

  const filteredTools = useMemo(() => {
    return TECH_RADAR_TOOLS.filter((tool) => {
      if (selectedStage !== 'All' && tool.stage !== selectedStage) return false;
      if (selectedCategory !== 'All' && tool.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tool.name.toLowerCase().includes(q);
        const matchesDesc = tool.description.toLowerCase().includes(q);
        const matchesWhy = tool.whyItMatters.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesWhy) return false;
      }
      return true;
    });
  }, [selectedStage, selectedCategory, searchQuery]);

  const handleCopyCode = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStageColor = (stage: TechTool['stage']) => {
    switch (stage) {
      case 'Adopt':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Trial':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'Assess':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Hold':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Strategy Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Compass className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Enterprise AI Tech & Tools Radar
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Track emerging frameworks, protocols, and inference engines. Evaluated across production readiness, licensing, latency, and team adoption friction.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Scale className="w-4 h-4" />
              <span>Compare 2 Tools with AI</span>
            </button>
          </div>
        </div>

        {/* Quadrant Legend Bar */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-2.5">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>ADOPT</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Battle-tested in production. Recommended default.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-cyan-500/20 rounded-xl p-2.5">
            <div className="flex items-center space-x-1.5 text-cyan-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>TRIAL</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              High potential in non-critical sandboxes.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-2.5">
            <div className="flex items-center space-x-1.5 text-amber-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>ASSESS</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Watch closely; evaluate architectural maturity.
            </p>
          </div>

          <div className="bg-slate-950/60 border border-rose-500/20 rounded-xl p-2.5">
            <div className="flex items-center space-x-1.5 text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>HOLD</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Avoid for new projects; plan deprecation.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tools by name, problem, or technology..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer w-full sm:w-auto"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stage Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedStage === stage
                  ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTools.map((tool) => {
          const isBookmarked = bookmarkedToolIds.includes(tool.id);

          return (
            <div
              key={tool.id}
              className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-extrabold text-base text-white">
                        {tool.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getStageColor(tool.stage)}`}>
                        {tool.stage}
                      </span>
                    </div>
                    <span className="text-xs text-cyan-400 font-semibold mt-0.5 block">
                      {tool.category}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onBookmarkTool(tool.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isBookmarked
                          ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark tool'}
                    >
                      <Bookmark className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {tool.githubOrSite && (
                      <a
                        href={tool.githubOrSite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Open documentation"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tool.description}
                </p>

                {/* Why It Matters Callout */}
                <div className="mt-3 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Why Working Professionals Need This:
                  </span>
                  <p className="text-xs text-slate-200 leading-normal font-medium">
                    {tool.whyItMatters}
                  </p>
                </div>

                {/* Pros and Cons */}
                <div className="mt-3.5 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                      Strengths:
                    </span>
                    <ul className="space-y-0.5">
                      {tool.pros.map((p, idx) => (
                        <li key={idx} className="text-[11px] text-slate-300 flex items-start">
                          <span className="text-emerald-400 mr-1">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-950/20 border border-rose-500/20 rounded-lg p-2">
                    <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">
                      Trade-offs:
                    </span>
                    <ul className="space-y-0.5">
                      {tool.cons.map((c, idx) => (
                        <li key={idx} className="text-[11px] text-slate-400 flex items-start">
                          <span className="text-rose-400 mr-1">•</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Quick Python Code Snippet if present */}
                {tool.quickCodeSnippet && (
                  <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-mono">Python Quickstart</span>
                      <button
                        onClick={() => handleCopyCode(tool.id, tool.quickCodeSnippet || '')}
                        className="text-slate-400 hover:text-white flex items-center space-x-1"
                      >
                        {copiedId === tool.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === tool.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-3 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                      {tool.quickCodeSnippet}
                    </pre>
                  </div>
                )}
              </div>

              {/* Card Footer: Metadata and Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-medium">
                    {tool.maturity}
                  </span>
                  <span>{tool.license}</span>
                </div>

                <button
                  onClick={() => onOpenPythonLab(tool.quickCodeSnippet)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Run in Python Lab</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tool Comparison Modal */}
      {showCompareModal && (
        <ToolCompareModal
          toolNames={TECH_RADAR_TOOLS.map((t) => t.name)}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </div>
  );
};
