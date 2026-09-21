import {
  ArrowLeft,
  CheckCircle2,
  Pencil,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import {
  api,
  type AdminAccounts,
  type AdminTeacher,
  type AdminUser,
} from '../services/api';
import { useAppStore } from '../store/useAppStore';

type FormKind = 'user' | 'teacher';

type AccountForm = {
  kind: FormKind;
  id: string | null;
  role?: 'TEACHER' | 'ADMIN';
  name: string;
  email: string;
  password: string;
  isActive: boolean;
};

const emptyForm = (kind: FormKind): AccountForm => ({
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
  const [form, setForm] = useState<AccountForm>(emptyForm('user'));
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

  if (!teacherToken) return <Navigate to="/professor" replace />;
  if (teacher?.role !== 'ADMIN') return <Navigate to="/professor/painel" replace />;

  function startCreate(kind: FormKind) {
    setForm(emptyForm(kind));
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function editUser(user: AdminUser) {
    setForm({
      kind: 'user',
      id: user.id,
      name: user.name,
      email: user.email,
      password: '',
      isActive: true,
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function editTeacher(item: AdminTeacher) {
    setForm({
      kind: 'teacher',
      id: item.id,
      role: item.role,
      name: item.name,
      email: item.email,
      password: '',
      isActive: item.isActive,
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!teacherToken) return;

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 2 || !email) {
      setError('Preencha nome e e-mail corretamente.');
      return;
    }

    if (!form.id && form.password.length < 8) {
      setError('Para novas contas, a senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (form.kind === 'user') {
        if (form.id) {
          await api.adminUpdateUser(teacherToken, form.id, {
            name,
            email,
            ...(form.password ? { password: form.password } : {}),
          });
          setToast('Usuário atualizado.');
        } else {
          await api.adminCreateUser(teacherToken, {
            name,
            email,
            password: form.password,
          });
          setToast('Usuário criado.');
        }
      } else if (form.id) {
        await api.adminUpdateTeacher(teacherToken, form.id, {
          name,
          email,
          isActive: form.role === 'ADMIN' ? true : form.isActive,
          ...(form.password ? { password: form.password } : {}),
        });
        setToast('Professor atualizado.');
      } else {
        await api.adminCreateTeacher(teacherToken, {
          name,
          email,
          password: form.password,
          isActive: form.isActive,
        });
        setToast('Professor criado.');
      }

      setForm(emptyForm(form.kind));
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a conta.');
    } finally {
      setLoading(false);
    }
  }

  async function removeUser(user: AdminUser) {
    if (!teacherToken || !window.confirm(`Excluir o usuário "${user.name}"?`)) return;

    try {
      setLoading(true);
      await api.adminDeleteUser(teacherToken, user.id);
      setToast('Usuário removido.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível remover o usuário.');
    } finally {
      setLoading(false);
    }
  }

  async function removeTeacher(item: AdminTeacher) {
    if (!teacherToken || item.role === 'ADMIN') return;
    if (!window.confirm(`Excluir o professor "${item.name}"?`)) return;

    try {
      setLoading(true);
      await api.adminDeleteTeacher(teacherToken, item.id);
      setToast('Professor removido.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível remover o professor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="safe-page relative overflow-hidden px-3.5 sm:px-6">
      <div className="app-shell relative pb-10">
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

        <section className="mt-5 sm:mt-6">
          <div className="flex items-center gap-2 text-[#008f81]">
            <ShieldCheck size={20} />
            <p className="text-xs font-black uppercase tracking-[.16em] sm:text-sm">Acesso administrativo</p>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-[-.035em] text-[#2b0d71] sm:text-5xl">
            Gerenciar contas
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#7656a7] sm:text-base">
            Esta área é exclusiva do administrador. Professores comuns não possuem acesso às opções abaixo.
          </p>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form onSubmit={submit} className="paper-card rounded-[1.5rem] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.14em] text-[#008f81]">
                  {form.id ? 'Editar conta' : 'Nova conta'}
                </p>
                <h2 className="mt-1 text-xl font-black text-[#2b0d71]">
                  {form.kind === 'user' ? 'Usuário' : 'Professor'}
                </h2>
              </div>
              {form.id && (
                <button
                  type="button"
                  onClick={() => setForm(emptyForm(form.kind))}
                  className="secondary-cta grid h-9 w-9 place-items-center rounded-full"
                  aria-label="Cancelar edição"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {!form.id && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => startCreate('user')}
                  className={`min-h-11 rounded-xl px-3 text-sm font-black ${
                    form.kind === 'user' ? 'primary-cta' : 'secondary-cta'
                  }`}
                >
                  Usuário
                </button>
                <button
                  type="button"
                  onClick={() => startCreate('teacher')}
                  className={`min-h-11 rounded-xl px-3 text-sm font-black ${
                    form.kind === 'teacher' ? 'primary-cta' : 'secondary-cta'
                  }`}
                >
                  Professor
                </button>
              </div>
            )}

            <label className="mt-4 block">
              <span className="mb-1.5 block text-sm font-black text-[#2b0d71]">Nome</span>
              <div className="form-control-shell rounded-2xl px-4">
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
                  className="min-h-12 w-full bg-transparent outline-none"
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
                  onChange={(event) => setForm((state) => ({ ...state, email: event.target.value }))}
                  className="min-h-12 w-full bg-transparent outline-none"
                />
              </div>
            </label>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-sm font-black text-[#2b0d71]">
                Senha {form.id ? '(deixe em branco para manter)' : ''}
              </span>
              <div className="form-control-shell rounded-2xl px-4">
                <input
                  type="password"
                  required={!form.id}
                  minLength={form.id ? undefined : 8}
                  value={form.password}
                  onChange={(event) => setForm((state) => ({ ...state, password: event.target.value }))}
                  className="min-h-12 w-full bg-transparent outline-none"
                />
              </div>
            </label>

            {form.kind === 'teacher' && (
              <label className="mt-4 flex items-center gap-3 rounded-2xl bg-[#f8f5fc] p-3">
                <input
                  type="checkbox"
                  checked={form.role === 'ADMIN' ? true : form.isActive}
                  disabled={form.role === 'ADMIN'}
                  onChange={(event) => setForm((state) => ({ ...state, isActive: event.target.checked }))}
                  className="h-5 w-5"
                />
                <span>
                  <strong className="block text-sm text-[#2b0d71]">Professor ativo</strong>
                  <span className="text-xs text-[#7656a7]">
                    Professores inativos não conseguem entrar nem aparecem para os alunos.
                  </span>
                </span>
              </label>
            )}

            {error && (
              <div className="mt-4 rounded-xl bg-[#fff0f4] px-3 py-2 text-sm font-bold text-[#c81f49]">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="primary-cta mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-4 font-black disabled:opacity-50"
            >
              {form.id ? <Save size={17} /> : <Plus size={17} />}
              {loading ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Cadastrar'}
            </button>
          </form>

          <div className="space-y-4">
            <section className="paper-card rounded-[1.5rem] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e8faf6] text-[#008f81]">
                  <UserRound size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-black text-[#2b0d71]">Usuários</h2>
                  <p className="text-xs text-[#7656a7]">{data?.users.length ?? 0} conta(s)</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {(data?.users ?? []).map((user) => (
                  <article key={user.id} className="rounded-2xl border border-[#ece4f5] bg-white/65 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-black text-[#2b0d71]">{user.name}</p>
                        <p className="mt-0.5 truncate text-xs text-[#7656a7]">{user.email}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => editUser(user)} className="secondary-cta grid h-9 w-9 place-items-center rounded-xl" aria-label="Editar usuário">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => removeUser(user)} className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0f4] text-[#c72b51]" aria-label="Excluir usuário">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
                {(data?.users.length ?? 0) === 0 && (
                  <p className="py-5 text-center text-sm font-bold text-[#7656a7]">Nenhum usuário cadastrado.</p>
                )}
              </div>
            </section>

            <section className="paper-card rounded-[1.5rem] p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f1e9ff] text-[#6c2db7]">
                  <UsersRound size={20} />
                </span>
                <div>
                  <h2 className="text-lg font-black text-[#2b0d71]">Professores</h2>
                  <p className="text-xs text-[#7656a7]">{data?.teachers.length ?? 0} conta(s)</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {(data?.teachers ?? []).map((item) => (
                  <article key={item.id} className="rounded-2xl border border-[#ece4f5] bg-white/65 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-black text-[#2b0d71]">{item.name}</p>
                          {item.role === 'ADMIN' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8faf6] px-2 py-0.5 text-[10px] font-black text-[#008f81]">
                              <ShieldCheck size={11} /> ADMIN
                            </span>
                          )}
                          {item.isActive && (
                            <CheckCircle2 size={15} className="text-[#008f81]" aria-label="Ativo" />
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-[#7656a7]">{item.email}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <button onClick={() => editTeacher(item)} className="secondary-cta grid h-9 w-9 place-items-center rounded-xl" aria-label="Editar professor">
                          <Pencil size={15} />
                        </button>
                        {item.role !== 'ADMIN' && (
                          <button onClick={() => removeTeacher(item)} className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0f4] text-[#c72b51]" aria-label="Excluir professor">
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed inset-x-4 bottom-5 z-[80] mx-auto max-w-md rounded-2xl border border-[#bee9df] bg-[#effbf8]/95 px-4 py-3 text-center text-sm font-black text-[#08786f] shadow-xl backdrop-blur-xl">
          {toast}
        </div>
      )}
    </main>
  );
}
