import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';
import { api, type Question } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function TestPage() {
  const token = useAppStore((state) => state.token);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const started = useRef(false);
  const parsedCount = Number(params.get('count') ?? 18);
  const count = Number.isFinite(parsedCount) ? Math.min(20, Math.max(15, parsedCount)) : 18;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState('');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    api.startTest(token, count)
      .then((data) => {
        setQuestions(data.questions);
        setAttemptId(data.attemptId);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Falha ao iniciar o teste.'))
      .finally(() => setLoading(false));
  }, [token, count]);

  const current = questions[index];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const isLast = index === questions.length - 1;

  if (!token) return <Navigate to="/" replace />;

  async function finish() {
    if (!token || !attemptId || answeredCount !== questions.length) return;
    try {
      setSubmitting(true);
      setError('');
      await api.submitTest(
        token,
        attemptId,
        questions.map((question) => ({ questionId: question.id, selectedAnswer: answers[question.id] })),
      );
      navigate(`/result/${attemptId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível finalizar o teste.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-[#06111f] text-slate-300">Preparando uma avaliação única para você...</div>;
  }

  if (error && !current) {
    return <div className="grid min-h-screen place-items-center bg-[#06111f] px-5 text-center text-rose-200"><div>{error}</div></div>;
  }

  return (
    <main className="min-h-screen bg-[#06111f] px-4 py-5 text-white sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
          <ProgressBar current={answeredCount} total={questions.length} />
        </div>

        {current && (
          <QuestionCard
            question={current}
            selected={answers[current.id]}
            onSelect={(answer) => setAnswers((state) => ({ ...state, [current.id]: answer }))}
          />
        )}

        {error && <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">{error}</div>}

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((value) => Math.max(0, value - 1))}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft size={18} /> Voltar
          </button>

          {!isLast ? (
            <button
              type="button"
              disabled={!answers[current?.id]}
              onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Próxima <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              disabled={answeredCount !== questions.length || submitting}
              onClick={finish}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-violet-400 px-5 py-3 font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? 'Calculando...' : 'Finalizar'} <Send size={18} />
            </button>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">Questão {index + 1} de {questions.length} · Você pode voltar e revisar antes de finalizar.</div>
      </div>
    </main>
  );
}
