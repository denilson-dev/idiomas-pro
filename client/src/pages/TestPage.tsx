import { ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';
import { api, type Question } from '../services/api';
import { saveResult } from '../services/resultStorage';
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
      const result = await api.submitTest(
        token,
        attemptId,
        questions.map((question) => ({ questionId: question.id, selectedAnswer: answers[question.id] })),
      );
      saveResult({ ...result, id: attemptId, attemptId });
      navigate(`/result/${attemptId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível finalizar o teste.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="safe-page grid place-items-center bg-[#06111f] px-6 text-center text-slate-300">
        <div>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-300" />
          <p className="mt-4 text-sm">Preparando uma avaliação única para você...</p>
        </div>
      </div>
    );
  }

  if (error && !current) {
    return (
      <div className="safe-page grid place-items-center bg-[#06111f] px-6 text-center text-rose-200">
        <div className="max-w-md rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">{error}</div>
      </div>
    );
  }

  return (
    <main className="safe-page bg-[#06111f] px-4 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="sticky top-0 z-20 -mx-4 mb-3 border-b border-white/[0.06] bg-[#06111f]/90 px-4 pb-3 pt-1 backdrop-blur-xl sm:static sm:mx-0 sm:mb-6 sm:rounded-2xl sm:border sm:border-white/10 sm:bg-white/[0.035] sm:p-4">
          <ProgressBar current={answeredCount} total={questions.length} />
          <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-slate-500 sm:text-xs">
            <span>Questão {index + 1} de {questions.length}</span>
            <span>{answeredCount} respondidas</span>
          </div>
        </div>

        {current && (
          <QuestionCard
            question={current}
            selected={answers[current.id]}
            onSelect={(answer) => setAnswers((state) => ({ ...state, [current.id]: answer }))}
          />
        )}

        {error && (
          <div aria-live="polite" className="mt-3 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm leading-5 text-rose-200">
            {error}
          </div>
        )}

        <div className="safe-bottom sticky bottom-0 z-20 -mx-4 mt-4 border-t border-white/[0.07] bg-[#06111f]/92 px-4 pt-3 backdrop-blur-xl sm:static sm:mx-0 sm:mt-5 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
              className="flex min-h-12 items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30 sm:text-base"
            >
              <ArrowLeft size={18} />
              <span className="hidden min-[360px]:inline">Voltar</span>
            </button>

            {!isLast ? (
              <button
                type="button"
                disabled={!answers[current?.id]}
                onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:text-base"
              >
                Próxima <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                disabled={answeredCount !== questions.length || submitting}
                onClick={finish}
                className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-violet-400 px-5 py-3 text-sm font-black text-slate-950 transition active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none sm:text-base"
              >
                {submitting ? 'Calculando...' : 'Finalizar'} <Send size={18} />
              </button>
            )}
          </div>

          <p className="mt-2 text-center text-[10px] leading-4 text-slate-500 sm:mt-4 sm:text-xs">
            Você pode voltar e revisar suas respostas antes de finalizar.
          </p>
        </div>
      </div>
    </main>
  );
}
