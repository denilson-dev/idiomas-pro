const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api';

export type User = { id: string; name: string; email: string };
export type SessionResponse = { token: string; expiresAt: string; user: User | null };

export type Question = {
  id: string;
  prompt: string;
  options: string[];
  category: 'GRAMMAR' | 'VOCABULARY' | 'LISTENING';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  mediaType: 'AUDIO' | 'VIDEO' | null;
  mediaUrl: string | null;
};

export type BreakdownItem = {
  category: 'GRAMMAR' | 'VOCABULARY' | 'LISTENING';
  label: string;
  correct: number;
  total: number;
  percentage: number;
};

export type Recommendation = { title: string; description: string; tag: string };

export type TestResult = {
  attemptId?: string;
  id?: string;
  score: number;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  correct?: number;
  total?: number;
  totalQuestions?: number;
  breakdown: BreakdownItem[];
  completedAt?: string;
  recommendations: Recommendation[];
};

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'x-session-token': token } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Falha na comunicação com o servidor.' }));
    throw new Error(body.message ?? 'Falha na comunicação com o servidor.');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  createAnonymousSession: () => request<SessionResponse>('/auth/anonymous', { method: 'POST' }),
  register: (payload: { name: string; email: string; password: string }) =>
    request<SessionResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<SessionResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: (token: string) => request<void>('/auth/logout', { method: 'POST' }, token),
  startTest: (token: string, count = 18) =>
    request<{ attemptId: string; totalQuestions: number; questions: Question[] }>(`/test/start?count=${count}`, {}, token),
  submitTest: (token: string, attemptId: string, answers: Array<{ questionId: string; selectedAnswer: string }>) =>
    request<TestResult>(`/test/${attemptId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }, token),
  getResult: (token: string, attemptId: string) => request<TestResult>(`/results/${attemptId}`, {}, token),
  getHistory: (token: string) => request<{ attempts: TestResult[] }>('/results/history', {}, token),
};
