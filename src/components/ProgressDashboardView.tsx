import React from 'react';
import { 
  BarChart3, 
  Flame, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Award, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Download, 
  FileText,
  Target,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { UserProgress, RoleType } from '../types';
import { LearningActivityD3Chart } from './LearningActivityD3Chart';

interface ProgressDashboardViewProps {
  progress: UserProgress;
  onUpdateWeeklyHoursGoal: (hours: number) => void;
  onOpenQuiz: () => void;
  onOpenPythonLab: () => void;
  onQuickLogHours?: (hours: number, xp: number) => void;
}

export const ProgressDashboardView: React.FC<ProgressDashboardViewProps> = ({
  progress,
  onUpdateWeeklyHoursGoal,
  onOpenQuiz,
  onOpenPythonLab,
  onQuickLogHours,
}) => {
  // Compute user tier & level based on XP
  const level = Math.floor(progress.xp / 150) + 1;
  const currentLevelXp = progress.xp % 150;
  const xpNeeded = 150;
  const levelProgress = Math.round((currentLevelXp / xpNeeded) * 100);

  const getLevelTitle = (lvl: number) => {
    if (lvl <= 2) return 'AI Explorer';
    if (lvl <= 4) return 'AI Systems Practitioner';
    if (lvl <= 6) return 'Senior AI Architect';
    return 'Principal AI Fellow';
  };

  // Generate 60-day heatmap data
  const heatmapDays = React.useMemo(() => {
    const days: { date: string; count: number; dayOfWeek: number }[] = [];
    const now = new Date();
    for (let i = 59; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const match = progress.activityLogs?.find((l) => l.date === dateStr);
      days.push({
        date: dateStr,
        count: match ? match.count : 0,
        dayOfWeek: d.getDay(),
      });
    }
    return days;
  }, [progress.activityLogs]);

  // Skill competencies
  const skills = [
    { name: 'Model Context Protocol (MCP) & Agents', level: 82, color: 'from-indigo-500 to-violet-500' },
    { name: 'Production Hybrid RAG & Vector Systems', level: 78, color: 'from-emerald-500 to-teal-500' },
    { name: 'LLM Inference, vLLM & Quantization', level: 65, color: 'from-cyan-500 to-blue-500' },
    { name: 'Evaluations (Ragas) & Guardrails', level: 58, color: 'from-amber-500 to-orange-500' },
    { name: 'Full-Stack Streaming & Tokenomics', level: 85, color: 'from-pink-500 to-rose-500' },
  ];

  // All Badges
  const allBadges = [
    { id: 'b-early', name: 'Early Adopter', desc: 'Joined NexusAI Radar', unlocked: true, icon: '🚀' },
    { id: 'b-mcp', name: 'MCP Explorer', desc: 'Completed FastMCP lesson', unlocked: true, icon: '🔌' },
    { id: 'b-streak-3', name: '3-Day Momentum', desc: 'Consistent 3-day study', unlocked: progress.streakDays >= 3, icon: '🔥' },
    { id: 'b-python', name: 'Python Hacker', desc: 'Executed 3 Python AI labs', unlocked: progress.xp >= 300, icon: '🐍' },
    { id: 'b-rag-master', name: 'RAG Architect', desc: 'Finished Hybrid RAG curriculum', unlocked: progress.completedLessonIds.length >= 2, icon: '📚' },
    { id: 'b-eval-pro', name: 'Continuous Eval Pro', desc: 'Passed automated eval challenge', unlocked: progress.xp >= 600, icon: '🛡️' },
  ];

  const handleExportSummary = () => {
    const summary = `# NexusAI Career Progress Summary
Role: ${progress.userRole}
Current Level: Level ${level} (${getLevelTitle(level)})
Total XP: ${progress.xp}
Active Streak: ${progress.streakDays} Days
Weekly Study Time: ${progress.weeklyHoursLogged} hrs (Goal: ${progress.targetWeeklyHours} hrs)
Completed Lessons: ${progress.completedLessonIds.length}
Articles Read: ${progress.readArticleIds.length}
Saved Bookmarks: ${progress.bookmarkedItemIds.length}

Generated on ${new Date().toLocaleDateString()}`;

    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexusai_progress_report_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Career Upskilling & Progress Dashboard
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Track consistency, study hours, verified technical competencies, and your learning streak as a {progress.userRole}.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportSummary}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export Report</span>
            </button>
            <button
              onClick={onOpenQuiz}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>Daily Workout</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Daily Streak
            </span>
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Flame className="w-4 h-4 fill-current animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {progress.streakDays} <span className="text-sm font-semibold text-orange-400">Days</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Active today • Consistency beats intensity
          </p>
        </div>

        {/* Weekly Hours Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Weekly Study Goal
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {progress.weeklyHoursLogged} <span className="text-sm font-semibold text-slate-400">/ {progress.targetWeeklyHours}h</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-3 border border-slate-800">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${Math.min(100, (progress.weeklyHoursLogged / progress.targetWeeklyHours) * 100)}%` }}
            />
          </div>
        </div>

        {/* Level & XP Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Engineering Level
            </span>
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Zap className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">
            Level {level}
          </div>
          <span className="text-xs font-semibold text-indigo-300 block mt-0.5">
            {getLevelTitle(level)}
          </span>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mt-3 border border-slate-800">
            <div
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Lessons & Read Count */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Knowledge Volume
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {progress.completedLessonIds.length} <span className="text-sm font-semibold text-slate-400">lessons</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {progress.readArticleIds.length} live articles read
          </p>
        </div>
      </div>

      {/* D3-based Weekly Activity Trends and XP Velocity Chart */}
      <LearningActivityD3Chart
        progress={progress}
        onQuickLogHours={onQuickLogHours}
      />

      {/* 60-Day Consistency Heatmap */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white">
              60-Day Upskilling Consistency Heatmap
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visual log of daily reading, lesson completions, and Python lab runs
            </p>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span className="text-[11px]">Less</span>
            <span className="w-3 h-3 rounded-sm bg-slate-950 border border-slate-800" />
            <span className="w-3 h-3 rounded-sm bg-emerald-900/60" />
            <span className="w-3 h-3 rounded-sm bg-emerald-600" />
            <span className="w-3 h-3 rounded-sm bg-emerald-400" />
            <span className="text-[11px]">More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-[640px]">
            {heatmapDays.map((day, idx) => {
              let bg = 'bg-slate-950 border-slate-800/80';
              if (day.count === 1) bg = 'bg-emerald-950 border-emerald-800/50';
              else if (day.count === 2) bg = 'bg-emerald-700/80 border-emerald-600';
              else if (day.count >= 3) bg = 'bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400/40';

              return (
                <div
                  key={idx}
                  title={`${day.date}: ${day.count} activities logged`}
                  className={`w-3.5 h-3.5 rounded-sm border transition-transform hover:scale-125 cursor-pointer ${bg}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Skill Competency Matrix & Badges Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Technical Competency Matrix */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white">
              Verified Technical Competencies
            </h3>
            <span className="text-xs text-slate-400">
              Evaluated across coursework & labs
            </span>
          </div>

          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200">{skill.name}</span>
                  <span className="text-slate-400">{skill.level}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full bg-gradient-to-r ${skill.color} rounded-full`}
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onOpenPythonLab}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>Practice in Python AI Lab to boost scores</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Milestones & Badges */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-white">
              Career Milestone Badges
            </h3>
            <span className="text-xs text-amber-400 font-bold">
              {allBadges.filter((b) => b.unlocked).length} / {allBadges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {allBadges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-xl border flex flex-col items-center text-center transition-all ${
                  badge.unlocked
                    ? 'bg-slate-950/80 border-indigo-500/30 shadow-sm'
                    : 'bg-slate-950/30 border-slate-900 opacity-40 grayscale'
                }`}
              >
                <span className="text-2xl mb-1">{badge.icon}</span>
                <span className="text-xs font-bold text-white leading-tight">
                  {badge.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {badge.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
