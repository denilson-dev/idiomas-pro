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
    mascot: 'welcome' as const,
  },
  VOCABULARY: {
    label: 'Vocabulário',
    icon: MessageCircleMore,
    titleA: 'Escolha a',
    titleB: 'resposta correta',
    mascot: 'welcome' as const,
  },
  LISTENING: {
    label: 'Listening',
    icon: Headphones,
    titleA: 'Ouça e',
    titleB: 'responda',
    mascot: 'listening' as const,
  },
};

export default function QuestionCard({ question, selected, onSelect }: Props) {
  const cfg = config[question.category];
  const Icon = cfg.icon;

  return (
    <div className="paper-card question-enter relative overflow-hidden rounded-[1.65rem] p-3.5 sm:p-6 lg:p-7">
      <div className="grid gap-3 lg:grid-cols-[1fr_230px] lg:items-start">
        <div>
          <div className="category-pill text-[10px] sm:text-xs">
            <Icon size={15} /> {cfg.label}
          </div>

          <h2 className="hero-title mt-3.5 text-[2.05rem] sm:mt-4 sm:text-[3.45rem]">
            <span style={{ color: question.category === 'VOCABULARY' ? '#2b0d71' : '#ff2d5f' }}>{cfg.titleA}</span>
            <br />
            <span className="hero-teal">{cfg.titleB}</span>
          </h2>

          <p className="mt-2.5 max-w-2xl text-[13px] font-semibold leading-5.5 text-[#7656a7] sm:mt-3 sm:text-base sm:leading-6">
            {question.category === 'LISTENING'
              ? 'Ouça o áudio com atenção e escolha a melhor alternativa.'
              : 'Leia com atenção e escolha a melhor alternativa.'}
          </p>
        </div>

        <div className="relative mx-auto hidden w-full max-w-[220px] lg:block">
          <div className="hand-note absolute right-0 top-0 z-10 text-base">Você consegue! ♡</div>
          <MascotOwl variant={cfg.mascot} className="h-[210px] w-[210px]" />
        </div>
      </div>

      {question.mediaUrl && question.mediaType && (
        <div className="mt-4 sm:mt-5">
          <VideoPlayer type={question.mediaType} src={question.mediaUrl} />
        </div>
      )}

      <div className="mt-4 rounded-[1.25rem] border border-white/80 bg-[#f2faf8]/90 px-4 py-3.5 text-[1.02rem] font-black leading-6 text-[#2b0d71] shadow-[inset_0_0_0_1px_rgba(0,155,139,.04)] sm:mt-5 sm:px-6 sm:py-5 sm:text-2xl sm:leading-8">
        {question.prompt}
      </div>

      <div className="mt-3 grid gap-2.5 sm:mt-4 sm:gap-3">
        {question.options.map((option, index) => {
          const active = selected === option;
          return (
            <button
              type="button"
              key={option}
              aria-pressed={active}
              onClick={() => onSelect(option)}
              className={`pressable group flex min-h-[58px] items-center gap-3 rounded-[1.15rem] border px-3.5 py-3 text-left sm:min-h-18 sm:gap-4 sm:rounded-2xl sm:px-5 ${
                active
                  ? 'border-[#ff2d5f] bg-[linear-gradient(145deg,#fff9fb,#fff0f5)] shadow-[0_12px_28px_rgba(255,45,95,.11),inset_0_0_0_1px_rgba(255,255,255,.8)]'
                  : 'border-[#ded5ed] bg-white/88 shadow-[0_7px_20px_rgba(43,13,113,.045)] hover:border-[#c9bae4]'
              }`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-black transition sm:h-11 sm:w-11 sm:text-base ${
                active
                  ? 'bg-gradient-to-b from-[#ff4b75] to-[#f31f55] text-white shadow-[0_7px_16px_rgba(255,45,95,.24)]'
                  : 'bg-[#f1eaff] text-[#3a167f]'
              }`}>
                {active ? <Check size={18} strokeWidth={3} /> : String.fromCharCode(65 + index)}
              </span>

              <span className="min-w-0 flex-1 text-[14px] font-black leading-5 text-[#2b0d71] sm:text-lg sm:leading-6">
                {option}
              </span>

              {active && (
                <span className="hidden h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ff2d5f] text-white sm:grid">
                  <Check size={16} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
