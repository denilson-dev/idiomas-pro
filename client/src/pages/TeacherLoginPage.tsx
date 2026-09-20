import { ArrowLeft, ArrowRight, LockKeyhole, Mail, School, UserRound } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import MascotOwl from '../components/MascotOwl';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function TeacherLoginPage() {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const setTeacherSession = useAppStore((state) => state.setTeacherSession);
  const navigate = useNavigate();

  const [canCreate, setCanCreate] = useState(false);
  const [mode, setMode] = useState<'login' | 'bootstrap'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTeacherBootstrapStatus()
      .then(({ canCreateFirstTeacher }) => {
        setCanCreate(canCreateFirstTeacher);
        if (canCreateFirstTeacher) setMode('bootstrap');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível verificar o acesso da escola.'))
      .finally(() => setChecking(false));
  }, []);

  if (teacherToken) return <Navigate to="/professor/painel" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const session = mode === 'bootstrap'
        ? await api.bootstrapTeacher(form)
        : await api.teacherLogin({ email: form.email, password: form.password });

      setTeacherSession(session.token, session.teacher);
      navigate('/professor/painel');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="safe-page relative overflow-hidden px-4 sm:px-6">
      <div className="app-shell relative max-w-4xl">
        <BrandHeader subtitle="Portal pedagógico" />

        <button onClick={() => navigate('/')} className="secondary-cta mt-4 grid h-11 w-11 place-items-center rounded-2xl" aria-label="Voltar">
          <ArrowLeft size={20} />
        </button>

        <section className="mt-4 grid items-center gap-4 lg:grid-cols-[1fr_.85fr]">
          <div>
            <div className="category-pill text-[10px] sm:text-xs"><School size={15}/> Área do professor</div>
            <h1 className="hero-title mt-5 text-[3rem] sm:text-[4.6rem]">
              <span className="text-[#2b0d71]">{canCreate ? 'Crie o acesso' : 'Acompanhe seus'}</span><br/>
              <span className="hero-pink">{canCreate ? 'da escola' : 'alunos'}</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-6 text-[#7656a7] sm:text-lg">
              {canCreate
                ? 'Este primeiro cadastro cria o acesso pedagógico inicial. Depois disso, a criação pública é bloqueada.'
                : 'Veja resultados, níveis, desempenho por habilidade e histórico dos alunos vinculados a você.'}
            </p>
          </div>
          <div className="relative mx-auto max-w-[300px]">
            <div className="hand-note absolute right-0 top-0 z-10 text-lg">Educação que transforma! ♡</div>
            <MascotOwl variant="study" className="h-[280px] w-[280px]" />
          </div>
        </section>

        <form onSubmit={submit} className="paper-card mt-5 rounded-[1.8rem] p-4 sm:p-6">
          {canCreate && (
            <div className="mb-4 grid grid-cols-2 rounded-2xl bg-[#f6f0ff] p-1">
              <button type="button" onClick={() => setMode('bootstrap')} className={`rounded-xl px-3 py-3 text-sm font-black ${mode === 'bootstrap' ? 'bg-white text-[#2b0d71] shadow-sm' : 'text-[#8d78b7]'}`}>Primeiro acesso</button>
              <button type="button" onClick={() => setMode('login')} className={`rounded-xl px-3 py-3 text-sm font-black ${mode === 'login' ? 'bg-white text-[#2b0d71] shadow-sm' : 'text-[#8d78b7]'}`}>Já tenho acesso</button>
            </div>
          )}

          {mode === 'bootstrap' && (
            <label className="block">
              <span className="mb-2 block text-sm font-black text-[#2b0d71]">Nome do professor</span>
              <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#ddd2ef] bg-white px-4">
                <UserRound size={20} className="text-[#4c2187]" />
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex.: Prof. Ana" className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#2b0d71] outline-none" />
              </div>
            </label>
          )}

          <label className={mode === 'bootstrap' ? 'mt-4 block' : 'block'}>
            <span className="mb-2 block text-sm font-black text-[#2b0d71]">E-mail</span>
            <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#ddd2ef] bg-white px-4">
              <Mail size={20} className="text-[#4c2187]" />
              <input required type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="professor@escola.com" className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#2b0d71] outline-none" />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-black text-[#2b0d71]">Senha</span>
            <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#ddd2ef] bg-white px-4">
              <LockKeyhole size={20} className="text-[#4c2187]" />
              <input required minLength={6} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Sua senha" className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#2b0d71] outline-none" />
            </div>
          </label>

          {error && <p className="mt-4 rounded-xl bg-[#fff0f4] px-3 py-2 text-sm font-bold text-[#c81f49]">{error}</p>}

          <button disabled={loading || checking} className="primary-cta mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl text-lg font-black disabled:opacity-50">
            {loading ? 'Aguarde...' : mode === 'bootstrap' ? 'Criar acesso pedagógico' : 'Entrar no painel'} <ArrowRight size={21}/>
          </button>
        </form>
      </div>
    </main>
  );
}
