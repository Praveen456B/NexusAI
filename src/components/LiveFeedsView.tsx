import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Search, 
  Filter, 
  ExternalLink, 
  Bookmark, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Tag, 
  Layers, 
  RefreshCw,
  Flame,
  ShieldCheck,
  Terminal,
  Cpu,
  Brain,
  FileText,
  Newspaper
} from 'lucide-react';
import { FeedItem, RoleType, ExecutiveBrief, UserProgress } from '../types';
import { ExecutiveBriefCard } from './ExecutiveBriefCard';

interface LiveFeedsViewProps {
  items: FeedItem[];
  userProgress: UserProgress;
  executiveBrief: ExecutiveBrief | null;
  isLoadingFeeds: boolean;
  isLoadingBrief: boolean;
  engineName: string;
  onRefreshFeeds: () => void;
  onRefreshBrief: () => void;
  onSelectArticle: (article: FeedItem) => void;
  onToggleBookmark: (articleId: string) => void;
  onToggleRead: (articleId: string) => void;
}

export const LiveFeedsView: React.FC<LiveFeedsViewProps> = ({
  items,
  userProgress,
  executiveBrief,
  isLoadingFeeds,
  isLoadingBrief,
  engineName,
  onRefreshFeeds,
  onRefreshBrief,
  onSelectArticle,
  onToggleBookmark,
  onToggleRead,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedImpact, setSelectedImpact] = useState<string>('All');
  const [filterMyRoleOnly, setFilterMyRoleOnly] = useState(false);

  // Map category to source icon
  const getSourceIcon = (sourceId: string) => {
    switch (sourceId) {
      case 'openai': return <Brain className="w-3.5 h-3.5 text-emerald-400" />;
      case 'google-deepmind': return <Sparkles className="w-3.5 h-3.5 text-blue-400" />;
      case 'anthropic': return <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />;
      case 'huggingface': return <Cpu className="w-3.5 h-3.5 text-yellow-400" />;
      case 'simon-willison': return <Terminal className="w-3.5 h-3.5 text-indigo-400" />;
      case 'arxiv-ai': return <FileText className="w-3.5 h-3.5 text-rose-400" />;
      default: return <Newspaper className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesSummary = item.summary.toLowerCase().includes(q);
        const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
        const matchesSource = item.source.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSummary && !matchesTags && !matchesSource) return false;
      }

      // Category
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Impact
      if (selectedImpact !== 'All' && item.impactLevel !== selectedImpact) {
        return false;
      }

      // Role filter
      if (filterMyRoleOnly) {
        const userShort = userProgress.userRole.includes('Engineer') ? 'SWE' : userProgress.userRole.includes('Lead') ? 'Tech Lead' : 'Product Manager';
        if (!item.targetRoles.some((r) => r.includes(userShort) || userProgress.userRole.includes(r))) {
          return false;
        }
      }

      return true;
    });
  }, [items, searchQuery, selectedCategory, selectedImpact, filterMyRoleOnly, userProgress.userRole]);

  return (
    <div className="space-y-6">
      {/* Top Executive Briefing */}
      <ExecutiveBriefCard
        brief={executiveBrief}
        userRole={userProgress.userRole}
        isLoading={isLoadingBrief}
        onRefresh={onRefreshBrief}
      />

      {/* Control Bar: Search & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live blog updates, tools (MCP, DeepSeek, vLLM, RAG)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Refresh & Engine Info */}
          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
              {engineName}
            </span>

            <button
              onClick={onRefreshFeeds}
              disabled={isLoadingFeeds}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFeeds ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Refresh Feeds</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Labs', 'Engineering', 'Research', 'News', 'Agents & Tooling', 'Open Source Models'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {/* Impact Filter */}
            <select
              value={selectedImpact}
              onChange={(e) => setSelectedImpact(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none cursor-pointer"
            >
              <option value="All">All Impacts</option>
              <option value="Critical">🔥 Critical Only</option>
              <option value="High">⚡ High Impact</option>
              <option value="Medium">Medium Impact</option>
            </select>

            {/* Target Role Filter Toggle */}
            <button
              onClick={() => setFilterMyRoleOnly(!filterMyRoleOnly)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                filterMyRoleOnly
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>For My Role</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feed Items Count & Status */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <span className="font-bold text-slate-200">{filteredItems.length}</span> live intelligence updates
        </span>
        <span>Click 'AI Deep Dive' for architectural takeaways & code</span>
      </div>

      {/* Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const isBookmarked = userProgress.bookmarkedItemIds.includes(item.id);
          const isRead = userProgress.readArticleIds.includes(item.id);

          return (
            <div
              key={item.id}
              className={`group bg-slate-900/80 hover:bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between ${
                isRead
                  ? 'border-slate-800/60 opacity-85'
                  : 'border-slate-800 hover:border-indigo-500/40 hover:shadow-indigo-500/5'
              }`}
            >
              {/* Card Header: Source, PubDate, Impact */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="p-1 rounded-md bg-slate-950 border border-slate-800">
                      {getSourceIcon(item.sourceId)}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {item.source}
                    </span>
                    <span className="text-[11px] text-slate-500">•</span>
                    <span className="text-[11px] text-slate-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1 inline" />
                      {item.readTime}
                    </span>
                  </div>

                  {/* Impact Badge */}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      item.impactLevel === 'Critical'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : item.impactLevel === 'High'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {item.impactLevel}
                  </span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onSelectArticle(item)}
                  className="font-bold text-sm sm:text-base text-white group-hover:text-indigo-300 transition-colors cursor-pointer leading-snug line-clamp-2"
                >
                  {item.title}
                </h3>

                {/* Summary */}
                <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>

                {/* Tags & Role Badges */}
                <div className="mt-3.5 flex flex-wrap gap-1.5 items-center">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-950 text-slate-400 border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                  {item.targetRoles.map((role) => (
                    <span
                      key={role}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950/50 text-indigo-300 border border-indigo-500/30"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                {/* AI Deep Dive CTA */}
                <button
                  onClick={() => onSelectArticle(item)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Deep Dive</span>
                </button>

                {/* Bookmark & Read state */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleBookmark(item.id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isBookmarked
                        ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <button
                    onClick={() => onToggleRead(item.id)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isRead
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={isRead ? 'Mark as unread' : 'Mark as read (+15 XP)'}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Open original blog post"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-16 text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          <Radio className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300">No updates match your filters</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, switching categories, or clearing role filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedImpact('All');
              setFilterMyRoleOnly(false);
            }}
            className="mt-4 px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
