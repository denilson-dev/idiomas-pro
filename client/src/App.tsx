import { useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAppStore } from './store/useAppStore';
import { WelcomePage, AuthPage, LanguagePage, SetupPage } from './premium/PublicPages';
import { ReviewPage, TestPage } from './premium/TestPages';
import { ResultPage, StudentDashboard, StudentProfile } from './premium/StudentPages';
import {
  TeacherDashboard,
  TeacherLogin,
  TeacherSettings,
  TeacherStudentDetail,
} from './premium/TeacherPages';
import { AdminPage } from './premium/AdminPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function StudentGate({ children }: { children: ReactNode }) {
  const token = useAppStore((state) => state.token);
  return token ? children : <Navigate to="/login" replace />;
}

function TeacherGate({ children }: { children: ReactNode }) {
  const teacherToken = useAppStore((state) => state.teacherToken);
  return teacherToken ? children : <Navigate to="/professor" replace />;
}

function AdminGate({ children }: { children: ReactNode }) {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const teacher = useAppStore((state) => state.teacher);

  return teacherToken && teacher?.role === 'ADMIN' ? (
    children
  ) : (
    <Navigate to="/professor" replace />
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/language"
          element={
            <StudentGate>
              <LanguagePage />
            </StudentGate>
          }
        />
        <Route
          path="/setup"
          element={
            <StudentGate>
              <SetupPage />
            </StudentGate>
          }
        />
        <Route
          path="/test"
          element={
            <StudentGate>
              <TestPage />
            </StudentGate>
          }
        />
        <Route
          path="/review"
          element={
            <StudentGate>
              <ReviewPage />
            </StudentGate>
          }
        />
        <Route
          path="/result/:attemptId"
          element={
            <StudentGate>
              <ResultPage />
            </StudentGate>
          }
        />
        <Route
          path="/dashboard"
          element={
            <StudentGate>
              <StudentDashboard />
            </StudentGate>
          }
        />
        <Route
          path="/student/profile"
          element={
            <StudentGate>
              <StudentProfile />
            </StudentGate>
          }
        />

        <Route path="/professor" element={<TeacherLogin />} />
        <Route
          path="/professor/painel"
          element={
            <TeacherGate>
              <TeacherDashboard />
            </TeacherGate>
          }
        />
        <Route
          path="/professor/aluno/:attemptId"
          element={
            <TeacherGate>
              <TeacherStudentDetail />
            </TeacherGate>
          }
        />
        <Route
          path="/professor/settings"
          element={
            <TeacherGate>
              <TeacherSettings />
            </TeacherGate>
          }
        />
        <Route
          path="/professor/administracao"
          element={
            <AdminGate>
              <AdminPage />
            </AdminGate>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
