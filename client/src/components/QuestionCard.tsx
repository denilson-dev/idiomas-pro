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
    <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
          {categoryLabel[question.category]}
        </span>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-slate-300">{question.level}</span>
        {question.category === 'LISTENING' && <Headphones size={16} className="text-violet-300" />}
      </div>

      {question.mediaUrl && question.mediaType && (
        <div className="mb-6"><VideoPlayer type={question.mediaType} src={question.mediaUrl} /></div>
      )}

      <h2 className="mb-7 text-xl font-semibold leading-relaxed text-white sm:text-2xl">{question.prompt}</h2>

      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const active = selected === option;
          return (
            <button
              type="button"
              key={option}
              onClick={() => onSelect(option)}
              className={`group flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-200 ${
                active
                  ? 'border-cyan-300/60 bg-cyan-300/12 shadow-lg shadow-cyan-900/20'
                  : 'border-white/10 bg-white/[0.035] hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]'
              }`}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-black ${active ? 'bg-cyan-300 text-slate-950' : 'bg-white/8 text-slate-300'}`}>
                {active ? <Check size={18} strokeWidth={3} /> : String.fromCharCode(65 + index)}
              </span>
              <span className="font-medium text-slate-100">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
