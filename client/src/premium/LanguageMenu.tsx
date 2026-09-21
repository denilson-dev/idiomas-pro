import { Check, ChevronDown, Languages } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function close(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="language-menu" ref={ref}>
      <button
        className="language-pill"
        type="button"
        aria-label="Idioma da interface: Português do Brasil"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="language-pill__flag" aria-hidden="true">🇧🇷</span>
        <span className="language-pill__code">PT-BR</span>
        <ChevronDown size={13} />
      </button>

      {open && (
        <div className="language-popover" role="menu">
          <div className="language-popover__title">
            <Languages size={14} /> Idioma da interface
          </div>
          <button type="button" className="language-option active" onClick={() => setOpen(false)}>
            <span>🇧🇷</span>
            <div>
              <b>Português</b>
              <small>Brasil • PT-BR</small>
            </div>
            <Check size={15} />
          </button>
          <div className="language-option disabled">
            <span>🇪🇸</span>
            <div>
              <b>Español</b>
              <small>Em breve</small>
            </div>
          </div>
          <div className="language-option disabled">
            <span>🇺🇸</span>
            <div>
              <b>English</b>
              <small>Em breve</small>
            </div>
          </div>
          <p>O idioma da avaliação é escolhido separadamente.</p>
        </div>
      )}
    </div>
  );
}
