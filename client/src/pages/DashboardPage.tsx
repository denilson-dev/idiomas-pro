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
    <main className="safe-page relative overflow-hidden bg-[#06111f] px-4 text-white sm:px-6">
      <div className="pointer-events-none absolute -right-24 top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 text-sm font-black text-slate-950 sm:h-11 sm:w-11">IP</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black sm:text-base">Idiomas Pro</div>
              <div className="truncate text-[10px] text-slate-500 sm:text-xs">Painel do aluno</div>
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => navigate('/language')}
              className="flex min-h-10 items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-950 sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <Plus size={16} />
              <span className="hidden min-[360px]:inline">Novo teste</span>
            </button>
            <button
              onClick={logout}
              aria-label="Sair"
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-400 transition hover:bg-white/5"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <section className="mt-7 grid gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-[.75fr_1.25fr]">
          <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-cyan-300/10 to-violet-400/10 p-5 sm:rounded-[2rem] sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300 sm:text-sm">Visão geral</p>
            <h1 className="mt-2 truncate text-2xl font-black sm:mt-3 sm:text-3xl">{user ? user.name : 'Visitante'}</h1>
            <p className="mt-1.5 truncate text-xs text-slate-400 sm:mt-2 sm:text-base">{user?.email ?? 'Histórico salvo neste navegador.'}</p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4 sm:mt-8 sm:rounded-3xl sm:p-5">
              <div className="flex items-center justify-between">
                <History className="text-violet-300" size={20} />
                <span className="text-3xl font-black">{attempts.length}</span>
              </div>
              <p className="mt-2 text-sm font-semibold sm:mt-3 sm:text-base">Testes concluídos</p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-4 sm:rounded-[2rem] sm:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 sm:text-sm">Histórico</p>
                <h2 className="mt-1 text-xl font-black sm:text-2xl">Seus resultados</h2>
              </div>
              <Trophy className="text-amber-300" size={21} />
            </div>

            <div className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-3">
              {attempts.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500 sm:p-8">
                  Ainda não há resultados salvos.
                </div>
              )}

              {attempts.map((attempt) => {
                const id = attempt.id ?? attempt.attemptId;
                return (
                  <button
                    type="button"
                    key={id}
                    onClick={() => id && navigate(`/result/${id}`)}
                    className="flex min-h-18 w-full items-center gap-3 rounded-2xl border border-white/10 bg-black/10 p-3 text-left transition hover:border-white/20 hover:bg-white/[0.04] sm:gap-4 sm:p-4"
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 text-base font-black text-slate-950 sm:h-14 sm:w-14 sm:text-xl">
                      {attempt.cefrLevel}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-bold sm:text-base">{attempt.score}% de aproveitamento</div>
                      <div className="mt-1 flex items-center gap-1 truncate text-[10px] text-slate-500 sm:text-xs">
                        <CalendarDays size={12} />
                        {attempt.completedAt ? new Date(attempt.completedAt).toLocaleString('pt-BR') : 'Data indisponível'}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-cyan-300 sm:text-sm">Ver</div>
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
