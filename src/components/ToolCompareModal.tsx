import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

interface ToolCompareModalProps {
  toolNames: string[];
  initialToolA?: string;
  initialToolB?: string;
  onClose: () => void;
}

interface ComparisonResult {
  summary: string;
  toolAOverview: {
    name: string;
    bestFor: string;
    strengths: string[];
    drawbacks: string[];
  };
  toolBOverview: {
    name: string;
    bestFor: string;
    strengths: string[];
    drawbacks: string[];
  };
  recommendation: string;
}

export const ToolCompareModal: React.FC<ToolCompareModalProps> = ({
  toolNames,
  initialToolA = 'vLLM (PagedAttention Serving)',
  initialToolB = 'Model Context Protocol (MCP)',
  onClose,
}) => {
  const [toolA, setToolA] = useState(initialToolA);
  const [toolB, setToolB] = useState(initialToolB || toolNames[1] || 'LangGraph');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleCompare = async () => {
    if (!toolA || !toolB) return;
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ai/compare-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolA, toolB }),
      });
      const data = await response.json();
      if (data.comparison) {
        setResult(data.comparison);
      }
    } catch (err) {
      console.error('Error comparing tools:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative my-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Architectural Tool Comparator
              </h2>
              <p className="text-xs text-slate-400">
                AI trade-off decision matrix for engineering teams
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selectors Bar */}
        <div className="p-6 space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Technology A:
              </label>
              <select
                value={toolA}
                onChange={(e) => setToolA(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {toolNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-2 text-slate-500">
              <ArrowRightLeft className="w-4 h-4" />
            </div>

            <div className="flex-1 w-full">
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">
                Technology B:
              </label>
              <select
                value={toolB}
                onChange={(e) => setToolB(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {toolNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto pt-4 sm:pt-4">
              <button
                onClick={handleCompare}
                disabled={loading || toolA === toolB}
                className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loading ? 'Evaluating...' : 'Compare with AI'}</span>
              </button>
            </div>
          </div>

          {/* Results Area */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-400 text-xs">
              <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <p>Analyzing architectures, benchmarks, and production trade-offs with Gemini...</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Executive Summary */}
              <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-indigo-400 uppercase block mb-1">
                  Evaluation Overview:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              {/* Side-by-Side Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tool A */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-extrabold text-sm text-white">
                      {result.toolAOverview.name}
                    </h3>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Best For:
                    </span>
                    <p className="text-xs text-slate-300">
                      {result.toolAOverview.bestFor}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                      Strengths:
                    </span>
                    <ul className="space-y-1">
                      {result.toolAOverview.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5 mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">
                      Limitations:
                    </span>
                    <ul className="space-y-1">
                      {result.toolAOverview.drawbacks.map((d, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 mr-1.5 mt-0.5 shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Tool B */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-extrabold text-sm text-white">
                      {result.toolBOverview.name}
                    </h3>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Best For:
                    </span>
                    <p className="text-xs text-slate-300">
                      {result.toolBOverview.bestFor}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase block mb-1">
                      Strengths:
                    </span>
                    <ul className="space-y-1">
                      {result.toolBOverview.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5 mt-0.5 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-rose-400 uppercase block mb-1">
                      Limitations:
                    </span>
                    <ul className="space-y-1">
                      {result.toolBOverview.drawbacks.map((d, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 mr-1.5 mt-0.5 shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Recommendation Rule */}
              <div className="bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-500/30 rounded-2xl p-4">
                <span className="text-[11px] font-bold text-emerald-400 uppercase block mb-1">
                  Architect's Decision Matrix:
                </span>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {result.recommendation}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-500 text-xs">
              Select two technologies and click 'Compare with AI' to generate a real-world decision matrix.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
