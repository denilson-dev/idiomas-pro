import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  ActiveTest,
  StudentTestProfile,
  Teacher,
  User,
} from '../services/api';

type AppState = {
  token: string | null;
  user: User | null;
  teacherToken: string | null;
  teacher: Teacher | null;
  selectedLanguage: 'ES';
  testProfile: StudentTestProfile | null;
  activeTest: ActiveTest | null;
  currentQuestionIndex: number;
  setSession: (token: string, user: User | null) => void;
  updateUser: (user: User) => void;
  clearSession: () => void;
  setTeacherSession: (token: string, teacher: Teacher) => void;
  updateTeacher: (teacher: Teacher) => void;
  clearTeacherSession: () => void;
  setSelectedLanguage: (language: 'ES') => void;
  setTestProfile: (profile: StudentTestProfile) => void;
  clearTestProfile: () => void;
  setActiveTest: (test: ActiveTest) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setTestAnswer: (questionId: string, selectedAnswer: string) => void;
  clearActiveTest: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      teacherToken: null,
      teacher: null,
      selectedLanguage: 'ES',
      testProfile: null,
      activeTest: null,
      currentQuestionIndex: 0,
      setSession: (token, user) => set({ token, user }),
      updateUser: (user) => set({ user }),
      clearSession: () => set({
        token: null,
        user: null,
        testProfile: null,
        activeTest: null,
        currentQuestionIndex: 0,
      }),
      setTeacherSession: (teacherToken, teacher) => set({ teacherToken, teacher }),
      updateTeacher: (teacher) => set({ teacher }),
      clearTeacherSession: () => set({ teacherToken: null, teacher: null }),
      setSelectedLanguage: (selectedLanguage) => set({ selectedLanguage }),
      setTestProfile: (testProfile) => set({ testProfile }),
      clearTestProfile: () => set({ testProfile: null }),
      setActiveTest: (activeTest) => set({ activeTest, currentQuestionIndex: 0 }),
      setCurrentQuestionIndex: (currentQuestionIndex) => set({ currentQuestionIndex }),
      setTestAnswer: (questionId, selectedAnswer) => set((state) => ({
        activeTest: state.activeTest
          ? {
              ...state.activeTest,
              answers: {
                ...state.activeTest.answers,
                [questionId]: selectedAnswer,
              },
            }
          : null,
      })),
      clearActiveTest: () => set({ activeTest: null, currentQuestionIndex: 0 }),
    }),
    {
      name: 'idiomas-pro-session',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        teacherToken: state.teacherToken,
        teacher: state.teacher,
        selectedLanguage: state.selectedLanguage,
        testProfile: state.testProfile,
        activeTest: state.activeTest,
        currentQuestionIndex: state.currentQuestionIndex,
      }),
    },
  ),
);
