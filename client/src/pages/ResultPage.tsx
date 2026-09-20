import { ArrowRight, BarChart3, BookOpen, CheckCircle2, Headphones, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { api, type TestResult } from '../services/api';
import { getStoredResult, saveResult } from '../services/resultStorage';
import { useAppStore } from '../store/useAppStore';

const categoryIcons = {
  GRAMMAR: BookOpen,
  VOCABULARY: BarChart3,
  LISTENING: Headphones,
};

export default function ResultPage() {
  const token = useAppStore((state) => state.token);
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !attemptId) return;

    const stored = getStoredResult(attemptId);
    if (stored) {
      setResult(stored);
      return;
    }

    api.getResult(token, attemptId)
      .then((data) => {
        saveResult(data);
        setResult(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Resultado indisponível.'));
  }, [token, attemptId]);

  if (!token) return <Navigate to="/" replace />;

  if (!result) {
    return (
      <div className="safe-page grid place-items-center bg-[#06111f] px-6 text-center text-slate-300">
        {error || 'Calculando seu resultado...'}
      </div>
    );
  }

  return (
    <main className="safe-page relative overflow-hidden bg-[#06111f] px-4 text-white sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-5xl">
        <section className="glass-panel relative overflow-hidden rounded-[1.75rem] p-5 text-center sm:rounded-[2.25rem] sm:p-10">
          <div className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-amber-300/10 text-amber-300 sm:h-14 sm:w-14">
              <Trophy size={24} />
            </div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-300 sm:mt-5 sm:text-sm">Seu nível estimado</p>
            <div className="mx-auto mt-3 grid h-24 w-24 place-items-center rounded-[1.5rem] border border-cyan-300/30 bg-gradient-to-br from-cyan-300 to-violet-400 text-4xl font-black text-slate-950 shadow-2xl shadow-cyan-900/30 sm:mt-4 sm:h-32 sm:w-32 sm:rounded-[2rem] sm:text-5xl">
              {result.cefrLevel}
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight sm:mt-5 sm:text-4xl">{result.score}% de aproveitamento</h1>
            <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-400 sm:mt-3 sm:text-base sm:leading-6">
              Resultado calculado pelo conjunto misto de questões e convertido para a escala CEFR.
            </p>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-4">
          {result.breakdown.map((item) => {
            const Icon = categoryIcons[item.category];
            return (
              <article key={item.category} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 sm:rounded-3xl sm:p-5">
                <div className="flex items-center justify-between gap-1">
                  <Icon className="text-cyan-300" size={17} />
                  <span className="text-lg font-black sm:text-2xl">{item.percentage}%</span>
                </div>
                <h2 className="mt-3 truncate text-xs font-bold sm:mt-5 sm:text-base">{item.label}</h2>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10 sm:mt-3 sm:h-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" style={{ width: `${item.percentage}%` }} />
                </div>
                <p className="mt-1.5 text-[9px] leading-4 text-slate-500 sm:mt-2 sm:text-xs">{item.correct}/{item.total} acertos</p>
              </article>
            );
          })}
        </section>

        <section className="mt-6 sm:mt-8">
          <div className="mb-3 flex items-center gap-2 sm:mb-4">
            <CheckCircle2 className="text-emerald-300" size={20} />
            <h2 className="text-xl font-black sm:text-2xl">Próximos passos</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 sm:gap-4">
            {result.recommendations.map((course) => (
              <article key={course.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition hover:border-white/20 sm:rounded-3xl sm:p-5">
                <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-[10px] font-bold text-violet-200 sm:px-3 sm:text-xs">{course.tag}</span>
                <h3 className="mt-3 text-base font-black sm:mt-4 sm:text-xl">{course.title}</h3>
                <p className="mt-1.5 text-sm leading-5 text-slate-400 sm:mt-2 sm:leading-6">{course.description}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="safe-bottom mt-6 grid gap-2 sm:mt-8 sm:flex sm:gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex min-h-12 flex-1 items-center justify-between rounded-2xl bg-white px-5 py-3.5 font-black text-slate-950"
          >
            Ver histórico <ArrowRight size={19} />
          </button>
          <button
            onClick={() => navigate('/language')}
            className="min-h-12 rounded-2xl border border-white/10 px-5 py-3.5 font-bold text-slate-300 hover:bg-white/5"
          >
            Fazer novo teste
          </button>
        </div>
      </div>
    </main>
  );
}
