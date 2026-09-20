import { ArrowLeft, ArrowRight, LogIn, Mail, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import MascotOwl from '../components/MascotOwl';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function LoginPage() {
  const token = useAppStore((state) => state.token);
  const setSession = useAppStore((state) => state.setSession);
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (token) return <Navigate to="/language" replace />;

  async function submit(event: FormEvent) {
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
      setError(err instanceof Error ? err.message : 'Não foi possível continuar.');
    } finally {
      setLoading(false);
    }
  }

  async function visitor() {
    try {
      setLoading(true);
      setError('');
      const session = await api.createAnonymousSession();
      setSession(session.token, session.user);
      navigate('/language');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível iniciar como visitante.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="safe-page relative overflow-hidden px-4 sm:px-6">
      <div className="app-shell relative max-w-4xl">
        <BrandHeader subtitle="Idiomas para o seu futuro" />

        <button onClick={() => navigate('/')} className="secondary-cta mt-4 grid h-11 w-11 place-items-center rounded-2xl" aria-label="Voltar">
          <ArrowLeft size={20}/>
        </button>

        <section className="mt-4 grid items-center gap-4 lg:grid-cols-[1fr_.85fr]">
          <div>
            <h1 className="hero-title text-[3rem] sm:text-[4.7rem]">
              <span className="text-[#2b0d71]">Que bom</span><br/>
              <span className="hero-pink">ter você aqui!</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-6 text-[#7656a7] sm:text-lg">
              Entre na sua conta ou continue como visitante para descobrir seu próximo nível.
            </p>
            <p className="hand-note mt-4 text-xl">Juntos vamos mais longe! ♡</p>
          </div>
          <div className="relative mx-auto max-w-[310px]">
            <div className="hand-note absolute right-0 top-0 z-10 text-lg">Aprender abre um mundo novo! ♡</div>
            <MascotOwl className="h-[290px] w-[290px]" />
          </div>
        </section>

        <section className="paper-card mt-5 rounded-[1.8rem] p-4 sm:p-6">
          <div className="mb-5 grid grid-cols-2 rounded-2xl bg-[#f6f0ff] p-1">
            <button type="button" onClick={() => setMode('login')} className={`rounded-xl px-3 py-3 font-black ${mode === 'login' ? 'bg-white text-[#2b0d71] shadow-sm' : 'text-[#8d78b7]'}`}>Entrar</button>
            <button type="button" onClick={() => setMode('register')} className={`rounded-xl px-3 py-3 font-black ${mode === 'register' ? 'bg-white text-[#2b0d71] shadow-sm' : 'text-[#8d78b7]'}`}>Criar conta</button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'register' && (
              <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#ddd2ef] bg-white px-4">
                <UserRound size={20} className="text-[#4c2187]" />
                <input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Seu nome" className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#2b0d71] outline-none" />
              </label>
            )}
            <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#ddd2ef] bg-white px-4">
              <Mail size={20} className="text-[#4c2187]" />
              <input required type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="seuemail@exemplo.com" className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#2b0d71] outline-none" />
            </label>
            <label className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#ddd2ef] bg-white px-4">
              <LogIn size={20} className="text-[#4c2187]" />
              <input required minLength={6} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Sua senha" className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#2b0d71] outline-none" />
            </label>

            {error && <p className="rounded-xl bg-[#fff0f4] px-3 py-2 text-sm font-bold text-[#c81f49]">{error}</p>}

            <button disabled={loading} className="primary-cta flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl text-lg font-black disabled:opacity-50">
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar na conta' : 'Criar minha conta'} <ArrowRight size={21}/>
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-xs font-bold text-[#9b89bb]"><span className="h-px flex-1 bg-[#e3daf1]"/><span>ou</span><span className="h-px flex-1 bg-[#e3daf1]"/></div>

          <button type="button" onClick={visitor} disabled={loading} className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-[#bdebe2] bg-[#effbf8] text-lg font-black text-[#008f81] disabled:opacity-50">
            <UserRound size={21}/> Entrar como visitante
          </button>
        </section>
      </div>
    </main>
  );
}
