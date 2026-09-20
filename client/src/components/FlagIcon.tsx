type FlagCode = 'BR' | 'ES' | 'US' | 'FR';

type Props = {
  code: FlagCode;
  className?: string;
  title?: string;
};

export default function FlagIcon({ code, className = '', title }: Props) {
  const common = `overflow-hidden rounded-full ring-1 ring-black/5 shadow-sm ${className}`;

  if (code === 'BR') {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label={title ?? 'Brasil'} className={common}>
        <defs><clipPath id="flag-br"><circle cx="24" cy="24" r="24"/></clipPath></defs>
        <g clipPath="url(#flag-br)">
          <rect width="48" height="48" fill="#169B62"/>
          <path d="M24 7 44 24 24 41 4 24Z" fill="#FFDF00"/>
          <circle cx="24" cy="24" r="9.2" fill="#002776"/>
          <path d="M15.7 21.9c5.7-2.1 11.2-1.3 16.6 2.3" fill="none" stroke="#fff" strokeWidth="1.7"/>
        </g>
      </svg>
    );
  }

  if (code === 'ES') {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label={title ?? 'Espanha'} className={common}>
        <defs><clipPath id="flag-es"><circle cx="24" cy="24" r="24"/></clipPath></defs>
        <g clipPath="url(#flag-es)">
          <rect width="48" height="48" fill="#AA151B"/>
          <rect y="12" width="48" height="24" fill="#F1BF00"/>
          <rect x="13" y="19" width="5" height="10" rx="1" fill="#AA151B" opacity=".9"/>
          <rect x="18.2" y="20.5" width="2.2" height="7" fill="#AA151B" opacity=".72"/>
        </g>
      </svg>
    );
  }

  if (code === 'US') {
    return (
      <svg viewBox="0 0 48 48" role="img" aria-label={title ?? 'Estados Unidos'} className={common}>
        <defs><clipPath id="flag-us"><circle cx="24" cy="24" r="24"/></clipPath></defs>
        <g clipPath="url(#flag-us)">
          <rect width="48" height="48" fill="#fff"/>
          {[0, 8, 16, 24, 32, 40].map((y) => <rect key={y} y={y} width="48" height="4" fill="#B22234"/>)}
          <rect width="24" height="24" fill="#3C3B6E"/>
          {[5,11,17].flatMap((y) => [5,11,17].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill="#fff"/>))}
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" role="img" aria-label={title ?? 'França'} className={common}>
      <defs><clipPath id="flag-fr"><circle cx="24" cy="24" r="24"/></clipPath></defs>
      <g clipPath="url(#flag-fr)">
        <rect width="16" height="48" fill="#0055A4"/>
        <rect x="16" width="16" height="48" fill="#fff"/>
        <rect x="32" width="16" height="48" fill="#EF4135"/>
      </g>
    </svg>
  );
}
