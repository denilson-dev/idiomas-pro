import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LanguageSelectPage from './pages/LanguageSelectPage';
import ResultPage from './pages/ResultPage';
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
        <Route path="/language" element={<LanguageSelectPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/result/:attemptId" element={<ResultPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
