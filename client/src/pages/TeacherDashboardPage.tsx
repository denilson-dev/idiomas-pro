import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  LogOut,
  Pencil,
  Save,
  Search,
  ShieldCheck,
  Trash2,
  Trophy,
  UsersRound,
  X,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import { api, type TeacherAttempt, type TeacherDashboard } from '../services/api';
import { useAppStore } from '../store/useAppStore';

type EditForm = {
  studentName: string;
  studentEmail: string;
};

export default function TeacherDashboardPage() {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const teacher = useAppStore((state) => state.teacher);
  const clearTeacherSession = useAppStore((state) => state.clearTeacherSession);
  const navigate = useNavigate();

  const [data, setData] = useState<TeacherDashboard | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [editTarget, setEditTarget] = useState<TeacherAttempt | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ studentName: '', studentEmail: '' });
  const [deleteTarget, setDeleteTarget] = useState<TeacherAttempt | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!teacherToken) return;

    try {
      setError('');
      const dashboard = await api.getTeacherDashboard(teacherToken);
      setData(dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o painel.');
    }
  }, [teacherToken]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const filtered = useMemo(() => {
    const attempts = data?.attempts ?? [];
    const normalized = query.trim().toLowerCase();

    if (!normalized) return attempts;

    return attempts.filter((item) =>
      (item.studentName ?? '').toLowerCase().includes(normalized) ||
      (item.studentEmail ?? '').toLowerCase().includes(normalized) ||
      (item.cefrLevel ?? '').toLowerCase().includes(normalized)
    );
  }, [data, query]);

  if (!teacherToken) return <Navigate to="/professor" replace />;

  async function logout() {
    if (teacherToken) {
      try {
        await api.teacherLogout(teacherToken);
      } catch {}
    }

    clearTeacherSession();
    navigate('/professor');
  }

  function openEdit(attempt: TeacherAttempt) {
    setEditTarget(attempt);
    setEditForm({
      studentName: attempt.studentName ?? '',
      studentEmail: attempt.studentEmail ?? '',
    });
    setError('');
  }

  async function saveEdit(event: FormEvent) {
    event.preventDefault();
    if (!teacherToken || !editTarget) return;

    const name = editForm.studentName.trim();
    if (name.length < 2) {
      setError('Informe um nome válido para o aluno.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');

      await api.updateTeacherAttempt(teacherToken, editTarget.id, {
        studentName: name,
        studentEmail: editForm.studentEmail.trim(),
      });

      setEditTarget(null);
      setToast('Dados da prova atualizados.');
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a prova.');
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteAttempt() {
    if (!teacherToken || !deleteTarget) return;

    try {
      setActionLoading(true);
      setError('');

      await api.deleteTeacherAttempt(teacherToken, deleteTarget.id);

      setDeleteTarget(null);
      setToast('Prova excluída com sucesso.');
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a prova.');
    } finally {
      setActionLoading(false);
    }
  }

  async function clearAllAttempts() {
    if (!teacherToken) return;

    try {
      setActionLoading(true);
      setError('');

      const result = await api.clearTeacherAttempts(teacherToken);

      setClearConfirm(false);
      setToast(result.message);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível limpar as provas.');
    } finally {
      setActionLoading(false);
    }
  }

  if (error && !data) {
    return (
      <main className="safe-page grid place-items-center px-6">
        <div className="rounded-2xl bg-[#fff0f4] p-4 font-bold text-[#c81f49]">{error}</div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="safe-page grid place-items-center px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eee6f7] border-t-[#ff2d5f]"/>
          <p className="mt-3 font-bold text-[#7656a7]">Carregando painel pedagógico...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="safe-page relative overflow-hidden px-3.5 sm:px-6">
      <div className="app-shell relative pb-10">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <BrandHeader subtitle="Painel do professor" compact />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {data.teacher.role === 'ADMIN' && (
              <button
                type="button"
                onClick={() => navigate('/professor/administracao')}
                className="secondary-cta grid h-10 w-10 place-items-center rounded-full text-[#008f81] sm:h-11 sm:w-11"
                aria-label="Administração"
                title="Administração"
              >
                <ShieldCheck size={18}/>
              </button>
            )}
            <button onClick={logout} className="secondary-cta grid h-10 w-10 place-items-center rounded-full sm:h-11 sm:w-11" aria-label="Sair">
              <LogOut size={17}/>
            </button>
          </div>
        </div>

        <section className="mt-5 sm:mt-6">
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#008f81] sm:text-sm">Visão pedagógica</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-[#2b0d71] sm:text-5xl">
            Olá, <span className="text-[#ff2d5f]">{teacher?.name ?? data.teacher.name}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7656a7] sm:text-base">
            Acompanhe, organize e gerencie os resultados dos alunos vinculados ao seu acesso.
          </p>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-3 lg:grid-cols-4">
          {[
            { Icon: BookOpenCheck, label: 'Avaliações', value: data.metrics.totalAssessments, className: 'bg-[#fff0f4] text-[#ff2d5f]' },
            { Icon: UsersRound, label: 'Alunos', value: data.metrics.uniqueStudents, className: 'bg-[#e8faf6] text-[#008f81]' },
            { Icon: BarChart3, label: 'Média geral', value: `${data.metrics.averageScore}%`, className: 'bg-[#f1e9ff] text-[#6c2db7]' },
            { Icon: Trophy, label: 'Último nível', value: data.metrics.latestLevel ?? '—', className: 'bg-[#fff6dd] text-[#d98b00]' },
          ].map(({ Icon, label, value, className }) => (
            <article key={label} className="paper-card rounded-[1.3rem] p-3.5 sm:rounded-[1.4rem] sm:p-4">
              <span className={`grid h-9 w-9 place-items-center rounded-full sm:h-10 sm:w-10 ${className}`}><Icon size={18}/></span>
              <div className="mt-3 text-xl font-black text-[#2b0d71] sm:mt-4 sm:text-2xl">{value}</div>
              <div className="mt-1 text-[10px] font-bold text-[#7656a7] sm:text-xs">{label}</div>
            </article>
          ))}
        </section>

        <section className="paper-card mt-5 rounded-[1.5rem] p-4 sm:mt-6 sm:rounded-[1.7rem] sm:p-5">
          <h2 className="text-lg font-black text-[#2b0d71] sm:text-xl">Distribuição de níveis</h2>
          <p className="mt-1 text-xs text-[#7656a7] sm:text-sm">Panorama dos resultados dos seus alunos.</p>

          <div className="mt-4 grid grid-cols-6 gap-1.5 sm:gap-2">
            {data.levelDistribution.map((item) => {
              const max = Math.max(1, ...data.levelDistribution.map((entry) => entry.count));
              const height = Math.max(10, Math.round((item.count / max) * 80));

              return (
                <div key={item.level} className="text-center">
                  <div className="flex h-20 items-end justify-center rounded-xl bg-[#f8f5fc] p-1.5 sm:h-24 sm:p-2">
                    <span className="w-5 rounded-lg bg-gradient-to-t from-[#6c2db7] to-[#ff2d5f] sm:w-7" style={{ height }} />
                  </div>
                  <div className="mt-1.5 text-[10px] font-black text-[#2b0d71] sm:mt-2 sm:text-xs">{item.level}</div>
                  <div className="text-[9px] font-bold text-[#8d78b7] sm:text-[10px]">{item.count}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-5 sm:mt-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#2b0d71] sm:text-2xl">Provas dos alunos</h2>
                <p className="mt-1 text-xs text-[#7656a7] sm:text-sm">
                  Visualize, edite a identificação ou exclua registros.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setClearConfirm(true)}
                disabled={data.attempts.length === 0}
                className="secondary-cta flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-[11px] font-black text-[#c72b51] disabled:cursor-not-allowed disabled:opacity-35 sm:min-h-11 sm:rounded-2xl sm:px-4 sm:text-sm"
              >
                <Trash2 size={16}/> <span className="hidden sm:inline">Limpar todas</span><span className="sm:hidden">Limpar</span>
              </button>
            </div>

            <label className="form-control-shell flex min-h-12 items-center gap-2 rounded-2xl px-4 sm:max-w-sm">
              <Search size={18} className="text-[#7656a7]"/>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar aluno, e-mail ou nível..."
                className="min-w-0 flex-1 bg-transparent text-sm text-[#2b0d71] outline-none"
              />
            </label>
          </div>

          {error && (
            <div className="mt-3 rounded-xl bg-[#fff0f4] px-3 py-2 text-sm font-bold text-[#c81f49]">
              {error}
            </div>
          )}

          <div className="mt-4 space-y-2.5 sm:space-y-3">
            {filtered.length === 0 ? (
              <div className="soft-card rounded-[1.5rem] p-8 text-center text-sm font-bold text-[#7656a7]">
                Nenhuma prova encontrada.
              </div>
            ) : filtered.map((attempt) => (
              <article key={attempt.id} className="soft-card rounded-[1.35rem] p-3 sm:rounded-[1.5rem] sm:p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/professor/aluno/${attempt.id}`)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f1e9ff] text-base font-black text-[#5d238e] sm:h-12 sm:w-12 sm:rounded-2xl sm:text-lg">
                      {(attempt.studentName || '?').slice(0, 1).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-black text-[#2b0d71] sm:text-base">{attempt.studentName || 'Aluno sem nome'}</div>
                      <div className="mt-0.5 truncate text-[10px] text-[#7656a7] sm:mt-1 sm:text-xs">
                        {attempt.studentEmail || 'Sem e-mail'} · {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString('pt-BR') : 'Data indisponível'}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-flex rounded-full bg-[#e8faf6] px-2.5 py-1 text-xs font-black text-[#008f81] sm:px-3 sm:py-1.5 sm:text-sm">
                        {attempt.cefrLevel ?? '—'}
                      </span>
                      <div className="mt-1 text-[10px] font-bold text-[#7656a7] sm:text-xs">{attempt.score ?? 0}%</div>
                    </div>

                    <ArrowRight size={17} className="hidden shrink-0 text-[#4a1a86] sm:block"/>
                  </button>
                </div>

                <div className="mt-3 flex gap-2 border-t border-[#ebe4f4] pt-3">
                  <button
                    type="button"
                    onClick={() => openEdit(attempt)}
                    className="secondary-cta flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-xs font-black sm:text-sm"
                  >
                    <Pencil size={15}/> Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(attempt)}
                    className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#f0ccd7] bg-[#fff6f8] px-3 text-xs font-black text-[#c72b51] transition active:scale-[.98] sm:text-sm"
                  >
                    <Trash2 size={15}/> Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[80] mx-auto max-w-md rounded-2xl border border-[#bee9df] bg-[#effbf8]/95 px-4 py-3 text-center text-sm font-black text-[#08786f] shadow-[0_18px_45px_rgba(43,13,113,.16)] backdrop-blur-xl">
          {toast}
        </div>
      )}

      {editTarget && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#17052f]/35 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <form onSubmit={saveEdit} className="paper-card w-full max-w-lg rounded-[1.6rem] p-4 sm:p-6" role="dialog" aria-modal="true" aria-label="Editar prova">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#2b0d71]">Editar identificação</h2>
                <p className="mt-1 text-xs leading-5 text-[#7656a7] sm:text-sm">
                  A nota, o nível e as respostas permanecem inalterados.
                </p>
              </div>
              <button type="button" onClick={() => setEditTarget(null)} className="secondary-cta grid h-10 w-10 shrink-0 place-items-center rounded-full" aria-label="Fechar">
                <X size={18}/>
              </button>
            </div>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-sm font-black text-[#2b0d71]">Nome do aluno</span>
              <div className="form-control-shell rounded-2xl px-4">
                <input
                  required
                  value={editForm.studentName}
                  onChange={(event) => setEditForm((state) => ({ ...state, studentName: event.target.value }))}
                  className="min-h-13 w-full bg-transparent text-base text-[#2b0d71] outline-none"
                />
              </div>
            </label>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-black text-[#2b0d71]">E-mail</span>
              <div className="form-control-shell rounded-2xl px-4">
                <input
                  type="email"
                  value={editForm.studentEmail}
                  onChange={(event) => setEditForm((state) => ({ ...state, studentEmail: event.target.value }))}
                  placeholder="Opcional"
                  className="min-h-13 w-full bg-transparent text-base text-[#2b0d71] outline-none"
                />
              </div>
            </label>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setEditTarget(null)} className="secondary-cta min-h-12 rounded-2xl px-4 font-black">
                Cancelar
              </button>
              <button disabled={actionLoading} className="primary-cta flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 font-black disabled:opacity-50">
                <Save size={17}/> {actionLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#17052f]/35 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="paper-card w-full max-w-md rounded-[1.6rem] p-5 sm:p-6" role="dialog" aria-modal="true" aria-label="Excluir prova">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0f4] text-[#d12a53]">
              <Trash2 size={23}/>
            </span>
            <h2 className="mt-4 text-xl font-black text-[#2b0d71]">Excluir esta prova?</h2>
            <p className="mt-2 text-sm leading-6 text-[#7656a7]">
              O resultado de <strong className="text-[#2b0d71]">{deleteTarget.studentName || 'este aluno'}</strong> e todas as respostas vinculadas serão removidos permanentemente.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setDeleteTarget(null)} className="secondary-cta min-h-12 rounded-2xl px-4 font-black">
                Cancelar
              </button>
              <button
                type="button"
                onClick={deleteAttempt}
                disabled={actionLoading}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#d82952] px-4 font-black text-white shadow-[0_12px_26px_rgba(216,41,82,.2)] disabled:opacity-50"
              >
                <Trash2 size={17}/> {actionLoading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {clearConfirm && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#17052f]/40 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="paper-card w-full max-w-md rounded-[1.6rem] p-5 sm:p-6" role="dialog" aria-modal="true" aria-label="Limpar todas as provas">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#fff4df] text-[#d98b00]">
              <AlertTriangle size={24}/>
            </span>
            <h2 className="mt-4 text-xl font-black text-[#2b0d71]">Limpar todas as provas?</h2>
            <p className="mt-2 text-sm leading-6 text-[#7656a7]">
              Esta ação removerá permanentemente as <strong className="text-[#2b0d71]">{data.attempts.length} provas</strong> listadas no seu painel e todas as respostas relacionadas.
            </p>
            <div className="mt-3 rounded-xl bg-[#fff6f8] px-3 py-2.5 text-xs font-bold leading-5 text-[#a83a57]">
              Esta operação não pode ser desfeita.
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setClearConfirm(false)} className="secondary-cta min-h-12 rounded-2xl px-4 font-black">
                Cancelar
              </button>
              <button
                type="button"
                onClick={clearAllAttempts}
                disabled={actionLoading}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#d82952] px-4 font-black text-white shadow-[0_12px_26px_rgba(216,41,82,.2)] disabled:opacity-50"
              >
                <Trash2 size={17}/> {actionLoading ? 'Limpando...' : 'Limpar todas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
