import { CalendarDays, History, LogOut, Plus, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, type TestResult } from '../services/api';
import { getStoredHistory } from '../services/resultStorage';
import { useAppStore } from '../store/useAppStore';

export default function DashboardPage() {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const clearSession = useAppStore((state) => state.clearSession);
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<TestResult[]>([]);

  useEffect(() => {
    if (!token) return;
    setAttempts(getStoredHistory());
  }, [token]);

  if (!token) return <Navigate to="/" replace />;

  async function logout() {
    if (!token) return;
    try { await api.logout(token); } catch { /* sessão local também será encerrada */ }
    clearSession();
    navigate('/');
  }

  return (
    <main className="min-h-screen bg-[#06111f] px-5 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300 font-black text-slate-950">IP</div>
            <div><div className="font-black">Idiomas Pro</div><div className="text-xs text-slate-500">Painel do aluno</div></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/language')} className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-black text-slate-950"><Plus size={17} /> Novo teste</button>
            <button onClick={logout} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/5"><LogOut size={17} /></button>
          </div>
        </header>

        <section className="mt-14 grid gap-6 lg:grid-cols-[.75fr_1.25fr]">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-300/10 to-violet-400/10 p-7">
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">Visão geral</p>
            <h1 className="mt-3 text-3xl font-black">{user ? user.name : 'Visitante'}</h1>
            <p className="mt-2 text-slate-400">{user?.email ?? 'Histórico salvo neste navegador.'}</p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-black/15 p-5">
              <div className="flex items-center justify-between"><History className="text-violet-300" /><span className="text-3xl font-black">{attempts.length}</span></div>
              <p className="mt-3 font-semibold">Testes concluídos</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Histórico</p><h2 className="mt-1 text-2xl font-black">Seus resultados</h2></div>
              <Trophy className="text-amber-300" />
            </div>

            <div className="mt-6 space-y-3">
              {attempts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-500">Ainda não há resultados salvos.</div>
              )}
              {attempts.map((attempt) => {
                const id = attempt.id ?? attempt.attemptId;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => id && navigate(`/result/${id}`)}
                    className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-black/10 p-4 text-left transition hover:border-white/20 hover:bg-white/[0.04]"
                  >
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 text-xl font-black text-slate-950">{attempt.cefrLevel}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold">{attempt.score}% de aproveitamento</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><CalendarDays size={13} /> {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString('pt-BR') : 'Data indisponível'}</div>
                    </div>
                    <div className="text-sm font-bold text-cyan-300">Ver</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
