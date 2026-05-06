import type { ReactNode } from "react";

export type ModuleStatus = "locked" | "available" | "in-progress" | "completed";

export interface LessonScreen {
  title: string;
  body: ReactNode;
}

export interface PracticeExercise {
  id: string;
  prompt: string;
  hint: string;
  /** Regex matched against the user's command line. */
  expectedCommand: RegExp;
  /** Lines printed to the practice terminal as canned output. */
  output: string[];
  successMessage: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface BossPacketField {
  label: string;
  layer: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  example: string;
}

export interface CourseModule {
  id: number;
  title: string;
  subtitle: string;
  briefing: string;
  estimatedMinutes: number;
  lessons: LessonScreen[];
  practice: PracticeExercise[];
  quiz: QuizQuestion[];
  boss?: {
    title: string;
    description: string;
    fields: BossPacketField[];
  };
  /** When true, the module isn't a structured lesson — it opens the existing CTF lab. */
  isLab?: boolean;
  /** Marks modules that don't have content yet. */
  comingSoon?: boolean;
}

export type ModuleProgress = {
  lessonsRead: boolean;
  practiceDone: string[]; // exercise ids cleared
  quizPassed: boolean;
  quizBestScore: number;
  bossDone: boolean;
};

export type CourseProgress = Record<number, ModuleProgress>;

export const emptyModuleProgress = (): ModuleProgress => ({
  lessonsRead: false,
  practiceDone: [],
  quizPassed: false,
  quizBestScore: 0,
  bossDone: false,
});

export const isModuleComplete = (p: ModuleProgress, m: CourseModule): boolean => {
  if (m.isLab || m.comingSoon) return false;
  const allPractice = m.practice.every((ex) => p.practiceDone.includes(ex.id));
  return p.lessonsRead && allPractice && p.quizPassed && (!m.boss || p.bossDone);
};
