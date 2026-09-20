import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StudentTestProfile, Teacher, User } from '../services/api';

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
      teacherToken: null,
      teacher: null,
      testProfile: null,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null, testProfile: null }),
      setTeacherSession: (teacherToken, teacher) => set({ teacherToken, teacher }),
      clearTeacherSession: () => set({ teacherToken: null, teacher: null }),
      setTestProfile: (testProfile) => set({ testProfile }),
      clearTestProfile: () => set({ testProfile: null }),
    }),
    { name: 'idiomas-pro-session' },
  ),
);
