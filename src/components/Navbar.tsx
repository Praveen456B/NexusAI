import { 
  Radio, 
  Compass, 
  BookOpen, 
  BarChart3, 
  Bookmark, 
  Flame, 
  Zap, 
  Sparkles,
  Layers,
  CheckCircle2,
  Brain,
  Cloud,
  Download,
  Bot,
  Mic,
  Video
} from 'lucide-react';
import { RoleType, UserProgress } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

export type NavTab = 'radar' | 'tools' | 'paths' | 'chat' | 'voice' | 'studio' | 'dashboard' | 'bookmarks';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  userProgress: UserProgress;
  onUpdateRole: (role: RoleType) => void;
  onOpenQuiz: () => void;
  onOpenCloudRun?: () => void;
  unreadCount?: number;
}

const ROLES: RoleType[] = [
  'Senior Software Engineer',
  'Full-Stack Developer',
  'ML Engineer / Data Scientist',
  'Tech Lead / Architect',
  'Product Manager',
  'Engineering Manager',
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProgress,
  onUpdateRole,
  onOpenQuiz,
  onOpenCloudRun,
  unreadCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Live Status */}
          <div className="flex items-center space-x-4">
            <div 
              onClick={() => setActiveTab('radar')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Brain className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                    Nexus<span className="text-indigo-400">AI</span>
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    LIVE RADAR
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  AI Intelligence & Upskilling for Working Professionals
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('radar')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'radar'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              <span>Feed</span>
              {unreadCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500 text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'tools'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('paths')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'paths'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Curriculum</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Copilot</span>
            </button>

            <button
              onClick={() => setActiveTab('voice')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'voice'
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 shadow-sm shadow-purple-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-purple-400" />
              <span>Voice Live</span>
            </button>

            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'studio'
                  ? 'bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/30 shadow-sm shadow-fuchsia-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Video className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Progress</span>
            </button>

            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bookmarks'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Bookmark className="w-4 h-4 text-pink-400" />
              <span>Saved</span>
              {userProgress.bookmarkedItemIds.length > 0 && (
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-full">
                  {userProgress.bookmarkedItemIds.length}
                </span>
              )}
            </button>
          </nav>

          {/* Right Section: Role Switcher, Streaks, XP, Daily Workout */}
          <div className="flex items-center space-x-3">
            {/* Role Selector */}
            <div className="hidden xl:flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300">
              <span className="text-slate-500 text-[11px]">Role:</span>
              <select
                value={userProgress.userRole}
                onChange={(e) => onUpdateRole(e.target.value as RoleType)}
                className="bg-transparent text-indigo-300 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-slate-900 text-slate-200">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Streak Badge */}
            <div 
              title="Daily Learning Streak"
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-orange-950/40 border border-orange-500/30 text-orange-400 text-xs font-bold shadow-inner"
            >
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{userProgress.streakDays}d</span>
            </div>

            {/* XP Badge */}
            <div 
              title="Total XP Earned"
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-bold"
            >
              <Zap className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
              <span>{userProgress.xp} XP</span>
            </div>

            {/* Cloud Run Workspace Host Button */}
            {onOpenCloudRun && (
              <button
                onClick={onOpenCloudRun}
                className="hidden lg:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/40 hover:text-white transition-all cursor-pointer"
                title="Host NexusAI in your workspace on Google Cloud Run"
              >
                <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cloud Run Host</span>
              </button>
            )}

            {/* PWA Download / Install App Button */}
            <PWAInstallButton />

            {/* Daily Workout / Quiz Trigger */}
            <button
              onClick={onOpenQuiz}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3-Min</span>
              <span>Workout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs overflow-x-auto space-x-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'radar' ? 'text-indigo-400 font-bold bg-indigo-950/50' : 'text-slate-400'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Feed</span>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'tools' ? 'text-cyan-400 font-bold bg-cyan-950/50' : 'text-slate-400'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Radar</span>
          </button>
          <button
            onClick={() => setActiveTab('paths')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'paths' ? 'text-emerald-400 font-bold bg-emerald-950/50' : 'text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Paths</span>
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'chat' ? 'text-indigo-400 font-bold bg-indigo-950/50' : 'text-slate-400'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'voice' ? 'text-purple-400 font-bold bg-purple-950/50' : 'text-slate-400'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice</span>
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'studio' ? 'text-fuchsia-400 font-bold bg-fuchsia-950/50' : 'text-slate-400'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard' ? 'text-amber-400 font-bold bg-amber-950/50' : 'text-slate-400'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Progress</span>
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md whitespace-nowrap cursor-pointer ${
              activeTab === 'bookmarks' ? 'text-pink-400 font-bold bg-pink-950/50' : 'text-slate-400'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
          </button>
        </div>
      </div>
    </header>
  );
};
