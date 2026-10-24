import React, { useState, useEffect } from 'react';
import { 
  FeedItem, 
  RoleType, 
  ExecutiveBrief, 
  UserProgress, 
  LearningTrack 
} from './types';
import { INITIAL_LEARNING_TRACKS } from './data/learningTracks';
import { 
  loadUserProgress, 
  saveUserProgress, 
  recordActivity, 
  loadCustomTracks, 
  saveCustomTrack 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { LiveFeedsView } from './components/LiveFeedsView';
import { TechRadarView } from './components/TechRadarView';
import { LearningPathsView } from './components/LearningPathsView';
import { PythonLabView } from './components/PythonLabView';
import { ProgressDashboardView } from './components/ProgressDashboardView';
import { BookmarksView } from './components/BookmarksView';
import { GeminiChatbotView } from './components/GeminiChatbotView';
import { LiveVoiceView } from './components/LiveVoiceView';
import { MediaStudioView } from './components/MediaStudioView';
import { ArticleModal } from './components/ArticleModal';
import { DailyQuizModal } from './components/DailyQuizModal';
import { CloudRunDeployModal } from './components/CloudRunDeployModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'radar' | 'tools' | 'paths' | 'python' | 'dashboard' | 'bookmarks' | 'chat' | 'voice' | 'studio'>('radar');
  const [userProgress, setUserProgress] = useState<UserProgress>(loadUserProgress());
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoadingFeeds, setIsLoadingFeeds] = useState(true);
  const [engineName, setEngineName] = useState('Python Collector');
  const [executiveBrief, setExecutiveBrief] = useState<ExecutiveBrief | null>(null);
  const [isLoadingBrief, setIsLoadingBrief] = useState(true);

  // Modals state
  const [selectedArticle, setSelectedArticle] = useState<FeedItem | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showCloudRunModal, setShowCloudRunModal] = useState(false);
  const [customTracks, setCustomTracks] = useState<LearningTrack[]>(loadCustomTracks());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Combine initial tracks + custom user tracks
  const allTracks = [...customTracks, ...INITIAL_LEARNING_TRACKS];

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch feeds on mount
  const fetchFeeds = async () => {
    setIsLoadingFeeds(true);
    try {
      const res = await fetch('/api/feeds');
      const data = await res.json();
      if (data.items) {
        setFeedItems(data.items);
        if (data.engine) setEngineName(data.engine);
      }
    } catch (err) {
      console.error('Failed to load feeds', err);
    } finally {
      setIsLoadingFeeds(false);
    }
  };

  // Fetch executive briefing
  const fetchBrief = async (role = userProgress.userRole) => {
    setIsLoadingBrief(true);
    try {
      const res = await fetch('/api/ai/executive-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRole: role }),
      });
      const data = await res.json();
      if (data.brief) {
        setExecutiveBrief(data.brief);
      }
    } catch (err) {
      console.error('Failed to load brief', err);
    } finally {
      setIsLoadingBrief(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
    fetchBrief(userProgress.userRole);
  }, []);

  // Update Role handler
  const handleUpdateRole = (newRole: RoleType) => {
    const updated = { ...userProgress, userRole: newRole };
    setUserProgress(updated);
    saveUserProgress(updated);
    fetchBrief(newRole);
    showToast(`Role updated to ${newRole}`);
  };

  // Handle XP gain & activity recording
  const handleGainXp = (amount: number, reason: string) => {
    const updated = recordActivity('lesson', amount);
    setUserProgress(updated);
    showToast(`+${amount} XP: ${reason}!`);
  };

  // Toggle bookmark on article or tool
  const handleToggleBookmark = (id: string) => {
    const exists = userProgress.bookmarkedItemIds.includes(id);
    const newBookmarks = exists
      ? userProgress.bookmarkedItemIds.filter((bId) => bId !== id)
      : [...userProgress.bookmarkedItemIds, id];

    const updated = { ...userProgress, bookmarkedItemIds: newBookmarks };
    setUserProgress(updated);
    saveUserProgress(updated);
    showToast(exists ? 'Removed from saved' : 'Saved to bookmarks');
  };

  // Toggle read status on article
  const handleToggleRead = (articleId: string) => {
    const exists = userProgress.readArticleIds.includes(articleId);
    let updated: UserProgress;
    if (exists) {
      updated = {
        ...userProgress,
        readArticleIds: userProgress.readArticleIds.filter((id) => id !== articleId),
      };
      showToast('Marked as unread');
    } else {
      updated = recordActivity('read', 15);
      updated.readArticleIds = [...updated.readArticleIds, articleId];
      showToast('+15 XP: Read live article');
    }
    setUserProgress(updated);
    saveUserProgress(updated);
  };

  // Save personal note
  const handleSaveNote = (id: string, note: string) => {
    const updated = {
      ...userProgress,
      notes: { ...userProgress.notes, [id]: note },
    };
    setUserProgress(updated);
    saveUserProgress(updated);
    showToast('Career notes saved');
  };

  // Complete lesson
  const handleCompleteLesson = (lessonId: string) => {
    const exists = userProgress.completedLessonIds.includes(lessonId);
    let updated: UserProgress;
    if (exists) {
      updated = {
        ...userProgress,
        completedLessonIds: userProgress.completedLessonIds.filter((id) => id !== lessonId),
      };
      showToast('Lesson marked uncompleted');
    } else {
      updated = recordActivity('lesson', 50);
      updated.completedLessonIds = [...updated.completedLessonIds, lessonId];
      showToast('🎉 +50 XP: Lesson Mastered!');
    }
    setUserProgress(updated);
    saveUserProgress(updated);
  };

  // Complete quiz
  const handleQuizCompleted = (score: number) => {
    const xpEarned = score * 20;
    const updated = recordActivity('quiz', xpEarned);
    setUserProgress(updated);
    showToast(`🔥 Workout Complete! Streak preserved • +${xpEarned} XP`);
  };

  // Add custom track
  const handleAddCustomTrack = (track: LearningTrack) => {
    saveCustomTrack(track);
    setCustomTracks((prev) => [track, ...prev]);
    showToast(`Created new roadmap: ${track.title}`);
  };

  // Open python lab with initial code if provided
  const handleOpenPythonLab = (code?: string) => {
    setActiveTab('python');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const unreadCount = feedItems.filter(
    (item) => !userProgress.readArticleIds.includes(item.id)
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center space-x-2 animate-bounce">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab === 'python' ? 'paths' : activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        userProgress={userProgress}
        onUpdateRole={handleUpdateRole}
        onOpenQuiz={() => setShowQuizModal(true)}
        onOpenCloudRun={() => setShowCloudRunModal(true)}
        unreadCount={unreadCount}
      />

      {/* Secondary Quick-Access Subnav for Python AI Lab & Cloud Run Hosting */}
      <div className="bg-slate-950/70 border-b border-slate-900 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-semibold hidden sm:inline">Quick Jump:</span>
            <button
              onClick={() => setActiveTab('python')}
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                activeTab === 'python'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>🐍 Python AI Lab</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[10px] text-emerald-400">
                Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-900 cursor-pointer"
            >
              Tech Radar (11 Tools)
            </button>
            <button
              onClick={() => setActiveTab('paths')}
              className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded hover:bg-slate-900 cursor-pointer"
            >
              Curriculum (6 Tracks)
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              🤖 Copilot Chat
            </button>
            <button
              onClick={() => setActiveTab('voice')}
              className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                activeTab === 'voice'
                  ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              🎙️ Live Voice
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-fuchsia-500/20 text-fuchsia-300 font-bold border border-fuchsia-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              🎨 Multimodal Studio
            </button>
            <button
              onClick={() => setShowCloudRunModal(true)}
              className="hidden sm:inline-flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded bg-cyan-950/30 border border-cyan-500/20 cursor-pointer"
            >
              <span>🚀 Deploy to Cloud Run</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden md:block">
            Logged in as <span className="font-bold text-slate-200">{userProgress.userName}</span> ({userProgress.userRole})
          </div>
        </div>
      </div>

      {/* Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'radar' && (
          <LiveFeedsView
            items={feedItems}
            userProgress={userProgress}
            executiveBrief={executiveBrief}
            isLoadingFeeds={isLoadingFeeds}
            isLoadingBrief={isLoadingBrief}
            engineName={engineName}
            onRefreshFeeds={fetchFeeds}
            onRefreshBrief={() => fetchBrief(userProgress.userRole)}
            onSelectArticle={(article) => setSelectedArticle(article)}
            onToggleBookmark={handleToggleBookmark}
            onToggleRead={handleToggleRead}
          />
        )}

        {activeTab === 'tools' && (
          <TechRadarView
            onOpenPythonLab={handleOpenPythonLab}
            onBookmarkTool={handleToggleBookmark}
            bookmarkedToolIds={userProgress.bookmarkedItemIds}
          />
        )}

        {activeTab === 'paths' && (
          <LearningPathsView
            tracks={allTracks}
            userProgress={userProgress}
            onCompleteLesson={handleCompleteLesson}
            onOpenPythonLab={handleOpenPythonLab}
            onAddCustomTrack={handleAddCustomTrack}
          />
        )}

        {activeTab === 'python' && (
          <PythonLabView onGainXp={handleGainXp} />
        )}

        {activeTab === 'chat' && (
          <GeminiChatbotView />
        )}

        {activeTab === 'voice' && (
          <LiveVoiceView />
        )}

        {activeTab === 'studio' && (
          <MediaStudioView />
        )}

        {activeTab === 'dashboard' && (
          <ProgressDashboardView
            progress={userProgress}
            onUpdateWeeklyHoursGoal={(hours) => {
              const updated = { ...userProgress, targetWeeklyHours: hours };
              setUserProgress(updated);
              saveUserProgress(updated);
              showToast(`Weekly goal updated to ${hours} hours`);
            }}
            onOpenQuiz={() => setShowQuizModal(true)}
            onOpenPythonLab={handleOpenPythonLab}
            onQuickLogHours={(hours, xp) => {
              const updated = recordActivity('lesson', xp);
              updated.weeklyHoursLogged = Number((updated.weeklyHoursLogged + hours).toFixed(1));
              setUserProgress(updated);
              saveUserProgress(updated);
              showToast(`🎉 +${hours}h Study Logged & +${xp} XP Gained! Chart velocity updated!`);
            }}
          />
        )}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            userProgress={userProgress}
            feedItems={feedItems}
            onRemoveBookmark={handleToggleBookmark}
            onUpdateNote={handleSaveNote}
            onSelectArticle={(article) => setSelectedArticle(article)}
            onOpenPythonLab={handleOpenPythonLab}
          />
        )}
      </main>

      {/* Article Detail Deep-Dive Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          userRole={userProgress.userRole}
          isBookmarked={userProgress.bookmarkedItemIds.includes(selectedArticle.id)}
          isRead={userProgress.readArticleIds.includes(selectedArticle.id)}
          userNote={userProgress.notes[selectedArticle.id] || ''}
          onClose={() => setSelectedArticle(null)}
          onToggleBookmark={handleToggleBookmark}
          onToggleRead={handleToggleRead}
          onSaveNote={handleSaveNote}
          onGainXp={handleGainXp}
        />
      )}

      {/* Daily 3-Minute Workout Quiz Modal */}
      {showQuizModal && (
        <DailyQuizModal
          onClose={() => setShowQuizModal(false)}
          onQuizCompleted={handleQuizCompleted}
          streakDays={userProgress.streakDays}
        />
      )}

      {/* Cloud Run Deployment & Hosting Modal */}
      {showCloudRunModal && (
        <CloudRunDeployModal
          onClose={() => setShowCloudRunModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            NexusAI • Real-Time AI Intelligence, Tech Radar & Professional Upskilling
          </p>
          <p className="text-[11px] text-slate-600">
            Powered by Python 3.10 live feed collectors & Gemini 3.8 Flash
          </p>
        </div>
      </footer>
    </div>
  );
}
