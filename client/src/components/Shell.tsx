import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpenCheck,
  CircleHelp,
  ClipboardList,
  Home,
  LogOut,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { Brand } from './Brand';
import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';

function LanguageMenu({compact=false}:{compact?:boolean}) {
  const [open,setOpen]=useState(false);
  return <div className="language-menu">
    <button
      type="button"
      className="language-pill"
      aria-expanded={open}
      onClick={()=>setOpen(value=>!value)}
    >
      🇧🇷 {compact?'PT':'PT-BR'} <span aria-hidden>⌄</span>
    </button>
    {open&&<div className="language-popover surface">
      <div className="language-popover__head"><b>Idioma da interface</b><button onClick={()=>setOpen(false)} aria-label="Fechar"><X size={15}/></button></div>
      <button className="language-option active" onClick={()=>setOpen(false)}><span>🇧🇷</span><div><b>Português</b><small>Brasil • PT-BR</small></div><i>✓</i></button>
      <button className="language-option disabled" disabled><span>🇪🇸</span><div><b>Español</b><small>Em breve</small></div></button>
      <button className="language-option disabled" disabled><span>🇺🇸</span><div><b>English</b><small>Em breve</small></div></button>
    </div>}
  </div>;
}

export function PublicHeader(){
  return <header className="topbar"><Link to="/" aria-label="Ir para início"><Brand compact/></Link><div className="topbar__actions"><LanguageMenu/></div></header>;
}

type NavItem = [string, typeof Home, string];

function NavEntry({item}:{item:NavItem}) {
  const [href,Icon,label]=item;
  const location=useLocation();
  const parts=href.split('?');
  const path=parts[0];
  const targetSearch=parts[1] ? '?' + parts[1] : '';
  const active=location.pathname===path && (!targetSearch || location.search===targetSearch);
  return <Link to={href} className={'nav-item ' + (active?'nav-item--active':'')}><Icon size={18}/><span>{label}</span></Link>;
}

export function Workspace({children,area='student'}:{children:ReactNode,area?:'student'|'teacher'|'admin'}){
  const nav=useNavigate();
  const token=useAppStore(state=>state.token);
  const user=useAppStore(state=>state.user);
  const teacherToken=useAppStore(state=>state.teacherToken);
  const teacher=useAppStore(state=>state.teacher);
  const clearSession=useAppStore(state=>state.clearSession);
  const clearTeacherSession=useAppStore(state=>state.clearTeacherSession);

  const items:NavItem[] = area==='student' ? [
    ['/dashboard',Home,'Início'],
    ['/student/history',ClipboardList,'Meus testes'],
    ['/language',BookOpenCheck,'Nova avaliação'],
    ['/student/profile',UserRound,'Meu perfil'],
    ['/help',CircleHelp,'Ajuda'],
  ] : area==='teacher' ? [
    ['/professor/painel',Home,'Visão geral'],
    ['/professor/alunos',UsersRound,'Alunos'],
    ['/professor/avaliacoes',BookOpenCheck,'Avaliações'],
    ['/professor/relatorios',BarChart3,'Relatórios'],
    ['/professor/settings',Settings,'Configurações'],
  ] : [
    ['/professor/administracao',ShieldCheck,'Visão geral'],
    ['/professor/administracao?tab=students',UserRound,'Alunos'],
    ['/professor/administracao?tab=teachers',UsersRound,'Professores'],
    ['/professor/relatorios',BarChart3,'Relatórios'],
    ['/professor/settings',Settings,'Configurações'],
  ];

  const person=area==='student'?user:teacher;

  async function logout(){
    try {
      if(area==='student' && token) await api.logout(token);
      if(area!=='student' && teacherToken) await api.teacherLogout(teacherToken);
    } catch {
      // A saída local deve continuar funcionando mesmo se a rede falhar.
    }
    if(area==='student'){
      clearSession();
      nav('/');
    } else {
      clearTeacherSession();
      nav('/professor');
    }
  }

  return <div className="workspace">
    <aside className="sidebar">
      <Link to={area==='student'?'/dashboard':area==='admin'?'/professor/administracao':'/professor/painel'}><Brand compact/></Link>
      <nav>{items.map(item=><NavEntry key={item[0]+item[2]} item={item}/>)}</nav>
      <div className="sidebar__foot"><button className="nav-item nav-item--button" onClick={logout}><LogOut size={18}/><span>Sair</span></button></div>
    </aside>
    <main className="workspace__main">
      <header className="workspace__top">
        <div><small>{area==='student'?'Área do aluno':area==='teacher'?'Portal do professor':'Administração'}</small><strong>{person?.name ?? 'Usuário'}</strong></div>
        <div className="workspace__top-actions"><LanguageMenu compact/><span className="avatar">{person?.name?.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase() || 'IP'}</span></div>
      </header>
      <div className="workspace__content">{children}</div>
    </main>
    <nav className="mobile-bottom-nav">
      {items.slice(0,4).map(([href,Icon,label])=><Link key={href+label} to={href}><Icon size={18}/><span>{label}</span></Link>)}
    </nav>
  </div>;
}
