import { Headphones, LoaderCircle, Play, RotateCcw, Square, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Props = { type: 'AUDIO' | 'VIDEO'; src: string };

export default function VideoPlayer({ type, src }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => { audioRef.current?.pause(); audioRef.current = null; }, [src]);

  if (type === 'VIDEO') {
    return <div className="overflow-hidden rounded-2xl border border-[#e2d8f3] bg-white p-3">
      <div className="mb-2 flex items-center gap-2 text-sm font-black text-[#2b0d71]"><Video size={16}/> Vídeo de compreensão</div>
      <video className="w-full rounded-xl" controls playsInline preload="metadata" src={src}/>
    </div>;
  }

  function stop() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause(); audio.currentTime = 0;
    setPlaying(false); setLoading(false);
  }

  async function play() {
    try {
      setError(''); setLoading(true);
      if (!audioRef.current) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audioRef.current = audio;
        audio.onplaying = () => { setLoading(false); setPlaying(true); };
        audio.onended = () => { setPlaying(false); setPlayed(true); setLoading(false); };
        audio.onerror = () => { setPlaying(false); setLoading(false); setError('Não foi possível carregar o áudio. Tente novamente.'); };
      }
      const audio = audioRef.current;
      audio.currentTime = 0;
      await audio.play();
    } catch {
      setPlaying(false); setLoading(false);
      setError('Toque novamente em “Ouvir áudio”.');
    }
  }

  return (
    <div className="rounded-[1.6rem] border border-[#f2cbd6] bg-gradient-to-r from-[#fff4f7] to-[#fbf7ff] p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={playing ? stop : play}
          disabled={loading}
          className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#ff2d5f] text-white shadow-[0_10px_24px_rgba(255,45,95,.2)] disabled:opacity-70 sm:h-20 sm:w-20"
        >
          {loading ? <LoaderCircle className="animate-spin" size={26}/> : playing ? <Square fill="currentColor" size={22}/> : played ? <RotateCcw size={27}/> : <Play fill="currentColor" size={27}/>}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[.12em] text-[#5d238e]"><Headphones size={16}/> Listening</div>
          <div className="flex h-10 items-end gap-1 overflow-hidden">
            {[14,26,18,34,24,40,21,31,17,37,23,30,16,28,19,35,20].map((h,i) => <span key={i} className={`w-1.5 rounded-full ${playing ? 'bg-[#ff2d5f]' : 'bg-[#d8c8ef]'}`} style={{height:h}}/>)}
          </div>
          <div className="mt-2 text-xs font-bold text-[#7656a7]">{playing ? 'Reproduzindo áudio...' : played ? 'Pronto para repetir' : 'Toque para ouvir'}</div>
        </div>
      </div>

      <div className="mint-card mt-4 rounded-2xl px-4 py-3 text-center text-sm font-bold text-[#08786f]">
        Você pode ouvir o áudio quantas vezes quiser.
      </div>
      {error && <p className="mt-2 text-center text-xs font-bold text-[#c81f49]">{error}</p>}
    </div>
  );
}
