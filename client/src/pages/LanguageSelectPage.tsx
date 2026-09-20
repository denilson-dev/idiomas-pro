import { ArrowRight, BookOpenCheck, Clock3, Languages } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

export default function LanguageSelectPage() {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const navigate = useNavigate();
  const [count, setCount] = useState(18);

  if (!token) return <Navigate to="/" replace />;

  return (
    <main className="safe-page relative overflow-hidden bg-[#06111f] px-4 text-white sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-5xl">
        <header className="flex items-center justify-between gap-3 py-1 sm:py-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 text-sm font-black text-slate-950">IP</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-black sm:text-base">Idiomas Pro</div>
              <div className="truncate text-[10px] text-slate-500 sm:text-xs">Nivelamento inteligente</div>
            </div>
          </div>
          <div className="max-w-[42%] truncate rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-right text-[11px] text-slate-400 sm:text-sm">
            {user ? `Olá, ${user.name.split(' ')[0]}` : 'Modo visitante'}
          </div>
        </header>

        <section className="mx-auto mt-8 max-w-3xl text-center sm:mt-14 lg:mt-16">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.07] text-cyan-300 sm:h-16 sm:w-16 sm:rounded-3xl">
            <Languages size={24} className="sm:hidden" />
            <Languages size={30} className="hidden sm:block" />
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300 sm:text-xs">Avaliação adaptativa</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.035em] sm:mt-3 sm:text-5xl">Teste de Espanhol</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:mt-4 sm:text-base sm:leading-7">
            Questões de A1 a C2 combinando gramática, vocabulário e listening em ordem aleatória.
          </p>
        </section>

        <section className="glass-panel mx-auto mt-6 max-w-3xl rounded-[1.75rem] p-4 sm:mt-9 sm:rounded-[2rem] sm:p-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 text-sm font-black text-slate-950 sm:h-12 sm:w-12">ES</div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold leading-5 sm:text-xl">Español · CEFR A1–C2</h2>
              <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">Avaliação geral para identificar seu ponto de partida.</p>
            </div>
            <BookOpenCheck className="shrink-0 text-emerald-300" size={20} />
          </div>

          <div className="my-5 h-px bg-white/10 sm:my-7" />

          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 sm:text-sm">
              <Clock3 size={16} />
              Tamanho do teste
            </div>
            <span className="text-[10px] text-slate-500 sm:text-xs">~8–12 min</span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[15, 18, 20].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setCount(value)}
                aria-pressed={count === value}
                className={`min-h-16 rounded-2xl border px-2 py-3 transition sm:min-h-20 sm:px-3 sm:py-4 ${
                  count === value
                    ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-100 shadow-lg shadow-cyan-950/20'
                    : 'border-white/10 bg-black/15 text-slate-400 hover:border-white/25'
                }`}
              >
                <div className="text-lg font-black sm:text-xl">{value}</div>
                <div className="mt-0.5 text-[10px] sm:mt-1 sm:text-xs">questões</div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/test?count=${count}`)}
            className="touch-no-hover mt-5 flex min-h-13 w-full items-center justify-between rounded-2xl bg-white px-4 py-3.5 font-black text-slate-950 transition hover:-translate-y-0.5 sm:mt-7 sm:px-5 sm:py-4"
          >
            <span>Iniciar avaliação</span>
            <ArrowRight size={20} />
          </button>

          <p className="mt-3 text-center text-[10px] leading-4 text-slate-500 sm:text-xs">
            Você poderá revisar as respostas antes de finalizar.
          </p>
        </section>
      </div>
    </main>
  );
}
