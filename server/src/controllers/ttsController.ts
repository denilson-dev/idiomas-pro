import { fileURLToPath } from 'node:url';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

const LISTENING_SCRIPTS: Record<string, string> = {
  '/media/listening-a1.mp3': 'Ana vive en Madrid.',
  '/media/listening-a2.mp3': 'La clase de español empieza a las nueve.',
  '/media/listening-b1.mp3': 'Carlos llegará tarde porque perdió el autobús.',
  '/media/listening-b2.mp3': 'Laura propone cambiar la fecha de entrega para resolver el problema.',
  '/media/listening-c1.mp3': 'Mi principal preocupación es que todavía no tenemos datos confiables para tomar una decisión.',
  '/media/listening-c2.mp3': 'La propuesta me parece razonable y podría funcionar, aunque todavía tengo algunas reservas importantes.',
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function synthesizeWithGoogleCloud(text: string) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) return null;

  const voiceName = process.env.GOOGLE_TTS_VOICE || 'es-ES-Chirp3-HD-Zephyr';

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'es-ES',
          name: voiceName,
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.90,
        },
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text().catch(() => '');
    console.error(`Google Cloud TTS falhou: HTTP ${response.status}`, details.slice(0, 300));
    return null;
  }

  const body = await response.json() as { audioContent?: string };
  return body.audioContent ? Buffer.from(body.audioContent, 'base64') : null;
}

async function synthesizeWithGoogleTranslate(text: string) {
  const url = new URL('https://translate.google.com/translate_tts');
  url.searchParams.set('ie', 'UTF-8');
  url.searchParams.set('client', 'tw-ob');
  url.searchParams.set('tl', 'es');
  url.searchParams.set('q', text);

  const response = await fetch(url, {
    headers: {
      Accept: 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (compatible; IdiomasPro/1.0)',
    },
  });

  if (!response.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}

export async function getListeningAudio(req: Request, res: Response) {
  const questionId = firstParam(req.params.questionId);
  if (!questionId) return res.status(400).json({ message: 'Questão inválida.' });

  const question = await prisma.question.findFirst({
    where: { id: questionId, category: 'LISTENING', isActive: true },
    select: { mediaUrl: true },
  });

  if (!question?.mediaUrl) {
    return res.status(404).json({ message: 'Áudio de listening não encontrado.' });
  }

  const script = LISTENING_SCRIPTS[question.mediaUrl];
  if (!script) {
    return res.status(404).json({ message: 'Texto de listening não configurado.' });
  }

  try {
    const googleCloudAudio = await synthesizeWithGoogleCloud(script);
    const audio = googleCloudAudio ?? await synthesizeWithGoogleTranslate(script);

    if (audio?.length) {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
      res.setHeader('Content-Length', String(audio.length));
      res.setHeader('X-TTS-Provider', googleCloudAudio ? 'google-cloud' : 'google-translate-fallback');
      return res.status(200).send(audio);
    }
  } catch (error) {
    console.error('Falha no TTS externo:', error);
  }

  const fallback = fileURLToPath(
    new URL(`../../../client/dist${question.mediaUrl}`, import.meta.url),
  );
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('X-TTS-Provider', 'local-mp3-fallback');
  return res.sendFile(fallback);
}
