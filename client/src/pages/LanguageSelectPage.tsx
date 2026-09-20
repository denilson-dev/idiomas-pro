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
    <main className="min-h-screen bg-[#06111f] px-5 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300 font-black text-slate-950">IP</div>
            <div><div className="font-black">Idiomas Pro</div><div className="text-xs text-slate-500">Nivelamento inteligente</div></div>
          </div>
          <div className="text-sm text-slate-400">{user ? `Olá, ${user.name.split(' ')[0]}` : 'Modo visitante'}</div>
        </header>

        <section className="mx-auto mt-20 max-w-3xl text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-white/5 text-cyan-300"><Languages size={30} /></div>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">Teste de Espanhol</h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">Questões distribuídas entre A1 e C2, em ordem aleatória, com gramática, vocabulário e listening.</p>
        </section>

        <section className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-400 font-black text-slate-950">ES</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Español · CEFR A1–C2</h2>
              <p className="mt-1 text-sm text-slate-400">Avaliação geral para identificar seu ponto de partida.</p>
            </div>
            <BookOpenCheck className="text-emerald-300" />
          </div>

          <div className="my-7 h-px bg-white/10" />
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300"><Clock3 size={17} /> Escolha o tamanho do teste</div>
          <div className="grid grid-cols-3 gap-3">
            {[15, 18, 20].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setCount(value)}
                className={`rounded-2xl border px-3 py-4 transition ${count === value ? 'border-cyan-300/60 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-black/15 text-slate-400 hover:border-white/25'}`}
              >
                <div className="text-xl font-black">{value}</div>
                <div className="mt-1 text-xs">questões</div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/test?count=${count}`)}
            className="mt-7 flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 font-black text-slate-950 transition hover:-translate-y-0.5"
          >
            Iniciar avaliação <ArrowRight size={20} />
          </button>
        </section>
      </div>
    </main>
  );
}
