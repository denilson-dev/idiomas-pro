import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  KeyRound,
  Pencil,
  Plus,
  Power,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import {
  api,
  type AdminAccounts,
  type AdminTeacher,
  type AdminUser,
} from '../services/api';
import { useAppStore } from '../store/useAppStore';

type Tab = 'students' | 'teachers';
type AccountKind = 'student' | 'teacher';

type AccountForm = {
  kind: AccountKind;
  id: string | null;
  role?: 'TEACHER' | 'ADMIN';
  name: string;
  email: string;
  password: string;
  isActive: boolean;
};

const emptyForm = (kind: AccountKind): AccountForm => ({
  kind,
  id: null,
  name: '',
  email: '',
  password: '',
  isActive: true,
});

export default function TeacherAdminPage() {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const teacher = useAppStore((state) => state.teacher);
  const navigate = useNavigate();

  const [data, setData] = useState<AdminAccounts | null>(null);
  const [tab, setTab] = useState<Tab>('students');
  const [query, setQuery] = useState('');
  const [form, setForm] = useState<AccountForm | null>(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!teacherToken) return;

    try {
      setError('');
      setData(await api.getAdminAccounts(teacherToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar a administração.');
    }
  }, [teacherToken]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const students = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const items = data?.users ?? [];
    if (!normalized) return items;

    return items.filter((item) =>
      item.name.toLowerCase().includes(normalized) ||
      item.email.toLowerCase().includes(normalized) ||
      (item.isActive ? 'ativo' : 'inativo').includes(normalized)
    );
  }, [data, query]);

  const teachers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const items = data?.teachers ?? [];
    if (!normalized) return items;

    return items.filter((item) =>
      item.name.toLowerCase().includes(normalized) ||
      item.email.toLowerCase().includes(normalized) ||
      item.role.toLowerCase().includes(normalized) ||
      (item.isActive ? 'ativo' : 'inativo').includes(normalized)
    );
  }, [data, query]);

  if (!teacherToken) return <Navigate to="/professor" replace />;
  if (teacher?.role !== 'ADMIN') return <Navigate to="/professor/painel" replace />;

  function openCreate(kind: AccountKind) {
    setError('');
    setForm(emptyForm(kind));
  }

  function openStudent(user: AdminUser) {
    setError('');
    setForm({
      kind: 'student',
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      isActive: user.isActive,
    });
  }

  function openTeacher(item: AdminTeacher) {
    setError('');
    setForm({
      kind: 'teacher',
      id: item.id,
      role: item.role,
      name: item.name,
      email: item.email,
      password: '',
      isActive: item.isActive,
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!teacherToken || !form) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 2 || !email) {
      setError('Preencha nome e e-mail corretamente.');
      return;
    }

    if (!form.id && form.password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    if (form.password && form.password.length < 8) {
      setError('A nova senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (form.kind === 'student') {
        if (form.id) {
          await api.adminUpdateUser(teacherToken, form.id, {
            name,
            email,
            isActive: form.isActive,
            ...(form.password ? { password: form.password } : {}),
          });
          setToast('Aluno atualizado com sucesso.');
        } else {
          await api.adminCreateUser(teacherToken, {
            name,
            email,
            password: form.password,
            isActive: form.isActive,
          });
          setToast('Aluno cadastrado com sucesso.');
        }
      } else if (form.id) {
        await api.adminUpdateTeacher(teacherToken, form.id, {
          name,
          email,
          isActive: form.role === 'ADMIN' ? true : form.isActive,
          ...(form.password ? { password: form.password } : {}),
        });
        setToast('Professor atualizado com sucesso.');
      } else {
        await api.adminCreateTeacher(teacherToken, {
          name,
          email,
          password: form.password,
          isActive: form.isActive,
        });
        setToast('Professor cadastrado com sucesso.');
      }

      setForm(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a conta.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStudent(user: AdminUser) {
    if (!teacherToken) return;

    try {
      setLoading(true);
      await api.adminUpdateUser(teacherToken, user.id, { isActive: !user.isActive });
      setToast(user.isActive ? 'Aluno desativado.' : 'Aluno ativado.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar o status.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleTeacher(item: AdminTeacher) {
    if (!teacherToken || item.role === 'ADMIN') return;

    try {
      setLoading(true);
      await api.adminUpdateTeacher(teacherToken, item.id, { isActive: !item.isActive });
      setToast(item.isActive ? 'Professor desativado.' : 'Professor ativado.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar o status.');
    } finally {
      setLoading(false);
    }
  }

  async function removeStudent(user: AdminUser) {
    if (!teacherToken) return;
    if (!window.confirm(`Excluir definitivamente o aluno "${user.name}"? As sessões serão removidas e as avaliações históricas permanecerão sem vínculo de conta.`)) return;

    try {
      setLoading(true);
      await api.adminDeleteUser(teacherToken, user.id);
      setToast('Aluno excluído.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir o aluno.');
    } finally {
      setLoading(false);
    }
  }

  async function removeTeacher(item: AdminTeacher) {
    if (!teacherToken || item.id === data?.currentAdminId) return;
    if (!window.confirm(`Excluir definitivamente o professor "${item.name}"? As avaliações históricas permanecerão sem vínculo de professor.`)) return;

    try {
      setLoading(true);
      await api.adminDeleteTeacher(teacherToken, item.id);
      setToast('Professor excluído.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir o professor.');
    } finally {
      setLoading(false);
    }
  }

  const summary = data?.summary;

  return (
    <main className="safe-page relative overflow-hidden px-3.5 sm:px-6">
      <div className="app-shell relative pb-12">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <BrandHeader subtitle="Administração" compact />
          </div>
          <button
            type="button"
            onClick={() => navigate('/professor/painel')}
            className="secondary-cta grid h-10 w-10 place-items-center rounded-full sm:h-11 sm:w-11"
            aria-label="Voltar ao painel"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        <section className="mt-5">
          <div className="flex items-center gap-2 text-[#008f81]">
            <ShieldCheck size={20} />
            <span className="text-xs font-black uppercase tracking-[.16em]">Administrador</span>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-[#2b0d71] sm:text-5xl">
            Controle de usuários
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#7656a7] sm:text-base">
            Cadastre, edite, redefina senhas, ative, desative e remova as contas de alunos e professores da plataforma.
          </p>
        </section>

        <section className="mt-5 grid grid-cols-2 gap-2.5 lg:grid-cols-5">
          <SummaryCard label="Alunos" value={summary?.students ?? 0} />
          <SummaryCard label="Alunos ativos" value={summary?.activeStudents ?? 0} />
          <SummaryCard label="Professores" value={summary?.teachers ?? 0} />
          <SummaryCard label="Professores ativos" value={summary?.activeTeachers ?? 0} />
          <SummaryCard label="Administradores" value={summary?.administrators ?? 0} />
        </section>

        <section className="paper-card mt-5 rounded-[1.5rem] p-3 sm:p-4">
          <div className="grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-center">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#f5f0fb] p-1">
              <button
                type="button"
                onClick={() => setTab('students')}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition ${
                  tab === 'students' ? 'bg-white text-[#2b0d71] shadow-sm' : 'text-[#7656a7]'
                }`}
              >
                <UserRound size={17} />
                Alunos
              </button>
              <button
                type="button"
                onClick={() => setTab('teachers')}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black transition ${
                  tab === 'teachers' ? 'bg-white text-[#2b0d71] shadow-sm' : 'text-[#7656a7]'
                }`}
              >
                <UsersRound size={17} />
                Professores
              </button>
            </div>

            <label className="form-control-shell flex min-h-11 items-center gap-2 rounded-2xl px-3">
              <Search size={17} className="shrink-0 text-[#6c2db7]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={tab === 'students' ? 'Buscar aluno por nome ou e-mail' : 'Buscar professor por nome ou e-mail'}
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>

            <button
              type="button"
              onClick={() => openCreate(tab === 'students' ? 'student' : 'teacher')}
              className="primary-cta flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black"
            >
              <Plus size={17} />
              {tab === 'students' ? 'Novo aluno' : 'Novo professor'}
            </button>
          </div>
        </section>

        {error && !form && (
          <div className="mt-4 rounded-2xl bg-[#fff0f4] px-4 py-3 text-sm font-bold text-[#c81f49]">
            {error}
          </div>
        )}

        <section className="mt-4 space-y-3">
          {tab === 'students' ? (
            students.length ? students.map((user) => (
              <StudentRow
                key={user.id}
                user={user}
                loading={loading}
                onEdit={() => openStudent(user)}
                onToggle={() => toggleStudent(user)}
                onDelete={() => removeStudent(user)}
              />
            )) : (
              <EmptyState text="Nenhum aluno encontrado." />
            )
          ) : (
            teachers.length ? teachers.map((item) => (
              <TeacherRow
                key={item.id}
                item={item}
                isCurrentAdmin={item.id === data?.currentAdminId}
                loading={loading}
                onEdit={() => openTeacher(item)}
                onToggle={() => toggleTeacher(item)}
                onDelete={() => removeTeacher(item)}
              />
            )) : (
              <EmptyState text="Nenhum professor encontrado." />
            )
          )}
        </section>
      </div>

      {form && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#1f0a49]/30 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto flex min-h-full max-w-xl items-center justify-center">
            <form onSubmit={save} className="paper-card w-full rounded-[1.75rem] p-4 shadow-2xl sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.14em] text-[#008f81]">
                    {form.id ? 'Editar conta' : 'Cadastrar conta'}
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#2b0d71]">
                    {form.kind === 'student' ? 'Aluno' : form.role === 'ADMIN' ? 'Administrador' : 'Professor'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="secondary-cta grid h-10 w-10 place-items-center rounded-full"
                  aria-label="Fechar"
                >
                  <X size={17} />
                </button>
              </div>

              <label className="mt-5 block">
                <span className="mb-1.5 block text-sm font-black text-[#2b0d71]">Nome</span>
                <div className="form-control-shell rounded-2xl px-4">
                  <input
                    required
                    value={form.name}
                    onChange={(event) => setForm((state) => state ? { ...state, name: event.target.value } : state)}
                    className="min-h-12 w-full bg-transparent outline-none"
                    placeholder="Nome completo"
                  />
                </div>
              </label>

              <label className="mt-3 block">
                <span className="mb-1.5 block text-sm font-black text-[#2b0d71]">E-mail</span>
                <div className="form-control-shell rounded-2xl px-4">
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((state) => state ? { ...state, email: event.target.value } : state)}
                    className="min-h-12 w-full bg-transparent outline-none"
                    placeholder="usuario@email.com"
                  />
                </div>
              </label>

              <label className="mt-3 block">
                <span className="mb-1.5 flex items-center gap-2 text-sm font-black text-[#2b0d71]">
                  <KeyRound size={15} />
                  {form.id ? 'Redefinir senha' : 'Senha'}
                </span>
                <div className="form-control-shell rounded-2xl px-4">
                  <input
                    type="password"
                    required={!form.id}
                    value={form.password}
                    onChange={(event) => setForm((state) => state ? { ...state, password: event.target.value } : state)}
                    className="min-h-12 w-full bg-transparent outline-none"
                    placeholder={form.id ? 'Deixe em branco para manter a senha atual' : 'Mínimo de 8 caracteres'}
                  />
                </div>
              </label>

              <label className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f8f5fc] p-3">
                <input
                  type="checkbox"
                  checked={form.role === 'ADMIN' ? true : form.isActive}
                  disabled={form.role === 'ADMIN'}
                  onChange={(event) => setForm((state) => state ? { ...state, isActive: event.target.checked } : state)}
                  className="h-5 w-5"
                />
                <span>
                  <strong className="block text-sm text-[#2b0d71]">Conta ativa</strong>
                  <span className="text-xs text-[#7656a7]">
                    Contas desativadas não conseguem entrar na plataforma.
                  </span>
                </span>
              </label>

              {error && (
                <div className="mt-4 rounded-xl bg-[#fff0f4] px-3 py-2 text-sm font-bold text-[#c81f49]">
                  {error}
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="secondary-cta min-h-12 rounded-2xl px-4 font-black"
                >
                  Cancelar
                </button>
                <button
                  disabled={loading}
                  className="primary-cta min-h-12 rounded-2xl px-4 font-black disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed inset-x-4 bottom-5 z-[120] mx-auto max-w-md rounded-2xl border border-[#bee9df] bg-[#effbf8]/95 px-4 py-3 text-center text-sm font-black text-[#08786f] shadow-xl backdrop-blur-xl">
          {toast}
        </div>
      )}
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="paper-card rounded-2xl px-3 py-3.5 sm:px-4">
      <p className="text-2xl font-black text-[#2b0d71] sm:text-3xl">{value}</p>
      <p className="mt-0.5 text-[11px] font-bold text-[#7656a7] sm:text-xs">{label}</p>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black ${
      active ? 'bg-[#e8faf6] text-[#008f81]' : 'bg-[#fff0f4] text-[#c72b51]'
    }`}>
      {active ? <CheckCircle2 size={12} /> : <Power size={12} />}
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}

function StudentRow({
  user,
  loading,
  onEdit,
  onToggle,
  onDelete,
}: {
  user: AdminUser;
  loading: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="paper-card rounded-[1.4rem] p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e8faf6] text-[#008f81]">
              <UserRound size={18} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-black text-[#2b0d71]">{user.name}</p>
              <p className="truncate text-xs text-[#7656a7]">{user.email}</p>
            </div>
            <StatusBadge active={user.isActive} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#7656a7]">
            <span className="rounded-full bg-[#f7f3fb] px-2.5 py-1">Aluno</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f3fb] px-2.5 py-1">
              <BookOpenCheck size={12} /> {user.assessmentCount} avaliação(ões)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:flex">
          <ActionButton icon={<Pencil size={15} />} label="Editar" onClick={onEdit} />
          <ActionButton
            icon={<Power size={15} />}
            label={user.isActive ? 'Desativar' : 'Ativar'}
            onClick={onToggle}
            disabled={loading}
          />
          <ActionButton icon={<Trash2 size={15} />} label="Excluir" danger onClick={onDelete} disabled={loading} />
        </div>
      </div>
    </article>
  );
}

function TeacherRow({
  item,
  isCurrentAdmin,
  loading,
  onEdit,
  onToggle,
  onDelete,
}: {
  item: AdminTeacher;
  isCurrentAdmin: boolean;
  loading: boolean;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="paper-card rounded-[1.4rem] p-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f1e9ff] text-[#6c2db7]">
              {item.role === 'ADMIN' ? <ShieldCheck size={18} /> : <UsersRound size={18} />}
            </span>
            <div className="min-w-0">
              <p className="truncate font-black text-[#2b0d71]">{item.name}</p>
              <p className="truncate text-xs text-[#7656a7]">{item.email}</p>
            </div>
            {item.role === 'ADMIN' && (
              <span className="rounded-full bg-[#e8faf6] px-2.5 py-1 text-[11px] font-black text-[#008f81]">
                ADMIN
              </span>
            )}
            <StatusBadge active={item.isActive} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#7656a7]">
            <span className="rounded-full bg-[#f7f3fb] px-2.5 py-1">
              {item.role === 'ADMIN' ? 'Administrador' : 'Professor'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f3fb] px-2.5 py-1">
              <BookOpenCheck size={12} /> {item.assessmentCount} avaliação(ões)
            </span>
          </div>
        </div>

        <div className={`grid gap-2 sm:flex ${isCurrentAdmin ? 'grid-cols-1' : 'grid-cols-3'}`}>
          <ActionButton icon={<Pencil size={15} />} label="Editar" onClick={onEdit} />
          {!isCurrentAdmin && (
            <>
              <ActionButton
                icon={<Power size={15} />}
                label={item.isActive ? 'Desativar' : 'Ativar'}
                onClick={onToggle}
                disabled={loading}
              />
              <ActionButton icon={<Trash2 size={15} />} label="Excluir" danger onClick={onDelete} disabled={loading} />
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  danger = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-black disabled:opacity-50 ${
        danger ? 'bg-[#fff0f4] text-[#c72b51]' : 'secondary-cta'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="paper-card rounded-[1.4rem] px-4 py-10 text-center text-sm font-bold text-[#7656a7]">
      {text}
    </div>
  );
}
