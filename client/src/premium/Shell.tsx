import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpenCheck,
  Home,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { Brand } from './Brand';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export function PublicHeader() {
  return (
    <header className="topbar">
      <Brand compact />
      <div className="topbar__actions">
        <button className="language-pill" type="button" aria-label="Idioma da interface">
          🇧🇷 PT-BR
        </button>
      </div>
    </header>
  );
}

export function Workspace({
  children,
  area = 'student',
}: {
  children: ReactNode;
  area?: 'student' | 'teacher' | 'admin';
}) {
  const navigate = useNavigate();
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const teacherToken = useAppStore((state) => state.teacherToken);
  const teacher = useAppStore((state) => state.teacher);
  const clearSession = useAppStore((state) => state.clearSession);
  const clearTeacherSession = useAppStore((state) => state.clearTeacherSession);

  const account = area === 'student' ? user : teacher;
  const items =
    area === 'student'
      ? [
          ['/dashboard', Home, 'Início'],
          ['/dashboard', BarChart3, 'Meu progresso'],
          ['/language', BookOpenCheck, 'Nova avaliação'],
          ['/student/profile', UserRound, 'Meu perfil'],
        ]
      : area === 'teacher'
        ? [
            ['/professor/painel', Home, 'Visão geral'],
            ['/professor/painel', UsersRound, 'Alunos'],
            ['/professor/painel', BookOpenCheck, 'Avaliações'],
            ['/professor/settings', Settings, 'Configurações'],
          ]
        : [
            ['/professor/administracao', ShieldCheck, 'Visão geral'],
            ['/professor/administracao?tab=students', UserRound, 'Alunos'],
            ['/professor/administracao?tab=teachers', UsersRound, 'Professores'],
            ['/professor/settings', Settings, 'Configurações'],
          ];

  async function logout() {
    try {
      if (area === 'student' && token) await api.logout(token);
      if (area !== 'student' && teacherToken) await api.teacherLogout(teacherToken);
    } catch {
      // local cleanup still happens if network is unavailable
    }

    if (area === 'student') {
      clearSession();
      navigate('/');
    } else {
      clearTeacherSession();
      navigate('/professor');
    }
  }

  const initials =
    account?.name
      ?.split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'IP';

  return (
    <div className="workspace">
      <aside className="sidebar">
        <Brand compact />
        <nav>
          {items.map(([href, Icon, label]) => (
            <NavLink
              key={String(label)}
              to={String(href)}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item--active' : ''}`}
            >
              <Icon size={18} />
              <span>{String(label)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__foot">
          <button className="nav-item nav-item--button" onClick={logout}>
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="workspace__main">
        <header className="workspace__top">
          <div>
            <small>
              {area === 'student'
                ? 'Área do aluno'
                : area === 'teacher'
                  ? 'Portal do professor'
                  : 'Administração'}
            </small>
            <strong>{account?.name ?? 'Usuário'}</strong>
          </div>
          <div className="workspace__top-actions">
            <button className="language-pill" type="button">
              🇧🇷 PT-BR
            </button>
            <span className="avatar">{initials}</span>
          </div>
        </header>
        <div className="workspace__content">{children}</div>
      </main>
    </div>
  );
}
