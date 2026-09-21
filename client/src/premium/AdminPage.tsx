import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import {
  Download,
  KeyRound,
  Pencil,
  Plus,
  Power,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UsersRound,
} from 'lucide-react';
import {
  api,
  type AdminAccounts,
  type AdminTeacher,
  type AdminUser,
} from '../services/api';
import { useAppStore } from '../store/useAppStore';
import { Button, Field, Modal, Pill, Stat, Surface, Toast } from './UI';
import { Workspace } from './Shell';

type Tab = 'overview' | 'students' | 'teachers';

type Editor = {
  id?: string;
  role: 'student' | 'teacher';
  name: string;
  email: string;
  password: string;
  isActive: boolean;
};

const blank = (role: 'student' | 'teacher'): Editor => ({
  role,
  name: '',
  email: '',
  password: '',
  isActive: true,
});

function downloadAdminCsv(data: AdminAccounts) {
  const rows = [
    ['Tipo', 'Nome', 'E-mail', 'Status', 'Avaliações'],
    ...data.users.map((user) => [
      'Aluno',
      user.name,
      user.email,
      user.isActive ? 'Ativo' : 'Inativo',
      user.assessmentCount,
    ]),
    ...data.teachers.map((teacher) => [
      teacher.role === 'ADMIN' ? 'Administrador' : 'Professor',
      teacher.name,
      teacher.email,
      teacher.isActive ? 'Ativo' : 'Inativo',
      teacher.assessmentCount,
    ]),
  ];

  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(','),
    )
    .join('\n');

  const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'idiomas-pro-usuarios.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AdminPage() {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const teacher = useAppStore((state) => state.teacher);
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab');
  const [tab, setTabState] = useState<Tab>(
    requested === 'teachers' ? 'teachers' : requested === 'students' ? 'students' : 'overview',
  );
  const [data, setData] = useState<AdminAccounts | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!teacherToken) return;
    api
      .getAdminAccounts(teacherToken)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Não foi possível carregar as contas.'))
      .finally(() => setLoading(false));
  }, [teacherToken]);

  useEffect(() => {
    const next = params.get('tab');
    if (next === 'teachers') setTabState('teachers');
    else if (next === 'students') setTabState('students');
    else setTabState('overview');
  }, [params]);

  if (!teacherToken || !teacher) return <Navigate to="/professor" replace />;
  if (teacher.role !== 'ADMIN') return <Navigate to="/professor/painel" replace />;

  const users = data?.users ?? [];
  const teachers = data?.teachers ?? [];

  const filtered = useMemo(() => {
    const list = tab === 'teachers' ? teachers : users;
    const search = query.trim().toLowerCase();
    if (!search) return list;

    return list.filter((account) =>
      `${account.name} ${account.email} ${account.isActive ? 'ativo' : 'inativo'} ${
        'role' in account ? account.role : 'student'
      }`
        .toLowerCase()
        .includes(search),
    );
  }, [tab, query, users, teachers]);

  const heading =
    tab === 'students'
      ? {
          eyebrow: 'Pessoas',
          title: 'Alunos da plataforma',
          description: 'Cadastre, atualize, bloqueie ou remova contas de alunos.',
        }
      : tab === 'teachers'
        ? {
            eyebrow: 'Equipe pedagógica',
            title: 'Professores',
            description: 'Gerencie apenas contas que recebem e acompanham avaliações.',
          }
        : {
            eyebrow: 'Administração',
            title: 'Organização da plataforma',
            description: 'Contas, acessos e ações essenciais em uma visão objetiva.',
          };

  function setTab(next: Tab) {
    setTabState(next);
    setQuery('');
    setError('');
    setParams(next === 'overview' ? {} : { tab: next });
  }

  async function reload() {
    if (!teacherToken) return;
    setData(await api.getAdminAccounts(teacherToken));
  }

  function openCreate(role: 'student' | 'teacher') {
    setError('');
    setEditor(blank(role));
  }

  function openUser(user: AdminUser) {
    setError('');
    setEditor({
      id: user.id,
      role: 'student',
      name: user.name,
      email: user.email,
      password: '',
      isActive: user.isActive,
    });
  }

  function openTeacher(item: AdminTeacher) {
    setError('');
    setEditor({
      id: item.id,
      role: 'teacher',
      name: item.name,
      email: item.email,
      password: '',
      isActive: item.isActive,
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editor || !teacherToken) return;

    if (editor.name.trim().length < 2 || !editor.email.trim()) {
      setError('Preencha nome e e-mail corretamente.');
      return;
    }

    if (!editor.id && editor.password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    try {
      setSaving(true);
      setError('');

      if (editor.role === 'student') {
        if (editor.id) {
          await api.adminUpdateUser(teacherToken, editor.id, {
            name: editor.name.trim(),
            email: editor.email.trim(),
            isActive: editor.isActive,
            ...(editor.password ? { password: editor.password } : {}),
          });
        } else {
          await api.adminCreateUser(teacherToken, {
            name: editor.name.trim(),
            email: editor.email.trim(),
            password: editor.password,
            isActive: editor.isActive,
          });
        }
      } else if (editor.id) {
        await api.adminUpdateTeacher(teacherToken, editor.id, {
          name: editor.name.trim(),
          email: editor.email.trim(),
          isActive: editor.isActive,
          ...(editor.password ? { password: editor.password } : {}),
        });
      } else {
        await api.adminCreateTeacher(teacherToken, {
          name: editor.name.trim(),
          email: editor.email.trim(),
          password: editor.password,
          isActive: editor.isActive,
        });
      }

      setEditor(null);
      await reload();
      setMessage(editor.id ? 'Conta atualizada com sucesso.' : 'Conta cadastrada com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar a conta.');
    } finally {
      setSaving(false);
    }
  }

  async function toggle(account: AdminUser | AdminTeacher) {
    if (!teacherToken) return;

    if ('role' in account && account.id === data?.currentAdminId) {
      setError('Você não pode desativar a própria conta administrativa.');
      return;
    }

    try {
      if ('role' in account) {
        await api.adminUpdateTeacher(teacherToken, account.id, { isActive: !account.isActive });
      } else {
        await api.adminUpdateUser(teacherToken, account.id, { isActive: !account.isActive });
      }
      await reload();
      setMessage(account.isActive ? 'Conta desativada.' : 'Conta ativada.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar o acesso.');
    }
  }

  async function remove(account: AdminUser | AdminTeacher) {
    if (!teacherToken) return;
    if ('role' in account && account.id === data?.currentAdminId) {
      setError('Você não pode excluir a própria conta administrativa.');
      return;
    }

    if (!window.confirm(`Excluir permanentemente a conta de "${account.name}"?`)) return;

    try {
      if ('role' in account) {
        await api.adminDeleteTeacher(teacherToken, account.id);
      } else {
        await api.adminDeleteUser(teacherToken, account.id);
      }
      await reload();
      setMessage('Conta excluída.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a conta.');
    }
  }

  if (loading && !data) {
    return (
      <Workspace area="admin">
        <Surface className="empty workspace-loading">
          <div className="empty__icon">✦</div>
          <h3>Carregando administração</h3>
          <p>Buscando contas, permissões e status da plataforma.</p>
        </Surface>
      </Workspace>
    );
  }

  return (
    <Workspace area="admin">
      <div className="workspace-heading">
        <div>
          <small>{heading.eyebrow}</small>
          <h1>{heading.title}</h1>
          <p>{heading.description}</p>
        </div>
        <div className="heading-actions">
          <Button variant="secondary" disabled={!data} onClick={() => data && downloadAdminCsv(data)}>
            <Download size={17} /> Exportar contas
          </Button>
        </div>
      </div>

      {tab === 'overview' ? (
        <>
          <div className="stat-grid product-metrics admin-metrics">
            <Stat label="Alunos" value={data?.summary.students ?? 0} tone="teal" />
            <Stat label="Professores" value={data?.summary.teachers ?? 0} tone="purple" />
            <Stat
              label="Contas ativas"
              value={(data?.summary.activeStudents ?? 0) + (data?.summary.activeTeachers ?? 0)}
              tone="pink"
            />
            <Stat
              label="Administradores"
              value={data?.summary.administrators ?? 0}
              tone="orange"
            />
          </div>

          <div className="dashboard-grid">
            <Surface className="quick-actions">
              <div className="section-title">
                <div>
                  <small>Ações</small>
                  <h2>Ações rápidas</h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setTab('students');
                  openCreate('student');
                }}
              >
                <span>
                  <Plus />
                </span>
                <div>
                  <b>Cadastrar aluno</b>
                  <small>Crie uma nova conta de aluno.</small>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('teachers');
                  openCreate('teacher');
                }}
              >
                <span>
                  <Plus />
                </span>
                <div>
                  <b>Cadastrar professor</b>
                  <small>Adicione um novo professor.</small>
                </div>
              </button>

              <button type="button" onClick={() => setTab('students')}>
                <span>
                  <KeyRound />
                </span>
                <div>
                  <b>Redefinir senha</b>
                  <small>Edite uma conta para trocar a senha.</small>
                </div>
              </button>

              <button type="button" onClick={() => setTab('teachers')}>
                <span>
                  <Power />
                </span>
                <div>
                  <b>Gerenciar acessos</b>
                  <small>Ative ou desative usuários.</small>
                </div>
              </button>
            </Surface>

            <Surface className="admin-health">
              <div className="section-title">
                <div>
                  <small>Status</small>
                  <h2>Saúde do acesso</h2>
                </div>
              </div>

              <div className="health-number">
                <strong>
                  {(data?.summary.activeStudents ?? 0) + (data?.summary.activeTeachers ?? 0)}
                </strong>
                <span>contas ativas</span>
              </div>

              <div className="health-number danger">
                <strong>
                  {(data?.summary.students ?? 0) +
                    (data?.summary.teachers ?? 0) +
                    (data?.summary.administrators ?? 0) -
                    ((data?.summary.activeStudents ?? 0) + (data?.summary.activeTeachers ?? 0))}
                </strong>
                <span>contas inativas</span>
              </div>

              <hr />
              <h3>Proteções administrativas</h3>
              <ul>
                <li>Conta admin atual não pode ser removida</li>
                <li>Senha redefinida invalida sessões antigas</li>
                <li>Contas inativas deixam de acessar</li>
              </ul>
            </Surface>
          </div>
        </>
      ) : (
        <>
          <Surface className="admin-toolbar">
            <label className="search-box grow">
              <Search size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Buscar ${tab === 'students' ? 'aluno' : 'professor'} por nome, e-mail ou status`}
              />
            </label>

            <Pill tone={tab === 'students' ? 'teal' : 'purple'}>
              {filtered.length} {tab === 'students' ? 'alunos' : 'professores'}
            </Pill>

            <Button onClick={() => openCreate(tab === 'students' ? 'student' : 'teacher')}>
              <Plus size={17} /> Novo {tab === 'students' ? 'aluno' : 'professor'}
            </Button>
          </Surface>

          <Surface className="admin-table">
            <div className="table">
              <div className="table__head">
                <span>Conta</span>
                <span>Perfil</span>
                <span>Status</span>
                <span>Avaliações</span>
                <span>Ações</span>
              </div>

              {filtered.map((account) => {
                const isTeacher = 'role' in account;
                const isCurrentAdmin = isTeacher && account.id === data?.currentAdminId;

                return (
                  <div className="table__row" key={account.id}>
                    <span>
                      <b>{account.name}</b>
                      <small>{account.email}</small>
                    </span>
                    <span>
                      <Pill
                        tone={
                          isTeacher
                            ? account.role === 'ADMIN'
                              ? 'pink'
                              : 'purple'
                            : 'teal'
                        }
                      >
                        {isTeacher
                          ? account.role === 'ADMIN'
                            ? 'ADMIN'
                            : 'Professor'
                          : 'Aluno'}
                      </Pill>
                    </span>
                    <span>
                      <Pill tone={account.isActive ? 'teal' : 'danger'}>
                        {account.isActive ? 'Ativo' : 'Inativo'}
                      </Pill>
                    </span>
                    <strong>{account.assessmentCount}</strong>
                    <span className="row-actions">
                      <button
                        type="button"
                        onClick={() =>
                          isTeacher
                            ? openTeacher(account as AdminTeacher)
                            : openUser(account as AdminUser)
                        }
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggle(account)}
                        title={account.isActive ? 'Desativar' : 'Ativar'}
                        disabled={isCurrentAdmin}
                      >
                        <Power size={15} />
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => remove(account)}
                        disabled={isCurrentAdmin}
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </Surface>
        </>
      )}

      <Modal
        open={!!editor}
        onClose={() => {
          setEditor(null);
          setError('');
        }}
        title={editor?.id ? 'Editar conta' : 'Cadastrar conta'}
      >
        {editor && (
          <form onSubmit={save} className="modal-form">
            <div className="account-type">
              <Pill tone={editor.role === 'student' ? 'teal' : 'purple'}>
                {editor.role === 'student' ? 'Aluno' : 'Professor'}
              </Pill>
              {editor.id && <span>Uma nova senha passa a valer imediatamente.</span>}
            </div>

            <Field
              label="Nome completo"
              value={editor.name}
              onChange={(name) => setEditor({ ...editor, name })}
            />
            <Field
              label="E-mail"
              value={editor.email}
              onChange={(email) => setEditor({ ...editor, email })}
              type="email"
            />
            <Field
              label={editor.id ? 'Redefinir senha' : 'Senha'}
              value={editor.password}
              onChange={(password) => setEditor({ ...editor, password })}
              type="password"
              placeholder={editor.id ? 'Deixe em branco para manter' : 'Mínimo 8 caracteres'}
            />

            <div className="toggle-row boxed">
              <div>
                <Power size={18} />
                <span>
                  <b>Conta ativa</b>
                  <small>Contas inativas não conseguem acessar.</small>
                </span>
              </div>
              <button
                type="button"
                className={`switch ${editor.isActive ? 'on' : ''}`}
                onClick={() => setEditor({ ...editor, isActive: !editor.isActive })}
              >
                <i />
              </button>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditor(null);
                  setError('');
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving
                  ? 'Salvando...'
                  : editor.id
                    ? 'Salvar alterações'
                    : 'Cadastrar conta'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {message && <Toast message={message} />}
      {error && !editor && <Toast message={error} tone="error" />}
    </Workspace>
  );
}
