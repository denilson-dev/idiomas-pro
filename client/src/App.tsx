import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { api } from './services/api';
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
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, search]);

  return null;
}

function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite">
      <span />
      <strong>Validando sua sessão...</strong>
    </div>
  );
}

function StudentGate({ children }: { children: ReactNode }) {
  const token = useAppStore((state) => state.token);
  const setSession = useAppStore((state) => state.setSession);
  const clearSession = useAppStore((state) => state.clearSession);
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>(
    token ? 'checking' : 'invalid',
  );

  useEffect(() => {
    let active = true;

    if (!token) {
      setStatus('invalid');
      return () => {
        active = false;
      };
    }

    setStatus('checking');
    api
      .me(token)
      .then(({ user }) => {
        if (!active) return;
        setSession(token, user);
        setStatus('valid');
      })
      .catch(() => {
        if (!active) return;
        clearSession();
        setStatus('invalid');
      });

    return () => {
      active = false;
    };
  }, [token, setSession, clearSession]);

  if (!token || status === 'invalid') return <Navigate to="/login" replace />;
  if (status === 'checking') return <RouteLoading />;
  return children;
}

function StaffGate({ children }: { children: ReactNode }) {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const setTeacherSession = useAppStore((state) => state.setTeacherSession);
  const clearTeacherSession = useAppStore((state) => state.clearTeacherSession);
  const [status, setStatus] = useState<'checking' | 'valid' | 'invalid'>(
    teacherToken ? 'checking' : 'invalid',
  );

  useEffect(() => {
    let active = true;

    if (!teacherToken) {
      setStatus('invalid');
      return () => {
        active = false;
      };
    }

    setStatus('checking');
    api
      .teacherMe(teacherToken)
      .then(({ teacher }) => {
        if (!active) return;
        setTeacherSession(teacherToken, teacher);
        setStatus('valid');
      })
      .catch(() => {
        if (!active) return;
        clearTeacherSession();
        setStatus('invalid');
      });

    return () => {
      active = false;
    };
  }, [teacherToken, setTeacherSession, clearTeacherSession]);

  if (!teacherToken || status === 'invalid') return <Navigate to="/professor" replace />;
  if (status === 'checking') return <RouteLoading />;
  return children;
}

function TeacherGate({ children }: { children: ReactNode }) {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const setTeacherSession = useAppStore((state) => state.setTeacherSession);
  const clearTeacherSession = useAppStore((state) => state.clearTeacherSession);
  const [status, setStatus] = useState<'checking' | 'valid' | 'admin' | 'invalid'>(
    teacherToken ? 'checking' : 'invalid',
  );

  useEffect(() => {
    let active = true;

    if (!teacherToken) {
      setStatus('invalid');
      return () => {
        active = false;
      };
    }

    setStatus('checking');
    api
      .teacherMe(teacherToken)
      .then(({ teacher }) => {
        if (!active) return;
        setTeacherSession(teacherToken, teacher);
        setStatus(teacher.role === 'ADMIN' ? 'admin' : 'valid');
      })
      .catch(() => {
        if (!active) return;
        clearTeacherSession();
        setStatus('invalid');
      });

    return () => {
      active = false;
    };
  }, [teacherToken, setTeacherSession, clearTeacherSession]);

  if (!teacherToken || status === 'invalid') return <Navigate to="/professor" replace />;
  if (status === 'admin') return <Navigate to="/professor/administracao" replace />;
  if (status === 'checking') return <RouteLoading />;
  return children;
}

function AdminGate({ children }: { children: ReactNode }) {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const setTeacherSession = useAppStore((state) => state.setTeacherSession);
  const clearTeacherSession = useAppStore((state) => state.clearTeacherSession);
  const [status, setStatus] = useState<'checking' | 'valid' | 'teacher' | 'invalid'>(
    teacherToken ? 'checking' : 'invalid',
  );

  useEffect(() => {
    let active = true;

    if (!teacherToken) {
      setStatus('invalid');
      return () => {
        active = false;
      };
    }

    setStatus('checking');
    api
      .teacherMe(teacherToken)
      .then(({ teacher }) => {
        if (!active) return;
        setTeacherSession(teacherToken, teacher);
        setStatus(teacher.role === 'ADMIN' ? 'valid' : 'teacher');
      })
      .catch(() => {
        if (!active) return;
        clearTeacherSession();
        setStatus('invalid');
      });

    return () => {
      active = false;
    };
  }, [teacherToken, setTeacherSession, clearTeacherSession]);

  if (!teacherToken || status === 'invalid') return <Navigate to="/professor" replace />;
  if (status === 'teacher') return <Navigate to="/professor/painel" replace />;
  if (status === 'checking') return <RouteLoading />;
  return children;
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
            <StaffGate>
              <TeacherSettings />
            </StaffGate>
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
