import { ArrowLeft, ArrowRight, CheckCircle2, Headphones, Send } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import MascotOwl from '../components/MascotOwl';
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
  const [reviewing, setReviewing] = useState(false);
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

  const categorySummary = useMemo(() => {
    const categories = [
      ['GRAMMAR', 'Gramática'],
      ['VOCABULARY', 'Vocabulário'],
      ['LISTENING', 'Compreensão auditiva'],
    ] as const;
    return categories.map(([category, label]) => {
      const list = questions.filter(q => q.category === category);
      const answered = list.filter(q => answers[q.id]).length;
      return { category, label, total: list.length, answered };
    });
  }, [questions, answers]);

  if (!token) return <Navigate to="/" replace />;

  async function finish() {
    if (!token || !attemptId || answeredCount !== questions.length) return;
    try {
      setSubmitting(true); setError('');
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
    return <div className="safe-page grid place-items-center px-6 text-center text-[#7656a7]">
      <div><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#eee6f7] border-t-[#ff2d5f]"/><p className="mt-4 text-sm font-bold">Preparando sua avaliação...</p></div>
    </div>;
  }

  if (error && !current) {
    return <div className="safe-page grid place-items-center px-6 text-center"><div className="max-w-md rounded-2xl bg-[#fff0f4] p-4 font-bold text-[#c81f49]">{error}</div></div>;
  }

  if (reviewing) {
    return (
      <main className="safe-page relative overflow-hidden px-4 sm:px-6">
        <div className="app-shell relative">
          <BrandHeader subtitle="Idiomas • Espanhol" />
          <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
            <div>
              <div className="category-pill text-[10px] sm:text-xs"><CheckCircle2 size={16}/> Teste de nivelamento</div>
              <h1 className="hero-title mt-5 text-[3.1rem] sm:text-[4.6rem]">
                <span className="hero-pink">Revise suas</span><br/><span className="hero-teal">respostas</span>
              </h1>
              <p className="mt-4 max-w-xl text-[15px] leading-6 text-[#7656a7] sm:text-lg">Confira seu progresso antes de finalizar. Você ainda pode voltar e fazer alterações com tranquilidade.</p>
            </div>
            <div className="relative mx-auto max-w-[320px]">
              <div className="hand-note absolute right-0 top-0 z-10 text-xl">Quase lá! ♡</div>
              <MascotOwl variant="study" className="h-[290px] w-[290px]" />
            </div>
          </section>

          <section className="mint-card mt-4 flex items-center gap-5 rounded-[1.6rem] p-5">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-[10px] border-[#00a38f] bg-white text-center">
              <div><div className="text-2xl font-black text-[#2b0d71]">{answeredCount}</div><div className="text-xs font-bold text-[#7656a7]">de {questions.length}</div></div>
            </div>
            <div><div className="text-2xl font-black text-[#2b0d71]">{answeredCount} de {questions.length} respondidas</div><div className="mt-1 text-sm font-bold text-[#7656a7]">Você está quase terminando!</div></div>
          </section>

          <section className="paper-card mt-4 overflow-hidden rounded-[1.6rem]">
            {categorySummary.map((item, idx) => (
              <div key={item.category} className={`flex items-center gap-4 px-4 py-4 sm:px-5 ${idx ? 'border-t border-[#ece4f5]' : ''}`}>
                <span className={`grid h-11 w-11 place-items-center rounded-full ${item.category==='GRAMMAR'?'bg-[#ffe7ed] text-[#ff2d5f]':item.category==='VOCABULARY'?'bg-[#e3f8f3] text-[#008f81]':'bg-[#f0e6ff] text-[#5d238e]'}`}>
                  {item.category==='LISTENING' ? <Headphones size={21}/> : <CheckCircle2 size={21}/>}
                </span>
                <div className="flex-1"><div className="font-black text-[#2b0d71]">{item.label}</div><div className="text-sm text-[#7656a7]">{item.answered} de {item.total} respondidas</div></div>
                <span className="rounded-full bg-[#e5faf4] px-3 py-1.5 text-xs font-black text-[#008f81]">Concluído</span>
              </div>
            ))}
          </section>

          {error && <div className="mt-3 rounded-xl bg-[#fff0f4] p-3 text-sm font-bold text-[#c81f49]">{error}</div>}

          <button onClick={finish} disabled={submitting} className="primary-cta mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl text-lg font-black disabled:opacity-60">
            {submitting ? 'Calculando resultado...' : 'Finalizar avaliação'} <Send size={21}/>
          </button>
          <button onClick={() => setReviewing(false)} className="secondary-cta mt-3 flex min-h-13 w-full items-center justify-center gap-3 rounded-2xl font-black">
            <ArrowLeft size={20}/> Continuar revisando
          </button>
          <div className="my-7 text-center"><span className="hand-note text-[#4d2588]">Seu esforço te leva mais longe! ♡</span></div>
          <div className="rainbow-corner"/>
        </div>
      </main>
    );
  }

  return (
    <main className="safe-page px-4 sm:px-6">
      <div className="app-shell">
        <BrandHeader subtitle="Idiomas • Espanhol" compact />
        <div className="sticky top-0 z-20 mt-3 rounded-2xl bg-[#f6f3ff]/95 py-3 backdrop-blur-xl">
          <ProgressBar current={index} total={questions.length} />
        </div>

        {current && <div className="mt-4">
          <QuestionCard question={current} selected={answers[current.id]} onSelect={(answer) => setAnswers((state) => ({ ...state, [current.id]: answer }))}/>
        </div>}

        {error && <div className="mt-3 rounded-xl bg-[#fff0f4] p-3 text-sm font-bold text-[#c81f49]">{error}</div>}

        <div className="safe-bottom sticky bottom-0 z-20 -mx-4 mt-4 border-t border-[#ebe3f5] bg-[#f6f3ff]/95 px-4 pt-3 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0">
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <button disabled={index===0} onClick={() => setIndex(v=>Math.max(0,v-1))} className="secondary-cta flex min-h-13 items-center justify-center gap-2 rounded-2xl px-5 font-black disabled:opacity-35">
              <ArrowLeft size={20}/><span className="hidden sm:inline">Voltar</span>
            </button>
            {!isLast ? (
              <button disabled={!answers[current?.id]} onClick={() => setIndex(v=>Math.min(questions.length-1,v+1))} className="primary-cta flex min-h-13 items-center justify-center gap-2 rounded-2xl px-5 font-black disabled:opacity-40">
                Próxima questão <ArrowRight size={20}/>
              </button>
            ) : (
              <button disabled={!answers[current?.id]} onClick={() => setReviewing(true)} className="primary-cta flex min-h-13 items-center justify-center gap-2 rounded-2xl px-5 font-black disabled:opacity-40">
                Revisar respostas <ArrowRight size={20}/>
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-[10px] font-bold text-[#927db8] sm:text-xs">Seu nível só será revelado depois da finalização.</p>
        </div>
      </div>
    </main>
  );
}
