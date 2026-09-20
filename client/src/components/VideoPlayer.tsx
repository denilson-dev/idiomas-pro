import { Headphones, Video } from 'lucide-react';

type Props = {
  type: 'AUDIO' | 'VIDEO';
  src: string;
};

export default function VideoPlayer({ type, src }: Props) {
  if (type === 'VIDEO') {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-2.5 sm:p-3">
        <div className="mb-2 flex items-center gap-2 px-1 text-xs font-medium text-slate-300 sm:text-sm">
          <Video size={15} /> Vídeo de compreensão
        </div>
        <video className="w-full rounded-xl" controls playsInline preload="metadata" src={src} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.055] p-3 sm:p-4">
      <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-cyan-100 sm:mb-3 sm:text-sm">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-cyan-300/10">
          <Headphones size={16} />
        </span>
        Ouça antes de responder
      </div>
      <audio className="block w-full max-w-full" controls preload="metadata" src={src} />
    </div>
  );
}
