import { ChevronDown } from 'lucide-react';

type Props = {
  subtitle?: string;
  language?: string;
  compact?: boolean;
};

export default function BrandHeader({ subtitle = 'Idiomas • A1 a C2', language = 'PT', compact = false }: Props) {
  return (
    <header className={`premium-header flex items-center justify-between gap-2.5 ${compact ? 'py-0.5' : 'py-1.5'}`}>
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border-[2.5px] border-[#ff2d5f] bg-white/90 shadow-[0_8px_24px_rgba(47,13,112,.08)] sm:h-14 sm:w-14 sm:border-[3px]">
          <span className="brand-mark text-lg font-black italic sm:text-2xl">M</span>
          <span className="absolute -left-1 top-3.5 h-2 w-3 rotate-[-28deg] rounded-full bg-[#00a38f] sm:top-4" />
          <span className="absolute -right-1 bottom-2.5 h-2 w-3 rotate-[28deg] rounded-full bg-[#ff9f21] sm:bottom-3" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-black leading-tight tracking-[-.02em] text-[#2b0d71] sm:text-xl">Nivelamento no Topo</div>
          <div className="mt-0.5 truncate text-[10px] font-semibold text-[#7656a7] sm:text-sm">{subtitle}</div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Idioma da interface"
        className="os-pill flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[11px] font-black text-[#2b0d71] transition active:scale-95 sm:gap-2 sm:px-4 sm:text-sm"
      >
        <span className="text-sm sm:text-base">🇪🇸</span>
        <span>{language}</span>
        <ChevronDown size={13} className="opacity-70" />
      </button>
    </header>
  );
}
