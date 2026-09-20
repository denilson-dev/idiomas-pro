import { Headphones, Video } from 'lucide-react';

type Props = {
  type: 'AUDIO' | 'VIDEO';
  src: string;
};

export default function VideoPlayer({ type, src }: Props) {
  if (type === 'VIDEO') {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-2">
        <div className="mb-2 flex items-center gap-2 px-2 text-sm text-slate-300"><Video size={16} /> Vídeo de compreensão</div>
        <video className="w-full rounded-xl" controls preload="metadata" src={src} />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-100"><Headphones size={17} /> Ouça antes de responder</div>
      <audio className="w-full" controls preload="metadata" src={src} />
    </div>
  );
}
