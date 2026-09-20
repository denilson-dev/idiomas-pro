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
      <div className="grid min-h-screen place-items-center bg-[#06111f] px-6 text-center text-slate-300">
        {error || 'Calculando seu resultado...'}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#06111f] px-5 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <section className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.025] p-7 text-center shadow-2xl shadow-black/25 sm:p-10">
          <div className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="relative">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-300/10 text-amber-300"><Trophy size={28} /></div>
            <p className="mt-5 text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">Seu nível estimado</p>
            <div className="mx-auto mt-4 grid h-32 w-32 place-items-center rounded-[2rem] border border-cyan-300/30 bg-gradient-to-br from-cyan-300 to-violet-400 text-5xl font-black text-slate-950 shadow-2xl shadow-cyan-900/30">
              {result.cefrLevel}
            </div>
            <h1 className="mt-5 text-4xl font-black">{result.score}% de aproveitamento</h1>
            <p className="mx-auto mt-3 max-w-xl text-slate-400">Resultado calculado com base no conjunto misto de questões e convertido para a escala CEFR.</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {result.breakdown.map((item) => {
            const Icon = categoryIcons[item.category];
            return (
              <article key={item.category} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                <div className="flex items-center justify-between"><Icon className="text-cyan-300" size={22} /><span className="text-2xl font-black">{item.percentage}%</span></div>
                <h2 className="mt-5 font-bold">{item.label}</h2>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" style={{ width: `${item.percentage}%` }} /></div>
                <p className="mt-2 text-xs text-slate-500">{item.correct} acertos em {item.total} questões</p>
              </article>
            );
          })}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2"><CheckCircle2 className="text-emerald-300" /><h2 className="text-2xl font-black">Próximos passos</h2></div>
          <div className="grid gap-4 md:grid-cols-2">
            {result.recommendations.map((course) => (
              <article key={course.title} className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:border-white/20">
                <span className="rounded-full bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-200">{course.tag}</span>
                <h3 className="mt-4 text-xl font-black">{course.title}</h3>
                <p className="mt-2 leading-6 text-slate-400">{course.description}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button onClick={() => navigate('/dashboard')} className="flex flex-1 items-center justify-between rounded-2xl bg-white px-5 py-4 font-black text-slate-950">Ver histórico <ArrowRight size={19} /></button>
          <button onClick={() => navigate('/language')} className="rounded-2xl border border-white/10 px-5 py-4 font-bold text-slate-300 hover:bg-white/5">Fazer novo teste</button>
        </div>
      </div>
    </main>
  );
}
