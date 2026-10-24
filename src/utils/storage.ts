import { UserProgress, RoleType, LearningTrack } from '../types';
import { INITIAL_LEARNING_TRACKS } from '../data/learningTracks';

const STORAGE_KEY_PROGRESS = 'nexusai_user_progress_v1';
const STORAGE_KEY_CUSTOM_TRACKS = 'nexusai_custom_tracks_v1';

export const DEFAULT_USER_PROGRESS: UserProgress = {
  userRole: 'Senior Software Engineer',
  userName: 'Alex Developer',
  targetWeeklyHours: 5,
  weeklyHoursLogged: 2.5,
  streakDays: 4,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessonIds: ['les-mcp-1-1'],
  bookmarkedItemIds: ['curated-1', 'tool-mcp'],
  readArticleIds: ['curated-1'],
  completedQuizIds: [],
  notes: {
    'curated-1': 'Key action: explore MCP TypeScript SDK for our internal PostgreSQL analytics database.',
  },
  xp: 350,
  badges: ['Early Adopter', 'MCP Explorer'],
  activityLogs: [
    { date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], count: 2 },
    { date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], count: 3 },
    { date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0], count: 1 },
    { date: new Date().toISOString().split('T')[0], count: 4 },
  ],
};

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) return DEFAULT_USER_PROGRESS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER_PROGRESS, ...parsed };
  } catch (e) {
    return DEFAULT_USER_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}

export function recordActivity(type: 'read' | 'lesson' | 'quiz', xpGain = 50): UserProgress {
  const current = loadUserProgress();
  const today = new Date().toISOString().split('T')[0];

  let newStreak = current.streakDays;
  if (current.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (current.lastActiveDate === yesterday) {
      newStreak += 1;
    } else if (current.lastActiveDate < yesterday) {
      newStreak = 1; // reset streak if missed a day
    }
  }

  // Activity logs
  const logs = [...(current.activityLogs || [])];
  const existingLog = logs.find((l) => l.date === today);
  if (existingLog) {
    existingLog.count += 1;
  } else {
    logs.push({ date: today, count: 1 });
  }

  const updated: UserProgress = {
    ...current,
    xp: current.xp + xpGain,
    streakDays: newStreak,
    lastActiveDate: today,
    weeklyHoursLogged: Number((current.weeklyHoursLogged + (type === 'lesson' ? 0.5 : 0.15)).toFixed(1)),
    activityLogs: logs.slice(-60), // keep last 60 days
  };

  saveUserProgress(updated);
  return updated;
}

export function loadCustomTracks(): LearningTrack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_TRACKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveCustomTrack(track: LearningTrack): void {
  try {
    const current = loadCustomTracks();
    const updated = [track, ...current.filter((t) => t.id !== track.id)];
    localStorage.setItem(STORAGE_KEY_CUSTOM_TRACKS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save custom track', e);
  }
}
