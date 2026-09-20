import { Check, ChevronDown, Languages } from 'lucide-react';
import { useState } from 'react';
import FlagIcon from './FlagIcon';

type Props = {
  subtitle?: string;
  language?: string;
  compact?: boolean;
};

export default function BrandHeader({ subtitle = 'Idiomas • A1 a C2', language = 'PT-BR', compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const displayLanguage = language === 'PT' ? 'PT-BR' : language;

  return (
    <header className={`premium-header relative z-40 flex items-center justify-between gap-2.5 ${compact ? 'py-0.5' : 'py-1.5'}`}>
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border-[2.5px] border-[#ff2d5f] bg-white/90 shadow-[0_8px_24px_rgba(47,13,112,.08)] sm:h-14 sm:w-14 sm:border-[3px]">
          <span className="brand-mark text-lg font-black italic sm:text-2xl">M</span>
          <span className="absolute -left-1 top-3.5 h-2 w-3 rotate-[-28deg] rounded-full bg-[#00a38f] sm:top-4" />
          <span className="absolute -right-1 bottom-2.5 h-2 w-3 rotate-[28deg] rounded-full bg-[#ff9f21] sm:bottom-3" />
        </div>

        <div className="min-w-0">
          <div className="truncate text-[14px] font-black leading-tight tracking-[-.02em] text-[#2b0d71] sm:text-xl">
            Nivelamento no Topo
          </div>
          <div className="mt-0.5 truncate text-[10px] font-semibold text-[#7656a7] sm:text-sm">{subtitle}</div>
        </div>
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          aria-label="Alterar idioma da interface"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="os-pill flex min-h-10 items-center gap-1.5 rounded-full px-2.5 py-2 text-[11px] font-black text-[#2b0d71] transition active:scale-95 sm:min-h-11 sm:gap-2 sm:px-3.5 sm:text-sm"
        >
          <FlagIcon code="BR" className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
          <span className="whitespace-nowrap">{displayLanguage}</span>
          <ChevronDown size={13} className={`opacity-70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 top-[calc(100%+.55rem)] z-50 w-[230px] overflow-hidden rounded-[1.25rem] border border-white/90 bg-white/92 p-2 shadow-[0_22px_55px_rgba(43,13,113,.16)] backdrop-blur-2xl">
            <div className="px-2.5 pb-2 pt-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.12em] text-[#8a75b0]">
                <Languages size={13}/> Idioma da interface
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl bg-[#f5f1ff] px-3 py-2.5 text-left"
            >
              <FlagIcon code="BR" className="h-7 w-7 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-[#2b0d71]">Português</span>
                <span className="block text-[10px] font-bold text-[#8873ad]">Brasil • PT-BR</span>
              </span>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e3f8f3] text-[#008f81]">
                <Check size={14} strokeWidth={3}/>
              </span>
            </button>

            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <div className="rounded-xl border border-[#eee8f6] bg-[#faf8fd] px-2.5 py-2 text-center opacity-55">
                <FlagIcon code="ES" className="mx-auto h-6 w-6" />
                <div className="mt-1 text-[10px] font-black text-[#5d238e]">ES</div>
                <div className="text-[9px] text-[#8c7aae]">Em breve</div>
              </div>
              <div className="rounded-xl border border-[#eee8f6] bg-[#faf8fd] px-2.5 py-2 text-center opacity-55">
                <FlagIcon code="US" className="mx-auto h-6 w-6" />
                <div className="mt-1 text-[10px] font-black text-[#5d238e]">EN</div>
                <div className="text-[9px] text-[#8c7aae]">Em breve</div>
              </div>
            </div>

            <p className="px-2.5 pb-1 pt-2 text-[9px] leading-4 text-[#927fb5]">
              O idioma da prova é escolhido separadamente.
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
