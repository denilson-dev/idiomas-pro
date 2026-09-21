import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Headphones,
  LogIn,
  School,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Owl } from '../components/Brand';
import { Button, Empty, Field, Pill, Surface, Toast } from '../components/UI';
import { PublicHeader } from '../components/Shell';
import { api, type TeacherOption } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export function WelcomePage(){
  const nav=useNavigate();
  const setSession=useAppStore(state=>state.setSession);
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState('');

  async function startAnonymous(){
    try{
      setLoading(true);setMessage('');
      const session=await api.createAnonymousSession();
      setSession(session.token,session.user);
      nav('/language');
    }catch(err){
      setMessage(err instanceof Error?err.message:'Não foi possível iniciar a avaliação.');
    }finally{setLoading(false)}
  }

  return <div className="public-page"><PublicHeader/><section className="hero-grid">
    <div className="hero-copy"><Pill tone="purple"><BookOpen size={14}/> Teste de nivelamento</Pill><h1><span>Descubra seu</span><span className="accent-teal">próximo nível</span></h1><p>Uma experiência moderna e acolhedora para descobrir seu nível, entender seu desempenho e transformar resultado em próximo passo.</p>
      <div className="feature-row"><Surface className="feature-card"><ShieldCheck/><b>Resultado na hora</b><span>Seu nível ao finalizar.</span></Surface><Surface className="feature-card"><Headphones/><b>Listening guiado</b><span>Ouça no seu ritmo.</span></Surface><Surface className="feature-card"><Sparkles/><b>A1 até C2</b><span>Leitura clara do nível.</span></Surface></div>
      <div className="hero-actions"><Button disabled={loading} onClick={startAnonymous}>{loading?'Preparando...':'Começar avaliação'} <ArrowRight size={18}/></Button><Button variant="secondary" onClick={()=>nav('/login')}><LogIn size={18}/> Entrar na conta</Button></div>
      <Button variant="ghost" className="teacher-link" onClick={()=>nav('/professor')}><School size={18}/> Área exclusiva do professor</Button>
    </div><div className="hero-visual"><div className="hero-glow"/><div className="scribble">Vamos descobrir juntos? ♡</div><Owl mode="celebrate"/><Surface className="level-strip"><b>A1</b><b>B1</b><b>C2</b><span>Seu próximo passo começa aqui.</span></Surface></div>
  </section>{message&&<Toast message={message} tone="error"/>}</div>
}

export function AuthPage(){
  const nav=useNavigate();
  const token=useAppStore(state=>state.token);
  const user=useAppStore(state=>state.user);
  const setSession=useAppStore(state=>state.setSession);
  const [mode,setMode]=useState<'login'|'register'>('login');
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);

  if(token&&user)return <Navigate to="/dashboard" replace/>;

  async function submit(e:FormEvent){
    e.preventDefault();
    try{
      setLoading(true);setMessage('');
      const session=mode==='login'
        ? await api.login({email,password})
        : await api.register({name,email,password});
      setSession(session.token,session.user);
      nav('/language');
    }catch(err){setMessage(err instanceof Error?err.message:'Não foi possível continuar.')}
    finally{setLoading(false)}
  }

  async function demo(){
    try{
      setLoading(true);setMessage('');
      const session=await api.login({email:'aluno@idiomaspro.com',password:'Teste123!'});
      setSession(session.token,session.user);
      nav('/dashboard');
    }catch(err){setMessage(err instanceof Error?err.message:'A conta de demonstração não está disponível.')}
    finally{setLoading(false)}
  }

  return <div className="public-page"><PublicHeader/><section className="auth-layout"><div className="auth-story"><Pill tone="teal">Experiência do aluno</Pill><h1>Que bom ter você aqui.</h1><p>Continue do ponto onde parou, veja seu histórico e acompanhe sua evolução sem perder o foco.</p><Owl mode="study"/></div><Surface className="auth-card"><div className="segmented"><button type="button" onClick={()=>setMode('login')} className={mode==='login'?'active':''}>Entrar</button><button type="button" onClick={()=>setMode('register')} className={mode==='register'?'active':''}>Criar conta</button></div><form onSubmit={submit}>{mode==='register'&&<Field label="Nome completo" value={name} onChange={setName} placeholder="Seu nome" required/>}<Field label="E-mail" value={email} onChange={setEmail} type="email" placeholder="seuemail@exemplo.com" required/><Field label="Senha" value={password} onChange={setPassword} type="password" placeholder={mode==='register'?'Mínimo de 6 caracteres':'Sua senha'} required/><Button disabled={loading} type="submit" className="full">{loading?'Aguarde...':mode==='login'?'Entrar na conta':'Criar conta'} <ArrowRight size={18}/></Button></form><div className="demo-note"><b>Conta demonstrativa:</b> aluno@idiomaspro.com / Teste123!</div><Button disabled={loading} variant="ghost" className="full" onClick={demo}>Continuar com conta de demonstração</Button></Surface></section>{message&&<Toast message={message} tone="error"/>}</div>
}

export function LanguagePage(){
  const nav=useNavigate();
  const token=useAppStore(state=>state.token);
  const language=useAppStore(state=>state.selectedLanguage);
  const setLanguage=useAppStore(state=>state.setSelectedLanguage);
  if(!token)return <Navigate to="/" replace/>;
  const cards=[['ES','🇪🇸','Espanhol','Disponível agora'],['EN','🇺🇸','Inglês','Em breve'],['FR','🇫🇷','Francês','Em breve']] as const;
  return <div className="public-page"><PublicHeader/><section className="page-intro"><Pill tone="purple">Etapa 1 de 2</Pill><h1>Qual idioma você quer avaliar?</h1><p>O idioma da interface continua em português. Aqui você escolhe apenas a avaliação.</p></section><div className="language-grid">{cards.map(([code,flag,name,status])=><button key={code} onClick={()=>status==='Disponível agora'&&setLanguage('ES')} className={'language-card '+(language===code?'selected ':'')+(status!=='Disponível agora'?'disabled':'')} disabled={status!=='Disponível agora'}><span className="language-card__flag">{flag}</span><b>{name}</b><span>{status}</span>{language===code&&<i>✓</i>}</button>)}</div><Surface className="selection-summary"><div><small>Selecionado</small><strong>🇪🇸 Espanhol</strong><span>Gramática, vocabulário e listening • A1 a C2</span></div><Button onClick={()=>nav('/setup')}>Continuar <ArrowRight size={18}/></Button></Surface></div>
}

export function SetupPage(){
  const nav=useNavigate();
  const token=useAppStore(state=>state.token);
  const user=useAppStore(state=>state.user);
  const language=useAppStore(state=>state.selectedLanguage);
  const setTestProfile=useAppStore(state=>state.setTestProfile);
  const setActiveTest=useAppStore(state=>state.setActiveTest);
  const [name,setName]=useState(user?.name??'');
  const [email,setEmail]=useState(user?.email??'');
  const [teachers,setTeachers]=useState<TeacherOption[]>([]);
  const [teacherId,setTeacherId]=useState('');
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState('');

  useEffect(()=>{
    let active=true;
    api.getTeachers().then(({teachers})=>{
      if(!active)return;
      setTeachers(teachers);
      setTeacherId(current=>current||teachers[0]?.id||'');
    }).catch(err=>active&&setMessage(err instanceof Error?err.message:'Não foi possível carregar os professores.')).finally(()=>active&&setLoading(false));
    return()=>{active=false};
  },[]);

  if(!token)return <Navigate to="/" replace/>;

  async function start(){
    if(!teacherId){setMessage('Selecione um professor antes de iniciar.');return}
    if(name.trim().length<2){setMessage('Digite seu nome completo.');return}
    try{
      setLoading(true);setMessage('');
      const teacher=teachers.find(item=>item.id===teacherId);
      const response=await api.startTest(token,{
        count:18,
        studentName:name.trim(),
        studentEmail:email.trim(),
        teacherId,
        language,
      });
      setTestProfile({
        count:response.totalQuestions,
        studentName:response.studentName,
        studentEmail:email.trim(),
        teacherId:response.teacher.id,
        teacherName:response.teacher.name,
        language,
      });
      setActiveTest({
        attemptId:response.attemptId,
        totalQuestions:response.totalQuestions,
        questions:response.questions,
        answers:{},
      });
      if(!teacher)setMessage('');
      nav('/test');
    }catch(err){setMessage(err instanceof Error?err.message:'Não foi possível iniciar a avaliação.')}
    finally{setLoading(false)}
  }

  return <div className="public-page"><PublicHeader/><section className="page-intro"><Pill tone="teal">Etapa 2 de 2</Pill><h1>Antes de começar</h1><p>Organize sua avaliação e vincule o resultado ao professor responsável.</p></section><div className="setup-grid"><Surface className="form-card"><Field label="Seu nome" value={name} onChange={setName} placeholder="Digite seu nome completo" required/><Field label="E-mail" value={email} onChange={setEmail} type="email" placeholder="seuemail@exemplo.com"/><label className="field"><span>Professor responsável</span><select value={teacherId} onChange={e=>setTeacherId(e.target.value)} disabled={loading||teachers.length===0}>{teachers.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>{teachers.length===0&&!loading&&<Empty title="Nenhum professor disponível" description="É necessário ter um professor ativo para iniciar a avaliação."/>}<Button disabled={loading||teachers.length===0} className="full" onClick={start}>{loading?'Preparando...':'Começar avaliação'} <ArrowRight size={18}/></Button></Surface><Surface className="setup-summary"><Owl mode="study"/><h3>Sua avaliação</h3><dl><div><dt>Idioma</dt><dd>Espanhol</dd></div><div><dt>Questões</dt><dd>18</dd></div><div><dt>Tempo médio</dt><dd>12–18 min</dd></div><div><dt>Professor</dt><dd>{teachers.find(item=>item.id===teacherId)?.name??'Selecione'}</dd></div></dl></Surface></div>{message&&<Toast message={message} tone="error"/>}</div>
}
