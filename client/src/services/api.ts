const API_URL = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api');

export type User = { id: string; name: string; email: string };
export type Teacher = { id: string; name: string; email: string };
export type TeacherOption = { id: string; name: string };
export type SessionResponse = { token: string; expiresAt: string; user: User | null };
export type TeacherSessionResponse = { token: string; expiresAt: string; teacher: Teacher };

export type Question = {
  id: string;
  prompt: string;
  options: string[];
  category: 'GRAMMAR' | 'VOCABULARY' | 'LISTENING';
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
  studentName?: string | null;
  studentEmail?: string | null;
  language?: string;
  teacher?: { id: string; name: string } | null;
  teacherId?: string | null;
  score: number;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  correct?: number;
  total?: number;
  totalQuestions?: number;
  breakdown: BreakdownItem[];
  completedAt?: string;
  recommendations: Recommendation[];
};

export type StudentTestProfile = {
  count: number;
  studentName: string;
  studentEmail?: string;
  teacherId: string;
  teacherName: string;
  language: 'ES';
};

export type TeacherAttempt = {
  id: string;
  studentName: string | null;
  studentEmail: string | null;
  language: string;
  score: number | null;
  cefrLevel: TestResult['cefrLevel'] | null;
  breakdown: BreakdownItem[] | null;
  totalQuestions: number;
  completedAt: string | null;
};

export type TeacherDashboard = {
  teacher: Teacher;
  metrics: {
    totalAssessments: number;
    uniqueStudents: number;
    averageScore: number;
    latestLevel: TestResult['cefrLevel'] | null;
  };
  levelDistribution: Array<{ level: TestResult['cefrLevel']; count: number }>;
  attempts: TeacherAttempt[];
};

export type TeacherAttemptDetail = {
  id: string;
  studentName: string | null;
  studentEmail: string | null;
  language: string;
  score: number | null;
  cefrLevel: TestResult['cefrLevel'] | null;
  breakdown: BreakdownItem[] | null;
  totalQuestions: number;
  completedAt: string | null;
  answers: Array<{
    question: string;
    category: 'GRAMMAR' | 'VOCABULARY' | 'LISTENING';
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }>;
};

async function readResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => '');
  return { __nonJson: true, text };
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  tokenHeader = 'x-session-token',
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { [tokenHeader]: token } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (response.status === 204) return undefined as T;

  const body = await readResponseBody(response);

  if (!response.ok) {
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      throw new Error(body.message);
    }

    throw new Error(
      `API indisponível (HTTP ${response.status}). Verifique se o backend foi publicado e se a rota /api está acessível.`
    );
  }

  if (body && typeof body === 'object' && '__nonJson' in body) {
    throw new Error('O servidor retornou uma página HTML no lugar da API.');
  }

  return body as T;
}

export const api = {
  createAnonymousSession: () => request<SessionResponse>('/auth/anonymous', { method: 'POST' }),
  register: (payload: { name: string; email: string; password: string }) =>
    request<SessionResponse>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<SessionResponse>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  logout: (token: string) => request<void>('/auth/logout', { method: 'POST' }, token),

  getTeachers: () => request<{ teachers: TeacherOption[] }>('/teachers'),

  startTest: (token: string, payload: Omit<StudentTestProfile, 'teacherName'>) =>
    request<{ attemptId: string; totalQuestions: number; studentName: string; teacher: TeacherOption; questions: Question[] }>(
      '/test/start',
      { method: 'POST', body: JSON.stringify(payload) },
      token,
    ),
  submitTest: (token: string, attemptId: string, answers: Array<{ questionId: string; selectedAnswer: string }>) =>
    request<TestResult>(`/test/${attemptId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }, token),
  getResult: (token: string, attemptId: string) => request<TestResult>(`/results/${attemptId}`, {}, token),
  getHistory: (token: string) => request<{ attempts: TestResult[] }>('/results/history', {}, token),

  getTeacherBootstrapStatus: () =>
    request<{ canCreateFirstTeacher: boolean }>('/teacher/auth/bootstrap-status'),
  bootstrapTeacher: (payload: { name: string; email: string; password: string }) =>
    request<TeacherSessionResponse>('/teacher/auth/bootstrap', { method: 'POST', body: JSON.stringify(payload) }),
  teacherLogin: (payload: { email: string; password: string }) =>
    request<TeacherSessionResponse>('/teacher/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  teacherLogout: (token: string) =>
    request<void>('/teacher/auth/logout', { method: 'POST' }, token, 'x-teacher-token'),
  getTeacherDashboard: (token: string) =>
    request<TeacherDashboard>('/teacher/dashboard', {}, token, 'x-teacher-token'),
  getTeacherAttempt: (token: string, attemptId: string) =>
    request<TeacherAttemptDetail>(`/teacher/attempts/${attemptId}`, {}, token, 'x-teacher-token'),
};
