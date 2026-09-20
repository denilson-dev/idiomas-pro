import { ArrowRight, BarChart3, BookOpen, Headphones, RotateCcw, Sparkles } from 'lucide-react';
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
      <div className="safe-page grid place-items-center px-6 text-center font-bold text-[#7656a7]">
        {error || 'Calculando seu resultado...'}
      </div>
    );
  }

  const levelLabel =
    result.cefrLevel === 'A1' || result.cefrLevel === 'A2'
      ? 'Nível básico'
      : result.cefrLevel === 'B1' || result.cefrLevel === 'B2'
        ? 'Nível intermediário'
        : 'Nível avançado';

  return (
    <main className="safe-page relative overflow-hidden px-3.5 sm:px-6">
      <div className="app-shell relative">
        <BrandHeader subtitle="Idiomas • Espanhol" />

        <section className="mt-4 sm:mt-6">
          <div className="category-pill text-[10px] sm:text-xs">
            <Sparkles size={14}/> Resultado do seu teste
          </div>

          <h1 className="hero-title mt-3.5 text-[2.8rem] sm:mt-5 sm:text-[4.8rem]">
            <span className="hero-pink">Parabéns!</span>
            <br/>
            <span className="text-[#2b0d71]">Seu nível é</span>
          </h1>

          <div className="mt-4 grid grid-cols-[1fr_128px] items-center gap-3 sm:mt-5 sm:grid-cols-[1fr_300px] sm:gap-6">
            <div className="paper-card flex min-h-[150px] flex-col items-center justify-center rounded-[1.45rem] border-[#ccece6] bg-[#f1fbf8]/90 px-4 py-4 text-center sm:min-h-[220px] sm:rounded-[1.8rem] sm:px-8 sm:py-5">
              <span className="text-[4.2rem] font-black leading-none text-[#08786f] sm:text-[6rem]">{result.cefrLevel}</span>
              <span className="mt-2 text-[10px] font-black uppercase tracking-[.12em] text-[#08786f] sm:text-sm">
                {levelLabel}
              </span>
              <span className="mt-3 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-black text-[#2b0d71] shadow-sm sm:text-sm">
                {result.score}% de aproveitamento
              </span>
            </div>

            <div className="relative mx-auto">
              <div className="hand-note absolute -right-1 -top-2 z-10 hidden text-base sm:block">Você conseguiu! ♡</div>
              <MascotOwl variant="celebrate" className="animate-float h-[126px] w-[126px] sm:h-[285px] sm:w-[285px]" />
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-[13px] leading-5.5 text-[#7656a7] sm:mt-5 sm:text-lg sm:leading-8">
            Você concluiu a avaliação com <strong className="text-[#2b0d71]">{result.score}% de aproveitamento</strong>. Continue praticando para avançar ainda mais.
          </p>
        </section>

        <section className="paper-card mt-5 rounded-[1.55rem] p-3.5 sm:rounded-[1.8rem] sm:p-6">
          <div className="mb-3 flex items-center gap-2 sm:mb-4">
            <BarChart3 className="text-[#5d238e]" size={20}/>
            <h2 className="text-lg font-black text-[#2b0d71] sm:text-2xl">Seu desempenho por habilidade</h2>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-3 sm:gap-4">
            {result.breakdown.map((item) => {
              const Icon = categoryIcons[item.category];
              const theme = categoryTheme[item.category];

              return (
                <article
                  key={item.category}
                  className="flex items-center gap-3 rounded-[1.15rem] p-3.5 sm:block sm:rounded-2xl sm:p-5"
                  style={{ background: theme.bg }}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/90 shadow-sm sm:h-9 sm:w-9">
                    <Icon size={18} style={{ color: theme.accent }}/>
                  </span>

                  <div className="min-w-0 flex-1 sm:mt-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="truncate text-sm font-black text-[#2b0d71] sm:text-base">{item.label}</h3>
                      <span className="text-xl font-black sm:text-3xl" style={{ color: theme.accent }}>{item.percentage}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
                      <div className="h-full rounded-full transition-[width] duration-700" style={{ width:`${item.percentage}%`, background:theme.accent }}/>
                    </div>
                    <p className="mt-1.5 text-[10px] font-bold text-[#7656a7] sm:text-xs">{item.correct}/{item.total} acertos</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-5 sm:mt-6">
          <div className="mb-3 flex items-center gap-2 sm:mb-4">
            <Sparkles className="text-[#f6a000]" size={20}/>
            <h2 className="text-xl font-black text-[#2b0d71] sm:text-2xl">Próximos passos</h2>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {result.recommendations.map((course, index) => (
              <article
                key={course.title}
                className={`soft-card flex items-center gap-3 rounded-[1.3rem] p-3.5 sm:gap-4 sm:rounded-[1.5rem] sm:p-5 ${
                  index === 0 ? 'border-[#cdeee7]' : index === 1 ? 'border-[#ffd4df]' : 'border-[#dfd0f6]'
                }`}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl sm:h-14 sm:w-14 sm:rounded-2xl ${
                  index === 0
                    ? 'bg-[#e4f8f3] text-[#008f81]'
                    : index === 1
                      ? 'bg-[#fff0f4] text-[#ff2d5f]'
                      : 'bg-[#f1e9ff] text-[#6c2db7]'
                }`}>
                  {index === 0 ? <BarChart3 size={20}/> : index === 1 ? <BookOpen size={20}/> : <Headphones size={20}/>}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <h3 className="text-sm font-black text-[#2b0d71] sm:text-lg">{course.title}</h3>
                    <span className="rounded-full bg-[#e8faf6] px-2 py-1 text-[9px] font-black uppercase tracking-[.06em] text-[#008f81] sm:px-2.5 sm:text-[10px]">
                      {course.tag}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4.5 text-[#7656a7] sm:text-sm sm:leading-5">{course.description}</p>
                </div>

                <ArrowRight size={18} className="shrink-0 text-[#3e147e]"/>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-5 grid gap-2.5 sm:mt-6 sm:grid-cols-2 sm:gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="primary-cta flex min-h-14 items-center justify-center gap-3 rounded-2xl px-4 text-base font-black sm:text-lg"
          >
            Ver próximos passos <ArrowRight size={20}/>
          </button>

          <button
            onClick={() => navigate('/language')}
            className="secondary-cta flex min-h-14 items-center justify-center gap-3 rounded-2xl px-4 text-base font-black sm:text-lg"
          >
            <RotateCcw size={19}/> Fazer novo teste
          </button>
        </div>

        <div className="my-6 flex items-center justify-center gap-3 sm:my-7">
          <span className="h-px w-14 bg-[#d9cff0] sm:w-20"/>
          <span className="hand-note">Grandes conversas começam aqui ♡</span>
          <span className="h-px w-14 bg-[#d9cff0] sm:w-20"/>
        </div>
        <div className="rainbow-corner"/>
      </div>
    </main>
  );
}
