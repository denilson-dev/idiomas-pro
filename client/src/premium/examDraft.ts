import type { Question } from '../services/api';

export type ExamDraft = {
  attemptId: string;
  questions: Question[];
  answers: Record<string, string>;
  currentIndex: number;
};

const KEY = 'idiomas-pro-premium-exam';

export function loadExamDraft(): ExamDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ExamDraft) : null;
  } catch {
    return null;
  }
}

export function saveExamDraft(draft: ExamDraft) {
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearExamDraft() {
  sessionStorage.removeItem(KEY);
}
