import { Headphones, Play, RotateCcw, Square, Video, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type Props = {
  type: 'AUDIO' | 'VIDEO';
  src: string;
  speechText?: string | null;
};

function scoreVoice(voice: SpeechSynthesisVoice) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  if (lang === 'es-es') score += 100;
  else if (lang.startsWith('es-')) score += 80;
  else if (lang === 'es') score += 70;

  if (/premium|enhanced|natural|neural/.test(name)) score += 60;
  if (/google/.test(name)) score += 50;
  if (/m[oó]nica|paulina|luciana|alba|helena|jorge|alvaro|[áa]lvaro|diego/.test(name)) score += 45;
  if (voice.localService) score += 5;

  return score;
}

function pickSpanishVoice() {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  return voices
    .filter((voice) => voice.lang.toLowerCase().startsWith('es'))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] ?? null;
}

export default function VideoPlayer({ type, src, speechText }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const [played, setPlayed] = useState(false);
  const fallbackAudio = useRef<HTMLAudioElement | null>(null);

  const speechSupported = useMemo(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    [],
  );

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      fallbackAudio.current?.pause();
    };
  }, [speechText, src]);

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

  function stopPlayback() {
    window.speechSynthesis?.cancel();
    fallbackAudio.current?.pause();
    setSpeaking(false);
  }

  function playFallback() {
    fallbackAudio.current?.pause();
    const audio = new Audio(src);
    fallbackAudio.current = audio;
    audio.preload = 'auto';
    audio.onplay = () => setSpeaking(true);
    audio.onended = () => {
      setSpeaking(false);
      setPlayed(true);
    };
    audio.onerror = () => setSpeaking(false);
    void audio.play();
  }

  function playSpeech() {
    if (!speechText || !speechSupported) {
      playFallback();
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'es-ES';
    utterance.rate = 0.88;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voice = pickSpanishVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      setPlayed(true);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      playFallback();
    };

    window.speechSynthesis.speak(utterance);
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
            <div className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">Voz espanhola · dicção clara</div>
          </div>
        </div>

        <Volume2 size={17} className="shrink-0 text-violet-300" />
      </div>

      <button
        type="button"
        onClick={speaking ? stopPlayback : playSpeech}
        className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.055] px-4 py-3 text-sm font-bold text-white transition hover:border-cyan-300/30 hover:bg-white/[0.08] active:scale-[.99]"
      >
        {speaking ? (
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

      <p className="mt-2 text-center text-[10px] leading-4 text-slate-500 sm:text-xs">
        Você pode repetir o áudio antes de responder.
      </p>
    </div>
  );
}
