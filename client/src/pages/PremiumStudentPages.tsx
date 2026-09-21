import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  KeyRound,
  LogOut,
  Save,
  Sparkles,
} from 'lucide-react';
import { Owl } from '../components/Brand';
import { Button, Empty, Field, Pill, Stat, Surface, Toast } from '../components/UI';
import { Workspace } from '../components/Shell';
import { api, type TestResult } from '../services/api';
import { useAppStore } from '../store/useAppStore';

const categoryLabel:Record<string,string>={
  GRAMMAR:'Gramática',
  VOCABULARY:'Vocabulário',
  LISTENING:'Listening',
};

export function ResultPage(){
  const nav=useNavigate();
  const {attemptId}=useParams();
  const token=useAppStore(state=>state.token);
  const [result,setResult]=useState<TestResult|null>(null);
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    if(!token||!attemptId)return;
    let active=true;
    api.getResult(token,attemptId).then(data=>active&&setResult(data)).catch(err=>active&&setMessage(err instanceof Error?err.message:'Resultado não encontrado.')).finally(()=>active&&setLoading(false));
    return()=>{active=false};
  },[token,attemptId]);

  if(!token)return <Navigate to="/" replace/>;
  if(loading)return <div className="public-page result-page"><Surface className="loading-card">Carregando seu resultado...</Surface></div>;
  if(!result)return <div className="public-page result-page"><Empty title="Resultado indisponível" description={message||'Não foi possível carregar esta avaliação.'} action={<Button onClick={()=>nav('/dashboard')}>Voltar ao histórico</Button>}/></div>;

  const next=result.recommendations?.[0];

  return <div className="public-page result-page"><section className="result-hero"><div><Pill tone="teal">Avaliação concluída</Pill><h1>Seu resultado chegou ✦</h1><p>Uma leitura simples do seu desempenho, com próximos passos práticos para continuar evoluindo.</p></div><Owl mode="celebrate"/></section><div className="result-grid"><Surface className="level-card"><small>Seu nível é</small><strong>{result.cefrLevel}</strong><b>{result.score}%</b><span>Pontuação geral</span><div className="progress-track"><i style={{width:result.score+'%'}}/></div><Button variant="secondary" className="full" onClick={()=>nav('/dashboard')}>Ver meu histórico <ArrowRight size={17}/></Button></Surface><div className="result-stack"><Surface><h3>Desempenho por habilidade</h3>{result.breakdown.map((item,index)=><div className="result-skill" key={item.category}><div><b>{item.label}</b><span>{item.percentage}%</span></div><div className={'bar bar--'+(['pink','teal','orange'][index%3])}><i style={{width:item.percentage+'%'}}/></div></div>)}</Surface><Surface className="next-step"><Sparkles/><div><h3>Próximo passo recomendado</h3><p>{next?.description??'Continue praticando para consolidar seu nível atual.'}</p><Pill tone="teal">{next?.title??('Plano '+result.cefrLevel)}</Pill></div></Surface></div></div>{message&&<Toast message={message} tone="error"/>}</div>
}

function useHistory(){
  const token=useAppStore(state=>state.token);
  const [attempts,setAttempts]=useState<TestResult[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  useEffect(()=>{
    if(!token){setLoading(false);return}
    let active=true;
    api.getHistory(token).then(({attempts})=>active&&setAttempts(attempts)).catch(err=>active&&setError(err instanceof Error?err.message:'Não foi possível carregar o histórico.')).finally(()=>active&&setLoading(false));
    return()=>{active=false};
  },[token]);
  return {attempts,loading,error};
}

export function StudentDashboard(){
  const nav=useNavigate();
  const user=useAppStore(state=>state.user);
  const token=useAppStore(state=>state.token);
  const {attempts,loading,error}=useHistory();
  const [message,setMessage]=useState('');

  if(!token)return <Navigate to="/" replace/>;

  const latest=attempts[0];
  const average=Math.round(attempts.reduce((sum,item)=>sum+item.score,0)/Math.max(1,attempts.length));
  const categoryValues=attempts.flatMap(item=>item.breakdown??[]);
  const categoryAverage=(category:string)=>{
    const values=categoryValues.filter(item=>item.category===category).map(item=>item.percentage);
    return values.length?Math.round(values.reduce((s,v)=>s+v,0)/values.length):0;
  };
  const best=(['GRAMMAR','VOCABULARY','LISTENING'] as const)
    .map(category=>({category,value:categoryAverage(category)}))
    .sort((a,b)=>b.value-a.value)[0];

  const recent=[...attempts].slice(0,5).reverse();

  return <Workspace area="student"><div className="workspace-heading"><div><small>Seu progresso</small><h1>Olá, {user?.name?.split(' ')[0] || 'aluno'}</h1><p>Seu histórico e evolução em um só lugar.</p></div><Button onClick={()=>nav('/language')}>Nova avaliação <ArrowRight size={17}/></Button></div><div className="stat-grid"><Stat label="Último nível" value={latest?.cefrLevel ?? '—'} sub="Avaliação mais recente" tone="pink"/><Stat label="Média geral" value={attempts.length?average+'%':'—'} sub="Todas as avaliações" tone="teal"/><Stat label="Avaliações" value={attempts.length} sub="Histórico completo" tone="orange"/><Stat label="Melhor habilidade" value={best?.value?categoryLabel[best.category]:'—'} sub={best?.value?best.value+'% de acerto':'Faça sua primeira prova'} tone="purple"/></div><div className="dashboard-grid"><Surface className="chart-card"><div className="section-title"><div><small>Histórico</small><h2>Evolução das avaliações</h2></div><Pill tone="neutral">Últimas avaliações</Pill></div>{loading?<p className="muted">Carregando evolução...</p>:recent.length?<div className="fake-chart"><div className="chart-line">{recent.map((item,index)=><i key={item.id??item.attemptId??index} style={{left:(5+index*(90/Math.max(1,recent.length-1)))+'%',bottom:Math.max(8,item.score*.72)+'%'}}/>)}</div><div className="chart-axis">{recent.map((item,index)=><span key={item.id??item.attemptId??index}>{item.cefrLevel}</span>)}</div></div>:<Empty title="Sem avaliações ainda" description="Faça seu primeiro nivelamento para começar a acompanhar sua evolução."/>}</Surface><Surface className="recommendations"><div className="section-title"><div><small>Plano de estudo</small><h2>Próximos passos</h2></div></div>{(latest?.recommendations?.length?latest.recommendations:[
    {title:'Listening guiado',description:'Comece uma nova avaliação para receber recomendações personalizadas.',tag:'12 min'},
    {title:'Revisão de gramática',description:'Pratique estruturas essenciais.',tag:'8 min'},
    {title:'Vocabulário ativo',description:'Amplie seu repertório.',tag:'10 min'},
  ]).slice(0,3).map((item,index)=><button className="recommendation" key={item.title} onClick={()=>setMessage(item.description)}><span className={'rec-dot rec-dot--'+(['teal','pink','orange'][index%3])}/><div><b>{item.title}</b><span>{item.tag}</span></div><ArrowRight size={16}/></button>)}</Surface></div><Surface className="history-table"><div className="section-title"><div><small>Avaliações</small><h2>Histórico recente</h2></div><Button variant="ghost" onClick={()=>nav('/student/history')}>Ver tudo</Button></div>{attempts.length?<div className="table"><div className="table__head"><span>Data</span><span>Professor</span><span>Nível</span><span>Nota</span><span/></div>{attempts.slice(0,5).map((item,index)=><div className="table__row" key={item.id??item.attemptId??index}><span>{item.completedAt?new Date(item.completedAt).toLocaleDateString('pt-BR'):'—'}</span><span>{item.teacher?.name??'—'}</span><span><Pill tone="teal">{item.cefrLevel}</Pill></span><strong>{item.score}%</strong><Button variant="ghost" onClick={()=>nav('/result/'+(item.id??item.attemptId))}>Detalhes</Button></div>)}</div>:<Empty title="Seu histórico está vazio" description="Quando você concluir uma avaliação, ela aparecerá aqui." action={<Button onClick={()=>nav('/language')}>Começar avaliação</Button>}/>}</Surface>{error&&<Toast message={error} tone="error"/>}{message&&<Toast message={message}/>}</Workspace>
}

export function StudentHistory(){
  const nav=useNavigate();
  const token=useAppStore(state=>state.token);
  const {attempts,loading,error}=useHistory();
  if(!token)return <Navigate to="/" replace/>;
  return <Workspace area="student"><div className="workspace-heading"><div><small>Meus testes</small><h1>Histórico completo</h1><p>Todas as avaliações concluídas e seus resultados.</p></div><Button onClick={()=>nav('/language')}>Nova avaliação <ArrowRight size={17}/></Button></div><Surface className="history-table">{loading?<p className="muted">Carregando histórico...</p>:attempts.length?<div className="table"><div className="table__head"><span>Data</span><span>Professor</span><span>Nível</span><span>Nota</span><span>Ação</span></div>{attempts.map((item,index)=><div className="table__row" key={item.id??item.attemptId??index}><span>{item.completedAt?new Date(item.completedAt).toLocaleDateString('pt-BR'):'—'}</span><span>{item.teacher?.name??'—'}</span><span><Pill tone="teal">{item.cefrLevel}</Pill></span><strong>{item.score}%</strong><Button variant="ghost" onClick={()=>nav('/result/'+(item.id??item.attemptId))}>Ver resultado</Button></div>)}</div>:<Empty title="Nenhuma avaliação concluída" description="Seu histórico começará a ser construído após o primeiro teste." action={<Button onClick={()=>nav('/language')}>Começar agora</Button>}/>}</Surface>{error&&<Toast message={error} tone="error"/>}</Workspace>
}

export function StudentProfile(){
  const nav=useNavigate();
  const token=useAppStore(state=>state.token);
  const user=useAppStore(state=>state.user);
  const updateUser=useAppStore(state=>state.updateUser);
  const clearSession=useAppStore(state=>state.clearSession);
  const [name,setName]=useState(user?.name??'');
  const [email,setEmail]=useState(user?.email??'');
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [notifications,setNotifications]=useState(user?.notificationsEnabled??true);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  useEffect(()=>{
    if(!token||!user)return;
    api.getStudentProfile(token).then(({user})=>{updateUser(user);setName(user.name);setEmail(user.email);setNotifications(user.notificationsEnabled??true)}).catch(()=>{});
  },[token]);

  if(!token)return <Navigate to="/" replace/>;
  if(!user)return <Workspace area="student"><Empty title="Perfil indisponível para visitante" description="Crie uma conta para salvar seus dados, preferências e histórico entre dispositivos." action={<Button onClick={()=>nav('/login')}>Criar conta</Button>}/></Workspace>;

  async function saveProfile(){
    try{
      setLoading(true);setError('');
      const response=await api.updateStudentProfile(token!,{name,email});
      updateUser({...user!,...response.user});
      setMessage('Perfil atualizado com sucesso.');
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível atualizar o perfil.')}
    finally{setLoading(false)}
  }

  async function savePassword(){
    if(!currentPassword||newPassword.length<8){setError('Informe a senha atual e uma nova senha com pelo menos 8 caracteres.');return}
    try{
      setLoading(true);setError('');
      await api.changeStudentPassword(token!,{currentPassword,newPassword});
      setCurrentPassword('');setNewPassword('');
      setMessage('Senha atualizada. As outras sessões foram encerradas.');
    }catch(err){setError(err instanceof Error?err.message:'Não foi possível alterar a senha.')}
    finally{setLoading(false)}
  }

  async function toggleNotifications(){
    try{
      const next=!notifications;
      setNotifications(next);
      await api.updateStudentPreferences(token!,next);
      updateUser({...user!,notificationsEnabled:next});
      setMessage('Preferência de notificações atualizada.');
    }catch(err){
      setNotifications(notifications);
      setError(err instanceof Error?err.message:'Não foi possível alterar a preferência.');
    }
  }

  async function logout(){
    try{await api.logout(token!)}catch{}
    clearSession();nav('/');
  }

  return <Workspace area="student"><div className="workspace-heading"><div><small>Minha conta</small><h1>Perfil e preferências</h1><p>Gerencie seus dados, senha e preferências de experiência.</p></div></div><div className="profile-grid"><Surface className="profile-card"><div className="profile-avatar">{name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}</div><h2>{name}</h2><p>{email}</p><Pill tone="teal">Aluno ativo</Pill><Button variant="danger" className="full" onClick={logout}><LogOut size={17}/> Sair da conta</Button></Surface><Surface className="settings-card"><h2>Informações pessoais</h2><Field label="Nome" value={name} onChange={setName}/><Field label="E-mail" value={email} onChange={setEmail} type="email"/><Button disabled={loading} onClick={saveProfile}><Save size={17}/> Salvar perfil</Button><hr/><h2>Segurança</h2><Field label="Senha atual" value={currentPassword} onChange={setCurrentPassword} type="password" placeholder="Sua senha atual"/><Field label="Nova senha" value={newPassword} onChange={setNewPassword} type="password" placeholder="Mínimo de 8 caracteres"/><Button disabled={loading} variant="secondary" onClick={savePassword}><KeyRound size={17}/> Alterar senha</Button><hr/><div className="toggle-row"><div><Bell size={19}/><span><b>Notificações de progresso</b><small>Guarde sua preferência de lembretes e novidades.</small></span></div><button type="button" aria-pressed={notifications} className={'switch '+(notifications?'on':'')} onClick={toggleNotifications}><i/></button></div></Surface></div>{message&&<Toast message={message}/>} {error&&<Toast message={error} tone="error"/>}</Workspace>
}

export function HelpPage(){
  const nav=useNavigate();
  return <Workspace area="student"><div className="workspace-heading"><div><small>Ajuda</small><h1>Como podemos ajudar?</h1><p>Respostas rápidas sobre avaliação, níveis, áudio e acesso.</p></div></div><div className="help-grid">{[
    ['Como funciona o nivelamento?','Você responde de 15 a 20 questões de gramática, vocabulário e listening. O resultado é calculado ao finalizar.'],
    ['O resultado é uma certificação oficial?','Não. O nível A1–C2 é uma referência educacional usada neste projeto de estudos.'],
    ['Posso refazer a avaliação?','Sim. Use o botão Nova avaliação no painel para gerar uma nova tentativa.'],
    ['O áudio não reproduziu. O que faço?','Verifique o volume do dispositivo, permita reprodução de mídia no navegador e tente novamente.'],
  ].map(([title,description])=><Surface className="help-card" key={title}><CheckCircle2/><h3>{title}</h3><p>{description}</p></Surface>)}</div><Surface className="help-cta"><div><h2>Quer fazer uma nova avaliação?</h2><p>Você pode iniciar outro nivelamento a qualquer momento.</p></div><Button onClick={()=>nav('/language')}>Começar agora <ArrowRight size={17}/></Button></Surface></Workspace>
}
