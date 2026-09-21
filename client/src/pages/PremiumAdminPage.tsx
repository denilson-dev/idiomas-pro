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
import { Button, Empty, Field, Modal, Pill, Stat, Surface, Toast } from '../components/UI';
import { Workspace } from '../components/Shell';
import {
  api,
  type AdminAccounts,
  type AdminTeacher,
  type AdminUser,
} from '../services/api';
import { useAppStore } from '../store/useAppStore';

type Role='student'|'teacher';
type Editor={id?:string;role:Role;name:string;email:string;password:string;isActive:boolean};
const blank=(role:Role):Editor=>({role,name:'',email:'',password:'',isActive:true});

export function AdminPage(){
  const token=useAppStore(state=>state.teacherToken);
  const teacher=useAppStore(state=>state.teacher);
  const [params,setParams]=useSearchParams();
  const initial=params.get('tab')==='teachers'?'teachers':params.get('tab')==='students'?'students':'overview';
  const [tab,setTabState]=useState<'overview'|'students'|'teachers'>(initial);
  const [data,setData]=useState<AdminAccounts|null>(null);
  const [query,setQuery]=useState('');
  const [editor,setEditor]=useState<Editor|null>(null);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  const load=()=>{
    if(!token)return;
    api.getAdminAccounts(token).then(setData).catch(err=>setError(err instanceof Error?err.message:'Não foi possível carregar as contas.'));
  };
  useEffect(load,[token]);

  if(!token||!teacher)return <Navigate to="/professor" replace/>;
  if(teacher.role!=='ADMIN')return <Navigate to="/professor/painel" replace/>;

  const students=data?.users??[];
  const teachers=data?.teachers??[];
  const setTab=(next:'overview'|'students'|'teachers')=>{setTabState(next);setParams(next==='overview'?{}:{tab:next})};
  const filtered=useMemo(()=>{
    const items=tab==='teachers'?teachers:students;
    const normalized=query.trim().toLowerCase();
    if(!normalized)return items;
    return items.filter(item=>(item.name+' '+item.email+' '+(item.isActive?'ativo':'inativo')+('role' in item?' '+item.role:'')).toLowerCase().includes(normalized));
  },[tab,query,data]);

  function openCreate(role:Role){setError('');setEditor(blank(role))}
  function openEdit(item:AdminUser|AdminTeacher){
    setError('');
    setEditor({
      id:item.id,
      role:'role' in item?'teacher':'student',
      name:item.name,
      email:item.email,
      password:'',
      isActive:item.isActive,
    });
  }

  async function save(e:FormEvent){
    e.preventDefault();
    if(!editor||!token)return;
    if(editor.name.trim().length<2||!editor.email.trim()){setError('Preencha nome e e-mail corretamente.');return}
    if(!editor.id&&editor.password.length<8){setError('A senha precisa ter pelo menos 8 caracteres.');return}
    if(editor.password&&editor.password.length<8){setError('A nova senha precisa ter pelo menos 8 caracteres.');return}
    try{
      setLoading(true);setError('');
      if(editor.role==='student'){
        if(editor.id)await api.adminUpdateUser(token,editor.id,{name:editor.name,email:editor.email,isActive:editor.isActive,...(editor.password?{password:editor.password}:{})});
        else await api.adminCreateUser(token,{name:editor.name,email:editor.email,password:editor.password,isActive:editor.isActive});
      }else{
        if(editor.id)await api.adminUpdateTeacher(token,editor.id,{name:editor.name,email:editor.email,isActive:editor.isActive,...(editor.password?{password:editor.password}:{})});
        else await api.adminCreateTeacher(token,{name:editor.name,email:editor.email,password:editor.password,isActive:editor.isActive});
      }
      setEditor(null);
      setMessage(editor.id?'Conta atualizada com sucesso.':'Conta cadastrada com sucesso.');
      load();
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível salvar a conta.')}
    finally{setLoading(false)}
  }

  async function toggle(item:AdminUser|AdminTeacher){
    if(!token)return;
    if(item.id===data?.currentAdminId){setError('Você não pode desativar a própria conta administrativa.');return}
    try{
      if('role' in item)await api.adminUpdateTeacher(token,item.id,{isActive:!item.isActive});
      else await api.adminUpdateUser(token,item.id,{isActive:!item.isActive});
      setMessage(item.isActive?'Conta desativada.':'Conta ativada.');load();
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível alterar o status.')}
  }

  async function remove(item:AdminUser|AdminTeacher){
    if(!token)return;
    if(item.id===data?.currentAdminId){setError('Você não pode excluir a própria conta administrativa.');return}
    if(!confirm('Excluir '+item.name+'? Esta ação não pode ser desfeita.'))return;
    try{
      if('role' in item)await api.adminDeleteTeacher(token,item.id);
      else await api.adminDeleteUser(token,item.id);
      setMessage('Conta excluída.');load();
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível excluir a conta.')}
  }

  function exportData(){
    if(!data)return;
    const rows=[
      ['Tipo','Nome','E-mail','Status','Avaliações'],
      ...data.users.map(item=>['Aluno',item.name,item.email,item.isActive?'Ativo':'Inativo',String(item.assessmentCount)]),
      ...data.teachers.map(item=>[item.role==='ADMIN'?'Administrador':'Professor',item.name,item.email,item.isActive?'Ativo':'Inativo',String(item.assessmentCount)]),
    ];
    const csv='\uFEFF'+rows.map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(';')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=url;anchor.download='idiomas-pro-usuarios-'+new Date().toISOString().slice(0,10)+'.csv';
    document.body.appendChild(anchor);anchor.click();anchor.remove();URL.revokeObjectURL(url);
    setMessage('Dados exportados em CSV.');
  }

  const summary=data?.summary;

  return <Workspace area="admin"><div className="workspace-heading"><div><small>Administração</small><h1>Controle da plataforma</h1><p>Gestão completa de alunos, professores, status e credenciais.</p></div><div className="heading-actions"><Button variant="secondary" onClick={exportData}><Download size={17}/> Exportar dados</Button></div></div>
    <div className="admin-tabs"><button className={tab==='overview'?'active':''} onClick={()=>setTab('overview')}><ShieldCheck size={17}/> Visão geral</button><button className={tab==='students'?'active':''} onClick={()=>setTab('students')}><UserRound size={17}/> Alunos</button><button className={tab==='teachers'?'active':''} onClick={()=>setTab('teachers')}><UsersRound size={17}/> Professores</button></div>
    {tab==='overview'?<><div className="stat-grid"><Stat label="Alunos" value={summary?.students??0} tone="teal"/><Stat label="Professores" value={summary?.teachers??0} tone="purple"/><Stat label="Contas ativas" value={(summary?.activeStudents??0)+(summary?.activeTeachers??0)+(summary?.administrators??0)} tone="pink"/><Stat label="Administradores" value={summary?.administrators??0} tone="orange"/></div><div className="dashboard-grid"><Surface className="quick-actions"><div className="section-title"><div><small>Ações</small><h2>Ações rápidas</h2></div></div><button onClick={()=>{setTab('students');openCreate('student')}}><span><Plus/></span><div><b>Cadastrar aluno</b><small>Crie uma nova conta de aluno.</small></div></button><button onClick={()=>{setTab('teachers');openCreate('teacher')}}><span><Plus/></span><div><b>Cadastrar professor</b><small>Adicione um novo professor.</small></div></button><button onClick={()=>setTab('students')}><span><KeyRound/></span><div><b>Redefinir senha</b><small>Edite uma conta para trocar a senha.</small></div></button><button onClick={()=>setTab('teachers')}><span><Power/></span><div><b>Gerenciar acessos</b><small>Ative ou desative usuários.</small></div></button></Surface><Surface className="admin-health"><div className="section-title"><div><small>Status</small><h2>Saúde do acesso</h2></div></div><div className="health-number"><strong>{(summary?.activeStudents??0)+(summary?.activeTeachers??0)+(summary?.administrators??0)}</strong><span>contas ativas</span></div><div className="health-number danger"><strong>{(summary?.students??0)-(summary?.activeStudents??0)+(summary?.teachers??0)-(summary?.activeTeachers??0)}</strong><span>contas inativas</span></div><hr/><h3>Proteções administrativas</h3><ul><li>A própria conta admin não pode ser excluída.</li><li>Senhas redefinidas invalidam sessões antigas.</li><li>Contas desativadas perdem acesso imediatamente.</li></ul></Surface></div></>:<><Surface className="admin-toolbar"><div className="segmented admin-segment"><button className={tab==='students'?'active':''} onClick={()=>setTab('students')}>Alunos</button><button className={tab==='teachers'?'active':''} onClick={()=>setTab('teachers')}>Professores</button></div><label className="search-box grow"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={'Buscar '+(tab==='students'?'aluno':'professor')+' por nome, e-mail ou status'}/></label><Button onClick={()=>openCreate(tab==='students'?'student':'teacher')}><Plus size={17}/> Novo {tab==='students'?'aluno':'professor'}</Button></Surface><Surface className="admin-table">{filtered.length?<div className="table"><div className="table__head"><span>Conta</span><span>Perfil</span><span>Status</span><span>Avaliações</span><span>Ações</span></div>{filtered.map(item=><div className="table__row" key={item.id}><span><b>{item.name}</b><small>{item.email}</small></span><span><Pill tone={'role' in item?(item.role==='ADMIN'?'pink':'purple'):'teal'}>{'role' in item?(item.role==='ADMIN'?'ADMIN':'Professor'):'Aluno'}</Pill></span><span><Pill tone={item.isActive?'teal':'danger'}>{item.isActive?'Ativo':'Inativo'}</Pill></span><strong>{item.assessmentCount}</strong><span className="row-actions"><button onClick={()=>openEdit(item)} title="Editar"><Pencil size={15}/></button><button onClick={()=>toggle(item)} title={item.isActive?'Desativar':'Ativar'} disabled={item.id===data?.currentAdminId}><Power size={15}/></button><button className="danger" onClick={()=>remove(item)} disabled={item.id===data?.currentAdminId} title="Excluir"><Trash2 size={15}/></button></span></div>)}</div>:<Empty title="Nenhuma conta encontrada" description="Ajuste a busca ou cadastre uma nova conta."/>}</Surface></>}
    <Modal open={!!editor} onClose={()=>setEditor(null)} title={editor?.id?'Editar conta':'Cadastrar conta'}>{editor&&<form onSubmit={save} className="modal-form"><div className="account-type"><Pill tone={editor.role==='student'?'teal':'purple'}>{editor.role==='student'?'Aluno':'Professor'}</Pill>{editor.id&&<span>Alterações de senha passam a valer imediatamente.</span>}</div><Field label="Nome completo" value={editor.name} onChange={v=>setEditor({...editor,name:v})} required/><Field label="E-mail" value={editor.email} onChange={v=>setEditor({...editor,email:v})} type="email" required/><Field label={editor.id?'Redefinir senha':'Senha'} value={editor.password} onChange={v=>setEditor({...editor,password:v})} type="password" placeholder={editor.id?'Deixe em branco para manter':'Mínimo 8 caracteres'} required={!editor.id}/><div className="toggle-row boxed"><div><Power size={18}/><span><b>Conta ativa</b><small>Contas inativas não conseguem acessar.</small></span></div><button type="button" aria-pressed={editor.isActive} className={'switch '+(editor.isActive?'on':'')} onClick={()=>setEditor({...editor,isActive:!editor.isActive})}><i/></button></div>{error&&<p className="form-error">{error}</p>}<div className="modal-actions"><Button variant="secondary" onClick={()=>setEditor(null)}>Cancelar</Button><Button disabled={loading} type="submit">{loading?'Salvando...':editor.id?'Salvar alterações':'Cadastrar conta'}</Button></div></form>}</Modal>{message&&<Toast message={message}/>} {error&&!editor&&<Toast message={error} tone="error"/>}</Workspace>
}
