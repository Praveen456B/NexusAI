import React, { useState } from 'react';
import { 
  Bookmark, 
  Search, 
  Trash2, 
  FileEdit, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Sparkles,
  BookOpen,
  Compass,
  Radio
} from 'lucide-react';
import { FeedItem, TechTool, UserProgress } from '../types';
import { TECH_RADAR_TOOLS } from '../data/techRadar';

interface BookmarksViewProps {
  userProgress: UserProgress;
  feedItems: FeedItem[];
  onRemoveBookmark: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onSelectArticle: (article: FeedItem) => void;
  onOpenPythonLab: (code?: string) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  userProgress,
  feedItems,
  onRemoveBookmark,
  onUpdateNote,
  onSelectArticle,
  onOpenPythonLab,
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Collect bookmarked items
  const bookmarkedArticles = feedItems.filter((i) =>
    userProgress.bookmarkedItemIds.includes(i.id)
  );

  const bookmarkedTools = TECH_RADAR_TOOLS.filter((t) =>
    userProgress.bookmarkedItemIds.includes(t.id)
  );

  const handleStartEditNote = (id: string) => {
    setEditingNoteId(id);
    setTempNoteText(userProgress.notes[id] || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateNote(id, tempNoteText);
    setEditingNoteId(null);
  };

  const handleExportNotes = () => {
    let md = `# NexusAI - My Engineering Notes & Saved Resources\n\n`;
    md += `Exported on: ${new Date().toLocaleDateString()}\n\n`;

    md += `## Saved Articles\n`;
    bookmarkedArticles.forEach((a) => {
      md += `### ${a.title} (${a.source})\n`;
      md += `Link: ${a.link}\n`;
      if (userProgress.notes[a.id]) {
        md += `**My Notes:** ${userProgress.notes[a.id]}\n`;
      }
      md += `\n`;
    });

    md += `## Saved Tools & Tech Radar\n`;
    bookmarkedTools.forEach((t) => {
      md += `### ${t.name} (${t.stage})\n`;
      md += `${t.description}\n`;
      if (userProgress.notes[t.id]) {
        md += `**My Notes:** ${userProgress.notes[t.id]}\n`;
      }
      md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexusai_notes_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalCount = bookmarkedArticles.length + bookmarkedTools.length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-pink-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                <Bookmark className="w-5 h-5 fill-current" />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-white">
                Saved Resources & Engineering Notebook
              </h1>
            </div>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl">
              Quick access to bookmarked articles, tools, and your personal architectural notes for work projects.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportNotes}
              disabled={totalCount === 0}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export All Notes (.md)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bookmarked Content Lists */}
      {totalCount === 0 ? (
        <div className="py-16 text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-300">No saved items yet</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click the bookmark icon on any live feed update or tech radar tool to save it here with custom notes.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Saved Articles Section */}
          {bookmarkedArticles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-200">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span>Saved Live Feed Articles ({bookmarkedArticles.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarkedArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-indigo-400">
                          {article.source}
                        </span>
                        <button
                          onClick={() => onRemoveBookmark(article.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3
                        onClick={() => onSelectArticle(article)}
                        className="font-bold text-sm text-white hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        {article.title}
                      </h3>

                      <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                        {article.summary}
                      </p>
                    </div>

                    {/* Note Box */}
                    <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                      {editingNoteId === article.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={tempNoteText}
                            onChange={(e) => setTempNoteText(e.target.value)}
                            rows={3}
                            placeholder="Add your thoughts or workplace implementation ideas..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNote(article.id)}
                              className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                              My Notes:
                            </span>
                            <p className="text-xs text-slate-300 italic">
                              {userProgress.notes[article.id] || 'No notes added yet.'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleStartEditNote(article.id)}
                            className="p-1 text-slate-500 hover:text-indigo-400 shrink-0 cursor-pointer"
                            title="Edit notes"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saved Tools Section */}
          {bookmarkedTools.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm font-bold text-slate-200">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Saved Tools & Tech Radar ({bookmarkedTools.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarkedTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-sm text-white">
                            {tool.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-700 text-cyan-300">
                            {tool.stage}
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveBookmark(tool.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                          title="Remove from saved"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-300">
                        {tool.description}
                      </p>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                      {tool.quickCodeSnippet && (
                        <button
                          onClick={() => onOpenPythonLab(tool.quickCodeSnippet)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold cursor-pointer"
                        >
                          Run in Python Lab
                        </button>
                      )}
                      {tool.githubOrSite && (
                        <a
                          href={tool.githubOrSite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
