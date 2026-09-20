type Props = { current: number; total: number };

export default function ProgressBar({ current, total }: Props) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm font-black text-[#2b0d71]">
        <span>Questão {Math.min(current + 1, total)} de {total}</span>
        <span className="font-bold text-[#4d2588]">{percentage}% concluído</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#ece6f7]">
        <div className="h-full rounded-full bg-gradient-to-r from-[#ff2d5f] to-[#ff4e72] transition-all duration-500" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
