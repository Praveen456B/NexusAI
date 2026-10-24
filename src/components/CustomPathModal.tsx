import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Compass, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { LearningTrack, RoleType } from '../types';

interface CustomPathModalProps {
  userRole: RoleType;
  onClose: () => void;
  onTrackCreated: (track: LearningTrack) => void;
}

export const CustomPathModal: React.FC<CustomPathModalProps> = ({
  userRole,
  onClose,
  onTrackCreated,
}) => {
  const [role, setRole] = useState<string>(userRole);
  const [targetSkill, setTargetSkill] = useState<string>('Production Agentic AI & Model Context Protocol in Python');
  const [weeklyHours, setWeeklyHours] = useState<number>(4);
  const [experienceLevel, setExperienceLevel] = useState<string>('Intermediate');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/generate-learning-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRole: role,
          targetSkill,
          weeklyHours,
          experienceLevel,
        }),
      });

      const data = await response.json();
      if (data.path) {
        // Convert to full LearningTrack format
        const newTrack: LearningTrack = {
          id: `custom-${Date.now()}`,
          title: data.path.title || `${targetSkill} for ${role}`,
          description: data.path.description || 'Personalized curriculum calibrated for working professionals.',
          level: experienceLevel as any,
          category: 'Agents & Workflows',
          estimatedWeeks: data.path.estimatedWeeks || 4,
          hoursPerWeek: weeklyHours,
          iconName: 'Workflow',
          badgeName: `${targetSkill.split(' ')[0]} Master`,
          modules: (data.path.modules || []).map((m: any, idx: number) => ({
            id: m.id || `mod-cust-${idx}`,
            title: m.title,
            estimatedHours: m.estimatedHours || 3,
            summary: `Module covering ${m.topics?.join(', ')} with a hands-on project.`,
            topics: m.topics || [],
            practicalProject: m.practicalProject || 'Build and deploy a proof-of-concept pipeline.',
            lessons: (m.topics || []).map((t: string, lIdx: number) => ({
              id: `les-cust-${idx}-${lIdx}`,
              title: t,
              readingTime: '8 min read',
              summary: `In-depth technical breakdown of ${t} for ${role}.`,
              keyTakeaways: [
                `Understand key design trade-offs of ${t}.`,
                `Deploy minimal verifiable Python prototype.`,
                `Integrate automated regression assertions.`,
              ],
              conceptExplanation: `This lesson covers ${t} tailored to your background in ${role}. 
              
Focus on minimizing token waste, maintaining strict latency budgets, and establishing deterministic behavior across production workloads.`,
              codeSnippet: {
                language: 'python',
                caption: `Python Implementation for ${t}`,
                code: `# Implementation for ${t}
import asyncio
from typing import Dict, Any

async def run_pipeline(payload: Dict[str, Any]):
    print("Executing ${t} pipeline for ${role}...")
    return {"status": "success", "metric": 0.94}

if __name__ == "__main__":
    asyncio.run(run_pipeline({"task": "production_eval"}))`,
              },
              architecturalNotes: [
                'Ensure all tool calls and model responses are logged for auditability.',
                'Enforce strict timeout policies on remote inference calls.',
              ],
              pitfallsToAvoid: [
                'Avoid hardcoding prompt strings without version control and automated evaluation.',
              ],
            })),
          })),
        };

        onTrackCreated(newTrack);
        onClose();
      }
    } catch (err) {
      console.error('Failed to generate custom path:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col relative my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Generate Custom AI Learning Path
              </h2>
              <p className="text-xs text-slate-400">
                Calibrated by Gemini for your exact role and busy schedule
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase">
              Your Current Role / Stack:
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Backend Engineer (Java / Go / Node)"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase">
              Target AI Skill or Technology to Master:
            </label>
            <input
              type="text"
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
              placeholder="e.g. Production Agentic AI with LangGraph & FastMCP in Python"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                'MCP & Agentic Protocols',
                'Hybrid RAG & Vector Systems',
                'Self-Hosting vLLM & Quantization',
                'Fine-Tuning with Unsloth / LoRA',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setTargetSkill(suggestion)}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-950 border border-slate-800 text-slate-400 hover:text-indigo-300 transition-colors"
                >
                  +{suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase">
                Weekly Study Time Budget:
              </label>
              <select
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value={2}>2 hours/week (Sprint mode: 20 min/day)</option>
                <option value={4}>4 hours/week (Recommended for busy pros)</option>
                <option value={6}>6 hours/week (Deep dive)</option>
                <option value={10}>10 hours/week (Career pivot / Bootcamp pace)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 uppercase">
                Experience Level:
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Beginner">Beginner (Foundations & Concepts)</option>
                <option value="Intermediate">Intermediate (Code & Production)</option>
                <option value="Advanced">Advanced (Scale & System Architecture)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Designing Syllabus...' : 'Generate Roadmap with AI'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
