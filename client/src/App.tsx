import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import LanguageSelectPage from './pages/LanguageSelectPage';
import ResultPage from './pages/ResultPage';
import TestPage from './pages/TestPage';
import WelcomePage from './pages/WelcomePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/language" element={<LanguageSelectPage />} />
      <Route path="/test" element={<TestPage />} />
      <Route path="/result/:attemptId" element={<ResultPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
