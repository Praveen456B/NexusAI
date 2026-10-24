export type RoleType = 
  | 'Senior Software Engineer'
  | 'Full-Stack Developer'
  | 'ML Engineer / Data Scientist'
  | 'Tech Lead / Architect'
  | 'Product Manager'
  | 'Engineering Manager';

export interface FeedItem {
  id: string;
  title: string;
  source: string;
  sourceId: string;
  category: string;
  pubDate: string;
  link: string;
  summary: string;
  readTime: string;
  tags: string[];
  impactLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  targetRoles: string[];
}

export interface ExecutiveBrief {
  headline: string;
  tldr: string;
  keyTakeaways: string[];
  actionForRole: string;
  techToWatch: string[];
}

export interface Lesson {
  id: string;
  title: string;
  readingTime: string;
  summary: string;
  keyTakeaways: string[];
  conceptExplanation: string;
  codeSnippet?: {
    language: string;
    code: string;
    caption: string;
  };
  architecturalNotes: string[];
  pitfallsToAvoid: string[];
}

export interface Module {
  id: string;
  title: string;
  estimatedHours: number;
  summary: string;
  topics: string[];
  practicalProject: string;
  lessons: Lesson[];
}

export interface LearningTrack {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Architect';
  category: 'Agents & Workflows' | 'RAG & Retrieval' | 'LLM Engineering' | 'Full-Stack AI' | 'Strategy & Leadership';
  estimatedWeeks: number;
  hoursPerWeek: number;
  iconName: string;
  badgeName: string;
  modules: Module[];
}

export interface TechTool {
  id: string;
  name: string;
  category: 'Agents & Protocol' | 'Inference & Serving' | 'RAG & Storage' | 'Fine-Tuning & Training' | 'Evals & Guardrails' | 'Dev Productivity';
  stage: 'Adopt' | 'Trial' | 'Assess' | 'Hold';
  description: string;
  whyItMatters: string;
  githubOrSite: string;
  maturity: 'Production Ready' | 'Rapidly Evolving' | 'Experimental';
  license: string;
  replacesOrComplements: string;
  quickCodeSnippet?: string;
  pros: string[];
  cons: string[];
}

export interface UserProgress {
  userRole: RoleType;
  userName: string;
  targetWeeklyHours: number;
  weeklyHoursLogged: number;
  streakDays: number;
  lastActiveDate: string;
  completedLessonIds: string[];
  bookmarkedItemIds: string[];
  readArticleIds: string[];
  completedQuizIds: string[];
  notes: Record<string, string>; // articleId or lessonId -> note
  xp: number;
  badges: string[];
  activityLogs: { date: string; count: number }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface WeeklyActivityPoint {
  weekKey: string;
  label: string;
  startDate: string;
  endDate: string;
  hours: number;
  xpGained: number;
  xpVelocity: number; // XP velocity (e.g. XP gained per active hour or rate of momentum)
  velocityChangePercent: number; // e.g. +14% vs previous week
  lessonsCompleted: number;
  articlesRead: number;
  isCurrentWeek?: boolean;
}

