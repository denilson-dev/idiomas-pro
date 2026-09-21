import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Headphones,
  LogIn,
  School,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Brand, Owl } from './Brand';
import { Button, Field, Pill, Surface, Toast } from './UI';
import { PublicHeader, StudentFlowHeader } from './Shell';
import { LanguageMenu } from './LanguageMenu';
import { api, type TeacherOption } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { clearExamDraft } from './examDraft';

export function WelcomePage() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function startAnonymous() {
    try {
      setLoading(true);
      setMessage('');
      const session = await api.createAnonymousSession();
      setSession(session.token, session.user);
      navigate('/language');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível iniciar a avaliação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="welcome-page">
      <header className="welcome-header">
        <Brand />
        <div className="welcome-header__actions">
          <span className="welcome-header__note">Nivelamento de idiomas</span>
          <LanguageMenu />
        </div>
      </header>

      <main className="welcome-main">
        <section className="welcome-copy">
          <Pill tone="purple">
            <BookOpen size={14} /> Avaliação de nivelamento
          </Pill>

          <h1>
            Descubra seu nível.
            <span>Entenda o próximo passo.</span>
          </h1>

          <p className="welcome-lead">
            Uma avaliação simples de espanhol com gramática, vocabulário e listening para mostrar
            onde você está e ajudar a organizar o que estudar depois.
          </p>

          <div className="welcome-benefits" aria-label="O que você encontra na avaliação">
            <div>
              <ShieldCheck size={19} />
              <span>
                <b>Resultado imediato</b>
                <small>Nível e desempenho ao finalizar.</small>
              </span>
            </div>
            <div>
              <Headphones size={19} />
              <span>
                <b>Listening integrado</b>
                <small>Áudio dentro da própria avaliação.</small>
              </span>
            </div>
            <div>
              <Sparkles size={19} />
              <span>
                <b>Leitura de A1 a C2</b>
                <small>Uma referência de estudo, não uma certificação oficial.</small>
              </span>
            </div>
          </div>

          <div className="welcome-actions">
            <Button onClick={startAnonymous} disabled={loading}>
              {loading ? 'Preparando...' : 'Começar avaliação'} <ArrowRight size={18} />
            </Button>
            <Button variant="secondary" onClick={() => navigate('/login')}>
              <LogIn size={18} /> Entrar como aluno
            </Button>
          </div>

          <div className="welcome-staff-entry">
            <span>Professor ou administrador?</span>
            <button type="button" onClick={() => navigate('/professor')}>
              <School size={17} />
              Acessar área da equipe
              <ArrowRight size={15} />
            </button>
          </div>
        </section>

        <section className="welcome-visual" aria-label="Visão da avaliação">
          <div className="welcome-visual__halo" />
          <div className="welcome-visual__levels" aria-hidden="true">
            <span>A1</span>
            <span>B1</span>
            <span>C2</span>
          </div>
          <Owl mode="celebrate" />
          <div className="welcome-visual__caption">
            <strong>Gramática • Vocabulário • Listening</strong>
            <span>Uma experiência curta, clara e guiada.</span>
          </div>
        </section>
      </main>

      {message && <Toast message={message} tone="error" />}
    </div>
  );
}

export function AuthPage() {
  const navigate = useNavigate();
  const token = useAppStore((state) => state.token);
  const setSession = useAppStore((state) => state.setSession);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  if (token) return <Navigate to="/language" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      setMessage('');
      const session =
        mode === 'login'
          ? await api.login({ email, password })
          : await api.register({ name, email, password });
      setSession(session.token, session.user);
      navigate('/language');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível continuar.');
    } finally {
      setLoading(false);
    }
  }

  async function continueAsVisitor() {
    try {
      setLoading(true);
      const session = await api.createAnonymousSession();
      setSession(session.token, session.user);
      navigate('/language');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível iniciar como visitante.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="public-page">
      <PublicHeader backTo="/" backLabel="Início" />
      <section className="auth-layout">
        <div className="auth-story">
          <Pill tone="teal">Experiência do aluno</Pill>
          <h1>Que bom ter você aqui.</h1>
          <p>
            Continue do ponto onde parou, veja seu histórico e acompanhe sua evolução sem perder o
            foco.
          </p>
          <Owl mode="study" />
        </div>

        <Surface className="auth-card">
          <div className="segmented">
            <button
              type="button"
              onClick={() => {
                setMessage('');
                setMode('login');
              }}
              className={mode === 'login' ? 'active' : ''}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMessage('');
                setMode('register');
              }}
              className={mode === 'register' ? 'active' : ''}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={submit}>
            {mode === 'register' && (
              <Field label="Nome completo" value={name} onChange={setName} placeholder="Seu nome" />
            )}
            <Field label="E-mail" value={email} onChange={setEmail} type="email" placeholder="seuemail@exemplo.com" />
            <Field label="Senha" value={password} onChange={setPassword} type="password" />
            <Button type="submit" className="full" disabled={loading}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
              <ArrowRight size={18} />
            </Button>
          </form>

          <Button variant="ghost" className="full" onClick={continueAsVisitor} disabled={loading}>
            Continuar como visitante
          </Button>
        </Surface>
      </section>

      {message && <Toast message={message} tone="error" />}
    </div>
  );
}

export function LanguagePage() {
  const navigate = useNavigate();
  const token = useAppStore((state) => state.token);
  const [language, setLanguage] = useState('ES');
  const cards = [
    ['ES', '🇪🇸', 'Espanhol', 'Disponível agora'],
    ['EN', '🇺🇸', 'Inglês', 'Em breve'],
    ['FR', '🇫🇷', 'Francês', 'Em breve'],
  ];

  if (!token) return <Navigate to="/" replace />;

  return (
    <div className="public-page">
      <StudentFlowHeader backTo="/" backLabel="Início" />
      <section className="page-intro">
        <Pill tone="purple">Etapa 1 de 2</Pill>
        <h1>Qual idioma você quer avaliar?</h1>
        <p>O idioma da interface continua em português. Aqui você escolhe apenas a avaliação.</p>
      </section>

      <div className="language-grid">
        {cards.map(([code, flag, name, status]) => (
          <button
            type="button"
            key={code}
            onClick={() => status === 'Disponível agora' && setLanguage(code)}
            disabled={status !== 'Disponível agora'}
            aria-disabled={status !== 'Disponível agora'}
            className={`language-card ${language === code ? 'selected' : ''} ${
              status !== 'Disponível agora' ? 'disabled' : ''
            }`}
          >
            <span className="language-card__flag">{flag}</span>
            <b>{name}</b>
            <span>{status}</span>
            {language === code && <i>✓</i>}
          </button>
        ))}
      </div>

      <Surface className="selection-summary">
        <div>
          <small>Selecionado</small>
          <strong>🇪🇸 Espanhol</strong>
          <span>Gramática, vocabulário e listening • A1 a C2</span>
        </div>
        <Button onClick={() => navigate('/setup')}>
          Continuar <ArrowRight size={18} />
        </Button>
      </Surface>
    </div>
  );
}

export function SetupPage() {
  const navigate = useNavigate();
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const setTestProfile = useAppStore((state) => state.setTestProfile);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .getTeachers()
      .then(({ teachers }) =>
        setTeachers(teachers.filter((teacher) => teacher.role === 'TEACHER')),
      )
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : 'Não foi possível carregar os professores.'),
      )
      .finally(() => setLoading(false));
  }, []);

  const selectedTeacher = useMemo(
    () => teachers.find((teacher) => teacher.id === teacherId) ?? null,
    [teachers, teacherId],
  );

  if (!token) return <Navigate to="/" replace />;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setMessage('Informe seu nome para continuar.');
      return;
    }
    if (!selectedTeacher) {
      setMessage('Selecione o professor responsável.');
      return;
    }

    clearExamDraft();
    setTestProfile({
      count: 18,
      studentName: name.trim(),
      studentEmail: email.trim(),
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      language: 'ES',
    });
    navigate('/test');
  }

  return (
    <div className="public-page">
      <StudentFlowHeader backTo="/language" backLabel="Idiomas" />
      <section className="page-intro">
        <Pill tone="teal">Etapa 2 de 2</Pill>
        <h1>Antes de começar</h1>
        <p>Organize sua avaliação e vincule o resultado ao professor responsável.</p>
      </section>

      <div className="setup-grid">
        <Surface className="form-card setup-form-card">
          <div className="setup-card-heading">
            <div>
              <span>Dados da avaliação</span>
              <h2>Quem vai realizar o teste?</h2>
              <p>Preencha seus dados e escolha apenas um professor responsável pela correção e acompanhamento.</p>
            </div>
          </div>
          <form onSubmit={submit}>
            <Field label="Seu nome" value={name} onChange={setName} placeholder="Digite seu nome completo" />
            <Field label="E-mail" value={email} onChange={setEmail} type="email" />
            <label className="field">
              <span>Professor responsável</span>
              <select
                value={teacherId}
                disabled={loading}
                onChange={(event) => setTeacherId(event.target.value)}
              >
                <option value="">
                  {loading
                    ? 'Carregando professores...'
                    : teachers.length
                      ? 'Selecione um professor'
                      : 'Nenhum professor disponível'}
                </option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </label>

            {!loading && teachers.length === 0 && (
              <div className="setup-warning" role="status">
                Nenhum professor ativo está disponível no momento. Peça ao administrador para cadastrar ou ativar uma conta de professor.
              </div>
            )}

            <Button type="submit" className="full setup-submit" disabled={loading || teachers.length === 0}>
              Começar avaliação <ArrowRight size={18} />
            </Button>
          </form>
        </Surface>

        <Surface className="setup-summary">
          <div className="setup-summary__hero">
            <Owl mode="study" />
            <div>
              <span>Resumo</span>
              <h3>Sua avaliação</h3>
              <p>Confira os detalhes antes de iniciar.</p>
            </div>
          </div>
          <dl className="setup-facts">
            <div>
              <dt>Idioma</dt>
              <dd>Espanhol</dd>
            </div>
            <div>
              <dt>Questões</dt>
              <dd>18</dd>
            </div>
            <div>
              <dt>Tempo médio</dt>
              <dd>12–18 min</dd>
            </div>
            <div>
              <dt>Professor</dt>
              <dd>{selectedTeacher?.name ?? '—'}</dd>
            </div>
          </dl>
        </Surface>
      </div>

      {message && <Toast message={message} tone="error" />}
    </div>
  );
}
