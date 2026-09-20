import { BookOpen, Check, Headphones, MessageCircleMore } from 'lucide-react';
import MascotOwl from './MascotOwl';
import type { Question } from '../services/api';
import VideoPlayer from './VideoPlayer';

type Props = {
  question: Question;
  selected?: string;
  onSelect: (answer: string) => void;
};

const config = {
  GRAMMAR: {
    label: 'Gramática',
    icon: BookOpen,
    titleA: 'Complete a frase',
    titleB: 'com a forma correta.',
    color: '#ff2d5f',
    mascot: 'welcome' as const,
  },
  VOCABULARY: {
    label: 'Vocabulário',
    icon: MessageCircleMore,
    titleA: 'Escolha a',
    titleB: 'resposta correta',
    color: '#009b8b',
    mascot: 'welcome' as const,
  },
  LISTENING: {
    label: 'Listening',
    icon: Headphones,
    titleA: 'Ouça e',
    titleB: 'responda',
    color: '#6b2bb8',
    mascot: 'listening' as const,
  },
};

export default function QuestionCard({ question, selected, onSelect }: Props) {
  const cfg = config[question.category];
  const Icon = cfg.icon;

  return (
    <div className="paper-card relative overflow-hidden rounded-[1.8rem] p-4 sm:p-7">
      <div className="grid gap-4 lg:grid-cols-[1fr_260px] lg:items-start">
        <div>
          <div className="category-pill text-[10px] sm:text-xs">
            <Icon size={16} /> {cfg.label}
          </div>
          <h2 className="hero-title mt-4 text-[2.55rem] sm:text-[3.7rem]">
            <span style={{ color: question.category === 'VOCABULARY' ? '#2b0d71' : '#ff2d5f' }}>{cfg.titleA}</span><br/>
            <span className="hero-teal">{cfg.titleB}</span>
          </h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#7656a7] sm:text-base">
            {question.category === 'LISTENING' ? 'Ouça o áudio com atenção e escolha a melhor alternativa.' : 'Leia com atenção e escolha a melhor alternativa.'}
          </p>
        </div>

        <div className="relative mx-auto hidden w-full max-w-[240px] lg:block">
          <div className="hand-note absolute right-0 top-0 z-10 text-lg">Você consegue! ♡</div>
          <MascotOwl variant={cfg.mascot} className="h-[230px] w-[230px]" />
        </div>
      </div>

      {question.mediaUrl && question.mediaType && (
        <div className="mt-5">
          <VideoPlayer type={question.mediaType} src={question.mediaUrl} />
        </div>
      )}

      <div className="mt-5 rounded-[1.5rem] bg-[#f5fbfa] px-4 py-4 text-lg font-black leading-7 text-[#2b0d71] sm:px-6 sm:py-5 sm:text-2xl">
        {question.prompt}
      </div>

      <div className="mt-4 grid gap-3">
        {question.options.map((option, index) => {
          const active = selected === option;
          return (
            <button
              type="button"
              key={option}
              aria-pressed={active}
              onClick={() => onSelect(option)}
              className={`group flex min-h-16 items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left transition-all duration-200 sm:min-h-20 sm:px-5 ${
                active
                  ? 'border-[#ff2d5f] bg-[#fff5f8] shadow-[0_10px_28px_rgba(255,45,95,.10)]'
                  : 'border-[#e4dcf2] bg-white hover:border-[#cfc0e8]'
              }`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black sm:h-11 sm:w-11 sm:text-base ${
                active ? 'bg-[#ff2d5f] text-white' : 'bg-[#f1eaff] text-[#3a167f]'
              }`}>
                {active ? <Check size={20} strokeWidth={3} /> : String.fromCharCode(65 + index)}
              </span>
              <span className="flex-1 text-[15px] font-black leading-5 text-[#2b0d71] sm:text-lg">{option}</span>
              {active && <span className="grid h-9 w-9 place-items-center rounded-full bg-[#ff2d5f] text-white"><Check size={18}/></span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
