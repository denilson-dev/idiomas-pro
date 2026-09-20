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
    <main className="safe-page relative overflow-hidden px-3.5 sm:px-6">
      <div className="app-shell relative">
        <BrandHeader subtitle="Idiomas • Espanhol" />

        <div className="mt-3 flex items-center justify-between gap-3">
          <button
            onClick={() => navigate('/language')}
            className="secondary-cta grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
            aria-label="Voltar"
          >
            <ArrowLeft size={20}/>
          </button>

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-black text-[#2b0d71] sm:text-xs">
              <span>Passo 2 de 3</span>
              <span className="font-bold text-[#7656a7]">Seus dados</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
              <span className="h-1.5 rounded-full bg-[#ff2d5f] sm:h-2"/>
              <span className="h-1.5 rounded-full bg-[#ff2d5f] sm:h-2"/>
              <span className="h-1.5 rounded-full bg-[#e7def4] sm:h-2"/>
            </div>
          </div>
        </div>

        <section className="mt-3.5 grid grid-cols-[1fr_116px] items-center gap-2 sm:mt-5 sm:grid-cols-[1.05fr_.95fr] sm:gap-4">
          <div>
            <div className="category-pill text-[10px] sm:text-xs"><UserRound size={14}/> Identificação</div>
            <h1 className="hero-title mt-3.5 text-[2.65rem] sm:mt-5 sm:text-[4.5rem]">
              <span className="hero-pink">Conte um pouco</span><br/>
              <span className="hero-teal">sobre você</span>
            </h1>
            <p className="mt-2.5 max-w-xl text-[12px] leading-5 text-[#7656a7] sm:mt-4 sm:text-lg sm:leading-7">
              Seu resultado será identificado e vinculado ao professor responsável.
            </p>
          </div>

          <div className="relative mx-auto">
            <div className="hand-note absolute -right-1 -top-1 z-10 hidden text-base sm:block">Quase lá! ♡</div>
            <MascotOwl className="h-[112px] w-[112px] sm:h-[280px] sm:w-[280px]" />
          </div>
        </section>

        <form onSubmit={submit} className="paper-card mt-3.5 rounded-[1.55rem] p-3.5 sm:mt-4 sm:p-6">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-black text-[#2b0d71] sm:mb-2 sm:text-sm">Seu nome</span>
            <div className="form-control-shell flex min-h-13 items-center gap-3 rounded-[1.05rem] px-3.5 sm:min-h-14 sm:rounded-2xl sm:px-4">
              <UserRound size={19} className="shrink-0 text-[#4c2187]"/>
              <input
                required
                autoComplete="name"
                enterKeyHint="next"
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                placeholder="Digite seu nome completo"
                className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#2b0d71] outline-none placeholder:text-[#a08fbf]"
              />
            </div>
          </label>

          <label className="mt-3.5 block sm:mt-4">
            <span className="mb-1.5 block text-[13px] font-black text-[#2b0d71] sm:mb-2 sm:text-sm">
              E-mail <span className="font-semibold text-[#8d78b7]">(opcional)</span>
            </span>
            <div className="form-control-shell flex min-h-13 items-center gap-3 rounded-[1.05rem] px-3.5 sm:min-h-14 sm:rounded-2xl sm:px-4">
              <Mail size={19} className="shrink-0 text-[#4c2187]"/>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                enterKeyHint="next"
                value={studentEmail}
                onChange={(event) => setStudentEmail(event.target.value)}
                placeholder="seuemail@exemplo.com"
                className="min-w-0 flex-1 bg-transparent py-3 text-base text-[#2b0d71] outline-none placeholder:text-[#a08fbf]"
              />
            </div>
          </label>

          <label className="mt-3.5 block sm:mt-4">
            <span className="mb-1.5 flex items-center gap-2 text-[13px] font-black text-[#2b0d71] sm:mb-2 sm:text-sm">
              <UsersRound size={16}/> Nome do professor <span className="text-[#ff2d5f]">*</span>
            </span>
            <div className="form-control-shell rounded-[1.05rem] sm:rounded-2xl">
              <select
                required
                value={teacherId}
                onChange={(event) => setTeacherId(event.target.value)}
                disabled={loadingTeachers || teachers.length === 0}
                className="min-h-13 w-full appearance-none rounded-[1.05rem] bg-transparent px-3.5 text-base font-bold text-[#2b0d71] outline-none disabled:opacity-60 sm:min-h-14 sm:rounded-2xl sm:px-4"
              >
                <option value="">{loadingTeachers ? 'Carregando professores...' : 'Selecione seu professor'}</option>
                {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
              </select>
            </div>
          </label>

          {teachers.length === 0 && !loadingTeachers && (
            <div className="mt-3.5 rounded-xl border border-[#f5ccd7] bg-[#fff5f8] p-3 text-xs leading-5 text-[#9f3152] sm:mt-4 sm:rounded-2xl sm:p-4 sm:text-sm">
              A escola ainda não cadastrou um professor. O primeiro acesso pode ser criado na{' '}
              <button type="button" onClick={() => navigate('/professor')} className="font-black underline">Área do professor</button>.
            </div>
          )}

          <div className="mt-3.5 flex items-start gap-3 rounded-xl bg-[#f5f1ff] p-3 text-xs leading-5 text-[#7656a7] sm:mt-4 sm:rounded-2xl sm:p-4 sm:text-sm">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#3d1680]" size={18}/>
            <span>Seu resultado ficará vinculado ao professor selecionado para acompanhamento pedagógico.</span>
          </div>

          {error && <p className="mt-3.5 rounded-xl bg-[#fff0f4] px-3 py-2 text-xs font-bold text-[#c81f49] sm:mt-4 sm:text-sm">{error}</p>}

          <button
            disabled={loadingTeachers || teachers.length === 0}
            className="primary-cta mt-4 flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl px-4 text-base font-black disabled:cursor-not-allowed disabled:opacity-45 sm:mt-5 sm:text-lg"
          >
            Começar teste <ArrowRight size={21}/>
          </button>
        </form>

        <section className="mint-card mt-4 rounded-[1.5rem] p-4 sm:mt-5 sm:rounded-[1.8rem] sm:p-5">
          <h2 className="text-base font-black text-[#2b0d71] sm:text-xl">Você vai avaliar:</h2>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4">
            {[
              { Icon: BookOpen, label: 'Gramática', className: 'bg-[#fff0f4] text-[#ff2d5f]' },
              { Icon: UserRound, label: 'Vocabulário', className: 'bg-[#e9faf6] text-[#008f81]' },
              { Icon: Headphones, label: 'Listening', className: 'bg-[#f1e9ff] text-[#6c2db7]' },
            ].map(({ Icon, label, className }) => (
              <div key={label} className="rounded-xl bg-white/90 p-2.5 text-center sm:rounded-2xl sm:p-3">
                <span className={`mx-auto grid h-9 w-9 place-items-center rounded-full sm:h-11 sm:w-11 ${className}`}><Icon size={18}/></span>
                <div className="mt-1.5 text-[10px] font-black text-[#2b0d71] sm:mt-2 sm:text-sm">{label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
