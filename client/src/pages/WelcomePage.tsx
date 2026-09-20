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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#06111f] text-white">
      <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-cyan-500/15 blur-3xl animate-pulse-glow" />
      <div className="absolute -right-24 bottom-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/15 blur-3xl animate-pulse-glow" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 py-10 lg:grid-cols-[1.15fr_.85fr] lg:px-10">
        <section>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-100 backdrop-blur-xl">
            <Sparkles size={16} /> Avaliação inteligente · CEFR A1–C2
          </div>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
            Descubra seu nível de <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">espanhol</span> com precisão.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Um teste dinâmico que combina gramática, vocabulário e compreensão auditiva para indicar seu nível no padrão europeu CEFR.
          </p>

          <div className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
              <BookOpen className="mb-4 text-cyan-300" size={22} />
              <div className="font-bold">A1 → C2</div>
              <div className="mt-1 text-xs text-slate-400">Dificuldade mista</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
              <Headphones className="mb-4 text-cyan-300" size={22} />
              <div className="font-bold">Listening</div>
              <div className="mt-1 text-xs text-slate-400">Áudios reais</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 backdrop-blur-xl">
              <ShieldCheck className="mb-4 text-cyan-300" size={22} />
              <div className="font-bold">Resultado</div>
              <div className="mt-1 text-xs text-slate-400">Histórico salvo</div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.065] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Idiomas Pro</div>
              <h2 className="mt-1 text-2xl font-bold">Seu nivelamento começa aqui</h2>
            </div>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-violet-500 font-black text-slate-950">IP</div>
          </div>

          <button
            type="button"
            onClick={anonymousStart}
            disabled={loading}
            className="flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 font-bold text-slate-950 transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            Fazer teste como visitante <ArrowRight size={19} />
          </button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-slate-500">
            <div className="h-px flex-1 bg-white/10" /> ou entre na sua conta <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mb-4 grid grid-cols-2 rounded-xl bg-black/20 p-1">
            {(['login', 'register'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${mode === item ? 'bg-white/10 text-white' : 'text-slate-400'}`}
              >
                {item === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <form onSubmit={submitAuth} className="space-y-3">
            {mode === 'register' && (
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Seu nome"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
              />
            )}
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="E-mail"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
            />
            <input
              required
              minLength={6}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Senha"
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-cyan-300/50"
            />
            {error && <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
            <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-3 font-black text-slate-950 transition hover:brightness-110 disabled:opacity-50">
              <LogIn size={18} /> {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar e continuar' : 'Criar conta'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            Demo: aluno@idiomaspro.com · Senha: Teste123!
          </p>
        </section>
      </div>
    </main>
  );
}
