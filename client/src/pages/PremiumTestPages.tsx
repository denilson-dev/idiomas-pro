import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Headphones,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Button, Pill, Surface, Toast } from '../components/UI';
import { PublicHeader } from '../components/Shell';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export function TestPage(){
  const nav=useNavigate();
  const token=useAppStore(state=>state.token);
  const activeTest=useAppStore(state=>state.activeTest);
  const index=useAppStore(state=>state.currentQuestionIndex);
  const setIndex=useAppStore(state=>state.setCurrentQuestionIndex);
  const setAnswer=useAppStore(state=>state.setTestAnswer);
  const [playing,setPlaying]=useState(false);
  const [message,setMessage]=useState('');
  const audioRef=useRef<HTMLAudioElement|null>(null);

  const questions=activeTest?.questions??[];
  const q=questions[index];
  const answers=activeTest?.answers??{};
  const progress=activeTest?Math.round(((index+1)/activeTest.totalQuestions)*100):0;
  const counts=useMemo(()=>({
    GRAMMAR:questions.filter(item=>item.category==='GRAMMAR').length,
    VOCABULARY:questions.filter(item=>item.category==='VOCABULARY').length,
    LISTENING:questions.filter(item=>item.category==='LISTENING').length,
  }),[questions]);

  useEffect(()=>{
    setPlaying(false);
    if(audioRef.current){
      audioRef.current.pause();
      audioRef.current.currentTime=0;
    }
  },[index]);

  if(!token)return <Navigate to="/" replace/>;
  if(!activeTest||!q)return <Navigate to="/setup" replace/>;

  async function toggleAudio(){
    const audio=audioRef.current;
    if(!audio)return;
    try{
      if(audio.paused){
        await audio.play();
        setPlaying(true);
      }else{
        audio.pause();
        setPlaying(false);
      }
    }catch{
      setMessage('Não foi possível reproduzir o áudio. Verifique o volume e tente novamente.');
    }
  }

  function next(){
    if(index<questions.length-1)setIndex(index+1);
    else nav('/review');
  }

  return <div className="exam-page"><PublicHeader/><div className="exam-progress"><div><Pill tone="purple">Questão {index+1} de {questions.length}</Pill><span>{progress}%</span></div><div className="progress-track"><i style={{width:progress+'%'}}/></div></div><div className="exam-layout"><Surface className="question-panel"><Pill tone={q.category==='LISTENING'?'teal':q.category==='VOCABULARY'?'orange':'pink'}>{q.category==='LISTENING'?'Listening':q.category==='VOCABULARY'?'Vocabulário':'Gramática'}</Pill><h1>{q.category==='LISTENING'?'Ouça o áudio e escolha a alternativa correta.':'Escolha a alternativa correta.'}</h1>{q.category==='LISTENING'&&<><audio ref={audioRef} src={q.mediaUrl??undefined} preload="metadata" onEnded={()=>setPlaying(false)}/><Surface className="audio-player"><Button variant="secondary" onClick={toggleAudio}>{playing?<Pause size={17}/>:<Play size={17}/>} {playing?'Pausar':'Reproduzir'}</Button><div className={'wave '+(playing?'wave--playing':'')}>{Array.from({length:18}).map((_,i)=><i key={i}/>)}</div><span>Listening</span></Surface></>}<div className="question-stem">{q.prompt}</div><div className="answer-list">{q.options.map((opt,i)=><button key={opt} aria-pressed={answers[q.id]===opt} className={'answer '+(answers[q.id]===opt?'answer--selected':'')} onClick={()=>setAnswer(q.id,opt)}><span>{String.fromCharCode(65+i)}</span><b>{opt}</b>{answers[q.id]===opt&&<CheckCircle2 size={18}/>}</button>)}</div><div className="exam-actions"><Button variant="secondary" disabled={index===0} onClick={()=>setIndex(Math.max(0,index-1))}><ArrowLeft size={17}/> Anterior</Button><Button onClick={next}>{index===questions.length-1?'Revisar respostas':'Próxima questão'} <ArrowRight size={17}/></Button></div></Surface><Surface className="exam-side"><h3>Seu progresso</h3>{(['GRAMMAR','VOCABULARY','LISTENING'] as const).map(cat=>{const total=counts[cat];const answered=questions.filter(item=>item.category===cat&&answers[item.id]!==undefined).length;return <div className="skill-progress" key={cat}><div><b>{cat==='GRAMMAR'?'Gramática':cat==='VOCABULARY'?'Vocabulário':'Listening'}</b><span>{answered}/{total}</span></div><div className="mini-track"><i style={{width:(total?answered/total*100:0)+'%'}}/></div></div>})}<div className="tip"><Headphones size={18}/><div><b>Dica</b><p>Você pode avançar e voltar antes de finalizar.</p></div></div><Button variant="ghost" className="full" onClick={()=>{if(confirm('Limpar todas as respostas desta avaliação?')){questions.forEach(item=>answers[item.id]&&setAnswer(item.id,''));setIndex(0)}}}><RotateCcw size={16}/> Voltar ao início</Button></Surface></div>{message&&<Toast message={message} tone="error"/>}</div>
}

export function ReviewPage(){
  const nav=useNavigate();
  const token=useAppStore(state=>state.token);
  const activeTest=useAppStore(state=>state.activeTest);
  const setIndex=useAppStore(state=>state.setCurrentQuestionIndex);
  const clearActiveTest=useAppStore(state=>state.clearActiveTest);
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState('');

  if(!token)return <Navigate to="/" replace/>;
  if(!activeTest)return <Navigate to="/setup" replace/>;

  const answered=activeTest.questions.filter(q=>Boolean(activeTest!.answers[q.id])).length;
  const pending=activeTest.totalQuestions-answered;
  const progress=Math.round(answered/activeTest.totalQuestions*100);

  function goTo(index:number){
    setIndex(index);
    nav('/test');
  }

  async function submit(){
    if(pending>0){setMessage('Responda todas as questões antes de finalizar.');return}
    try{
      setLoading(true);setMessage('');
      const answers=activeTest!.questions.map(question=>({
        questionId:question.id,
        selectedAnswer:activeTest!.answers[question.id],
      }));
      const result=await api.submitTest(token!,activeTest!.attemptId,answers);
      const id=result.attemptId??activeTest!.attemptId;
      nav('/result/'+id);
      clearActiveTest();
    }catch(err){setMessage(err instanceof Error?err.message:'Não foi possível finalizar a avaliação.')}
    finally{setLoading(false)}
  }

  return <div className="public-page"><PublicHeader/><section className="page-intro"><Pill tone="purple">Revisão</Pill><h1>Revise antes de finalizar</h1><p>Veja rapidamente o que já foi respondido e volte onde quiser antes de enviar a avaliação.</p></section><div className="review-grid"><Surface className="review-map"><h3>Questões</h3><div className="question-map">{activeTest!.questions.map((q,i)=>{const isPending=!activeTest!.answers[q.id];return <button key={q.id} className={isPending?'pending':''} onClick={()=>goTo(i)}><b>{i+1}</b><span>{isPending?'Pendente':'Respondida'}</span></button>})}</div></Surface><Surface className="review-summary"><h3>Resumo</h3><p><strong>{answered} de {activeTest.totalQuestions} respondidas</strong></p><dl><div><dt>Respondidas</dt><dd>{answered}</dd></div><div><dt>Pendentes</dt><dd>{pending}</dd></div><div><dt>Progresso</dt><dd>{progress}%</dd></div></dl><p>{pending?'Clique em uma questão pendente para voltar diretamente até ela.':'Tudo pronto para finalizar.'}</p><Button disabled={loading||pending>0} className="full" onClick={submit}>{loading?'Enviando...':'Finalizar avaliação'} <CheckCircle2 size={18}/></Button></Surface></div>{message&&<Toast message={message} tone="error"/>}</div>
}
