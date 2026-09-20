import { useState } from 'react';
import { ArrowRight, BookOpen, Headphones, LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function WelcomePage() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const session = mode === 'login'
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);
      setSession(session.token, session.user);
      navigate('/language');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na autenticação.');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setMode('login');
    setError('');
    setForm((current) => ({
      ...current,
      email: 'aluno@idiomaspro.com',
      password: 'Teste123!',
    }));
  }

  const features = [
    { icon: BookOpen, title: 'A1 → C2', subtitle: 'Dificuldade mista' },
    { icon: Headphones, title: 'Listening', subtitle: 'Áudios reais' },
    { icon: ShieldCheck, title: 'Resultado', subtitle: 'Histórico salvo' },
  ];

  return (
    <main className="safe-page relative overflow-hidden bg-[#06111f] text-white">
      <div className="pointer-events-none absolute -left-32 top-8 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/15 blur-3xl animate-pulse-glow" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:min-h-[calc(100dvh-2rem)] lg:grid-cols-[1.12fr_.88fr] lg:grid-rows-[auto_auto] lg:items-center lg:gap-x-12 lg:px-10">
        <section className="pt-1 lg:col-start-1 lg:row-start-1 lg:pt-0">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-cyan-100 backdrop-blur-xl sm:text-sm">
            <Sparkles size={15} /> Avaliação inteligente · CEFR A1–C2
          </div>

          <h1 className="max-w-3xl text-[clamp(2.65rem,12vw,4.6rem)] font-black leading-[.98] tracking-[-0.045em]">
            Descubra seu nível de{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
              espanhol
            </span>{' '}
            com precisão.
          </h1>

          <p className="mt-4 max-w-2xl text-[15px] leading-6 text-slate-300 sm:mt-6 sm:text-lg sm:leading-8">
            Gramática, vocabulário e compreensão auditiva em uma experiência rápida para estimar seu nível no padrão CEFR.
          </p>
        </section>

        <section className="glass-panel rounded-[1.75rem] p-4 sm:p-6 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:p-7">
          <div className="mb-4 flex items-center justify-between gap-4 sm:mb-6">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-300 sm:text-xs">Idiomas Pro</div>
              <h2 className="mt-1 text-xl font-black leading-tight sm:text-2xl">Seu nivelamento começa aqui</h2>
            </div>
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 text-sm font-black text-slate-950 sm:h-12 sm:w-12">IP</div>
          </div>

          <button
            type="button"
            onClick={anonymousStart}
            disabled={loading}
            className="touch-no-hover flex min-h-13 w-full items-center justify-between rounded-2xl bg-white px-4 py-3.5 font-bold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:py-4"
          >
            <span>Fazer teste como visitante</span>
            <ArrowRight size={19} />
          </button>

          <div className="my-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:my-6 sm:text-xs">
            <div className="h-px flex-1 bg-white/10" />
            <span>ou entre na sua conta</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mb-3 grid grid-cols-2 rounded-xl bg-black/20 p-1">
            {(['login', 'register'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMode(item);
                  setError('');
                }}
                className={`min-h-10 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  mode === item ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={submitAuth} className="space-y-2.5">
            {mode === 'register' && (
              <label className="block">
                <span className="sr-only">Seu nome</span>
                <input
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Seu nome"
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
                />
              </label>
            )}

            <label className="block">
              <span className="sr-only">E-mail</span>
              <input
                required
                type="email"
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="E-mail"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
              />
            </label>

            <label className="block">
              <span className="sr-only">Senha</span>
              <input
                required
                minLength={6}
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Senha"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
              />
            </label>

            <div aria-live="polite">
              {error && (
                <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2.5 text-sm leading-5 text-rose-200">
                  {error}
                </p>
              )}
            </div>

            <button
              disabled={loading}
              className="touch-no-hover flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-3 font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogIn size={18} />
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar e continuar' : 'Criar conta'}
            </button>
          </form>

          <button
            type="button"
            onClick={fillDemo}
            className="mt-3 w-full rounded-xl px-2 py-2 text-center text-[11px] leading-4 text-slate-500 transition hover:bg-white/[0.035] hover:text-slate-300 sm:mt-4 sm:text-xs"
          >
            Usar conta demo · aluno@idiomaspro.com · Teste123!
          </button>
        </section>

        <section className="grid grid-cols-3 gap-2 pb-1 sm:gap-3 lg:col-start-1 lg:row-start-2 lg:max-w-2xl lg:self-start lg:pt-2">
          {features.map(({ icon: Icon, title, subtitle }) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.045] p-3 backdrop-blur-xl sm:p-4"
            >
              <Icon className="mb-3 text-cyan-300" size={19} />
              <div className="text-[13px] font-bold sm:text-base">{title}</div>
              <div className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">{subtitle}</div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
