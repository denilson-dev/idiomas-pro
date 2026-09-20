import { ArrowLeft, ArrowRight, BookOpen, Headphones, Mail, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import MascotOwl from '../components/MascotOwl';
import { api, type TeacherOption } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function StudentSetupPage() {
  const token = useAppStore((state) => state.token);
  const user = useAppStore((state) => state.user);
  const setTestProfile = useAppStore((state) => state.setTestProfile);
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [studentName, setStudentName] = useState(user?.name ?? '');
  const [studentEmail, setStudentEmail] = useState(user?.email ?? '');
  const [teacherId, setTeacherId] = useState('');
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTeachers()
      .then(({ teachers }) => setTeachers(teachers))
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar os professores.'))
      .finally(() => setLoadingTeachers(false));
  }, []);

  const selectedTeacher = useMemo(
    () => teachers.find((teacher) => teacher.id === teacherId) ?? null,
    [teachers, teacherId],
  );

  if (!token) return <Navigate to="/" replace />;

  function submit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (studentName.trim().length < 2) {
      setError('Informe seu nome para continuar.');
      return;
    }

    if (!selectedTeacher) {
      setError('Selecione o professor responsável pelo seu teste.');
      return;
    }

    setTestProfile({
      count: 18,
      studentName: studentName.trim(),
      studentEmail: studentEmail.trim(),
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      language: 'ES',
    });

    navigate('/test');
  }

  return (
    <main className="safe-page relative overflow-hidden px-4 sm:px-6">
      <div className="app-shell relative">
        <BrandHeader subtitle="Idiomas • Espanhol" />

        <div className="mt-4 flex items-center justify-between gap-4">
          <button onClick={() => navigate('/language')} className="secondary-cta grid h-11 w-11 place-items-center rounded-2xl" aria-label="Voltar">
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between text-xs font-black text-[#2b0d71]">
              <span>Passo 1 de 3</span>
              <span className="font-bold text-[#7656a7]">Seus dados</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="h-2 rounded-full bg-[#ff2d5f]" />
              <span className="h-2 rounded-full bg-[#e7def4]" />
              <span className="h-2 rounded-full bg-[#e7def4]" />
            </div>
          </div>
        </div>

        <section className="mt-5 grid items-center gap-3 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="category-pill text-[10px] sm:text-xs"><UserRound size={15}/> Personalize sua avaliação</div>
            <h1 className="hero-title mt-5 text-[3rem] sm:text-[4.5rem]">
              <span className="hero-pink">Qual é o</span><br/>
              <span className="hero-teal">seu nome?</span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-6 text-[#7656a7] sm:text-lg">
              Vamos usar seus dados para identificar o resultado e enviar a avaliação ao professor responsável.
            </p>
          </div>
          <div className="relative mx-auto max-w-[330px]">
            <div className="hand-note absolute right-0 top-0 z-10 text-xl">Quase lá! ♡</div>
            <MascotOwl className="h-[300px] w-[300px]" />
          </div>
        </section>

        <form onSubmit={submit} className="paper-card mt-4 rounded-[1.8rem] p-4 sm:p-6">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-[#2b0d71]">Seu nome</span>
            <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#ddd2ef] bg-white px-4 focus-within:border-[#ff2d5f]">
              <UserRound size={20} className="shrink-0 text-[#4c2187]" />
              <input
                required
                autoComplete="name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Digite seu nome completo"
                className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#2b0d71] outline-none placeholder:text-[#a08fbf]"
              />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-black text-[#2b0d71]">E-mail <span className="font-semibold text-[#8d78b7]">(opcional)</span></span>
            <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-[#ddd2ef] bg-white px-4 focus-within:border-[#ff2d5f]">
              <Mail size={20} className="shrink-0 text-[#4c2187]" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#2b0d71] outline-none placeholder:text-[#a08fbf]"
              />
            </div>
          </label>

          <label className="mt-4 block">
            <span className="mb-2 flex items-center gap-2 text-sm font-black text-[#2b0d71]">
              <UsersRound size={17} /> Nome do professor <span className="text-[#ff2d5f]">*</span>
            </span>
            <select
              required
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              disabled={loadingTeachers || teachers.length === 0}
              className="min-h-14 w-full rounded-2xl border border-[#ddd2ef] bg-white px-4 text-base font-bold text-[#2b0d71] outline-none focus:border-[#ff2d5f] disabled:opacity-60"
            >
              <option value="">{loadingTeachers ? 'Carregando professores...' : 'Selecione seu professor'}</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
            </select>
          </label>

          {teachers.length === 0 && !loadingTeachers && (
            <div className="mt-4 rounded-2xl border border-[#f5ccd7] bg-[#fff5f8] p-4 text-sm leading-5 text-[#9f3152]">
              A escola ainda não cadastrou um professor. O primeiro acesso pode ser criado na <button type="button" onClick={() => navigate('/professor')} className="font-black underline">Área do professor</button>.
            </div>
          )}

          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#f5f1ff] p-4 text-sm leading-5 text-[#7656a7]">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#3d1680]" size={20} />
            <span>Seu resultado ficará vinculado ao professor selecionado para acompanhamento pedagógico.</span>
          </div>

          {error && <p className="mt-4 rounded-xl bg-[#fff0f4] px-3 py-2 text-sm font-bold text-[#c81f49]">{error}</p>}

          <button
            disabled={loadingTeachers || teachers.length === 0}
            className="primary-cta mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl text-lg font-black disabled:cursor-not-allowed disabled:opacity-45"
          >
            Começar teste <ArrowRight size={22}/>
          </button>
        </form>

        <section className="mint-card mt-5 rounded-[1.8rem] p-5">
          <h2 className="text-xl font-black text-[#2b0d71]">Você vai avaliar suas habilidades em:</h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { Icon: BookOpen, label: 'Gramática', className: 'bg-[#fff0f4] text-[#ff2d5f]' },
              { Icon: UserRound, label: 'Vocabulário', className: 'bg-[#e9faf6] text-[#008f81]' },
              { Icon: Headphones, label: 'Listening', className: 'bg-[#f1e9ff] text-[#6c2db7]' },
            ].map(({ Icon, label, className }) => (
              <div key={label} className="rounded-2xl bg-white p-3 text-center">
                <span className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${className}`}><Icon size={20}/></span>
                <div className="mt-2 text-xs font-black text-[#2b0d71] sm:text-sm">{label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
