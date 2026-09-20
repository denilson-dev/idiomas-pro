import { Headphones, LoaderCircle, Play, RotateCcw, Square, Video } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Props = { type: 'AUDIO' | 'VIDEO'; src: string };

export default function VideoPlayer({ type, src }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setPlaying(false);
    setPlayed(false);
    setLoading(false);
    setError('');

    if (type !== 'AUDIO') return;

    const audio = new Audio(src);
    audio.preload = 'auto';

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

    audioRef.current = audio;
    audio.load();

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [src, type]);

  if (type === 'VIDEO') {
    return (
      <div className="overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/82 p-2.5 shadow-[0_12px_30px_rgba(43,13,113,.07)] backdrop-blur-xl">
        <div className="mb-2 flex items-center gap-2 px-1 text-xs font-black uppercase tracking-[.08em] text-[#2b0d71]">
          <Video size={15}/> Vídeo de compreensão
        </div>
        <video className="w-full rounded-2xl" controls playsInline preload="metadata" src={src}/>
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
    const audio = audioRef.current;
    if (!audio) {
      setError('O áudio ainda está sendo preparado. Tente novamente em alguns segundos.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      audio.currentTime = 0;
      await audio.play();
    } catch {
      setPlaying(false);
      setLoading(false);
      setError('O navegador não iniciou o áudio. Toque novamente em “Ouvir áudio”.');
    }
  }

  const bars = [14,26,18,34,24,40,21,31,17,37,23,30,16,28,19,35,20];

  return (
    <div className="rounded-[1.35rem] border border-[#f1cad5] bg-[linear-gradient(145deg,rgba(255,247,250,.95),rgba(249,246,255,.88))] p-3.5 shadow-[0_14px_35px_rgba(255,45,95,.07)] backdrop-blur-xl sm:p-5">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label={playing ? 'Parar áudio' : played ? 'Repetir áudio' : 'Ouvir áudio'}
          onClick={playing ? stop : play}
          disabled={loading}
          className="primary-cta grid h-14 w-14 shrink-0 place-items-center rounded-full p-0 disabled:opacity-70 sm:h-18 sm:w-18"
        >
          {loading
            ? <LoaderCircle className="animate-spin" size={23}/>
            : playing
              ? <Square fill="currentColor" size={19}/>
              : played
                ? <RotateCcw size={23}/>
                : <Play className="ml-0.5" fill="currentColor" size={23}/>}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[.14em] text-[#5d238e] sm:text-xs">
            <Headphones size={14}/> Listening
          </div>

          <div className={`flex h-9 items-end gap-[3px] overflow-hidden sm:h-10 sm:gap-1 ${playing ? 'is-playing' : ''}`}>
            {bars.map((height, index) => (
              <span
                key={index}
                className={`wave-bar min-w-[3px] flex-1 rounded-full ${playing ? 'bg-gradient-to-t from-[#ff2d5f] to-[#ff7b9b]' : 'bg-[#d9cbed]'}`}
                style={{ height }}
              />
            ))}
          </div>

          <div className="mt-1.5 text-[11px] font-bold text-[#7656a7] sm:text-xs">
            {loading ? 'Carregando áudio...' : playing ? 'Reproduzindo áudio...' : played ? 'Pronto para repetir' : 'Toque para ouvir'}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-[#cceee6] bg-[#effbf8]/90 px-3 py-2.5 text-center text-[11px] font-bold leading-4 text-[#08786f] sm:mt-4 sm:text-sm">
        <Headphones size={15} className="shrink-0"/>
        Você pode ouvir o áudio quantas vezes quiser.
      </div>

      {error && <p className="mt-2 text-center text-[11px] font-bold text-[#c81f49] sm:text-xs">{error}</p>}
    </div>
  );
}
