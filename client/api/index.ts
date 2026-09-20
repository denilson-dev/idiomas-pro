import { randomUUID } from 'node:crypto';
import { questions, type Category, type Level, type PlacementQuestion } from './questions.js';

type Req = {
  method?: string;
  url?: string;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
};
type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
  send: (body?: unknown) => void;
  setHeader: (name: string, value: string) => void;
};

const levels: Level[] = ['A1','A2','B1','B2','C1','C2'];

function respond(res: Res, code: number, body: unknown) {
  res.status(code).json(body);
}

function pathOf(req: Req) {
  const p = req.query?.path;
  if (Array.isArray(p)) return p.join('/');
  if (typeof p === 'string') return p.replace(/^\/+|\/+$/g, '');
  return (req.url ?? '').split('?')[0]
    .replace(/^\/api\/?/, '')
    .replace(/^index\/?/, '')
    .replace(/^\/+|\/+$/g, '');
}

function bodyOf(req: Req): Record<string, unknown> {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return req.body && typeof req.body === 'object'
    ? req.body as Record<string, unknown>
    : {};
}

function authenticated(req: Req) {
  const token = req.headers['x-session-token'];
  return typeof token === 'string' && token.length > 4;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function choose(count: number) {
  const wanted = Math.max(15, Math.min(20, count));
  const selected: PlacementQuestion[] = [];
  const used = new Set<string>();

  const firstListening = shuffle(questions.filter(q => q.category === 'LISTENING'))[0];
  selected.push(firstListening);
  used.add(firstListening.id);

  let cursor = 0;
  while (selected.length < wanted && cursor < 240) {
    const level = levels[cursor % levels.length];
    const candidate = shuffle(questions.filter(q => q.level === level && !used.has(q.id)))[0];
    if (candidate) {
      selected.push(candidate);
      used.add(candidate.id);
    }
    cursor++;
  }

  return shuffle(selected).slice(0, wanted);
}

function publicQuestion(q: PlacementQuestion) {
  return {
    id: q.id,
    prompt: q.prompt,
    options: q.options,
    category: q.category,
    mediaType: q.mediaType ?? null,
    mediaUrl: q.speechText ? `/api/tts?questionId=${encodeURIComponent(q.id)}` : (q.mediaUrl ?? null),
  };
}

async function synthesizeWithGoogleCloud(text: string) {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'es-ES',
          name: process.env.GOOGLE_TTS_VOICE || 'es-ES-Chirp3-HD-Zephyr',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.92,
        },
      }),
    },
  );

  if (!response.ok) return null;
  const body = await response.json() as { audioContent?: string };
  return body.audioContent ? Buffer.from(body.audioContent, 'base64') : null;
}

async function synthesizeWithGoogleTranslate(text: string) {
  const url = new URL('https://translate.google.com/translate_tts');
  url.searchParams.set('ie', 'UTF-8');
  url.searchParams.set('client', 'tw-ob');
  url.searchParams.set('tl', 'es-ES');
  url.searchParams.set('q', text);

  const response = await fetch(url, {
    headers: {
      'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
      'User-Agent': 'Mozilla/5.0 (compatible; IdiomasPro/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao sintetizar áudio: HTTP ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function encodeAttempt(ids: string[]) {
  return Buffer.from(JSON.stringify({ q: ids, t: Date.now() })).toString('base64url');
}

function decodeAttempt(id: string) {
  try {
    const parsed = JSON.parse(Buffer.from(id, 'base64url').toString('utf8')) as { q?: string[] };
    return Array.isArray(parsed.q) ? parsed.q : [];
  } catch {
    return [];
  }
}

function cefr(score: number): Level {
  if (score <= 20) return 'A1';
  if (score <= 40) return 'A2';
  if (score <= 60) return 'B1';
  if (score <= 80) return 'B2';
  if (score <= 95) return 'C1';
  return 'C2';
}

function recommendations(level: Level) {
  const byLevel: Record<Level, Array<{title:string;description:string;tag:string}>> = {
    A1:[
      {title:'Espanhol Essencial A1',description:'Base de comunicação, apresentação, números e situações cotidianas.',tag:'Fundamentos'},
      {title:'Pronúncia sem medo',description:'Treino guiado de sons, ritmo e compreensão inicial.',tag:'Conversação'}
    ],
    A2:[
      {title:'Espanhol Prático A2',description:'Amplie vocabulário e ganhe autonomia em viagens e rotina.',tag:'Evolução'},
      {title:'Listening A2',description:'Áudios curtos e conversas reais em velocidade controlada.',tag:'Listening'}
    ],
    B1:[
      {title:'Espanhol Intermediário B1',description:'Consolide tempos verbais e argumentação em situações reais.',tag:'Intermediário'},
      {title:'Conversação B1+',description:'Aulas focadas em fluência, vocabulário ativo e correção.',tag:'Conversação'}
    ],
    B2:[
      {title:'Fluência B2',description:'Aprofunde estruturas, compreensão e espontaneidade.',tag:'Avançado'},
      {title:'Espanhol Profissional',description:'Reuniões, apresentações, e-mails e contexto corporativo.',tag:'Carreira'}
    ],
    C1:[
      {title:'Domínio C1',description:'Nuances, registros, precisão lexical e compreensão de alta complexidade.',tag:'Proficiência'},
      {title:'Conversação avançada',description:'Debates, improvisação e refinamento de naturalidade.',tag:'Conversação'}
    ],
    C2:[
      {title:'Laboratório C2',description:'Manutenção de proficiência, repertório cultural e linguagem especializada.',tag:'Excelência'},
      {title:'Mentoria de Proficiência',description:'Plano individual para objetivos acadêmicos ou profissionais.',tag:'Mentoria'}
    ]
  };
  return byLevel[level];
}

export default async function handler(req: Req, res: Res) {
  const path = pathOf(req);
  const method = (req.method ?? 'GET').toUpperCase();

  if (path === 'tts' && method === 'GET') {
    const rawQuestionId = req.query?.questionId;
    const questionId = Array.isArray(rawQuestionId) ? rawQuestionId[0] : rawQuestionId;
    const question = questions.find((item) => item.id === questionId && item.category === 'LISTENING');

    if (!question?.speechText) {
      return respond(res, 404, { message: 'Áudio de listening não encontrado.' });
    }

    try {
      const audio =
        await synthesizeWithGoogleCloud(question.speechText) ??
        await synthesizeWithGoogleTranslate(question.speechText);

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000');
      res.setHeader('Content-Length', String(audio.length));
      return res.status(200).send(audio);
    } catch (error) {
      console.error('TTS error', error);
      return respond(res, 502, { message: 'Não foi possível gerar o áudio agora.' });
    }
  }

  if ((path === 'health' || path === '') && method === 'GET') {
    return respond(res, 200, {
      status:'ok',
      service:'idiomas-pro-api',
      runtime:'vercel-serverless',
      root:'client'
    });
  }

  if (path === 'auth/anonymous' && method === 'POST') {
    return respond(res, 201, {
      token:'anon-' + randomUUID(),
      expiresAt:new Date(Date.now() + 86400000).toISOString(),
      user:null
    });
  }

  if (path === 'auth/login' && method === 'POST') {
    const body = bodyOf(req);
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    if (email !== 'aluno@idiomaspro.com' || password !== 'Teste123!') {
      return respond(res, 401, { message:'E-mail ou senha incorretos.' });
    }
    return respond(res, 200, {
      token:'demo-' + randomUUID(),
      expiresAt:new Date(Date.now() + 30 * 86400000).toISOString(),
      user:{ id:'demo-user', name:'Aluno Demonstração', email }
    });
  }

  if (path === 'auth/register' && method === 'POST') {
    const body = bodyOf(req);
    const name = String(body.name ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    if (name.length < 2 || !email.includes('@') || password.length < 6) {
      return respond(res, 400, { message:'Preencha nome, e-mail e senha corretamente.' });
    }
    return respond(res, 201, {
      token:'user-' + randomUUID(),
      expiresAt:new Date(Date.now() + 30 * 86400000).toISOString(),
      user:{ id:randomUUID(), name, email }
    });
  }

  if (path === 'auth/logout' && method === 'POST') {
    return res.status(204).send();
  }

  if (path === 'test/start' && method === 'GET') {
    if (!authenticated(req)) {
      return respond(res, 401, { message:'Sessão inválida ou expirada.' });
    }
    const raw = req.query?.count;
    const count = Number(Array.isArray(raw) ? raw[0] : raw ?? 18);
    const selected = choose(Number.isFinite(count) ? count : 18);
    return respond(res, 201, {
      attemptId:encodeAttempt(selected.map(q => q.id)),
      totalQuestions:selected.length,
      questions:selected.map(publicQuestion)
    });
  }

  const submit = path.match(/^test\/([^/]+)\/submit$/);
  if (submit && method === 'POST') {
    if (!authenticated(req)) {
      return respond(res, 401, { message:'Sessão inválida ou expirada.' });
    }

    const ids = decodeAttempt(submit[1]);
    if (!ids.length) return respond(res, 400, { message:'Tentativa inválida.' });

    const body = bodyOf(req);
    const answers = Array.isArray(body.answers)
      ? body.answers as Array<{questionId?:string;selectedAnswer?:string}>
      : [];

    if (answers.length !== ids.length) {
      return respond(res, 400, { message:`Responda todas as ${ids.length} questões antes de finalizar.` });
    }

    const answerMap = new Map(answers.map(a => [a.questionId, a.selectedAnswer]));
    const selected = ids.map(id => questions.find(q => q.id === id))
      .filter(Boolean) as PlacementQuestion[];

    if (selected.length !== ids.length) {
      return respond(res, 400, { message:'Conjunto de questões inválido.' });
    }

    const scored = selected.map(q => ({
      q,
      correct:answerMap.get(q.id) === q.correctAnswer
    }));
    const correct = scored.filter(item => item.correct).length;
    const score = Math.round((correct / scored.length) * 100);
    const level = cefr(score);
    const categories: Category[] = ['GRAMMAR','VOCABULARY','LISTENING'];
    const breakdown = categories.map(category => {
      const items = scored.filter(item => item.q.category === category);
      const hits = items.filter(item => item.correct).length;
      return {
        category,
        label:category === 'GRAMMAR' ? 'Gramática' : category === 'VOCABULARY' ? 'Vocabulário' : 'Listening',
        correct:hits,
        total:items.length,
        percentage:items.length ? Math.round((hits / items.length) * 100) : 0
      };
    });

    return respond(res, 200, {
      attemptId:submit[1],
      id:submit[1],
      score,
      cefrLevel:level,
      correct,
      total:scored.length,
      totalQuestions:scored.length,
      breakdown,
      completedAt:new Date().toISOString(),
      recommendations:recommendations(level)
    });
  }

  if (path === 'results/history' && method === 'GET') {
    if (!authenticated(req)) {
      return respond(res, 401, { message:'Sessão inválida ou expirada.' });
    }
    return respond(res, 200, { attempts:[] });
  }

  return respond(res, 404, { message:'Rota da API não encontrada.', path, method });
}
