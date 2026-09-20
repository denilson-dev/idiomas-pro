import { ArrowRight, BarChart3, BookOpenCheck, LogOut, Search, Trophy, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import { api, type TeacherDashboard } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function TeacherDashboardPage() {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const teacher = useAppStore((state) => state.teacher);
  const clearTeacherSession = useAppStore((state) => state.clearTeacherSession);
  const navigate = useNavigate();

  const [data, setData] = useState<TeacherDashboard | null>(null);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!teacherToken) return;
    api.getTeacherDashboard(teacherToken)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar o painel.'));
  }, [teacherToken]);

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
      try { await api.teacherLogout(teacherToken); } catch {}
    }
    clearTeacherSession();
    navigate('/professor');
  }

  if (error && !data) {
    return <main className="safe-page grid place-items-center px-6"><div className="rounded-2xl bg-[#fff0f4] p-4 font-bold text-[#c81f49]">{error}</div></main>;
  }

  if (!data) {
    return <main className="safe-page grid place-items-center px-6"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eee6f7] border-t-[#ff2d5f]"/><p className="mt-3 font-bold text-[#7656a7]">Carregando painel pedagógico...</p></div></main>;
  }

  return (
    <main className="safe-page relative overflow-hidden px-4 sm:px-6">
      <div className="app-shell relative pb-10">
        <div className="flex items-center justify-between gap-3">
          <BrandHeader subtitle="Painel do professor" compact />
          <button onClick={logout} className="secondary-cta grid h-11 w-11 shrink-0 place-items-center rounded-full" aria-label="Sair"><LogOut size={18}/></button>
        </div>

        <section className="mt-6">
          <p className="text-sm font-black uppercase tracking-[.16em] text-[#008f81]">Visão pedagógica</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-[#2b0d71] sm:text-5xl">
            Olá, <span className="text-[#ff2d5f]">{teacher?.name ?? data.teacher.name}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7656a7] sm:text-base">
            Acompanhe os alunos que selecionaram você como professor responsável no teste de nivelamento.
          </p>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { Icon: BookOpenCheck, label: 'Avaliações', value: data.metrics.totalAssessments, className: 'bg-[#fff0f4] text-[#ff2d5f]' },
            { Icon: UsersRound, label: 'Alunos', value: data.metrics.uniqueStudents, className: 'bg-[#e8faf6] text-[#008f81]' },
            { Icon: BarChart3, label: 'Média geral', value: `${data.metrics.averageScore}%`, className: 'bg-[#f1e9ff] text-[#6c2db7]' },
            { Icon: Trophy, label: 'Último nível', value: data.metrics.latestLevel ?? '—', className: 'bg-[#fff6dd] text-[#d98b00]' },
          ].map(({ Icon, label, value, className }) => (
            <article key={label} className="paper-card rounded-[1.4rem] p-4">
              <span className={`grid h-10 w-10 place-items-center rounded-full ${className}`}><Icon size={19}/></span>
              <div className="mt-4 text-2xl font-black text-[#2b0d71]">{value}</div>
              <div className="mt-1 text-xs font-bold text-[#7656a7]">{label}</div>
            </article>
          ))}
        </section>

        <section className="paper-card mt-6 rounded-[1.7rem] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#2b0d71]">Distribuição de níveis</h2>
              <p className="mt-1 text-sm text-[#7656a7]">Panorama dos resultados dos seus alunos.</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-6 gap-2">
            {data.levelDistribution.map((item) => {
              const max = Math.max(1, ...data.levelDistribution.map((entry) => entry.count));
              const height = Math.max(10, Math.round((item.count / max) * 80));
              return <div key={item.level} className="text-center">
                <div className="flex h-24 items-end justify-center rounded-xl bg-[#f8f5fc] p-2">
                  <span className="w-7 rounded-lg bg-gradient-to-t from-[#6c2db7] to-[#ff2d5f]" style={{ height }} />
                </div>
                <div className="mt-2 text-xs font-black text-[#2b0d71]">{item.level}</div>
                <div className="text-[10px] font-bold text-[#8d78b7]">{item.count}</div>
              </div>;
            })}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-[#2b0d71]">Resultados dos alunos</h2>
              <p className="mt-1 text-sm text-[#7656a7]">Abra um resultado para ver as respostas detalhadas.</p>
            </div>
            <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-[#ddd2ef] bg-white px-4 sm:w-72">
              <Search size={18} className="text-[#7656a7]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar aluno..." className="min-w-0 flex-1 bg-transparent text-sm text-[#2b0d71] outline-none" />
            </label>
          </div>

          <div className="mt-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="soft-card rounded-[1.5rem] p-8 text-center text-sm font-bold text-[#7656a7]">Nenhum resultado encontrado.</div>
            ) : filtered.map((attempt) => (
              <button key={attempt.id} onClick={() => navigate(`/professor/aluno/${attempt.id}`)} className="soft-card flex w-full items-center gap-4 rounded-[1.5rem] p-4 text-left transition hover:border-[#cdbde9]">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f1e9ff] text-lg font-black text-[#5d238e]">
                  {(attempt.studentName || '?').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-black text-[#2b0d71]">{attempt.studentName || 'Aluno sem nome'}</div>
                  <div className="mt-1 truncate text-xs text-[#7656a7]">{attempt.studentEmail || 'Sem e-mail'} · {attempt.completedAt ? new Date(attempt.completedAt).toLocaleDateString('pt-BR') : 'Data indisponível'}</div>
                </div>
                <div className="text-right">
                  <span className="inline-flex rounded-full bg-[#e8faf6] px-3 py-1.5 text-sm font-black text-[#008f81]">{attempt.cefrLevel ?? '—'}</span>
                  <div className="mt-1 text-xs font-bold text-[#7656a7]">{attempt.score ?? 0}%</div>
                </div>
                <ArrowRight size={18} className="shrink-0 text-[#4a1a86]" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
