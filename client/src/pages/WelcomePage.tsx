import { useState } from 'react';
import { ArrowRight, BookOpen, Headphones, LogIn, PlayCircle, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import MascotOwl from '../components/MascotOwl';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function WelcomePage() {
  const navigate = useNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function anonymousStart() {
    try {
      setLoading(true); setError('');
      const session = await api.createAnonymousSession();
      setSession(session.token, session.user);
      navigate('/language');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível iniciar o teste.');
    } finally { setLoading(false); }
  }

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    try {
      setLoading(true); setError('');
      const session = mode === 'login'
        ? await api.login({ email: form.email, password: form.password })
        : await api.register(form);
      setSession(session.token, session.user);
      navigate('/language');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha na autenticação.');
    } finally { setLoading(false); }
  }

  return (
    <main className="safe-page relative overflow-hidden px-4 sm:px-6">
      <div className="app-shell relative">
        <BrandHeader subtitle="Idiomas • A1 a C2" />

        <section className="mt-5 grid items-center gap-3 lg:grid-cols-[1.05fr_.95fr] lg:gap-8">
          <div>
            <div className="category-pill text-[10px] sm:text-xs"><BookOpen size={15}/> Teste de nivelamento</div>
            <h1 className="hero-title mt-5 max-w-2xl text-[3.3rem] sm:text-[4.6rem] lg:text-[5.3rem]">
              <span className="hero-pink">Descubra seu próximo</span><br/>
              <span className="hero-teal">nível</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-6 text-[#7656a7] sm:text-lg sm:leading-8">
              Avalie seus conhecimentos de gramática, vocabulário e compreensão auditiva e descubra a etapa ideal para continuar aprendendo com confiança.
            </p>

            <div className="mt-6 space-y-3">
              {[
                [ShieldCheck,'Resultado na hora','Saiba seu nível imediatamente.'],
                [Headphones,'Listening profissional','Ouça e responda no seu ritmo.'],
                [BookOpen,'Do A1 ao C2','Avaliação completa para todos os níveis.'],
              ].map(([Icon,title,desc]) => {
                const I = Icon as typeof ShieldCheck;
                return <div key={title as string} className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#fff0f4]"><I size={20} className="text-[#ff2d5f]"/></span>
                  <div><div className="font-black text-[#2b0d71]">{title}</div><div className="text-sm text-[#7656a7]">{desc}</div></div>
                </div>
              })}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[470px]">
            <div className="hand-note absolute right-2 top-1 z-10 text-xl sm:text-2xl">Vamos descobrir juntos? ♡</div>
            <MascotOwl className="animate-float mx-auto h-[320px] w-[320px] sm:h-[420px] sm:w-[420px]" />
          </div>
        </section>

        {!showAuth ? (
          <section className="mt-3 grid gap-3 sm:grid-cols-2">
            <button onClick={anonymousStart} disabled={loading} className="primary-cta flex min-h-14 items-center justify-center gap-3 rounded-2xl px-5 py-4 text-lg font-black disabled:opacity-50">
              {loading ? 'Preparando...' : 'Começar avaliação'} <ArrowRight size={22}/>
            </button>
            <button onClick={() => setShowAuth(true)} className="secondary-cta flex min-h-14 items-center justify-center gap-3 rounded-2xl px-5 py-4 text-lg font-black">
              <LogIn size={21}/> Entrar na conta
            </button>
          </section>
        ) : (
          <section className="paper-card mt-5 rounded-[1.8rem] p-4 sm:p-6">
            <div className="mb-4 grid grid-cols-2 rounded-2xl bg-[#f6f0ff] p-1">
              {(['login','register'] as const).map(item => <button key={item} onClick={() => setMode(item)} className={`rounded-xl px-3 py-3 text-sm font-black ${mode===item?'bg-white text-[#2b0d71] shadow-sm':'text-[#8d78b7]'}`}>{item==='login'?'Entrar':'Criar conta'}</button>)}
            </div>
            <form onSubmit={submitAuth} className="space-y-3">
              {mode==='register' && <input required placeholder="Seu nome" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="min-h-12 w-full rounded-2xl border border-[#ddd2ef] bg-white px-4 text-[#2b0d71] outline-none"/>}
              <input required type="email" placeholder="E-mail" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="min-h-12 w-full rounded-2xl border border-[#ddd2ef] bg-white px-4 text-[#2b0d71] outline-none"/>
              <input required minLength={6} type="password" placeholder="Senha" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="min-h-12 w-full rounded-2xl border border-[#ddd2ef] bg-white px-4 text-[#2b0d71] outline-none"/>
              {error && <p className="rounded-xl bg-[#fff0f4] px-3 py-2 text-sm text-[#c81f49]">{error}</p>}
              <button disabled={loading} className="primary-cta flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl font-black"><LogIn size={18}/>{loading?'Aguarde...':mode==='login'?'Entrar e continuar':'Criar conta'}</button>
            </form>
            <button type="button" onClick={() => setForm({name:'',email:'aluno@idiomaspro.com',password:'Teste123!'})} className="mt-3 w-full text-center text-xs font-bold text-[#7656a7]">Usar conta de demonstração</button>
          </section>
        )}

        <section className="mint-card relative mt-6 overflow-hidden rounded-[1.8rem] p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex gap-2"><span className="rounded-2xl bg-[#ffe4eb] px-4 py-5 font-black text-[#ff2d5f]">A1</span><span className="rounded-2xl border-2 border-[#008f81] bg-white px-4 py-5 font-black text-[#08786f]">B1</span><span className="rounded-2xl bg-[#efe4ff] px-4 py-5 font-black text-[#6c2cb0]">C2</span></div>
            <div><h2 className="text-xl font-black text-[#2b0d71]">Do seu jeito. Para o seu próximo passo.</h2><p className="mt-1 text-sm leading-6 text-[#7656a7]">Mais conhecimento, mais oportunidades. Um você cada vez mais no topo!</p></div>
          </div>
          <div className="rainbow-corner"/>
        </section>

        <div className="my-7 flex items-center justify-center gap-3 text-sm text-[#4d2588]"><span className="h-px w-20 bg-[#d9cff0]"/><span className="hand-note">Aprender te leva mais longe ♡</span><span className="h-px w-20 bg-[#d9cff0]"/></div>
      </div>
    </main>
  );
}
