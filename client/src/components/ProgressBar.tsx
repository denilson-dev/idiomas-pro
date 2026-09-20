type Props = { current: number; total: number };

export default function ProgressBar({ current, total }: Props) {
  const step = total > 0 ? Math.min(current + 1, total) : 0;
  const percentage = total > 0 ? Math.round((step / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-[13px] font-black text-[#2b0d71] sm:text-sm">
        <span>Questão {step} de {total}</span>
        <span className="whitespace-nowrap font-bold text-[#4d2588]">{percentage}% concluído</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e9e3f5] shadow-inner sm:h-2.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#ff2d5f] via-[#ff4770] to-[#ff6688] shadow-[0_2px_8px_rgba(255,45,95,.25)] transition-[width] duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
