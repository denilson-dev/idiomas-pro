import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Headphones,
  KeyRound,
   Save,
  Sparkles,
} from 'lucide-react';
import { api, type AccountPreferences, type TestResult } from '../services/api';
import { getStoredResult, saveResult } from '../services/resultStorage';
import { useAppStore } from '../store/useAppStore';
import { Owl } from './Brand';
import { Button, Field, Pill, Stat, Surface, Toast } from './UI';
import { StudentFlowHeader, Workspace } from './Shell';

function average(values: number[]) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

function latestBreakdownValue(result: TestResult | undefined, category: 'GRAMMAR' | 'VOCABULARY' | 'LISTENING') {
  return result?.breakdown.find((item) => item.category === category)?.percentage ?? 0;
}

export function ResultPage() {
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const token = useAppStore((state) => state.token);
  const [result, setResult] = useState<TestResult | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !attemptId) return;
    const stored = getStoredResult(attemptId);
    if (stored) {
      setResult(stored);
      return;
    }

    api
      .getResult(token, attemptId)
      .then((data) => {
        saveResult(data);
        setResult(data);
      })
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : 'Resultado indisponível.'),
      );
  }, [token, attemptId]);

  if (!token) return <Navigate to="/" replace />;

  if (!result) {
    return (
      <div className="public-page result-page">
        <StudentFlowHeader backTo="/dashboard" backLabel="Painel" />
        <Surface className="empty">
          <div className="empty__icon">✦</div>
          <h3>{message || 'Calculando seu resultado...'}</h3>
          <p>Aguarde enquanto carregamos sua análise.</p>
        </Surface>
      </div>
    );
  }

  return (
    <div className="public-page result-page">
      <StudentFlowHeader backTo="/dashboard" backLabel="Painel" />

      <section className="result-hero">
        <div>
          <Pill tone="teal">Avaliação concluída</Pill>
          <h1>Seu resultado chegou ✦</h1>
          <p>
            Uma leitura simples do seu desempenho, com próximos passos práticos para continuar
            evoluindo.
          </p>
        </div>
        <Owl mode="celebrate" />
      </section>

      <div className="result-grid">
        <Surface className="level-card">
          <small>Nível atual</small>
          <strong>{result.cefrLevel}</strong>
          <b>{result.score}%</b>
          <span>Pontuação geral</span>
          <div className="progress-track">
            <i style={{ width: `${result.score}%` }} />
          </div>
          <Button variant="secondary" className="full" onClick={() => navigate('/dashboard')}>
            Ver meu histórico <ArrowRight size={17} />
          </Button>
        </Surface>

        <div className="result-stack">
          <Surface>
            <h3>Desempenho por habilidade</h3>
            {result.breakdown.map((item) => (
              <div className="result-skill" key={item.category}>
                <div>
                  <b>{item.label}</b>
                  <span>{item.percentage}%</span>
                </div>
                <div
                  className={`bar ${
                    item.category === 'GRAMMAR'
                      ? 'bar--pink'
                      : item.category === 'VOCABULARY'
                        ? 'bar--teal'
                        : 'bar--orange'
                  }`}
                >
                  <i style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}
          </Surface>

          <Surface className="next-step">
            <Sparkles />
            <div>
              <h3>Próximo passo recomendado</h3>
              <p>
                {result.recommendations[0]?.description ??
                  'Continue praticando as habilidades com menor aproveitamento.'}
              </p>
              <Pill tone="teal">
                {result.recommendations[0]?.tag ?? `Plano ${result.cefrLevel}`}
              </Pill>
            </div>
          </Surface>
        </div>
      </div>

      <div className="hero-actions" style={{ marginTop: 24 }}>
        <Button onClick={() => navigate('/language')}>
          Nova avaliação <ArrowRight size={17} />
        </Button>
        <Button variant="secondary" onClick={() => navigate('/student/profile')}>
          Meu perfil
        </Button>
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [attempts, setAttempts] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const view = searchParams.get('view') === 'progress' ? 'progress' : 'home';

  useEffect(() => {
    if (!token) return;
    api
      .getHistory(token)
      .then(({ attempts }) => setAttempts(attempts))
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : 'Não foi possível carregar o histórico.'),
      )
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) return <Navigate to="/login" replace />;

  const latest = attempts[0];
  const avg = average(attempts.map((item) => item.score));
  const best = latest
    ? [
        ['Gramática', latestBreakdownValue(latest, 'GRAMMAR')],
        ['Vocabulário', latestBreakdownValue(latest, 'VOCABULARY')],
        ['Listening', latestBreakdownValue(latest, 'LISTENING')],
      ].sort((a, b) => Number(b[1]) - Number(a[1]))[0]
    : ['—', 0];

  if (view === 'progress') {
    return (
      <Workspace area="student">
        <div className="workspace-heading">
          <div>
            <small>Meu progresso</small>
            <h1>Sua evolução</h1>
            <p>Veja como seu desempenho mudou e quais habilidades merecem mais atenção.</p>
          </div>
          <Button onClick={() => navigate('/language')}>
            Nova avaliação <ArrowRight size={17} />
          </Button>
        </div>

        <div className="progress-summary">
          <div>
            <span>Nível mais recente</span>
            <strong>{latest?.cefrLevel ?? '—'}</strong>
          </div>
          <div>
            <span>Média das avaliações</span>
            <strong>{avg}%</strong>
          </div>
          <div>
            <span>Avaliações concluídas</span>
            <strong>{attempts.length}</strong>
          </div>
          <div>
            <span>Habilidade mais forte</span>
            <strong>{String(best[0])}</strong>
            <small>{latest ? `${best[1]}% na última avaliação` : 'Sem dados ainda'}</small>
          </div>
        </div>

        <div className="dashboard-grid progress-grid">
          <Surface className="chart-card">
            <div className="section-title">
              <div>
                <small>Linha do tempo</small>
                <h2>Evolução das notas</h2>
              </div>
            </div>

            {attempts.length ? (
              <div className="fake-chart">
                <div className="chart-line">
                  {attempts
                    .slice(0, 6)
                    .reverse()
                    .map((attempt, index, array) => (
                      <i
                        key={attempt.attemptId ?? attempt.id ?? index}
                        style={{
                          left: `${8 + (index * 84) / Math.max(1, array.length - 1)}%`,
                          bottom: `${Math.max(8, attempt.score * 0.72)}%`,
                        }}
                      />
                    ))}
                </div>
                <div className="chart-axis">
                  {attempts
                    .slice(0, 6)
                    .reverse()
                    .map((_, index) => (
                      <span key={index}>T{index + 1}</span>
                    ))}
                </div>
              </div>
            ) : (
              <div className="empty empty--inline">
                <h3>Ainda não existe uma linha do tempo</h3>
                <p>Faça sua primeira avaliação para iniciar o acompanhamento.</p>
              </div>
            )}
          </Surface>

          <Surface className="skill-board">
            <div className="section-title">
              <div>
                <small>Última avaliação</small>
                <h2>Habilidades</h2>
              </div>
            </div>

            {latest?.breakdown.map((item) => (
              <div className="skill-board__item" key={item.category}>
                <div>
                  <span>{item.label}</span>
                  <strong>{item.percentage}%</strong>
                </div>
                <div className="bar">
                  <i style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}

            {!latest && <p className="muted">Suas habilidades aparecerão depois da primeira avaliação.</p>}
          </Surface>
        </div>

        <Surface className="history-table">
          <div className="section-title">
            <div>
              <small>Histórico</small>
              <h2>Todas as avaliações</h2>
            </div>
          </div>

          <div className="table">
            <div className="table__head">
              <span>Data</span>
              <span>Professor</span>
              <span>Nível</span>
              <span>Nota</span>
              <span>Ação</span>
            </div>

            {attempts.map((attempt) => (
              <div className="table__row" key={attempt.attemptId ?? attempt.id}>
                <span>
                  <b>
                    {attempt.completedAt
                      ? new Date(attempt.completedAt).toLocaleDateString('pt-BR')
                      : '—'}
                  </b>
                  <small>Espanhol</small>
                </span>
                <span>{attempt.teacher?.name ?? 'Professor'}</span>
                <span>
                  <Pill tone="teal">{attempt.cefrLevel}</Pill>
                </span>
                <strong>{attempt.score}%</strong>
                <Button
                  variant="ghost"
                  onClick={() => navigate(`/result/${attempt.attemptId ?? attempt.id}`)}
                >
                  Ver resultado
                </Button>
              </div>
            ))}
          </div>
        </Surface>

        {message && <Toast message={message} tone="error" />}
      </Workspace>
    );
  }

  return (
    <Workspace area="student">
      <section className="student-home-hero">
        <div>
          <small>Olá, {user?.name?.split(' ')[0] || 'aluno'}</small>
          <h1>{latest ? 'Continue de onde você parou.' : 'Descubra seu nível de espanhol.'}</h1>
          <p>
            {latest
              ? 'Seu resultado mais recente está aqui, junto com um próximo passo simples.'
              : 'Faça sua primeira avaliação para montar seu histórico de aprendizagem.'}
          </p>
          <div className="hero-actions">
            <Button onClick={() => navigate('/language')}>
              {latest ? 'Fazer nova avaliação' : 'Começar avaliação'} <ArrowRight size={17} />
            </Button>
            {latest && (
              <Button variant="secondary" onClick={() => navigate('/dashboard?view=progress')}>
                Ver meu progresso
              </Button>
            )}
          </div>
        </div>
        <Owl mode={latest ? 'study' : 'welcome'} />
      </section>

      {latest ? (
        <>
          <div className="student-home-grid">
            <Surface className="learning-snapshot">
              <div className="learning-snapshot__level">
                <span>Seu nível mais recente</span>
                <strong>{latest.cefrLevel}</strong>
                <b>{latest.score}%</b>
              </div>

              <div className="learning-snapshot__skills">
                {latest.breakdown.map((item) => (
                  <div key={item.category}>
                    <span>{item.label}</span>
                    <div className="bar">
                      <i style={{ width: `${item.percentage}%` }} />
                    </div>
                    <strong>{item.percentage}%</strong>
                  </div>
                ))}
              </div>

              <Button
                variant="secondary"
                onClick={() => navigate(`/result/${latest.attemptId ?? latest.id}`)}
              >
                Abrir resultado completo
              </Button>
            </Surface>

            <Surface className="next-learning-card">
              <Sparkles />
              <small>Próximo passo</small>
              <h2>{latest.recommendations[0]?.title ?? 'Continue praticando'}</h2>
              <p>
                {latest.recommendations[0]?.description ??
                  'Use seu resultado para escolher a próxima habilidade a praticar.'}
              </p>
              <Pill tone="teal">{latest.recommendations[0]?.tag ?? latest.cefrLevel}</Pill>
            </Surface>
          </div>

          <Surface className="recent-activity">
            <div className="section-title">
              <div>
                <small>Atividade recente</small>
                <h2>Últimas avaliações</h2>
              </div>
              <Button variant="ghost" onClick={() => navigate('/dashboard?view=progress')}>
                Ver histórico
              </Button>
            </div>

            <div className="recent-activity__list">
              {attempts.slice(0, 3).map((attempt) => (
                <button
                  type="button"
                  key={attempt.attemptId ?? attempt.id}
                  onClick={() => navigate(`/result/${attempt.attemptId ?? attempt.id}`)}
                >
                  <span>
                    {attempt.completedAt
                      ? new Date(attempt.completedAt).toLocaleDateString('pt-BR')
                      : 'Sem data'}
                  </span>
                  <b>{attempt.cefrLevel}</b>
                  <strong>{attempt.score}%</strong>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          </Surface>
        </>
      ) : (
        <Surface className="empty student-first-step">
          <Owl mode="study" />
          <div>
            <h3>Seu histórico começa com uma avaliação</h3>
            <p>
              A prova reúne gramática, vocabulário e listening para gerar um ponto de partida.
            </p>
            <Button onClick={() => navigate('/language')}>Começar agora</Button>
          </div>
        </Surface>
      )}

      {!loading && message && <Toast message={message} tone="error" />}
    </Workspace>
  );
}

export function StudentProfile() {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const setSession = useAppStore((state) => state.setSession);

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [preferences, setPreferences] = useState<AccountPreferences>({
    notifications: true,
    reducedMotion: false,
  });
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!token) return;
    api
      .getPreferences(token)
      .then(({ preferences }) => {
        setPreferences((current) => ({ ...current, ...preferences }));
        document.documentElement.classList.toggle('reduce-motion', !!preferences.reducedMotion);
      })
      .catch(() => undefined);
  }, [token]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', !!preferences.reducedMotion);
  }, [preferences.reducedMotion]);

  if (!token || !user) return <Navigate to="/login" replace />;

  async function saveProfile() {
    try {
      const { user: updated } = await api.updateProfile(token!, { name, email });
      setSession(token!, updated);
      setTone('success');
      setMessage('Informações pessoais atualizadas.');
    } catch (error) {
      setTone('error');
      setMessage(error instanceof Error ? error.message : 'Não foi possível atualizar o perfil.');
    }
  }

  async function changePassword() {
    if (!currentPassword || newPassword.length < 8) {
      setTone('error');
      setMessage('Informe sua senha atual e uma nova senha com pelo menos 8 caracteres.');
      return;
    }

    try {
      await api.updatePassword(token!, { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setTone('success');
      setMessage('Senha atualizada com sucesso.');
    } catch (error) {
      setTone('error');
      setMessage(error instanceof Error ? error.message : 'Não foi possível alterar a senha.');
    }
  }

  async function togglePreference(key: keyof AccountPreferences) {
    const next = { ...preferences, [key]: !preferences[key] };

    if (key === 'notifications' && next.notifications) {
      if (!('Notification' in window)) {
        setTone('error');
        setMessage('Este navegador não oferece suporte a notificações.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setPreferences((current) => ({ ...current, notifications: false }));
        await api.updatePreferences(token!, { notifications: false }).catch(() => undefined);
        setTone('error');
        setMessage('Permissão de notificações não foi concedida.');
        return;
      }

      new Notification('Idiomas Pro', {
        body: 'Notificações ativadas. Sua preferência foi salva.',
      });
    }

    setPreferences(next);
    try {
      const response = await api.updatePreferences(token!, { [key]: next[key] });
      setPreferences((current) => ({ ...current, ...response.preferences }));
      setTone('success');
      setMessage('Preferência atualizada.');
    } catch (error) {
      setTone('error');
      setMessage(error instanceof Error ? error.message : 'Não foi possível salvar a preferência.');
    }
  }

  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AL';

  return (
    <Workspace area="student" backTo="/dashboard" backLabel="Painel">
      <div className="workspace-heading">
        <div>
          <small>Perfil</small>
          <h1>Minha conta</h1>
          <p>Dados pessoais, segurança e preferências da sua experiência.</p>
        </div>
      </div>

      <div className="profile-grid">
        <Surface className="profile-card">
          <div className="profile-avatar">{initials}</div>
          <h2>{name}</h2>
          <p>{email}</p>
          <Pill tone="teal">Aluno ativo</Pill>
          <p className="profile-card__hint">Use o botão Sair no cabeçalho para encerrar sua sessão com segurança.</p>
        </Surface>

        <Surface className="settings-card">
          <h2>Informações pessoais</h2>
          <Field label="Nome" value={name} onChange={setName} />
          <Field label="E-mail" value={email} onChange={setEmail} type="email" />
          <Button onClick={saveProfile}>
            <Save size={17} /> Salvar alterações
          </Button>

          <hr />

          <h2>Segurança</h2>
          <Field
            label="Senha atual"
            value={currentPassword}
            onChange={setCurrentPassword}
            type="password"
          />
          <Field
            label="Nova senha"
            value={newPassword}
            onChange={setNewPassword}
            type="password"
            placeholder="Mínimo de 8 caracteres"
          />
          <Button variant="secondary" onClick={changePassword}>
            <KeyRound size={17} /> Alterar senha
          </Button>

          <hr />

          <div className="toggle-row">
            <div>
              <Bell size={19} />
              <span>
                <b>Notificações do navegador</b>
                <small>Solicita permissão real e salva sua preferência.</small>
              </span>
            </div>
            <button
              type="button"
              aria-label="Alternar notificações"
              className={`switch ${preferences.notifications ? 'on' : ''}`}
              onClick={() => togglePreference('notifications')}
            >
              <i />
            </button>
          </div>

          <div className="toggle-row">
            <div>
              <BookOpen size={19} />
              <span>
                <b>Reduzir movimentos</b>
                <small>Preferência de acessibilidade para animações.</small>
              </span>
            </div>
            <button
              type="button"
              aria-label="Alternar redução de movimento"
              className={`switch ${preferences.reducedMotion ? 'on' : ''}`}
              onClick={() => togglePreference('reducedMotion')}
            >
              <i />
            </button>
          </div>
        </Surface>
      </div>

      {message && <Toast message={message} tone={tone} />}
    </Workspace>
  );
}
