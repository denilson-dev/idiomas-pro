import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StudentTestProfile, Teacher, User } from '../services/api';

const STAFF_SESSION_KEY = 'idiomas-pro-staff-session';

type StaffSession = {
  teacherToken: string;
  teacher: Teacher;
};

function readStaffSession(): StaffSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(STAFF_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StaffSession>;
    if (!parsed.teacherToken || !parsed.teacher) return null;

    return {
      teacherToken: parsed.teacherToken,
      teacher: parsed.teacher,
    };
  } catch {
    window.sessionStorage.removeItem(STAFF_SESSION_KEY);
    return null;
  }
}

function writeStaffSession(session: StaffSession | null) {
  if (typeof window === 'undefined') return;

  if (!session) {
    window.sessionStorage.removeItem(STAFF_SESSION_KEY);
    return;
  }

  window.sessionStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session));
}

const initialStaffSession = readStaffSession();

type AppState = {
  token: string | null;
  user: User | null;
  teacherToken: string | null;
  teacher: Teacher | null;
  testProfile: StudentTestProfile | null;
  setSession: (token: string, user: User | null) => void;
  clearSession: () => void;
  setTeacherSession: (token: string, teacher: Teacher) => void;
  clearTeacherSession: () => void;
  setTestProfile: (profile: StudentTestProfile) => void;
  clearTestProfile: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      teacherToken: initialStaffSession?.teacherToken ?? null,
      teacher: initialStaffSession?.teacher ?? null,
      testProfile: null,

      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null, testProfile: null }),

      setTeacherSession: (teacherToken, teacher) => {
        writeStaffSession({ teacherToken, teacher });
        set({ teacherToken, teacher });
      },

      clearTeacherSession: () => {
        writeStaffSession(null);
        set({ teacherToken: null, teacher: null });
      },

      setTestProfile: (testProfile) => set({ testProfile }),
      clearTestProfile: () => set({ testProfile: null }),
    }),
    {
      name: 'idiomas-pro-session',
      version: 2,
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        testProfile: state.testProfile,
      }),
      migrate: (persistedState) => {
        const previous = (persistedState ?? {}) as Partial<AppState>;

        return {
          token: previous.token ?? null,
          user: previous.user ?? null,
          testProfile: previous.testProfile ?? null,
        };
      },
    },
  ),
);
