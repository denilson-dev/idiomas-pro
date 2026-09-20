import { ArrowLeft, ArrowRight, BarChart3, Check, Globe2 } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import FlagIcon from '../components/FlagIcon';
import MascotOwl from '../components/MascotOwl';
import { useAppStore } from '../store/useAppStore';

export default function LanguageSelectPage() {
  const token = useAppStore((state) => state.token);
  const navigate = useNavigate();

  if (!token) return <Navigate to="/" replace />;

  const languages = [
    { code:'ES', flagCode:'ES' as const, name:'Espanhol', native:'Español', active:true },
    { code:'EN', flagCode:'US' as const, name:'Inglês', native:'English', active:false },
    { code:'FR', flagCode:'FR' as const, name:'Francês', native:'Français', active:false },
  ];

  return (
    <main className="safe-page relative overflow-hidden px-3.5 sm:px-6">
      <div className="app-shell relative">
        <BrandHeader subtitle="Idiomas • A1 a C2" />

        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            aria-label="Voltar"
            className="secondary-cta grid h-11 w-11 place-items-center rounded-2xl"
          >
            <ArrowLeft size={20}/>
          </button>
          <span className="os-pill rounded-full px-3 py-2 text-[11px] font-black text-[#7656a7]">1 de 3</span>
        </div>

        <section className="mt-3 grid grid-cols-[1fr_126px] items-center gap-2 sm:mt-5 sm:grid-cols-[1.05fr_.95fr] sm:gap-5">
          <div>
            <div className="category-pill text-[10px] sm:text-xs"><Globe2 size={14}/> Idioma da avaliação</div>
            <h1 className="hero-title mt-3.5 text-[2.8rem] sm:mt-5 sm:text-[4.8rem]">
              <span className="text-[#2b0d71]">Escolha seu</span><br/>
              <span className="hero-pink">idioma</span>
            </h1>
            <p className="mt-3 max-w-xl text-[13px] leading-5.5 text-[#7656a7] sm:mt-4 sm:text-lg sm:leading-8">
              Selecione o idioma da avaliação. O idioma da interface continua em Português.
            </p>
          </div>

          <div className="relative mx-auto">
            <div className="hand-note absolute -right-1 -top-2 z-10 hidden text-base sm:block">Qual será a próxima conquista? ♡</div>
            <MascotOwl className="animate-float h-[122px] w-[122px] sm:h-[340px] sm:w-[340px]" />
          </div>
        </section>

        <section className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              disabled={!lang.active}
              aria-label={lang.active ? `Selecionar ${lang.name}` : `${lang.name} em breve`}
              className={`pressable group flex min-h-[82px] w-full items-center gap-3 rounded-[1.3rem] border px-3.5 py-3.5 text-left sm:min-h-[92px] sm:gap-4 sm:rounded-[1.5rem] sm:px-5 sm:py-4 ${
                lang.active
                  ? 'border-[#ff2d5f] bg-[linear-gradient(145deg,rgba(255,255,255,.98),rgba(255,241,246,.94))] shadow-[0_14px_34px_rgba(255,45,95,.09)]'
                  : 'border-[#e4dbf2] bg-white/72 opacity-60'
              }`}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white shadow-[0_8px_22px_rgba(43,13,113,.08)] ring-1 ring-[#ede6f6] sm:h-14 sm:w-14">
                <FlagIcon code={lang.flagCode} className="h-10 w-10 sm:h-12 sm:w-12" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[.08em] text-[#8d79b2]">{lang.code}</span>
                  {!lang.active && (
                    <span className="rounded-full bg-[#f2ecfb] px-2 py-0.5 text-[9px] font-black uppercase tracking-[.05em] text-[#8066aa]">
                      Em breve
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-lg font-black text-[#2b0d71] sm:text-xl">{lang.name}</span>
                <span className="mt-0.5 block text-xs text-[#7656a7] sm:mt-1 sm:text-sm">
                  {lang.native} • Níveis A1 a C2
                </span>
              </span>

              {lang.active
                ? <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#ff4b75] to-[#f31f55] text-white shadow-[0_7px_16px_rgba(255,45,95,.22)] sm:h-11 sm:w-11"><Check size={20}/></span>
                : <span className="h-9 w-9 shrink-0 rounded-full border-2 border-[#ddd3ee] bg-white/70"/>}
            </button>
          ))}
        </section>

        <section className="mint-card mt-4 rounded-[1.4rem] p-4 sm:mt-5 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#ddf7f2] text-[#008f81] sm:h-12 sm:w-12">
              <BarChart3 size={23}/>
            </span>
            <div>
              <h2 className="text-base font-black text-[#2b0d71] sm:text-lg">Uma avaliação completa</h2>
              <p className="mt-1 text-xs leading-5 text-[#7656a7] sm:text-sm sm:leading-6">
                Gramática, vocabulário e compreensão auditiva para identificar seu nível com resultado imediato.
              </p>
            </div>
          </div>
        </section>

        <button
          onClick={() => navigate('/setup')}
          className="primary-cta mt-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-5 text-base font-black sm:mt-5 sm:text-lg"
        >
          Continuar em Espanhol <ArrowRight size={21}/>
        </button>

        <div className="my-6 flex items-center justify-center gap-3 text-sm text-[#4d2588] sm:my-7">
          <span className="h-px w-14 bg-[#d9cff0] sm:w-20"/>
          <span className="hand-note">Aprender te leva mais longe ♡</span>
          <span className="h-px w-14 bg-[#d9cff0] sm:w-20"/>
        </div>
        <div className="rainbow-corner"/>
      </div>
    </main>
  );
}
