import { ArrowRight, BarChart3, BookOpen, CalendarCheck2, Headphones, RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import MascotOwl from '../components/MascotOwl';
import { api, type TestResult } from '../services/api';
import { getStoredResult, saveResult } from '../services/resultStorage';
import { useAppStore } from '../store/useAppStore';

const categoryIcons = {
  GRAMMAR: BookOpen,
  VOCABULARY: BarChart3,
  LISTENING: Headphones,
};

const categoryTheme = {
  GRAMMAR: { bg:'#fff0f4', accent:'#ff2d5f' },
  VOCABULARY: { bg:'#eaf9f5', accent:'#009b8b' },
  LISTENING: { bg:'#f1e9ff', accent:'#6c2db7' },
};

export default function ResultPage() {
  const token = useAppStore((state) => state.token);
  const clearTestProfile = useAppStore((state) => state.clearTestProfile);
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    clearTestProfile();
  }, [clearTestProfile]);

  useEffect(() => {
    if (!token || !attemptId) return;
    const stored = getStoredResult(attemptId);
    if (stored) { setResult(stored); return; }
    api.getResult(token, attemptId)
      .then((data) => { saveResult(data); setResult(data); })
      .catch((err) => setError(err instanceof Error ? err.message : 'Resultado indisponível.'));
  }, [token, attemptId]);

  if (!token) return <Navigate to="/" replace />;

  if (!result) {
    return <div className="safe-page grid place-items-center px-6 text-center font-bold text-[#7656a7]">{error || 'Calculando seu resultado...'}</div>;
  }

  return (
    <main className="safe-page relative overflow-hidden px-4 sm:px-6">
      <div className="app-shell relative">
        <BrandHeader subtitle="Idiomas • Espanhol" />

        <section className="mt-6 grid items-center gap-3 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="category-pill text-[10px] sm:text-xs"><Sparkles size={15}/> Resultado do seu teste</div>
            <h1 className="hero-title mt-5 text-[3.25rem] sm:text-[4.8rem]">
              <span className="hero-pink">Parabéns!</span><br/>
              <span className="text-[#2b0d71]">Seu nível é</span>
            </h1>

            <div className="mt-5 inline-flex min-w-[210px] flex-col items-center rounded-[1.7rem] border border-[#ccece6] bg-[#f1fbf8] px-8 py-5">
              <span className="text-[4.5rem] font-black leading-none text-[#08786f] sm:text-[6rem]">{result.cefrLevel}</span>
              <span className="mt-2 text-sm font-black uppercase tracking-[.12em] text-[#08786f]">
                {result.cefrLevel === 'A1' || result.cefrLevel === 'A2' ? 'Nível básico' :
                 result.cefrLevel === 'B1' || result.cefrLevel === 'B2' ? 'Nível intermediário' : 'Nível avançado'}
              </span>
            </div>

            <p className="mt-5 max-w-xl text-[15px] leading-6 text-[#7656a7] sm:text-lg sm:leading-8">
              Você concluiu a avaliação com <strong className="text-[#2b0d71]">{result.score}% de aproveitamento</strong>. Continue praticando para avançar ainda mais.
            </p>
          </div>

          <div className="relative mx-auto max-w-[420px]">
            <div className="hand-note absolute right-0 top-0 z-10 text-xl sm:text-2xl">Você conseguiu! ♡</div>
            <MascotOwl variant="celebrate" className="animate-float h-[330px] w-[330px] sm:h-[420px] sm:w-[420px]" />
          </div>
        </section>

        <section className="paper-card mt-5 rounded-[1.8rem] p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-2"><BarChart3 className="text-[#5d238e]"/><h2 className="text-xl font-black text-[#2b0d71] sm:text-2xl">Seu desempenho por habilidade</h2></div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {result.breakdown.map((item) => {
              const Icon = categoryIcons[item.category];
              const theme = categoryTheme[item.category];
              return (
                <article key={item.category} className="rounded-2xl p-3 sm:p-5" style={{background:theme.bg}}>
                  <div className="flex items-center justify-between gap-1">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-white"><Icon size={18} style={{color:theme.accent}}/></span>
                    <span className="text-xl font-black sm:text-3xl" style={{color:theme.accent}}>{item.percentage}%</span>
                  </div>
                  <h3 className="mt-3 truncate text-xs font-black text-[#2b0d71] sm:text-base">{item.label}</h3>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80"><div className="h-full rounded-full" style={{width:`${item.percentage}%`,background:theme.accent}}/></div>
                  <p className="mt-2 text-[10px] font-bold text-[#7656a7] sm:text-xs">{item.correct}/{item.total} acertos</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4 flex items-center gap-2"><Sparkles className="text-[#f6a000]"/><h2 className="text-2xl font-black text-[#2b0d71]">Nossas recomendações para você</h2></div>
          <div className="space-y-3">
            {result.recommendations.map((course, i) => (
              <article key={course.title} className={`soft-card flex items-center gap-4 rounded-[1.5rem] p-4 sm:p-5 ${i===0?'border-[#cdeee7]':i===1?'border-[#ffd4df]':'border-[#dfd0f6]'}`}>
                <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${i===0?'bg-[#e4f8f3] text-[#008f81]':i===1?'bg-[#fff0f4] text-[#ff2d5f]':'bg-[#f1e9ff] text-[#6c2db7]'}`}>
                  {i===0?<BarChart3/>:i===1?<BookOpen/>:<Headphones/>}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black text-[#2b0d71]">{course.title}</h3><span className="rounded-full bg-[#e8faf6] px-2.5 py-1 text-[10px] font-black uppercase tracking-[.08em] text-[#008f81]">{course.tag}</span></div>
                  <p className="mt-1 text-sm leading-5 text-[#7656a7]">{course.description}</p>
                </div>
                <ArrowRight className="shrink-0 text-[#3e147e]" />
              </article>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button onClick={() => navigate('/dashboard')} className="primary-cta flex min-h-14 items-center justify-center gap-3 rounded-2xl text-lg font-black">
            Ver próximos passos <ArrowRight size={21}/>
          </button>
          <button onClick={() => navigate('/language')} className="secondary-cta flex min-h-14 items-center justify-center gap-3 rounded-2xl text-lg font-black">
            <RotateCcw size={20}/> Fazer novo teste
          </button>
        </div>

        <div className="my-7 flex items-center justify-center gap-3"><span className="h-px w-20 bg-[#d9cff0]"/><span className="hand-note">Grandes conversas começam aqui ♡</span><span className="h-px w-20 bg-[#d9cff0]"/></div>
        <div className="rainbow-corner"/>
      </div>
    </main>
  );
}
