import { ArrowLeft, ArrowRight, BarChart3, Check, Globe2 } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import MascotOwl from '../components/MascotOwl';
import { useAppStore } from '../store/useAppStore';

export default function LanguageSelectPage() {
  const token = useAppStore((state) => state.token);
  const navigate = useNavigate();

  if (!token) return <Navigate to="/" replace />;

  const languages = [
    { code:'ES', flag:'🇪🇸', name:'Espanhol', native:'Español', active:true },
    { code:'EN', flag:'🇺🇸', name:'Inglês', native:'English', active:false },
    { code:'FR', flag:'🇫🇷', name:'Francês', native:'Français', active:false },
  ];

  return (
    <main className="safe-page relative overflow-hidden px-4 sm:px-6">
      <div className="app-shell relative">
        <BrandHeader subtitle="Idiomas • A1 a C2" />

        <button onClick={() => navigate('/')} aria-label="Voltar" className="secondary-cta mt-4 grid h-11 w-11 place-items-center rounded-2xl">
          <ArrowLeft size={20}/>
        </button>

        <section className="mt-3 grid items-center gap-3 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="category-pill text-[10px] sm:text-xs"><Globe2 size={15}/> Teste de nivelamento</div>
            <h1 className="hero-title mt-5 text-[3.1rem] sm:text-[4.8rem]">
              <span className="text-[#2b0d71]">Escolha o</span><br/>
              <span className="hero-pink">idioma para</span><br/>
              <span className="hero-teal">nivelar</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-6 text-[#7656a7] sm:text-lg sm:leading-8">
              Descubra seu nível de conhecimento, do A1 ao C2, e receba uma jornada de aprendizado personalizada.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[390px]">
            <div className="hand-note absolute right-0 top-0 z-10 text-lg sm:text-xl">Qual idioma vamos descobrir juntos? ♡</div>
            <MascotOwl className="animate-float mx-auto h-[290px] w-[290px] sm:h-[360px] sm:w-[360px]" />
          </div>
        </section>

        <section className="mt-4 space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              disabled={!lang.active}
              className={`flex min-h-[86px] w-full items-center gap-4 rounded-[1.5rem] border-2 px-4 py-4 text-left transition sm:px-5 ${
                lang.active ? 'border-[#ff2d5f] bg-[#fff8fa] shadow-[0_12px_30px_rgba(255,45,95,.08)]' : 'border-[#e2d8f3] bg-white opacity-65'
              }`}
            >
              <span className="text-4xl">{lang.flag}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-black text-[#2b0d71]">{lang.name}</span>
                <span className="mt-1 block text-sm text-[#7656a7]">{lang.native} • A1 a C2 {lang.active ? '' : '• Em breve'}</span>
              </span>
              {lang.active ? <span className="grid h-11 w-11 place-items-center rounded-full bg-[#ff2d5f] text-white"><Check size={21}/></span> : <span className="h-9 w-9 rounded-full border-2 border-[#d8cdec]"/>}
            </button>
          ))}
        </section>

        <section className="mint-card mt-5 rounded-[1.6rem] p-5">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#ddf7f2] text-[#008f81]"><BarChart3 size={26}/></span>
            <div><h2 className="text-lg font-black text-[#2b0d71]">Uma avaliação completa</h2><p className="mt-1 text-sm leading-6 text-[#7656a7]">Gramática, vocabulário e compreensão auditiva para identificar seu nível com resultado imediato.</p></div>
          </div>
        </section>

        <button onClick={() => navigate('/test?count=18')} className="primary-cta mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-5 text-lg font-black">
          Continuar <ArrowRight size={22}/>
        </button>

        <div className="my-7 flex items-center justify-center gap-3 text-sm text-[#4d2588]"><span className="h-px w-20 bg-[#d9cff0]"/><span className="hand-note">Aprender te leva mais longe ♡</span><span className="h-px w-20 bg-[#d9cff0]"/></div>
        <div className="rainbow-corner"/>
      </div>
    </main>
  );
}
