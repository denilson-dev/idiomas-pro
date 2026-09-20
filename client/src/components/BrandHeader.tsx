import { ChevronDown } from 'lucide-react';

type Props = {
  subtitle?: string;
  language?: string;
  compact?: boolean;
};

export default function BrandHeader({ subtitle = 'Idiomas • A1 a C2', language = 'PT', compact = false }: Props) {
  return (
    <header className={`flex items-center justify-between gap-3 ${compact ? 'py-1' : 'py-2'}`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full border-[3px] border-[#ff2d5f] bg-white shadow-[0_8px_24px_rgba(47,13,112,.08)] sm:h-14 sm:w-14">
          <span className="brand-mark text-xl font-black italic sm:text-2xl">M</span>
          <span className="absolute -left-1 top-4 h-2 w-3 rotate-[-28deg] rounded-full bg-[#00a38f]" />
          <span className="absolute -right-1 bottom-3 h-2 w-3 rotate-[28deg] rounded-full bg-[#ff9f21]" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[15px] font-black leading-tight text-[#2b0d71] sm:text-xl">Nivelamento no Topo</div>
          <div className="mt-0.5 truncate text-[11px] font-medium text-[#7656a7] sm:text-sm">{subtitle}</div>
        </div>
      </div>

      <button type="button" className="flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-[#ded5ef] bg-white px-3 py-2 text-xs font-black text-[#2b0d71] shadow-[0_6px_18px_rgba(47,13,112,.06)] sm:px-4 sm:text-sm">
        <span className="text-base">🇪🇸</span>
        <span>{language}</span>
        <ChevronDown size={14} />
      </button>
    </header>
  );
}
