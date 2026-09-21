import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Download,
  FileText,
  Filter,
  KeyRound,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
} from 'lucide-react';
import {
  api,
  type AccountPreferences,
  type TeacherAttempt,
  type TeacherAttemptDetail,
  type TeacherDashboard as TeacherDashboardData,
} from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { Owl } from './Brand';
import { Button, Field, Pill, Stat, Surface, Toast } from './UI';
import { PublicHeader, Workspace } from './Shell';

function downloadCsv(filename: string, rows: Array<Array<string | number | null | undefined>>) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n');

  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function printReport(detail: TeacherAttemptDetail) {
  const rows = detail.answers
    .map(
      (answer) => `
      <tr>
        <td>${answer.category}</td>
        <td>${answer.question}</td>
        <td>${answer.selectedAnswer}</td>
        <td>${answer.correctAnswer}</td>
        <td>${answer.isCorrect ? 'Correta' : 'Incorreta'}</td>
      </tr>`,
    )
    .join('');

  const report = window.open('', '_blank', 'width=1000,height=780');
  if (!report) return;

  report.document.write(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8"/>
        <title>Relatório pedagógico - ${detail.studentName ?? 'Aluno'}</title>
        <style>
          body{font-family:Arial,sans-serif;color:#26134f;padding:36px}
          h1{color:#2b0d71} .meta{color:#7656a7;margin-bottom:24px}
          .score{display:flex;gap:16px;margin:20px 0}
          .score b{background:#f4effb;border-radius:14px;padding:16px 22px;color:#2b0d71}
          table{border-collapse:collapse;width:100%;font-size:12px}
          th,td{border:1px solid #e5dcf2;padding:10px;text-align:left;vertical-align:top}
          th{background:#f7f3fb;color:#2b0d71}
          @media print{button{display:none}}
        </style>
      </head>
      <body>
        <h1>Idiomas Pro — Relatório pedagógico</h1>
        <div class="meta">
          <strong>${detail.studentName ?? 'Aluno'}</strong><br/>
          ${detail.studentEmail ?? ''}<br/>
          Conclusão: ${detail.completedAt ? new Date(detail.completedAt).toLocaleString('pt-BR') : '—'}
        </div>
        <div class="score">
          <b>Nível: ${detail.cefrLevel ?? '—'}</b>
          <b>Nota: ${detail.score ?? 0}%</b>
          <b>Questões: ${detail.totalQuestions}</b>
        </div>
        <table>
          <thead><tr><th>Categoria</th><th>Questão</th><th>Resposta</th><th>Correta</th><th>Status</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="margin-top:24px;color:#7656a7">Projeto de estudos — resultado não representa certificação oficial.</p>
        <button onclick="window.print()">Imprimir / Salvar em PDF</button>
      </body>
    </html>
  `);
  report.document.close();
}

export function TeacherLogin() {
  const navigate = useNavigate();
  const setTeacherSession = useAppStore((state) => state.setTeacherSession);
  const teacherToken = useAppStore((state) => state.teacherToken);
  const teacher = useAppStore((state) => state.teacher);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bootstrap, setBootstrap] = useState(false);
  const [bootstrapName, setBootstrapName] = useState('');
  const [canBootstrap, setCanBootstrap] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .getTeacherBootstrapStatus()
      .then(({ canCreateFirstTeacher }) => setCanBootstrap(canCreateFirstTeacher))
      .catch(() => undefined);
  }, []);

  if (teacherToken && teacher) {
    return (
      <Navigate
        to={teacher.role === 'ADMIN' ? '/professor/administracao' : '/professor/painel'}
        replace
      />
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setMessage('');
      const session = bootstrap
        ? await api.bootstrapTeacher({ name: bootstrapName, email, password })
        : await api.teacherLogin({ email, password });

      setTeacherSession(session.token, session.teacher);
      navigate(
        session.teacher.role === 'ADMIN' ? '/professor/administracao' : '/professor/painel',
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="public-page">
      <PublicHeader />

      <section className="teacher-auth">
        <div>
          <Pill tone="purple">Portal do professor</Pill>
          <h1>Acompanhe seus alunos com clareza.</h1>
          <p>
            Resultados, níveis, histórico e evolução pedagógica com uma visão organizada e rápida.
          </p>
          <Owl mode="study" />
        </div>

        <Surface className="auth-card">
          <h2>{bootstrap ? 'Criar primeiro acesso' : 'Entrar no painel'}</h2>
          <p className="muted">
            {bootstrap
              ? 'Cadastre a primeira conta pedagógica da escola.'
              : 'Use sua conta de professor ou administrador.'}
          </p>

          <form onSubmit={submit}>
            {bootstrap && (
              <Field label="Nome" value={bootstrapName} onChange={setBootstrapName} />
            )}
            <Field label="E-mail" value={email} onChange={setEmail} type="email" />
            <Field label="Senha" value={password} onChange={setPassword} type="password" />
            <Button type="submit" className="full" disabled={loading}>
              {loading ? 'Aguarde...' : bootstrap ? 'Criar acesso' : 'Entrar no painel'}
              <ArrowRight size={17} />
            </Button>
          </form>

          {canBootstrap && (
            <Button
              variant="ghost"
              className="full"
              onClick={() => {
                setMessage('');
                setBootstrap((value) => !value);
              }}
            >
              {bootstrap ? 'Já tenho acesso' : 'Criar primeiro professor'}
            </Button>
          )}
        </Surface>
      </section>

      {message && <Toast message={message} tone="error" />}
    </div>
  );
}

export function TeacherDashboard() {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const teacher = useAppStore((state) => state.teacher);
  const navigate = useNavigate();
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!teacherToken) return;
    api
      .getTeacherDashboard(teacherToken)
      .then(setData)
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : 'Não foi possível carregar o painel.'),
      );
  }, [teacherToken]);

  if (!teacherToken || !teacher) return <Navigate to="/professor" replace />;

  const attempts = data?.attempts ?? [];
  const filtered = attempts.filter((attempt) =>
    `${attempt.studentName ?? ''} ${attempt.studentEmail ?? ''} ${attempt.cefrLevel ?? ''}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  function exportDashboard() {
    downloadCsv('idiomas-pro-avaliacoes.csv', [
      ['Aluno', 'E-mail', 'Data', 'Nível', 'Nota', 'Questões'],
      ...attempts.map((attempt) => [
        attempt.studentName,
        attempt.studentEmail,
        attempt.completedAt ? new Date(attempt.completedAt).toLocaleString('pt-BR') : '',
        attempt.cefrLevel,
        attempt.score,
        attempt.totalQuestions,
      ]),
    ]);
  }

  return (
    <Workspace area="teacher">
      <div className="workspace-heading">
        <div>
          <small>Portal do professor</small>
          <h1>Visão pedagógica</h1>
          <p>Resultados e evolução dos alunos vinculados ao seu acesso.</p>
        </div>

        <div className="heading-actions">
          {teacher.role === 'ADMIN' && (
            <Button variant="secondary" onClick={() => navigate('/professor/administracao')}>
              <ShieldCheck size={17} /> Administração
            </Button>
          )}
          <Button variant="secondary" onClick={exportDashboard}>
            <Download size={17} /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="stat-grid">
        <Stat label="Avaliações" value={data?.metrics.totalAssessments ?? 0} tone="pink" />
        <Stat label="Alunos" value={data?.metrics.uniqueStudents ?? 0} tone="teal" />
        <Stat label="Média geral" value={`${data?.metrics.averageScore ?? 0}%`} tone="purple" />
        <Stat label="Último nível" value={data?.metrics.latestLevel ?? '—'} tone="orange" />
      </div>

      <div className="dashboard-grid">
        <Surface className="chart-card">
          <div className="section-title">
            <div>
              <small>Distribuição</small>
              <h2>Níveis dos alunos</h2>
            </div>
          </div>

          <div className="bar-chart">
            {(data?.levelDistribution ?? []).map((item) => {
              const max = Math.max(1, ...(data?.levelDistribution ?? []).map((entry) => entry.count));
              return (
                <div key={item.level}>
                  <i style={{ height: `${Math.max(10, (item.count / max) * 100)}%` }} />
                  <b>{item.level}</b>
                  <span>{item.count}</span>
                </div>
              );
            })}
          </div>
        </Surface>

        <Surface className="recommendations">
          <div className="section-title">
            <div>
              <small>Insights</small>
              <h2>Atenção pedagógica</h2>
            </div>
          </div>

          <div className="insight">
            <b>Média da turma</b>
            <span>Acompanhe a tendência geral das últimas avaliações.</span>
            <Pill tone="teal">{data?.metrics.averageScore ?? 0}%</Pill>
          </div>
          <div className="insight">
            <b>{data?.metrics.uniqueStudents ?? 0} alunos</b>
            <span>Participaram das avaliações vinculadas ao seu acesso.</span>
            <Pill tone="purple">Turma</Pill>
          </div>
          <div className="insight">
            <b>{data?.metrics.latestLevel ?? '—'}</b>
            <span>É o nível da avaliação mais recente.</span>
            <Pill tone="orange">Recente</Pill>
          </div>
        </Surface>
      </div>

      <Surface className="history-table">
        <div className="section-title">
          <div>
            <small>Alunos</small>
            <h2>Avaliações recentes</h2>
          </div>
          <label className="search-box">
            <Search size={16} />
            <input
              placeholder="Buscar aluno, e-mail ou nível"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="table">
          <div className="table__head">
            <span>Aluno</span>
            <span>Data</span>
            <span>Nível</span>
            <span>Nota</span>
            <span>Ações</span>
          </div>

          {filtered.map((attempt) => (
            <div className="table__row" key={attempt.id}>
              <span>
                <b>{attempt.studentName || 'Aluno'}</b>
                <small>{attempt.studentEmail || 'Sem e-mail'}</small>
              </span>
              <span>
                {attempt.completedAt
                  ? new Date(attempt.completedAt).toLocaleDateString('pt-BR')
                  : '—'}
              </span>
              <span>
                <Pill tone="teal">{attempt.cefrLevel ?? '—'}</Pill>
              </span>
              <strong>{attempt.score ?? 0}%</strong>
              <Button variant="ghost" onClick={() => navigate(`/professor/aluno/${attempt.id}`)}>
                Abrir
              </Button>
            </div>
          ))}
        </div>
      </Surface>

      {message && <Toast message={message} tone="error" />}
    </Workspace>
  );
}

export function TeacherStudentDetail() {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<TeacherAttemptDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!teacherToken || !attemptId) return;
    api
      .getTeacherAttempt(teacherToken, attemptId)
      .then((attempt) => {
        setDetail(attempt);
        setName(attempt.studentName ?? '');
        setEmail(attempt.studentEmail ?? '');
      })
      .catch((error) => {
        setTone('error');
        setMessage(error instanceof Error ? error.message : 'Avaliação indisponível.');
      });
  }, [teacherToken, attemptId]);

  if (!teacherToken) return <Navigate to="/professor" replace />;

  async function saveIdentification() {
    if (!detail || !attemptId) return;
    try {
      const response = await api.updateTeacherAttempt(teacherToken, attemptId, {
        studentName: name,
        studentEmail: email,
      });
      setDetail((current) =>
        current
          ? {
              ...current,
              studentName: response.attempt.studentName,
              studentEmail: response.attempt.studentEmail,
            }
          : current,
      );
      setEditing(false);
      setTone('success');
      setMessage('Identificação atualizada.');
    } catch (error) {
      setTone('error');
      setMessage(error instanceof Error ? error.message : 'Não foi possível atualizar.');
    }
  }

  async function removeAttempt() {
    if (!attemptId || !window.confirm('Excluir esta avaliação permanentemente?')) return;
    try {
      await api.deleteTeacherAttempt(teacherToken, attemptId);
      navigate('/professor/painel');
    } catch (error) {
      setTone('error');
      setMessage(error instanceof Error ? error.message : 'Não foi possível excluir.');
    }
  }

  if (!detail) {
    return (
      <Workspace area="teacher">
        <Surface className="empty">
          <h3>Carregando avaliação</h3>
          <p>{message || 'Aguarde...'}</p>
        </Surface>
      </Workspace>
    );
  }

  return (
    <Workspace area="teacher">
      <div className="workspace-heading">
        <div>
          <small>Detalhes do aluno</small>
          <h1>{detail.studentName || 'Aluno'}</h1>
          <p>
            {detail.studentEmail || 'Sem e-mail'} • Espanhol •{' '}
            {detail.completedAt
              ? new Date(detail.completedAt).toLocaleDateString('pt-BR')
              : '—'}
          </p>
        </div>
        <div className="heading-actions">
          <Button variant="secondary" onClick={() => setEditing((value) => !value)}>
            <Pencil size={17} /> Editar identificação
          </Button>
          <Button variant="danger" onClick={removeAttempt}>
            <Trash2 size={17} /> Excluir avaliação
          </Button>
        </div>
      </div>

      {editing && (
        <Surface className="inline-edit">
          <Field label="Nome" value={name} onChange={setName} />
          <Field label="E-mail" value={email} onChange={setEmail} />
          <Button onClick={saveIdentification}>Salvar</Button>
        </Surface>
      )}

      <div className="detail-grid">
        <Surface className="level-card compact">
          <small>Resultado</small>
          <strong>{detail.cefrLevel ?? '—'}</strong>
          <b>{detail.score ?? 0}%</b>
          <span>Pontuação geral</span>
        </Surface>

        <Surface>
          <h2>Desempenho por habilidade</h2>
          {(detail.breakdown ?? []).map((item) => (
            <div className="result-skill" key={item.category}>
              <div>
                <b>{item.label}</b>
                <span>{item.percentage}%</span>
              </div>
              <div className="bar bar--teal">
                <i style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </Surface>
      </div>

      <Surface className="answer-audit">
        <div className="section-title">
          <div>
            <small>Correção</small>
            <h2>Respostas da avaliação</h2>
          </div>
          <Button variant="secondary" onClick={() => printReport(detail)}>
            <FileText size={17} /> Gerar relatório
          </Button>
        </div>

        {detail.answers.map((answer, index) => (
          <div className="answer-audit__row" key={`${answer.question}-${index}`}>
            <div>
              <Pill tone={answer.isCorrect ? 'purple' : 'pink'}>
                {answer.category === 'GRAMMAR'
                  ? 'Gramática'
                  : answer.category === 'VOCABULARY'
                    ? 'Vocabulário'
                    : 'Listening'}
              </Pill>
              <b>{answer.question}</b>
            </div>
            <span>{answer.selectedAnswer}</span>
            <Pill tone={answer.isCorrect ? 'teal' : 'danger'}>
              {answer.isCorrect ? 'Correta' : 'Revisar'}
            </Pill>
          </div>
        ))}
      </Surface>

      {message && <Toast message={message} tone={tone} />}
    </Workspace>
  );
}

export function TeacherSettings() {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const teacher = useAppStore((state) => state.teacher);
  const setTeacherSession = useAppStore((state) => state.setTeacherSession);

  const [name, setName] = useState(teacher?.name ?? '');
  const [email, setEmail] = useState(teacher?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [preferences, setPreferences] = useState<AccountPreferences>({
    compactTables: false,
    rememberFilters: true,
    reducedMotion: false,
  });
  const [message, setMessage] = useState('');
  const [tone, setTone] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (!teacherToken) return;
    api
      .getTeacherPreferences(teacherToken)
      .then(({ preferences }) =>
        setPreferences((current) => ({ ...current, ...preferences })),
      )
      .catch(() => undefined);
  }, [teacherToken]);

  if (!teacherToken || !teacher) return <Navigate to="/professor" replace />;

  async function saveProfile() {
    try {
      const response = await api.updateTeacherProfile(teacherToken, { name, email });
      setTeacherSession(teacherToken, response.teacher);
      setTone('success');
      setMessage('Conta atualizada.');
    } catch (error) {
      setTone('error');
      setMessage(error instanceof Error ? error.message : 'Não foi possível atualizar.');
    }
  }

  async function changePassword() {
    if (!currentPassword || newPassword.length < 8) {
      setTone('error');
      setMessage('Informe a senha atual e uma nova senha com pelo menos 8 caracteres.');
      return;
    }

    try {
      await api.updateTeacherPassword(teacherToken, { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setTone('success');
      setMessage('Senha atualizada.');
    } catch (error) {
      setTone('error');
      setMessage(error instanceof Error ? error.message : 'Não foi possível alterar a senha.');
    }
  }

  async function togglePreference(key: keyof AccountPreferences) {
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    try {
      const response = await api.updateTeacherPreferences(teacherToken, { [key]: next[key] });
      setPreferences((current) => ({ ...current, ...response.preferences }));
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
      .toUpperCase() || 'PR';

  return (
    <Workspace area={teacher.role === 'ADMIN' ? 'admin' : 'teacher'}>
      <div className="workspace-heading">
        <div>
          <small>Configurações</small>
          <h1>Conta e preferências</h1>
          <p>Dados do perfil, segurança e experiência do painel.</p>
        </div>
      </div>

      <div className="profile-grid">
        <Surface className="profile-card">
          <div className="profile-avatar">{initials}</div>
          <h2>{name}</h2>
          <p>{email}</p>
          <Pill tone={teacher.role === 'ADMIN' ? 'pink' : 'teal'}>
            {teacher.role === 'ADMIN' ? 'Administrador' : 'Professor'}
          </Pill>
        </Surface>

        <Surface className="settings-card">
          <h2>Informações da conta</h2>
          <Field label="Nome" value={name} onChange={setName} />
          <Field label="E-mail" value={email} onChange={setEmail} type="email" />
          <Button onClick={saveProfile}>Salvar alterações</Button>

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
              <UserCog size={19} />
              <span>
                <b>Modo compacto de tabelas</b>
                <small>Salva a preferência para visualizações mais densas.</small>
              </span>
            </div>
            <button
              type="button"
              className={`switch ${preferences.compactTables ? 'on' : ''}`}
              onClick={() => togglePreference('compactTables')}
            >
              <i />
            </button>
          </div>

          <div className="toggle-row">
            <div>
              <Filter size={19} />
              <span>
                <b>Lembrar filtros</b>
                <small>Mantém a preferência de filtros entre sessões.</small>
              </span>
            </div>
            <button
              type="button"
              className={`switch ${preferences.rememberFilters ? 'on' : ''}`}
              onClick={() => togglePreference('rememberFilters')}
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
