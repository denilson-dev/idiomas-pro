export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand--compact' : ''}`}>
      <div className="brand__mark">
        IP
        <span className="brand__dot brand__dot--a" />
        <span className="brand__dot brand__dot--b" />
      </div>
      <div>
        <strong>Idiomas Pro</strong>
        <span>Nivelamento • A1 a C2</span>
      </div>
    </div>
  );
}

export function Owl({ mode = 'welcome' }: { mode?: 'welcome' | 'listen' | 'celebrate' | 'study' }) {
  return (
    <div className={`owl owl--${mode}`} aria-hidden="true">
      <svg viewBox="0 0 360 360" role="img">
        <defs>
          <linearGradient id="owlBodyPremium" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff9f21" />
            <stop offset="1" stopColor="#f36a17" />
          </linearGradient>
          <linearGradient id="owlWingPremium" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8b2fb4" />
            <stop offset="1" stopColor="#55208d" />
          </linearGradient>
        </defs>
        <g transform="translate(25 22)">
          <ellipse cx="157" cy="162" rx="105" ry="114" fill="url(#owlBodyPremium)" />
          <path d="M72 162c-50 7-68 40-39 72 18 21 42 28 65 15" fill="url(#owlWingPremium)" />
          <path d="M238 162c50 7 68 40 39 72-18 21-42 28-65 15" fill="url(#owlWingPremium)" />
          <ellipse cx="157" cy="139" rx="86" ry="73" fill="#fff4dc" />
          <ellipse cx="127" cy="137" rx="38" ry="42" fill="#fff" />
          <ellipse cx="190" cy="137" rx="38" ry="42" fill="#fff" />
          <circle cx="129" cy="139" r="24" fill="#401272" />
          <circle cx="129" cy="139" r="14" fill="#121018" />
          <circle cx="121" cy="130" r="7" fill="#fff" />
          <path d="M171 141c8 12 27 14 38 2" fill="none" stroke="#30105f" strokeWidth="7" strokeLinecap="round" />
          <circle cx="127" cy="137" r="47" fill="none" stroke="#5d238e" strokeWidth="10" />
          <circle cx="190" cy="137" r="47" fill="none" stroke="#5d238e" strokeWidth="10" />
          <path d="M171 133h-4" stroke="#5d238e" strokeWidth="10" strokeLinecap="round" />
          <path d="M157 151l-20 16 20 12 20-12z" fill="#f69b16" stroke="#d56414" strokeWidth="3" />
          <path d="M97 218c18-26 104-26 120 0l-8 77c-30 24-76 25-104 0z" fill="#fff" />
          <path d="M124 242c9-16 8 34 18 3 8-25 6 36 18 0 10-30 9 31 20 3" fill="none" stroke="#00a38f" strokeWidth="11" strokeLinecap="round" />
          <ellipse cx="123" cy="306" rx="29" ry="15" fill="#f07917" />
          <ellipse cx="194" cy="306" rx="29" ry="15" fill="#f07917" />
          {mode === 'listen' && (
            <g>
              <path d="M87 123c5-57 134-63 143 0" fill="none" stroke="#54218b" strokeWidth="15" strokeLinecap="round" />
              <rect x="70" y="118" width="24" height="58" rx="12" fill="#6725a0" />
              <rect x="221" y="118" width="24" height="58" rx="12" fill="#6725a0" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
