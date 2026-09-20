import { useState } from 'react';
import { ArrowRight, BookOpen, Headphones, LogIn, School, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import MascotOwl from '../components/MascotOwl';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function WelcomePage() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function anonymousStart() {
    try {
      setLoading(true);
      setError('');
      const session = await api.createAnonymousSession();
      setSession(session.token, session.user);
      navigate('/language');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível iniciar o teste.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="safe-page relative overflow-hidden px-3.5 sm:px-6">
      <div className="app-shell relative">
        <BrandHeader subtitle="Idiomas • A1 a C2" />

        <section className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-8">
          <div>
            <div className="category-pill text-[10px] sm:text-xs">
              <BookOpen size={14}/> Teste de nivelamento
            </div>

            <h1 className="hero-title mt-4 max-w-2xl text-[3.15rem] sm:mt-5 sm:text-[4.6rem] lg:text-[5.3rem]">
              <span className="hero-pink">Descubra seu</span>
              <br/>
              <span className="hero-pink">próximo </span>
              <span className="hero-teal">nível</span>
            </h1>

            <p className="mt-4 max-w-xl text-[14px] leading-6 text-[#7656a7] sm:mt-5 sm:text-lg sm:leading-8">
              Uma avaliação rápida, leve e completa para descobrir seu nível e orientar seus próximos passos.
            </p>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
              {[
                { Icon: ShieldCheck, title: 'Resultado na hora', desc: 'Seu nível ao finalizar.' },
                { Icon: Headphones, title: 'Listening', desc: 'Ouça no seu ritmo.' },
                { Icon: BookOpen, title: 'A1 até C2', desc: 'Avaliação completa.' },
              ].map(({ Icon, title, desc }) => (
                <div key={title} className="soft-card flex items-center gap-3 rounded-[1.2rem] p-3 sm:block sm:p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff0f4] text-[#ff2d5f]">
                    <Icon size={18}/>
                  </span>
                  <div className="min-w-0 sm:mt-3">
                    <div className="text-sm font-black text-[#2b0d71]">{title}</div>
                    <div className="mt-0.5 text-[11px] leading-4 text-[#7656a7] sm:text-xs">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[360px]">
            <div className="paper-card relative overflow-hidden rounded-[1.7rem] px-4 pt-3 sm:bg-transparent sm:p-0 sm:shadow-none sm:backdrop-blur-none">
              <div className="hand-note absolute right-4 top-3 z-10 text-base sm:right-2 sm:top-1 sm:text-2xl">Vamos descobrir juntos? ♡</div>
              <MascotOwl className="animate-float mx-auto h-[210px] w-[210px] sm:h-[390px] sm:w-[390px]" />
              <div className="absolute inset-x-8 bottom-3 h-10 rounded-full bg-[#5d238e]/8 blur-2xl sm:bottom-0" />
            </div>
          </div>
        </section>

        <section className="mt-4 grid gap-2.5 sm:mt-5 sm:grid-cols-2 sm:gap-3">
          <button
            onClick={anonymousStart}
            disabled={loading}
            className="primary-cta flex min-h-14 items-center justify-center gap-3 rounded-2xl px-5 py-4 text-base font-black disabled:opacity-50 sm:text-lg"
          >
            {loading ? 'Preparando...' : 'Começar avaliação'} <ArrowRight size={21}/>
          </button>

          <button
            onClick={() => navigate('/login')}
            className="secondary-cta flex min-h-14 items-center justify-center gap-3 rounded-2xl px-5 py-4 text-base font-black sm:text-lg"
          >
            <LogIn size={20}/> Entrar na conta
          </button>
        </section>

        {error && <p className="mt-3 rounded-xl bg-[#fff0f4] px-3 py-2 text-sm font-bold text-[#c81f49]">{error}</p>}

        <button
          type="button"
          onClick={() => navigate('/professor')}
          className="secondary-cta mt-3.5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black"
        >
          <School size={18}/> Área exclusiva do professor
        </button>

        <section className="mint-card relative mt-5 overflow-hidden rounded-[1.6rem] p-4 sm:mt-6 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex gap-2">
              <span className="rounded-2xl bg-[#ffe4eb] px-3.5 py-4 font-black text-[#ff2d5f]">A1</span>
              <span className="rounded-2xl border border-[#8fd8cb] bg-white px-3.5 py-4 font-black text-[#08786f]">B1</span>
              <span className="rounded-2xl bg-[#efe4ff] px-3.5 py-4 font-black text-[#6c2cb0]">C2</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-[#f6a000]"/>
                <h2 className="text-lg font-black text-[#2b0d71] sm:text-xl">Seu próximo passo começa aqui.</h2>
              </div>
              <p className="mt-1 text-xs leading-5 text-[#7656a7] sm:text-sm sm:leading-6">
                Mais conhecimento, mais possibilidades e um acompanhamento pensado para sua evolução.
              </p>
            </div>
          </div>
          <div className="rainbow-corner"/>
        </section>

        <div className="my-6 flex items-center justify-center gap-3 text-sm text-[#4d2588] sm:my-7">
          <span className="h-px w-14 bg-[#d9cff0] sm:w-20"/>
          <span className="hand-note">Aprender te leva mais longe ♡</span>
          <span className="h-px w-14 bg-[#d9cff0] sm:w-20"/>
        </div>
      </div>
    </main>
  );
}
