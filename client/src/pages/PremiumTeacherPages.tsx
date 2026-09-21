import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Download,
  FileText,
  Filter,
  KeyRound,
  Pencil,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
} from 'lucide-react';
import { Owl } from '../components/Brand';
import { Button, Empty, Field, Pill, Stat, Surface, Toast } from '../components/UI';
import { PublicHeader, Workspace } from '../components/Shell';
import {
  api,
  type TeacherAttempt,
  type TeacherAttemptDetail,
  type TeacherDashboard as TeacherDashboardData,
  type TeacherReports as TeacherReportsData,
} from '../services/api';
import { useAppStore } from '../store/useAppStore';

function useDashboard(){
  const token=useAppStore(state=>state.teacherToken);
  const [data,setData]=useState<TeacherDashboardData|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const reload=()=>{
    if(!token)return;
    setLoading(true);
    api.getTeacherDashboard(token).then(setData).catch(err=>setError(err instanceof Error?err.message:'Não foi possível carregar o painel.')).finally(()=>setLoading(false));
  };
  useEffect(reload,[token]);
  return {token,data,loading,error,reload};
}

export function TeacherLogin(){
  const nav=useNavigate();
  const teacherToken=useAppStore(state=>state.teacherToken);
  const teacher=useAppStore(state=>state.teacher);
  const setTeacherSession=useAppStore(state=>state.setTeacherSession);
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);

  if(teacherToken&&teacher)return <Navigate to={teacher.role==='ADMIN'?'/professor/administracao':'/professor/painel'} replace/>;

  async function submit(e:FormEvent){
    e.preventDefault();
    try{
      setLoading(true);setMessage('');
      const session=await api.teacherLogin({email,password});
      setTeacherSession(session.token,session.teacher);
      nav(session.teacher.role==='ADMIN'?'/professor/administracao':'/professor/painel');
    }catch(err){setMessage(err instanceof Error?err.message:'Não foi possível entrar.')}
    finally{setLoading(false)}
  }

  return <div className="public-page"><PublicHeader/><section className="teacher-auth"><div><Pill tone="purple">Portal do professor</Pill><h1>Acompanhe seus alunos com clareza.</h1><p>Resultados, níveis, histórico e evolução pedagógica com uma visão organizada e rápida.</p><Owl mode="study"/></div><Surface className="auth-card"><h2>Entrar no painel</h2><p className="muted">Use sua conta de professor ou administrador.</p><form onSubmit={submit}><Field label="E-mail" value={email} onChange={setEmail} type="email" placeholder="professor@escola.com" required/><Field label="Senha" value={password} onChange={setPassword} type="password" placeholder="Sua senha" required/><Button disabled={loading} type="submit" className="full">{loading?'Entrando...':'Entrar no painel'} <ArrowRight size={17}/></Button></form><div className="demo-note"><b>Administrador de estudos:</b> administrador@adm.com / admin123</div></Surface></section>{message&&<Toast message={message} tone="error"/>}</div>
}

export function TeacherDashboard(){
  const nav=useNavigate();
  const teacher=useAppStore(state=>state.teacher);
  const {token,data,loading,error}=useDashboard();
  const [query,setQuery]=useState('');
  const [message,setMessage]=useState('');

  if(!token)return <Navigate to="/professor" replace/>;
  const attempts=data?.attempts??[];
  const filtered=attempts.filter(item=>String(item.studentName??'').toLowerCase().includes(query.toLowerCase())||String(item.studentEmail??'').toLowerCase().includes(query.toLowerCase())||String(item.cefrLevel??'').toLowerCase().includes(query.toLowerCase()));

  const categoryAverage=(category:string)=>{
    const values=attempts.flatMap(item=>item.breakdown??[]).filter(item=>item.category===category).map(item=>item.percentage);
    return values.length?Math.round(values.reduce((s,v)=>s+v,0)/values.length):0;
  };
  const lowest=(['GRAMMAR','VOCABULARY','LISTENING'] as const).map(category=>({category,value:categoryAverage(category)})).sort((a,b)=>a.value-b.value)[0];

  async function exportCsv(){
    if(!token)return;
    try{await api.exportTeacherCsv(token);setMessage('CSV gerado com sucesso.')}catch(err){setMessage(err instanceof Error?err.message:'Não foi possível exportar.')}
  }

  return <Workspace area="teacher"><div className="workspace-heading"><div><small>Portal do professor</small><h1>Visão pedagógica</h1><p>Resultados e evolução dos alunos vinculados ao seu acesso.</p></div><div className="heading-actions">{teacher?.role==='ADMIN'&&<Button variant="secondary" onClick={()=>nav('/professor/administracao')}><ShieldCheck size={17}/> Administração</Button>}<Button variant="secondary" onClick={exportCsv}><Download size={17}/> Exportar CSV</Button></div></div><div className="stat-grid"><Stat label="Avaliações" value={data?.metrics.totalAssessments??0} tone="pink"/><Stat label="Alunos" value={data?.metrics.uniqueStudents??0} tone="teal"/><Stat label="Média geral" value={(data?.metrics.averageScore??0)+'%'} tone="purple"/><Stat label="Último nível" value={data?.metrics.latestLevel??'—'} tone="orange"/></div><div className="dashboard-grid"><Surface className="chart-card"><div className="section-title"><div><small>Distribuição</small><h2>Níveis dos alunos</h2></div></div><div className="bar-chart">{(data?.levelDistribution??[]).map(item=><div key={item.level}><i style={{height:Math.max(10,Math.min(100,item.count*16))+'%'}}/><b>{item.level}</b><span>{item.count}</span></div>)}</div></Surface><Surface className="recommendations"><div className="section-title"><div><small>Insights</small><h2>Atenção pedagógica</h2></div></div><div className="insight"><b>{lowest?.category==='GRAMMAR'?'Gramática':lowest?.category==='VOCABULARY'?'Vocabulário':'Listening'}</b><span>Habilidade com menor média recente.</span><Pill tone="orange">{lowest?.value??0}%</Pill></div><div className="insight"><b>{data?.metrics.uniqueStudents??0} alunos</b><span>Com resultados disponíveis para acompanhamento.</span><Pill tone="pink">Acompanhar</Pill></div><div className="insight"><b>{data?.metrics.latestLevel??'—'}</b><span>Nível da avaliação mais recente.</span><Pill tone="teal">Recente</Pill></div></Surface></div><Surface className="history-table"><div className="section-title"><div><small>Alunos</small><h2>Avaliações recentes</h2></div><label className="search-box"><Search size={16}/><input placeholder="Buscar aluno, e-mail ou nível" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>{loading?<p className="muted">Carregando avaliações...</p>:filtered.length?<div className="table"><div className="table__head"><span>Aluno</span><span>Data</span><span>Nível</span><span>Nota</span><span>Ações</span></div>{filtered.slice(0,10).map(item=><div className="table__row" key={item.id}><span><b>{item.studentName??'Aluno'}</b><small>{item.studentEmail??'Sem e-mail'}</small></span><span>{item.completedAt?new Date(item.completedAt).toLocaleDateString('pt-BR'):'—'}</span><span><Pill tone="teal">{item.cefrLevel??'—'}</Pill></span><strong>{item.score??0}%</strong><Button variant="ghost" onClick={()=>nav('/professor/aluno/'+item.id)}>Abrir</Button></div>)}</div>:<Empty title="Nenhuma avaliação encontrada" description="Quando seus alunos concluírem avaliações, elas aparecerão aqui."/>}</Surface>{error&&<Toast message={error} tone="error"/>}{message&&<Toast message={message}/>}</Workspace>
}

export function TeacherStudents(){
  const nav=useNavigate();
  const {token,data,loading,error}=useDashboard();
  const [query,setQuery]=useState('');
  if(!token)return <Navigate to="/professor" replace/>;

  const students=useMemo(()=>{
    const map=new Map<string,{key:string;name:string;email:string;attempts:TeacherAttempt[]}>();
    for(const attempt of data?.attempts??[]){
      const key=(attempt.studentEmail||attempt.studentName||attempt.id).toLowerCase();
      const current=map.get(key)??{key,name:attempt.studentName??'Aluno',email:attempt.studentEmail??'',attempts:[]};
      current.attempts.push(attempt);map.set(key,current);
    }
    return [...map.values()].filter(item=>(item.name+' '+item.email).toLowerCase().includes(query.toLowerCase()));
  },[data,query]);

  return <Workspace area="teacher"><div className="workspace-heading"><div><small>Alunos</small><h1>Visão por aluno</h1><p>Acompanhe quantidade de testes, média e último nível de cada aluno.</p></div></div><Surface className="history-table"><div className="section-title"><div><small>Base vinculada</small><h2>{students.length} aluno(s)</h2></div><label className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar aluno ou e-mail"/></label></div>{loading?<p className="muted">Carregando alunos...</p>:students.length?<div className="table"><div className="table__head"><span>Aluno</span><span>Testes</span><span>Nível recente</span><span>Média</span><span>Ação</span></div>{students.map(student=>{const latest=student.attempts[0];const avg=Math.round(student.attempts.reduce((s,a)=>s+(a.score??0),0)/student.attempts.length);return <div className="table__row" key={student.key}><span><b>{student.name}</b><small>{student.email||'Sem e-mail'}</small></span><strong>{student.attempts.length}</strong><span><Pill tone="teal">{latest.cefrLevel??'—'}</Pill></span><strong>{avg}%</strong><Button variant="ghost" onClick={()=>nav('/professor/aluno/'+latest.id)}>Abrir</Button></div>})}</div>:<Empty title="Nenhum aluno encontrado" description="Tente ajustar sua pesquisa ou aguarde novas avaliações."/>}</Surface>{error&&<Toast message={error} tone="error"/>}</Workspace>
}

export function TeacherAssessments(){
  const nav=useNavigate();
  const {token,data,loading,error,reload}=useDashboard();
  const [query,setQuery]=useState('');
  const [message,setMessage]=useState('');
  if(!token)return <Navigate to="/professor" replace/>;
  const filtered=(data?.attempts??[]).filter(item=>(String(item.studentName??'')+' '+String(item.studentEmail??'')+' '+String(item.cefrLevel??'')).toLowerCase().includes(query.toLowerCase()));

  async function remove(item:TeacherAttempt){
    if(!confirm('Excluir esta avaliação? Esta ação não pode ser desfeita.'))return;
    try{await api.deleteTeacherAttempt(token,item.id);setMessage('Avaliação excluída.');reload()}catch(err){setMessage(err instanceof Error?err.message:'Não foi possível excluir.')}
  }
  async function clearAll(){
    if(!confirm('Excluir todas as avaliações listadas para este professor?'))return;
    try{const result=await api.clearTeacherAttempts(token);setMessage(result.message);reload()}catch(err){setMessage(err instanceof Error?err.message:'Não foi possível limpar as avaliações.')}
  }

  return <Workspace area="teacher"><div className="workspace-heading"><div><small>Avaliações</small><h1>Histórico pedagógico</h1><p>Consulte, abra ou remova avaliações vinculadas à sua conta.</p></div><div className="heading-actions"><Button variant="danger" onClick={clearAll}><Trash2 size={17}/> Limpar avaliações</Button></div></div><Surface className="history-table"><div className="section-title"><div><small>Resultados</small><h2>{filtered.length} avaliação(ões)</h2></div><label className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar aluno, e-mail ou nível"/></label></div>{loading?<p className="muted">Carregando...</p>:filtered.length?<div className="table"><div className="table__head"><span>Aluno</span><span>Data</span><span>Nível</span><span>Nota</span><span>Ações</span></div>{filtered.map(item=><div className="table__row" key={item.id}><span><b>{item.studentName??'Aluno'}</b><small>{item.studentEmail??'Sem e-mail'}</small></span><span>{item.completedAt?new Date(item.completedAt).toLocaleDateString('pt-BR'):'—'}</span><span><Pill tone="teal">{item.cefrLevel??'—'}</Pill></span><strong>{item.score??0}%</strong><span className="row-actions"><button onClick={()=>nav('/professor/aluno/'+item.id)} title="Abrir"><FileText size={15}/></button><button className="danger" onClick={()=>remove(item)} title="Excluir"><Trash2 size={15}/></button></span></div>)}</div>:<Empty title="Nenhuma avaliação" description="Não existem avaliações correspondentes à busca."/>}</Surface>{error&&<Toast message={error} tone="error"/>}{message&&<Toast message={message}/>}</Workspace>
}

export function TeacherStudentDetail(){
  const token=useAppStore(state=>state.teacherToken);
  const {attemptId}=useParams();
  const nav=useNavigate();
  const [attempt,setAttempt]=useState<TeacherAttemptDetail|null>(null);
  const [edit,setEdit]=useState(false);
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');

  const load=()=>{
    if(!token||!attemptId)return;
    api.getTeacherAttempt(token,attemptId).then(data=>{setAttempt(data);setName(data.studentName??'');setEmail(data.studentEmail??'')}).catch(err=>setError(err instanceof Error?err.message:'Não foi possível carregar a avaliação.'));
  };
  useEffect(load,[token,attemptId]);

  if(!token)return <Navigate to="/professor" replace/>;
  if(!attempt)return <Workspace area="teacher">{error?<Empty title="Avaliação indisponível" description={error} action={<Button onClick={()=>nav('/professor/painel')}>Voltar ao painel</Button>}/>:<Surface className="loading-card">Carregando avaliação...</Surface>}</Workspace>;

  async function save(){
    if(!token||!attemptId)return;
    try{const response=await api.updateTeacherAttempt(token,attemptId,{studentName:name,studentEmail:email});setAttempt(current=>current?{...current,...response.attempt}:current);setEdit(false);setMessage('Identificação atualizada.')}catch(err){setError(err instanceof Error?err.message:'Não foi possível salvar.')}
  }
  async function remove(){
    if(!token||!attemptId||!confirm('Excluir definitivamente esta avaliação?'))return;
    try{await api.deleteTeacherAttempt(token,attemptId);nav('/professor/avaliacoes')}catch(err){setError(err instanceof Error?err.message:'Não foi possível excluir.')}
  }

  return <Workspace area="teacher"><div className="workspace-heading"><div><small>Detalhes do aluno</small><h1>{name}</h1><p>{email||'Sem e-mail'} • Espanhol • {attempt.completedAt?new Date(attempt.completedAt).toLocaleDateString('pt-BR'):'—'}</p></div><div className="heading-actions"><Button variant="secondary" onClick={()=>setEdit(!edit)}><Pencil size={17}/> Editar identificação</Button><Button variant="secondary" onClick={()=>window.print()}><FileText size={17}/> Imprimir / PDF</Button><Button variant="danger" onClick={remove}><Trash2 size={17}/> Excluir avaliação</Button></div></div>{edit&&<Surface className="inline-edit"><Field label="Nome" value={name} onChange={setName}/><Field label="E-mail" value={email} onChange={setEmail}/><Button onClick={save}>Salvar</Button></Surface>}<div className="detail-grid"><Surface className="level-card compact"><small>Resultado</small><strong>{attempt.cefrLevel??'—'}</strong><b>{attempt.score??0}%</b><span>Pontuação geral</span></Surface><Surface><h2>Desempenho por habilidade</h2>{(attempt.breakdown??[]).map(item=><div className="result-skill" key={item.category}><div><b>{item.label}</b><span>{item.percentage}%</span></div><div className="bar bar--teal"><i style={{width:item.percentage+'%'}}/></div></div>)}</Surface></div><Surface className="answer-audit"><div className="section-title"><div><small>Correção</small><h2>Respostas da avaliação</h2></div><Button variant="secondary" onClick={()=>window.print()}><FileText size={17}/> Gerar relatório</Button></div>{attempt.answers.map((answer,index)=><div className="answer-audit__row" key={index}><div><Pill tone={answer.isCorrect?'purple':'pink'}>{answer.category==='GRAMMAR'?'Gramática':answer.category==='VOCABULARY'?'Vocabulário':'Listening'}</Pill><b>{answer.question}</b></div><span>{answer.selectedAnswer}</span><Pill tone={answer.isCorrect?'teal':'danger'}>{answer.isCorrect?'Correta':'Revisar'}</Pill></div>)}</Surface>{message&&<Toast message={message}/>} {error&&<Toast message={error} tone="error"/>}</Workspace>
}

export function TeacherReports(){
  const token=useAppStore(state=>state.teacherToken);
  const teacher=useAppStore(state=>state.teacher);
  const [data,setData]=useState<TeacherReportsData|null>(null);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  useEffect(()=>{if(token)api.getTeacherReports(token).then(setData).catch(err=>setError(err instanceof Error?err.message:'Não foi possível carregar os relatórios.'))},[token]);
  if(!token)return <Navigate to="/professor" replace/>;

  async function exportCsv(){
    try{await api.exportTeacherCsv(token);setMessage('Arquivo CSV gerado.')}catch(err){setError(err instanceof Error?err.message:'Não foi possível exportar.')}
  }

  return <Workspace area={teacher?.role==='ADMIN'?'admin':'teacher'}><div className="workspace-heading"><div><small>Relatórios e Analytics</small><h1>Dados para acompanhamento</h1><p>Tendências, níveis e habilidades consolidadas das avaliações.</p></div><Button variant="secondary" onClick={exportCsv}><Download size={17}/> Exportar CSV</Button></div><div className="stat-grid"><Stat label="Avaliações" value={data?.metrics.totalAssessments??0} tone="pink"/><Stat label="Alunos únicos" value={data?.metrics.uniqueStudents??0} tone="teal"/><Stat label="Média geral" value={(data?.metrics.averageScore??0)+'%'} tone="purple"/><Stat label="Concluídas" value={(data?.metrics.completionRate??0)+'%'} tone="orange"/></div><div className="dashboard-grid"><Surface className="chart-card"><div className="section-title"><div><small>Últimos 6 meses</small><h2>Evolução da média</h2></div></div><div className="report-trend">{(data?.trend??[]).map(item=><div key={item.key}><span>{item.averageScore}%</span><i style={{height:Math.max(8,item.averageScore)+'%'}}/><b>{item.label}</b><small>{item.assessments} teste(s)</small></div>)}</div></Surface><Surface className="recommendations"><div className="section-title"><div><small>Habilidades</small><h2>Médias por categoria</h2></div></div>{(data?.categoryAverages??[]).map(item=><div className="result-skill" key={item.category}><div><b>{item.category==='GRAMMAR'?'Gramática':item.category==='VOCABULARY'?'Vocabulário':'Listening'}</b><span>{item.average}%</span></div><div className="bar bar--teal"><i style={{width:item.average+'%'}}/></div></div>)}</Surface></div><Surface className="history-table"><div className="section-title"><div><small>Distribuição</small><h2>Níveis CEFR</h2></div></div><div className="level-report-grid">{(data?.levelDistribution??[]).map(item=><div key={item.level}><Pill tone="purple">{item.level}</Pill><strong>{item.count}</strong><span>avaliação(ões)</span></div>)}</div></Surface>{error&&<Toast message={error} tone="error"/>}{message&&<Toast message={message}/>}</Workspace>
}

export function TeacherSettings(){
  const token=useAppStore(state=>state.teacherToken);
  const teacher=useAppStore(state=>state.teacher);
  const updateTeacher=useAppStore(state=>state.updateTeacher);
  const [name,setName]=useState(teacher?.name??'');
  const [email,setEmail]=useState(teacher?.email??'');
  const [compact,setCompact]=useState(teacher?.compactMode??false);
  const [rememberFilters,setRememberFilters]=useState(teacher?.rememberFilters??true);
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');

  useEffect(()=>{if(token)api.getTeacherProfile(token).then(({teacher})=>{updateTeacher(teacher);setName(teacher.name);setEmail(teacher.email);setCompact(teacher.compactMode??false);setRememberFilters(teacher.rememberFilters??true)}).catch(()=>{})},[token]);

  if(!token||!teacher)return <Navigate to="/professor" replace/>;

  async function saveProfile(){
    try{const response=await api.updateTeacherProfile(token,{name,email});updateTeacher({...teacher,...response.teacher});setMessage('Conta atualizada.')}catch(err){setError(err instanceof Error?err.message:'Não foi possível atualizar a conta.')}
  }
  async function savePassword(){
    if(!currentPassword||newPassword.length<8){setError('Informe a senha atual e uma nova senha com pelo menos 8 caracteres.');return}
    try{await api.changeTeacherPassword(token,{currentPassword,newPassword});setCurrentPassword('');setNewPassword('');setMessage('Senha alterada. Outras sessões foram encerradas.')}catch(err){setError(err instanceof Error?err.message:'Não foi possível alterar a senha.')}
  }
  async function updatePreferences(next:{compactMode?:boolean;rememberFilters?:boolean}){
    try{const response=await api.updateTeacherPreferences(token,next);setCompact(response.preferences.compactMode);setRememberFilters(response.preferences.rememberFilters);updateTeacher({...teacher,...response.preferences});setMessage('Preferências atualizadas.')}catch(err){setError(err instanceof Error?err.message:'Não foi possível atualizar as preferências.')}
  }

  return <Workspace area={teacher.role==='ADMIN'?'admin':'teacher'}><div className="workspace-heading"><div><small>Configurações</small><h1>Conta e preferências</h1><p>Dados do perfil, segurança e experiência do painel.</p></div></div><div className="profile-grid"><Surface className="profile-card"><div className="profile-avatar">{name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}</div><h2>{name}</h2><p>{email}</p><Pill tone={teacher.role==='ADMIN'?'pink':'teal'}>{teacher.role==='ADMIN'?'Administrador':'Professor'}</Pill></Surface><Surface className="settings-card"><h2>Informações da conta</h2><Field label="Nome" value={name} onChange={setName}/><Field label="E-mail" value={email} onChange={setEmail}/><Button onClick={saveProfile}>Salvar alterações</Button><hr/><h2>Segurança</h2><Field label="Senha atual" value={currentPassword} onChange={setCurrentPassword} type="password"/><Field label="Nova senha" value={newPassword} onChange={setNewPassword} type="password" placeholder="Mínimo de 8 caracteres"/><Button variant="secondary" onClick={savePassword}><KeyRound size={17}/> Alterar senha</Button><hr/><div className="toggle-row"><div><UserCog size={19}/><span><b>Modo compacto de tabelas</b><small>Guarda sua preferência para exibir dados de forma mais densa.</small></span></div><button type="button" aria-pressed={compact} className={'switch '+(compact?'on':'')} onClick={()=>updatePreferences({compactMode:!compact})}><i/></button></div><div className="toggle-row"><div><Filter size={19}/><span><b>Lembrar filtros</b><small>Mantém sua preferência de navegação e filtros.</small></span></div><button type="button" aria-pressed={rememberFilters} className={'switch '+(rememberFilters?'on':'')} onClick={()=>updatePreferences({rememberFilters:!rememberFilters})}><i/></button></div></Surface></div>{message&&<Toast message={message}/>} {error&&<Toast message={error} tone="error"/>}</Workspace>
}
