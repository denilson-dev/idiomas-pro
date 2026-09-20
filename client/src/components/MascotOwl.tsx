import { ClipboardCheck, Headphones, Sparkles } from 'lucide-react';

type Props = {
  variant?: 'welcome' | 'listening' | 'celebrate' | 'study';
  className?: string;
};

export default function MascotOwl({ variant = 'welcome', className = '' }: Props) {
  const headphones = variant === 'listening';
  const celebrate = variant === 'celebrate';
  const study = variant === 'study';

  return (
    <div className={`relative select-none ${className}`} aria-hidden="true">
      {celebrate && (
        <>
          <span className="absolute left-[4%] top-[18%] h-3 w-8 rotate-[32deg] rounded-full bg-[#ff2d5f]" />
          <span className="absolute right-[10%] top-[12%] h-3 w-8 -rotate-[26deg] rounded-full bg-[#ffad00]" />
          <span className="absolute right-[1%] top-[35%] h-3 w-7 rotate-[28deg] rounded-full bg-[#00a38f]" />
        </>
      )}
      <svg viewBox="0 0 360 360" className="h-full w-full drop-shadow-[0_20px_30px_rgba(47,13,112,.15)]">
        <defs>
          <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff9f21" />
            <stop offset="100%" stopColor="#f36a17" />
          </linearGradient>
          <linearGradient id="wing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b2fb4" />
            <stop offset="100%" stopColor="#55208d" />
          </linearGradient>
          <linearGradient id="shirtM" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00a38f" />
            <stop offset="45%" stopColor="#ff2d5f" />
            <stop offset="100%" stopColor="#ff9f21" />
          </linearGradient>
        </defs>

        <g transform="translate(25 22)">
          <path d="M105 52c-19-26-15-42 10-34 9-21 31-17 34 8 15-24 37-17 33 10 20-18 40-5 25 18" fill="url(#body)" />
          <ellipse cx="157" cy="162" rx="105" ry="114" fill="url(#body)" />

          <path d="M72 162c-50 7-68 40-39 72 18 21 42 28 65 15" fill="url(#wing)" />
          <path d="M238 162c50 7 68 40 39 72-18 21-42 28-65 15" fill="url(#wing)" />
          <path d="M64 180c-28 12-35 30-17 46M250 180c28 12 35 30 17 46" fill="none" stroke="#aa49c3" strokeWidth="11" strokeLinecap="round" />

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
          <path d="M143 181c8 18 22 18 30 0" fill="#9d2541" />
          <path d="M149 192c6 7 12 7 17 0" fill="#ff7d8e" />

          <path d="M97 218c18-26 104-26 120 0l-8 77c-30 24-76 25-104 0z" fill="#fff" />
          <path d="M124 242c9-16 8 34 18 3 8-25 6 36 18 0 10-30 9 31 20 3" fill="none" stroke="url(#shirtM)" strokeWidth="11" strokeLinecap="round" />

          <ellipse cx="123" cy="306" rx="29" ry="15" fill="#f07917" />
          <ellipse cx="194" cy="306" rx="29" ry="15" fill="#f07917" />

          {headphones && (
            <g>
              <path d="M87 123c5-57 134-63 143 0" fill="none" stroke="#54218b" strokeWidth="15" strokeLinecap="round" />
              <rect x="70" y="118" width="24" height="58" rx="12" fill="#6725a0" />
              <rect x="221" y="118" width="24" height="58" rx="12" fill="#6725a0" />
            </g>
          )}
        </g>
      </svg>

      {study && (
        <div className="absolute -bottom-1 right-0 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-lg">
          <ClipboardCheck className="text-[#00a38f]" size={32} />
        </div>
      )}
      {headphones && (
        <div className="absolute right-1 top-3 grid h-11 w-11 place-items-center rounded-full bg-[#f3e8ff]">
          <Headphones className="text-[#5a1e91]" size={22} />
        </div>
      )}
      {celebrate && (
        <div className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full bg-[#fff1c6]">
          <Sparkles className="text-[#f8a100]" size={20} />
        </div>
      )}
    </div>
  );
}
