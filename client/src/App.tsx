import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LanguageSelectPage from './pages/LanguageSelectPage';
import LoginPage from './pages/LoginPage';
import ResultPage from './pages/ResultPage';
import StudentSetupPage from './pages/StudentSetupPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import TeacherLoginPage from './pages/TeacherLoginPage';
import TeacherStudentDetailPage from './pages/TeacherStudentDetailPage';
import TestPage from './pages/TestPage';
import WelcomePage from './pages/WelcomePage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/language" element={<LanguageSelectPage />} />
        <Route path="/setup" element={<StudentSetupPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/result/:attemptId" element={<ResultPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/professor" element={<TeacherLoginPage />} />
        <Route path="/professor/painel" element={<TeacherDashboardPage />} />
        <Route path="/professor/aluno/:attemptId" element={<TeacherStudentDetailPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
