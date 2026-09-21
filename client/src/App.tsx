import { useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import {
  AuthPage,
  LanguagePage,
  SetupPage,
  WelcomePage,
} from './pages/PremiumPublicPages';
import { ReviewPage, TestPage } from './pages/PremiumTestPages';
import {
  HelpPage,
  ResultPage,
  StudentDashboard,
  StudentHistory,
  StudentProfile,
} from './pages/PremiumStudentPages';
import {
  TeacherAssessments,
  TeacherDashboard,
  TeacherLogin,
  TeacherReports,
  TeacherSettings,
  TeacherStudentDetail,
  TeacherStudents,
} from './pages/PremiumTeacherPages';
import { AdminPage } from './pages/PremiumAdminPage';
import { useAppStore } from './store/useAppStore';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function SessionGate({ children }: { children: ReactNode }) {
  const token = useAppStore((state) => state.token);
  return token ? children : <Navigate to="/" replace />;
}

function TeacherGate({ children }: { children: ReactNode }) {
  const token = useAppStore((state) => state.teacherToken);
  return token ? children : <Navigate to="/professor" replace />;
}

function AdminGate({ children }: { children: ReactNode }) {
  const token = useAppStore((state) => state.teacherToken);
  const teacher = useAppStore((state) => state.teacher);

  if (!token) return <Navigate to="/professor" replace />;
  if (teacher?.role !== 'ADMIN') return <Navigate to="/professor/painel" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<AuthPage />} />

        <Route path="/language" element={<SessionGate><LanguagePage /></SessionGate>} />
        <Route path="/setup" element={<SessionGate><SetupPage /></SessionGate>} />
        <Route path="/test" element={<SessionGate><TestPage /></SessionGate>} />
        <Route path="/review" element={<SessionGate><ReviewPage /></SessionGate>} />
        <Route path="/result/:attemptId" element={<SessionGate><ResultPage /></SessionGate>} />

        <Route path="/dashboard" element={<SessionGate><StudentDashboard /></SessionGate>} />
        <Route path="/student/history" element={<SessionGate><StudentHistory /></SessionGate>} />
        <Route path="/student/profile" element={<SessionGate><StudentProfile /></SessionGate>} />
        <Route path="/help" element={<SessionGate><HelpPage /></SessionGate>} />

        <Route path="/professor" element={<TeacherLogin />} />
        <Route path="/professor/painel" element={<TeacherGate><TeacherDashboard /></TeacherGate>} />
        <Route path="/professor/alunos" element={<TeacherGate><TeacherStudents /></TeacherGate>} />
        <Route path="/professor/avaliacoes" element={<TeacherGate><TeacherAssessments /></TeacherGate>} />
        <Route path="/professor/relatorios" element={<TeacherGate><TeacherReports /></TeacherGate>} />
        <Route path="/professor/settings" element={<TeacherGate><TeacherSettings /></TeacherGate>} />
        <Route path="/professor/aluno/:attemptId" element={<TeacherGate><TeacherStudentDetail /></TeacherGate>} />
        <Route path="/professor/administracao" element={<AdminGate><AdminPage /></AdminGate>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
