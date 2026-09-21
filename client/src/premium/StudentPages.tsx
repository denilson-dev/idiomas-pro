import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Headphones,
  KeyRound,
  LogOut,
  Save,
  Sparkles,
} from 'lucide-react';
import { api, type AccountPreferences, type TestResult } from '../services/api';
import { getStoredResult, saveResult } from '../services/resultStorage';
import { useAppStore } from '../store/useAppStore';
import { Owl } from './Brand';
import { Button, Field, Pill, Stat, Surface, Toast } from './UI';
import { PublicHeader, Workspace } from './Shell';

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
        <PublicHeader />
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
      <PublicHeader />

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
  const [attempts, setAttempts] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
        ['Gram.', latestBreakdownValue(latest, 'GRAMMAR')],
        ['Vocab.', latestBreakdownValue(latest, 'VOCABULARY')],
        ['Listen.', latestBreakdownValue(latest, 'LISTENING')],
      ].sort((a, b) => Number(b[1]) - Number(a[1]))[0]
    : ['—', 0];

  return (
    <Workspace area="student">
      <div className="workspace-heading">
        <div>
          <small>Seu progresso</small>
          <h1>Olá, {user?.name?.split(' ')[0] || 'aluno'}</h1>
          <p>Seu histórico e evolução em um só lugar.</p>
        </div>
        <Button onClick={() => navigate('/language')}>
          Nova avaliação <ArrowRight size={17} />
        </Button>
      </div>

      <div className="stat-grid">
        <Stat
          label="Último nível"
          value={latest?.cefrLevel ?? '—'}
          sub="Avaliação mais recente"
          tone="pink"
        />
        <Stat label="Média geral" value={`${avg}%`} sub="Todas as avaliações" tone="teal" />
        <Stat label="Avaliações" value={attempts.length} sub="Histórico completo" tone="orange" />
        <Stat
          label="Melhor habilidade"
          value={String(best[0])}
          sub={latest ? `${best[1]}% de acerto` : 'Faça sua primeira avaliação'}
          tone="purple"
        />
      </div>

      <div className="dashboard-grid">
        <Surface className="chart-card">
          <div className="section-title">
            <div>
              <small>Histórico</small>
              <h2>Evolução das avaliações</h2>
            </div>
            <Pill tone="neutral">Últimas avaliações</Pill>
          </div>

          {attempts.length ? (
            <div className="fake-chart">
              <div className="chart-line">
                {attempts
                  .slice(0, 5)
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
                  .slice(0, 5)
                  .reverse()
                  .map((_, index) => (
                    <span key={index}>T{index + 1}</span>
                  ))}
              </div>
            </div>
          ) : (
            <div className="empty" style={{ boxShadow: 'none' }}>
              <h3>Nenhuma avaliação ainda</h3>
              <p>Faça sua primeira avaliação para começar a acompanhar sua evolução.</p>
            </div>
          )}
        </Surface>

        <Surface className="recommendations">
          <div className="section-title">
            <div>
              <small>Plano de estudo</small>
              <h2>Próximos passos</h2>
            </div>
          </div>

          {(latest?.recommendations ?? []).slice(0, 3).map((item, index) => (
            <button
              type="button"
              className="recommendation"
              key={item.title}
              onClick={() => navigate('/language')}
            >
              <span
                className={`rec-dot ${
                  index === 0 ? 'rec-dot--teal' : index === 1 ? 'rec-dot--pink' : 'rec-dot--orange'
                }`}
              />
              <div>
                <b>{item.title}</b>
                <span>{item.tag}</span>
              </div>
              <ArrowRight size={16} />
            </button>
          ))}

          {!latest && (
            <button type="button" className="recommendation" onClick={() => navigate('/language')}>
              <span className="rec-dot rec-dot--teal" />
              <div>
                <b>Descubra seu nível</b>
                <span>Começar agora</span>
              </div>
              <ArrowRight size={16} />
            </button>
          )}
        </Surface>
      </div>

      <Surface className="history-table">
        <div className="section-title">
          <div>
            <small>Avaliações</small>
            <h2>Histórico recente</h2>
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
                Abrir
              </Button>
            </div>
          ))}
        </div>

        {!loading && !attempts.length && (
          <p className="muted" style={{ textAlign: 'center', marginTop: 24 }}>
            Seu histórico aparecerá aqui depois da primeira avaliação.
          </p>
        )}
      </Surface>

      {message && <Toast message={message} tone="error" />}
    </Workspace>
  );
}

export function StudentProfile() {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const setSession = useAppStore((state) => state.setSession);
  const clearSession = useAppStore((state) => state.clearSession);
  const navigate = useNavigate();

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
      .then(({ preferences }) =>
        setPreferences((current) => ({ ...current, ...preferences })),
      )
      .catch(() => undefined);
  }, [token]);

  if (!token || !user) return <Navigate to="/login" replace />;

  async function saveProfile() {
    try {
      const { user: updated } = await api.updateProfile(token, { name, email });
      setSession(token, updated);
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
      await api.updatePassword(token, { currentPassword, newPassword });
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
    setPreferences(next);
    try {
      const response = await api.updatePreferences(token, { [key]: next[key] });
      setPreferences((current) => ({ ...current, ...response.preferences }));
    } catch (error) {
      setTone('error');
      setMessage(error instanceof Error ? error.message : 'Não foi possível salvar a preferência.');
    }
  }

  async function logout() {
    try {
      await api.logout(token);
    } catch {
      // local cleanup
    }
    clearSession();
    navigate('/');
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
    <Workspace area="student">
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
          <Button variant="danger" className="full" onClick={logout}>
            <LogOut size={17} /> Sair da conta
          </Button>
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
                <b>Notificações de progresso</b>
                <small>Salva sua preferência para lembretes e novidades.</small>
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
