import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
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
import { LanguageMenu } from './LanguageMenu';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { clearExamDraft } from './examDraft';

type Area = 'student' | 'teacher' | 'admin';

type ProductNavItem = {
  to: string;
  label: string;
  shortLabel: string;
  icon: typeof Home;
};

function productNavigation(area: Area): ProductNavItem[] {
  if (area === 'student') {
    return [
      { to: '/dashboard', label: 'Início', shortLabel: 'Início', icon: Home },
      {
        to: '/dashboard?view=progress',
        label: 'Meu progresso',
        shortLabel: 'Progresso',
        icon: BarChart3,
      },
      {
        to: '/language',
        label: 'Nova avaliação',
        shortLabel: 'Avaliar',
        icon: BookOpenCheck,
      },
      {
        to: '/student/profile',
        label: 'Minha conta',
        shortLabel: 'Conta',
        icon: UserRound,
      },
    ];
  }

  if (area === 'teacher') {
    return [
      {
        to: '/professor/painel',
        label: 'Visão pedagógica',
        shortLabel: 'Visão',
        icon: Home,
      },
      {
        to: '/professor/painel?view=students',
        label: 'Alunos',
        shortLabel: 'Alunos',
        icon: UsersRound,
      },
      {
        to: '/professor/painel?view=assessments',
        label: 'Avaliações',
        shortLabel: 'Provas',
        icon: BookOpenCheck,
      },
      {
        to: '/professor/settings',
        label: 'Minha conta',
        shortLabel: 'Conta',
        icon: Settings,
      },
    ];
  }

  return [
    {
      to: '/professor/administracao',
      label: 'Visão geral',
      shortLabel: 'Visão',
      icon: ShieldCheck,
    },
    {
      to: '/professor/administracao?tab=students',
      label: 'Alunos',
      shortLabel: 'Alunos',
      icon: UserRound,
    },
    {
      to: '/professor/administracao?tab=teachers',
      label: 'Professores',
      shortLabel: 'Professores',
      icon: UsersRound,
    },
    {
      to: '/professor/settings',
      label: 'Minha conta',
      shortLabel: 'Conta',
      icon: Settings,
    },
  ];
}

function itemIsActive(item: ProductNavItem, pathname: string, search: string) {
  const [targetPath, targetQuery = ''] = item.to.split('?');
  if (pathname !== targetPath) return false;

  const targetParams = new URLSearchParams(targetQuery);
  const currentParams = new URLSearchParams(search);

  const targetView = targetParams.get('view');
  const targetTab = targetParams.get('tab');

  if (targetView) return currentParams.get('view') === targetView;
  if (targetTab) return currentParams.get('tab') === targetTab;

  if (targetPath === '/dashboard') return !currentParams.get('view');
  if (targetPath === '/professor/painel') return !currentParams.get('view');
  if (targetPath === '/professor/administracao') return !currentParams.get('tab');

  return true;
}

function roleLabel(area: Area) {
  if (area === 'student') return 'Aluno';
  if (area === 'teacher') return 'Professor';
  return 'Administrador';
}

export function PublicHeader({
  backTo,
  backLabel = 'Voltar',
}: {
  backTo?: string;
  backLabel?: string;
}) {
  return (
    <header className="topbar product-public-header">
      <div className="product-public-header__side">
        {backTo ? (
          <Link to={backTo} className="text-action" aria-label={backLabel}>
            <ArrowLeft size={17} />
            <span>{backLabel}</span>
          </Link>
        ) : (
          <span className="product-public-header__spacer" />
        )}
      </div>

      <Brand compact />

      <div className="product-public-header__side product-public-header__side--end">
        <LanguageMenu />
      </div>
    </header>
  );
}

export function StudentFlowHeader({
  backTo,
  backLabel = 'Voltar',
  onExit,
  onBack,
}: {
  backTo?: string;
  backLabel?: string;
  onExit?: () => Promise<void> | void;
  onBack?: () => Promise<void> | void;
}) {
  const navigate = useNavigate();
  const token = useAppStore((state) => state.token);
  const clearSession = useAppStore((state) => state.clearSession);
  const clearTestProfile = useAppStore((state) => state.clearTestProfile);

  async function exitFlow() {
    try {
      if (onExit) {
        await onExit();
      }

      if (token) {
        await api.logout(token);
      }
    } catch {
      // Cleanup local continua mesmo quando a rede estiver indisponível.
    }

    clearExamDraft();
    clearTestProfile();
    clearSession();
    navigate('/');
  }

  return (
    <header className="topbar product-public-header">
      <div className="product-public-header__side">
        {onBack ? (
          <button type="button" className="text-action" aria-label={backLabel} onClick={() => void onBack()}>
            <ArrowLeft size={17} />
            <span>{backLabel}</span>
          </button>
        ) : backTo ? (
          <Link to={backTo} className="text-action" aria-label={backLabel}>
            <ArrowLeft size={17} />
            <span>{backLabel}</span>
          </Link>
        ) : (
          <span className="product-public-header__spacer" />
        )}
      </div>

      <Brand compact />

      <div className="product-public-header__side product-public-header__side--end">
        <LanguageMenu />
        <button type="button" className="text-action text-action--danger" aria-label="Sair da conta" onClick={exitFlow}>
          <LogOut size={17} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
}

export function Workspace({
  children,
  area = 'student',
  backTo,
  backLabel = 'Voltar',
}: {
  children: ReactNode;
  area?: Area;
  backTo?: string;
  backLabel?: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const teacherToken = useAppStore((state) => state.teacherToken);
  const teacher = useAppStore((state) => state.teacher);
  const clearSession = useAppStore((state) => state.clearSession);
  const clearTeacherSession = useAppStore((state) => state.clearTeacherSession);

  const account = area === 'student' ? user : teacher;
  const items = productNavigation(area);

  async function logout() {
    try {
      if (area === 'student' && token) await api.logout(token);
      if (area !== 'student' && teacherToken) await api.teacherLogout(teacherToken);
    } catch {
      // O encerramento local não depende da rede.
    }

    clearExamDraft();

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
    <div className={`workspace workspace--${area}`}>
      <header className="product-header">
        <div className="product-header__bar">
          <div className="product-header__brand">
            <Brand compact />
            <div className="product-header__identity">
              <span>{roleLabel(area)}</span>
              <strong>{account?.name ?? 'Usuário'}</strong>
            </div>
          </div>

          <div className="product-header__actions">
            {backTo && (
              <Link to={backTo} className="text-action product-header__back" aria-label={backLabel}>
                <ArrowLeft size={17} />
                <span>{backLabel}</span>
              </Link>
            )}

            <LanguageMenu />

            <span className="avatar" title={account?.name ?? 'Conta'}>
              {initials}
            </span>

            <button type="button" className="text-action text-action--danger" aria-label="Sair da conta" onClick={logout}>
              <LogOut size={17} />
              <span>Sair</span>
            </button>
          </div>
        </div>

        <nav className="product-navigation" aria-label="Navegação principal">
          {items.map((item) => {
            const Icon = item.icon;
            const active = itemIsActive(item, location.pathname, location.search);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`product-navigation__item ${active ? 'is-active' : ''}`}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={18} />
                <span className="product-navigation__label">{item.label}</span>
                <span className="product-navigation__short-label">{item.shortLabel}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="workspace__main">
        <div className="workspace__content">{children}</div>
      </main>
    </div>
  );
}
