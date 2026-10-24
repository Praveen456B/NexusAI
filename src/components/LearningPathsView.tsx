import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  Terminal, 
  Layers, 
  Code2, 
  ArrowRight,
  Flame,
  Plus
} from 'lucide-react';
import { LearningTrack, Module, Lesson, UserProgress } from '../types';
import { LessonModal } from './LessonModal';
import { CustomPathModal } from './CustomPathModal';

interface LearningPathsViewProps {
  tracks: LearningTrack[];
  userProgress: UserProgress;
  onCompleteLesson: (lessonId: string) => void;
  onOpenPythonLab: (code?: string) => void;
  onAddCustomTrack: (track: LearningTrack) => void;
}

export const LearningPathsView: React.FC<LearningPathsViewProps> = ({
  tracks,
  userProgress,
  onCompleteLesson,
  onOpenPythonLab,
  onAddCustomTrack,
}) => {
  const [selectedTrack, setSelectedTrack] = useState<LearningTrack | null>(tracks[0] || null);
  const [activeLesson, setActiveLesson] = useState<{ lesson: Lesson; track: LearningTrack } | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-mcp-1': true,
    'mod-rag-1': true,
  });

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // Calculate track progress
  const getTrackProgress = (track: LearningTrack) => {
    let totalLessons = 0;
    let completedLessons = 0;

    track.modules.forEach((m) => {
      m.lessons.forEach((l) => {
        totalLessons += 1;
        if (userProgress.completedLessonIds.includes(l.id)) {
          completedLessons += 1;
        }
      });
    });

    if (totalLessons === 0) return 0;
    return Math.round((completedLessons / totalLessons) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <BookOpen className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Structured AI Upskilling Curriculum
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Code-first learning tracks designed specifically for working professionals. Focus on production architectures, practical Python implementations, and verified mastery.
            </p>
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Custom Roadmap</span>
          </button>
        </div>
      </div>

      {/* Main Track Selection & Syllabus Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Track Cards Column */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 block">
            Select Track ({tracks.length})
          </span>

          {tracks.map((track) => {
            const progress = getTrackProgress(track);
            const isSelected = selectedTrack?.id === track.id;

            return (
              <div
                key={track.id}
                onClick={() => setSelectedTrack(track)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950/70 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-extrabold text-sm text-white leading-snug">
                    {track.title}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300 shrink-0">
                    {track.level}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {track.description}
                </p>

                {/* Progress Bar & Stats */}
                <div className="mt-3 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                    <span>{track.estimatedWeeks} Weeks ({track.hoursPerWeek}h/wk)</span>
                    <span className="font-bold text-emerald-400">{progress}% complete</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Track Modules & Lessons Detail */}
        <div className="lg:col-span-8 space-y-4">
          {selectedTrack && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              {/* Track Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedTrack.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedTrack.modules.length} Modules
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    {selectedTrack.title}
                  </h2>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center space-x-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Badge: {selectedTrack.badgeName}</span>
                  </span>
                </div>
              </div>

              {/* Module Accordions */}
              <div className="space-y-4">
                {selectedTrack.modules.map((module, mIdx) => {
                  const isExpanded = !!expandedModules[module.id];
                  const moduleCompletedLessons = module.lessons.filter((l) =>
                    userProgress.completedLessonIds.includes(l.id)
                  ).length;
                  const allCompleted = module.lessons.length > 0 && moduleCompletedLessons === module.lessons.length;

                  return (
                    <div
                      key={module.id}
                      className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                    >
                      {/* Module Header Bar */}
                      <div
                        onClick={() => toggleModule(module.id)}
                        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                            allCompleted 
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-900 border border-slate-700 text-slate-300'
                          }`}>
                            {allCompleted ? '✓' : mIdx + 1}
                          </span>
                          <div>
                            <h3 className="font-bold text-sm text-white">
                              {module.title}
                            </h3>
                            <span className="text-xs text-slate-400">
                              {module.estimatedHours} Hours • {moduleCompletedLessons}/{module.lessons.length} Lessons Finished
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Lessons & Practical Project */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4">
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {module.summary}
                          </p>

                          {/* Lessons List */}
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                              Lessons & Code Walkthroughs:
                            </span>

                            {module.lessons.map((lesson) => {
                              const isLessonCompleted = userProgress.completedLessonIds.includes(lesson.id);

                              return (
                                <div
                                  key={lesson.id}
                                  onClick={() => setActiveLesson({ lesson, track: selectedTrack })}
                                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                    isLessonCompleted
                                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-300'
                                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 hover:border-emerald-500/30'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onCompleteLesson(lesson.id);
                                      }}
                                      className={`p-1 rounded-md transition-colors ${
                                        isLessonCompleted
                                          ? 'text-emerald-400 hover:text-slate-400'
                                          : 'text-slate-600 hover:text-emerald-400'
                                      }`}
                                      title={isLessonCompleted ? 'Mark uncompleted' : 'Mark completed'}
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>

                                    <div>
                                      <h4 className="font-semibold text-xs sm:text-sm text-white">
                                        {lesson.title}
                                      </h4>
                                      <span className="text-[11px] text-slate-400 flex items-center mt-0.5">
                                        <Clock className="w-3 h-3 mr-1 text-slate-500" />
                                        {lesson.readingTime}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    {lesson.codeSnippet && (
                                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-emerald-400 hidden sm:inline">
                                        Python
                                      </span>
                                    )}
                                    <ArrowRight className="w-4 h-4 text-slate-500" />
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Practical Project Deliverable Box */}
                          {module.practicalProject && (
                            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5 flex items-center">
                                  <Code2 className="w-3.5 h-3.5 mr-1" />
                                  Hands-on Production Project
                                </span>
                                <p className="text-xs text-slate-200">
                                  {module.practicalProject}
                                </p>
                              </div>

                              <button
                                onClick={() => onOpenPythonLab()}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1 shrink-0 transition-colors"
                              >
                                <Terminal className="w-3.5 h-3.5" />
                                <span>Open Lab</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Reader Modal */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson.lesson}
          track={activeLesson.track}
          isCompleted={userProgress.completedLessonIds.includes(activeLesson.lesson.id)}
          onClose={() => setActiveLesson(null)}
          onCompleteLesson={onCompleteLesson}
          onOpenPythonLab={onOpenPythonLab}
        />
      )}

      {/* Custom Roadmap Generator Modal */}
      {showCustomModal && (
        <CustomPathModal
          userRole={userProgress.userRole}
          onClose={() => setShowCustomModal(false)}
          onTrackCreated={onAddCustomTrack}
        />
      )}
    </div>
  );
};
