import { Headphones, LoaderCircle, Play, RotateCcw, Square, Video, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  type: 'AUDIO' | 'VIDEO';
  src: string;
};

export default function VideoPlayer({ type, src }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [src]);

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

  function stop() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
    setLoading(false);
  }

  async function play() {
    try {
      setError('');
      setLoading(true);

      if (!audioRef.current) {
        const audio = new Audio(src);
        audio.preload = 'auto';
        audioRef.current = audio;

        audio.onplaying = () => {
          setLoading(false);
          setPlaying(true);
        };
        audio.onended = () => {
          setPlaying(false);
          setPlayed(true);
          setLoading(false);
        };
        audio.onerror = () => {
          setPlaying(false);
          setLoading(false);
          setError('Não foi possível carregar o áudio. Tente novamente.');
        };
      }

      const audio = audioRef.current;
      audio.currentTime = 0;
      await audio.play();
    } catch {
      setPlaying(false);
      setLoading(false);
      setError('O navegador bloqueou a reprodução. Toque novamente em “Ouvir áudio”.');
    }
  }

  return (
    <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.055] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-300/10 text-cyan-100">
            <Headphones size={17} />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-cyan-100 sm:text-sm">Compreensão auditiva</div>
            <div className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">Áudio em espanhol · reprodução pelo servidor</div>
          </div>
        </div>

        <Volume2 size={17} className="shrink-0 text-violet-300" />
      </div>

      <button
        type="button"
        onClick={playing ? stop : play}
        disabled={loading}
        className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/[0.08] active:scale-[.99] disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? (
          <>
            <LoaderCircle size={17} className="animate-spin" /> Carregando áudio...
          </>
        ) : playing ? (
          <>
            <Square size={16} fill="currentColor" /> Parar áudio
          </>
        ) : played ? (
          <>
            <RotateCcw size={17} /> Ouvir novamente
          </>
        ) : (
          <>
            <Play size={17} fill="currentColor" /> Ouvir áudio
          </>
        )}
      </button>

      {error ? (
        <p className="mt-2 text-center text-[10px] leading-4 text-rose-300 sm:text-xs">{error}</p>
      ) : (
        <p className="mt-2 text-center text-[10px] leading-4 text-slate-500 sm:text-xs">
          Você pode repetir o áudio antes de responder.
        </p>
      )}
    </div>
  );
}
