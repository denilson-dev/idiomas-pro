import { ArrowRight, CalendarDays, History, LogOut, Plus, Trophy, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import MascotOwl from '../components/MascotOwl';
import { api, type TestResult } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function DashboardPage() {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const clearSession = useAppStore((state) => state.clearSession);
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<TestResult[]>([]);

  useEffect(() => {
    if (!token) return;
    api.getHistory(token)
      .then(({ attempts }) => setAttempts(attempts))
      .catch(() => setAttempts([]));
  }, [token]);

  if (!token) return <Navigate to="/" replace />;

  async function logout() {
    if (!token) return;
    try {
      await api.logout(token);
    } catch {}
    clearSession();
    navigate('/');
  }

  const latest = attempts[0];

  return (
    <main className="safe-page relative overflow-hidden px-3.5 sm:px-6">
      <div className="app-shell relative pb-10">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1"><BrandHeader subtitle="Painel do aluno" compact /></div>
          <button onClick={logout} className="secondary-cta grid h-10 w-10 shrink-0 place-items-center rounded-full sm:h-11 sm:w-11" aria-label="Sair">
            <LogOut size={17}/>
          </button>
        </div>

        <section className="mt-4 grid grid-cols-[1fr_118px] items-center gap-2 sm:mt-5 sm:grid-cols-[1.1fr_.9fr] sm:gap-4">
          <div>
            <div className="category-pill text-[10px] sm:text-xs"><Trophy size={14}/> Sua jornada</div>
            <h1 className="hero-title mt-3.5 text-[2.7rem] sm:mt-5 sm:text-[4.3rem]">
              <span className="text-[#2b0d71]">Olá, </span>
              <span className="hero-pink">{user?.name?.split(' ')[0] ?? 'Aluno'}!</span>
            </h1>
            <p className="mt-2.5 max-w-xl text-[12px] leading-5 text-[#7656a7] sm:mt-4 sm:text-lg sm:leading-7">
              Acompanhe seu histórico e veja como seu aprendizado está evoluindo.
            </p>
          </div>

          <div className="relative mx-auto">
            <div className="hand-note absolute -right-2 -top-2 z-10 hidden text-base sm:block">Você está indo muito bem! ♡</div>
            <MascotOwl className="h-[116px] w-[116px] sm:h-[270px] sm:w-[270px]" />
          </div>
        </section>

        {latest && (
          <section className="mint-card mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[1.4rem] p-3.5 sm:p-5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl font-black text-[#08786f] shadow-sm sm:h-14 sm:w-14 sm:text-2xl">
              {latest.cefrLevel}
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[.08em] text-[#7656a7]">Último nivelamento</div>
              <div className="mt-0.5 truncate text-sm font-black text-[#2b0d71] sm:text-base">{latest.score}% de aproveitamento</div>
            </div>
            <Trophy size={20} className="text-[#f6a000]"/>
          </section>
        )}

        <button
          onClick={() => navigate('/language')}
          className="primary-cta mt-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-4 text-base font-black sm:text-lg"
        >
          <Plus size={21}/> Novo nivelamento <ArrowRight size={20}/>
        </button>

        <section className="mt-5 sm:mt-6">
          <div className="mb-3 flex items-center gap-2">
            <History className="text-[#3f167f]" size={20}/>
            <h2 className="text-lg font-black text-[#2b0d71] sm:text-2xl">Histórico de avaliações</h2>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {attempts.length === 0 ? (
              <div className="soft-card rounded-[1.4rem] p-7 text-center text-sm font-bold text-[#7656a7]">
                Você ainda não concluiu nenhum teste.
              </div>
            ) : attempts.map((attempt) => {
              const id = attempt.id ?? attempt.attemptId;
              const date = attempt.completedAt ? new Date(attempt.completedAt) : null;

              return (
                <button
                  key={id}
                  onClick={() => id && navigate(`/result/${id}`)}
                  className="soft-card pressable flex min-h-[72px] w-full items-center gap-3 rounded-[1.25rem] px-3.5 py-3 text-left sm:min-h-20 sm:gap-4 sm:rounded-[1.5rem] sm:px-5"
                >
                  <div className="w-11 shrink-0 text-center sm:w-14">
                    <div className="text-base font-black text-[#2b0d71] sm:text-lg">{date?.getDate() ?? '--'}</div>
                    <div className="text-[9px] font-black uppercase text-[#7656a7] sm:text-[10px]">
                      {date?.toLocaleDateString('pt-BR',{month:'short'}).replace('.','') ?? ''}
                    </div>
                  </div>

                  <div className="h-9 w-px bg-[#e4dcf2] sm:h-10"/>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-[#2b0d71] sm:text-base">Nivelamento completo</div>
                    <div className="mt-0.5 text-[10px] font-bold text-[#7656a7] sm:mt-1 sm:text-xs">Espanhol • {attempt.score}%</div>
                  </div>

                  <span className={`rounded-full px-3 py-1.5 text-xs font-black sm:px-4 sm:py-2 sm:text-sm ${
                    attempt.cefrLevel.startsWith('B')
                      ? 'bg-[#e7f8f4] text-[#08786f]'
                      : attempt.cefrLevel.startsWith('A')
                        ? 'bg-[#fff0f4] text-[#ff2d5f]'
                        : 'bg-[#f1e9ff] text-[#6c2db7]'
                  }`}>
                    {attempt.cefrLevel}
                  </span>
                  <ArrowRight size={17} className="shrink-0 text-[#4a1a86]"/>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mint-card mt-5 rounded-[1.5rem] p-4 sm:mt-6 sm:rounded-[1.8rem] sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-[#2b0d71] sm:text-xl">Panorama da sua evolução</h2>
              <p className="mt-0.5 text-xs text-[#7656a7] sm:mt-1 sm:text-sm">Mais dados. Mais conquistas.</p>
            </div>
            <Trophy className="text-[#f6a000]" size={21}/>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-4">
            <div className="rounded-xl bg-white/90 p-2.5 text-center sm:rounded-2xl sm:p-3">
              <UsersRound className="mx-auto text-[#6c2db7]" size={19}/>
              <div className="mt-1.5 text-xl font-black text-[#2b0d71] sm:mt-2 sm:text-2xl">{attempts.length}</div>
              <div className="text-[9px] font-bold text-[#7656a7] sm:text-[10px]">Testes</div>
            </div>

            <div className="rounded-xl bg-white/90 p-2.5 text-center sm:rounded-2xl sm:p-3">
              <Trophy className="mx-auto text-[#008f81]" size={19}/>
              <div className="mt-1.5 text-xl font-black text-[#2b0d71] sm:mt-2 sm:text-2xl">{latest?.cefrLevel ?? '—'}</div>
              <div className="text-[9px] font-bold text-[#7656a7] sm:text-[10px]">Último nível</div>
            </div>

            <div className="rounded-xl bg-white/90 p-2.5 text-center sm:rounded-2xl sm:p-3">
              <CalendarDays className="mx-auto text-[#ff2d5f]" size={19}/>
              <div className="mt-1.5 text-xl font-black text-[#2b0d71] sm:mt-2 sm:text-2xl">{latest?.score ?? 0}%</div>
              <div className="text-[9px] font-bold text-[#7656a7] sm:text-[10px]">Aproveitamento</div>
            </div>
          </div>
        </section>

        <div className="my-6 text-center sm:my-7">
          <span className="hand-note">Aprender te leva mais longe ♡</span>
        </div>
        <div className="rainbow-corner"/>
      </div>
    </main>
  );
}
