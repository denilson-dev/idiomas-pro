import { ArrowRight, CalendarDays, History, LogOut, Plus, Trophy, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import MascotOwl from '../components/MascotOwl';
import { api, type TestResult } from '../services/api';
import { getStoredHistory } from '../services/resultStorage';
import { useAppStore } from '../store/useAppStore';

export default function DashboardPage() {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const clearSession = useAppStore((state) => state.clearSession);
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<TestResult[]>([]);

  useEffect(() => { if (token) setAttempts(getStoredHistory()); }, [token]);
  if (!token) return <Navigate to="/" replace />;

  async function logout() {
    if (!token) return;
    try { await api.logout(token); } catch {}
    clearSession(); navigate('/');
  }

  const latest = attempts[0];

  return (
    <main className="safe-page relative overflow-hidden px-4 sm:px-6">
      <div className="app-shell relative pb-24">
        <div className="flex items-center justify-between gap-3">
          <BrandHeader subtitle="Painel do aluno" compact />
          <button onClick={logout} className="secondary-cta grid h-11 w-11 shrink-0 place-items-center rounded-full" aria-label="Sair"><LogOut size={18}/></button>
        </div>

        <section className="mt-5 grid items-center gap-3 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <div className="category-pill text-[10px] sm:text-xs"><Trophy size={15}/> Sua jornada</div>
            <h1 className="hero-title mt-5 text-[3rem] sm:text-[4.3rem]">
              <span className="text-[#2b0d71]">Olá,</span><br/>
              <span className="hero-pink">{user?.name?.split(' ')[0] ?? 'Aluno'}!</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-6 text-[#7656a7] sm:text-lg">Acompanhe seu histórico e veja como seu aprendizado está evoluindo.</p>
          </div>
          <div className="relative mx-auto max-w-[320px]">
            <div className="hand-note absolute right-0 top-0 z-10 text-xl">Você está indo muito bem! ♡</div>
            <MascotOwl className="h-[280px] w-[280px]" />
          </div>
        </section>

        <button onClick={() => navigate('/language')} className="primary-cta mt-3 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl text-lg font-black">
          <Plus size={22}/> Novo nivelamento <ArrowRight size={21}/>
        </button>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><History className="text-[#3f167f]"/><h2 className="text-xl font-black text-[#2b0d71] sm:text-2xl">Histórico de avaliações</h2></div></div>
          <div className="space-y-3">
            {attempts.length === 0 ? (
              <div className="soft-card rounded-[1.5rem] p-8 text-center text-sm font-bold text-[#7656a7]">Você ainda não concluiu nenhum teste.</div>
            ) : attempts.map((attempt) => {
              const id = attempt.id ?? attempt.attemptId;
              const date = attempt.completedAt ? new Date(attempt.completedAt) : null;
              return (
                <button key={id} onClick={() => id && navigate(`/result/${id}`)} className="soft-card flex min-h-20 w-full items-center gap-4 rounded-[1.5rem] px-4 py-3 text-left sm:px-5">
                  <div className="w-14 shrink-0 text-center"><div className="text-lg font-black text-[#2b0d71]">{date?.getDate() ?? '--'}</div><div className="text-[10px] font-black uppercase text-[#7656a7]">{date?.toLocaleDateString('pt-BR',{month:'short'}).replace('.','') ?? ''}</div></div>
                  <div className="h-10 w-px bg-[#e4dcf2]"/>
                  <div className="min-w-0 flex-1"><div className="truncate font-black text-[#2b0d71]">Nivelamento completo</div><div className="mt-1 text-xs font-bold text-[#7656a7]">A1 a C2 • Espanhol</div></div>
                  <span className={`rounded-full px-4 py-2 text-sm font-black ${attempt.cefrLevel.startsWith('B')?'bg-[#e7f8f4] text-[#08786f]':attempt.cefrLevel.startsWith('A')?'bg-[#fff0f4] text-[#ff2d5f]':'bg-[#f1e9ff] text-[#6c2db7]'}`}>{attempt.cefrLevel}</span>
                  <ArrowRight size={18} className="text-[#4a1a86]"/>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mint-card mt-6 rounded-[1.8rem] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-black text-[#2b0d71]">Panorama da sua evolução</h2><p className="mt-1 text-sm text-[#7656a7]">Mais dados. Mais conquistas.</p></div><Trophy className="text-[#f6a000]"/></div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="rounded-2xl bg-white p-3 text-center"><UsersRound className="mx-auto text-[#6c2db7]" size={22}/><div className="mt-2 text-2xl font-black text-[#2b0d71]">{attempts.length}</div><div className="text-[10px] font-bold text-[#7656a7]">Testes feitos</div></div>
            <div className="rounded-2xl bg-white p-3 text-center"><Trophy className="mx-auto text-[#008f81]" size={22}/><div className="mt-2 text-2xl font-black text-[#2b0d71]">{latest?.cefrLevel ?? '—'}</div><div className="text-[10px] font-bold text-[#7656a7]">Último nível</div></div>
            <div className="rounded-2xl bg-white p-3 text-center"><CalendarDays className="mx-auto text-[#ff2d5f]" size={22}/><div className="mt-2 text-2xl font-black text-[#2b0d71]">{latest?.score ?? 0}%</div><div className="text-[10px] font-bold text-[#7656a7]">Aproveitamento</div></div>
          </div>
        </section>

        <div className="my-7 text-center"><span className="hand-note">Aprender te leva mais longe ♡</span></div>
        <div className="rainbow-corner"/>
      </div>
    </main>
  );
}
