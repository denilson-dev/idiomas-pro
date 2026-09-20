import { ArrowLeft, ArrowRight, CheckCircle2, Headphones, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import MascotOwl from '../components/MascotOwl';
import ProgressBar from '../components/ProgressBar';
import QuestionCard from '../components/QuestionCard';
import { api, type Question } from '../services/api';
import { saveResult } from '../services/resultStorage';
import { useAppStore } from '../store/useAppStore';

export default function TestPage() {
  const token = useAppStore((state) => state.token);
  const testProfile = useAppStore((state) => state.testProfile);
  const navigate = useNavigate();
  const started = useRef(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [attemptId, setAttemptId] = useState('');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviewing, setReviewing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !testProfile || started.current) return;
    started.current = true;

    api.startTest(token, {
      count: testProfile.count,
      studentName: testProfile.studentName,
      studentEmail: testProfile.studentEmail,
      teacherId: testProfile.teacherId,
      language: testProfile.language,
    })
      .then((data) => {
        setQuestions(data.questions);
        setAttemptId(data.attemptId);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Falha ao iniciar o teste.'))
      .finally(() => setLoading(false));
  }, [token, testProfile]);

  useEffect(() => {
    if (loading || reviewing) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [index, loading, reviewing]);

  useEffect(() => {
    if (reviewing) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [reviewing]);

  const current = questions[index];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const isLast = index === questions.length - 1;

  const categorySummary = useMemo(() => {
    const categories = [
      ['GRAMMAR', 'Gramática'],
      ['VOCABULARY', 'Vocabulário'],
      ['LISTENING', 'Compreensão auditiva'],
    ] as const;

    return categories.map(([category, label]) => {
      const list = questions.filter((question) => question.category === category);
      const answered = list.filter((question) => answers[question.id]).length;
      return { category, label, total: list.length, answered };
    });
  }, [questions, answers]);

  if (!token) return <Navigate to="/" replace />;
  if (!testProfile) return <Navigate to="/setup" replace />;

  async function finish() {
    if (!token || !attemptId || answeredCount !== questions.length) return;

    try {
      setSubmitting(true);
      setError('');

      const result = await api.submitTest(
        token,
        attemptId,
        questions.map((question) => ({
          questionId: question.id,
          selectedAnswer: answers[question.id],
        })),
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
      <div className="safe-page grid place-items-center px-6 text-center text-[#7656a7]">
        <div>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eee6f7] border-t-[#ff2d5f]" />
          <p className="mt-4 text-sm font-bold">Preparando sua avaliação...</p>
        </div>
      </div>
    );
  }

  if (error && !current) {
    return (
      <div className="safe-page grid place-items-center px-6 text-center">
        <div className="max-w-md rounded-2xl bg-[#fff0f4] p-4 font-bold text-[#c81f49]">{error}</div>
      </div>
    );
  }

  if (reviewing) {
    return (
      <main className="safe-page relative overflow-hidden px-3.5 sm:px-6">
        <div className="app-shell relative">
          <BrandHeader subtitle={`Espanhol • Prof. ${testProfile.teacherName.replace(/^Prof\.?\s*/i, '')}`} />

          <section className="mt-4 grid grid-cols-[1fr_auto] items-center gap-3 sm:mt-6 lg:grid-cols-[1.15fr_.85fr] lg:gap-4">
            <div>
              <div className="category-pill text-[10px] sm:text-xs">
                <CheckCircle2 size={15}/> Revisão final
              </div>
              <h1 className="hero-title mt-3.5 text-[2.75rem] sm:mt-5 sm:text-[4.6rem]">
                <span className="hero-pink">Revise suas</span>
                <br/>
                <span className="hero-teal">respostas</span>
              </h1>
              <p className="mt-3 max-w-xl text-[13px] leading-5.5 text-[#7656a7] sm:mt-4 sm:text-lg sm:leading-7">
                Confira seu progresso antes de finalizar. Você ainda pode voltar e fazer alterações.
              </p>
            </div>

            <div className="relative mx-auto">
              <div className="hand-note absolute -right-1 -top-1 z-10 hidden text-base sm:block">Quase lá! ♡</div>
              <MascotOwl variant="study" className="h-[116px] w-[116px] sm:h-[260px] sm:w-[260px]" />
            </div>
          </section>

          <section className="mint-card mt-4 flex items-center gap-4 rounded-[1.45rem] p-4 sm:gap-5 sm:p-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-[8px] border-[#00a38f] bg-white text-center shadow-[0_8px_24px_rgba(0,155,139,.10)] sm:h-24 sm:w-24 sm:border-[10px]">
              <div>
                <div className="text-xl font-black text-[#2b0d71] sm:text-2xl">{answeredCount}</div>
                <div className="text-[10px] font-bold text-[#7656a7] sm:text-xs">de {questions.length}</div>
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-xl font-black leading-tight text-[#2b0d71] sm:text-2xl">{answeredCount} de {questions.length} respondidas</div>
              <div className="mt-1 text-xs font-bold text-[#7656a7] sm:text-sm">Você está quase terminando!</div>
            </div>
          </section>

          <section className="paper-card mt-4 overflow-hidden rounded-[1.45rem]">
            {categorySummary.map((item, idx) => {
              const complete = item.answered === item.total;
              return (
                <div key={item.category} className={`flex items-center gap-3 px-3.5 py-3.5 sm:gap-4 sm:px-5 sm:py-4 ${idx ? 'border-t border-[#ece4f5]' : ''}`}>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full sm:h-11 sm:w-11 ${
                    item.category === 'GRAMMAR'
                      ? 'bg-[#ffe7ed] text-[#ff2d5f]'
                      : item.category === 'VOCABULARY'
                        ? 'bg-[#e3f8f3] text-[#008f81]'
                        : 'bg-[#f0e6ff] text-[#5d238e]'
                  }`}>
                    {item.category === 'LISTENING' ? <Headphones size={20}/> : <CheckCircle2 size={20}/>}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-[#2b0d71] sm:text-base">{item.label}</div>
                    <div className="text-xs text-[#7656a7] sm:text-sm">{item.answered} de {item.total} respondidas</div>
                  </div>

                  <span className={`shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-black sm:px-3 sm:text-xs ${
                    complete ? 'bg-[#e5faf4] text-[#008f81]' : 'bg-[#f1e9ff] text-[#6c2db7]'
                  }`}>
                    {complete ? 'Concluído' : 'Em andamento'}
                  </span>
                </div>
              );
            })}
          </section>

          {error && <div className="mt-3 rounded-xl bg-[#fff0f4] p-3 text-sm font-bold text-[#c81f49]">{error}</div>}

          <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-3">
            <button
              onClick={finish}
              disabled={submitting}
              className="primary-cta flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-4 text-base font-black disabled:opacity-60 sm:text-lg"
            >
              {submitting ? 'Calculando resultado...' : 'Finalizar avaliação'} <Send size={20}/>
            </button>

            <button
              onClick={() => setReviewing(false)}
              className="secondary-cta flex min-h-13 w-full items-center justify-center gap-3 rounded-2xl px-4 font-black"
            >
              <ArrowLeft size={19}/> Continuar revisando
            </button>
          </div>

          <div className="my-6 text-center sm:my-7">
            <span className="hand-note text-[#4d2588]">Seu esforço te leva mais longe! ♡</span>
          </div>
          <div className="rainbow-corner"/>
        </div>
      </main>
    );
  }

  return (
    <main className="safe-page px-3.5 sm:px-6">
      <div className="app-shell pb-2">
        <BrandHeader subtitle={`Espanhol • Prof. ${testProfile.teacherName.replace(/^Prof\.?\s*/i, '')}`} compact />

        <div className="test-progress-surface mt-2.5 rounded-2xl px-3.5 py-3 sm:sticky sm:top-3 sm:z-20 sm:mt-3 sm:px-4">
          <ProgressBar current={index} total={questions.length} />
        </div>

        {current && (
          <div className="mt-3.5 sm:mt-4">
            <QuestionCard
              key={current.id}
              question={current}
              selected={answers[current.id]}
              onSelect={(answer) => setAnswers((state) => ({ ...state, [current.id]: answer }))}
            />
          </div>
        )}

        {error && <div className="mt-3 rounded-xl bg-[#fff0f4] p-3 text-sm font-bold text-[#c81f49]">{error}</div>}

        <p className="mt-3 text-center text-[10px] font-bold text-[#927db8] sm:text-xs">
          Seu nível só será revelado depois da finalização.
        </p>

        <div className="mobile-nav-dock safe-bottom sticky bottom-2 z-20 -mx-0.5 mt-3 rounded-[1.35rem] p-2 sm:static sm:mx-0 sm:mt-4 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
          <div className="grid grid-cols-[52px_1fr] gap-2.5 sm:grid-cols-[auto_1fr] sm:gap-3">
            <button
              disabled={index === 0}
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
              className="secondary-cta flex min-h-12 items-center justify-center gap-2 rounded-2xl px-3 font-black disabled:opacity-30 sm:min-h-13 sm:px-5"
              aria-label="Voltar para questão anterior"
            >
              <ArrowLeft size={20}/>
              <span className="hidden sm:inline">Voltar</span>
            </button>

            {!isLast ? (
              <button
                disabled={!answers[current?.id]}
                onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))}
                className="primary-cta flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black disabled:opacity-40 sm:min-h-13 sm:px-5 sm:text-base"
              >
                Próxima questão <ArrowRight size={19}/>
              </button>
            ) : (
              <button
                disabled={!answers[current?.id]}
                onClick={() => setReviewing(true)}
                className="primary-cta flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black disabled:opacity-40 sm:min-h-13 sm:px-5 sm:text-base"
              >
                Revisar respostas <ArrowRight size={19}/>
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
