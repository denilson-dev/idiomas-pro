import { Check, Headphones } from 'lucide-react';
import type { Question } from '../services/api';
import VideoPlayer from './VideoPlayer';

type Props = {
  question: Question;
  selected?: string;
  onSelect: (answer: string) => void;
};

const categoryLabel = {
  GRAMMAR: 'Gramática',
  VOCABULARY: 'Vocabulário',
  LISTENING: 'Listening',
};

export default function QuestionCard({ question, selected, onSelect }: Props) {
  return (
    <div className="glass-panel rounded-[1.6rem] p-4 sm:rounded-[2rem] sm:p-8">
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-6">
        <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-200 sm:px-3 sm:text-xs">
          {categoryLabel[question.category]}
        </span>
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-slate-300 sm:px-3 sm:text-xs">
          {question.level}
        </span>
        {question.category === 'LISTENING' && <Headphones size={15} className="text-violet-300" />}
      </div>

      {question.mediaUrl && question.mediaType && (
        <div className="mb-4 sm:mb-6">
          <VideoPlayer type={question.mediaType} src={question.mediaUrl} />
        </div>
      )}

      <h2 className="mb-5 text-[17px] font-semibold leading-7 text-white sm:mb-7 sm:text-2xl sm:leading-relaxed">
        {question.prompt}
      </h2>

      <div className="grid gap-2.5 sm:gap-3">
        {question.options.map((option, index) => {
          const active = selected === option;
          return (
            <button
              type="button"
              key={option}
              aria-pressed={active}
              onClick={() => onSelect(option)}
              className={`group flex min-h-14 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200 sm:min-h-16 sm:gap-4 sm:px-4 sm:py-4 ${
                active
                  ? 'border-cyan-300/60 bg-cyan-300/12 shadow-lg shadow-cyan-900/20'
                  : 'border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.07]'
              }`}
            >
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-xs font-black sm:h-9 sm:w-9 sm:text-sm ${
                active ? 'bg-cyan-300 text-slate-950' : 'bg-white/8 text-slate-300'
              }`}>
                {active ? <Check size={17} strokeWidth={3} /> : String.fromCharCode(65 + index)}
              </span>
              <span className="text-sm font-medium leading-5 text-slate-100 sm:text-base">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
