import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Headphones,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { api, type Question } from '../services/api';
import { saveResult } from '../services/resultStorage';
import { useAppStore } from '../store/useAppStore';
import { Button, Pill, Surface, Toast } from './UI';
import { PublicHeader } from './Shell';
import {
  clearExamDraft,
  loadExamDraft,
  saveExamDraft,
  type ExamDraft,
} from './examDraft';

function categoryLabel(category: Question['category']) {
  if (category === 'GRAMMAR') return 'Gramática';
  if (category === 'VOCABULARY') return 'Vocabulário';
  return 'Listening';
}

function categoryTone(category: Question['category']) {
  if (category === 'GRAMMAR') return 'pink' as const;
  if (category === 'VOCABULARY') return 'orange' as const;
  return 'teal' as const;
}

export function TestPage() {
  const navigate = useNavigate();
  const token = useAppStore((state) => state.token);
  const testProfile = useAppStore((state) => state.testProfile);
  const started = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [draft, setDraft] = useState<ExamDraft | null>(() => loadExamDraft());
  const [loading, setLoading] = useState(!draft);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !testProfile || draft || started.current) return;
    started.current = true;

    api
      .startTest(token, {
        count: testProfile.count,
        studentName: testProfile.studentName,
        studentEmail: testProfile.studentEmail,
        teacherId: testProfile.teacherId,
        language: testProfile.language,
      })
      .then((data) => {
        const next: ExamDraft = {
          attemptId: data.attemptId,
          questions: data.questions,
          answers: {},
          currentIndex: 0,
        };
        setDraft(next);
        saveExamDraft(next);
      })
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : 'Não foi possível iniciar a avaliação.'),
      )
      .finally(() => setLoading(false));
  }, [token, testProfile, draft]);

  useEffect(() => {
    if (draft) saveExamDraft(draft);
  }, [draft]);

  useEffect(
    () => () => {
      audioRef.current?.pause();
    },
    [],
  );

  const current = draft?.questions[draft.currentIndex];
  const answeredCount = draft ? Object.keys(draft.answers).length : 0;
  const progress = draft
    ? Math.round(((draft.currentIndex + 1) / Math.max(1, draft.questions.length)) * 100)
    : 0;

  const categorySummary = useMemo(() => {
    if (!draft) return [];
    return (['GRAMMAR', 'VOCABULARY', 'LISTENING'] as const).map((category) => {
      const questions = draft.questions.filter((question) => question.category === category);
      return {
        category,
        total: questions.length,
        answered: questions.filter((question) => draft.answers[question.id] !== undefined).length,
      };
    });
  }, [draft]);

  if (!token) return <Navigate to="/" replace />;
  if (!testProfile && !draft) return <Navigate to="/setup" replace />;

  function selectAnswer(answer: string) {
    if (!draft || !current) return;
    setDraft({
      ...draft,
      answers: {
        ...draft.answers,
        [current.id]: answer,
      },
    });
  }

  function goTo(index: number) {
    if (!draft) return;
    setPlaying(false);
    audioRef.current?.pause();
    setDraft({
      ...draft,
      currentIndex: Math.max(0, Math.min(draft.questions.length - 1, index)),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetCurrentAttempt() {
    if (!draft) return;
    setDraft({ ...draft, answers: {}, currentIndex: 0 });
    setMessage('');
  }

  function toggleAudio() {
    if (!current) return;
    const source = current.mediaUrl || api.getListeningAudioUrl(current.id);

    if (!audioRef.current || audioRef.current.src !== new URL(source, window.location.origin).href) {
      audioRef.current?.pause();
      audioRef.current = new Audio(source);
      audioRef.current.onended = () => setPlaying(false);
      audioRef.current.onerror = () => {
        setPlaying(false);
        setMessage('Não foi possível reproduzir este áudio.');
      };
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setMessage('O navegador bloqueou a reprodução. Toque novamente em reproduzir.'));
    }
  }

  if (loading) {
    return (
      <div className="exam-page">
        <PublicHeader />
        <Surface className="empty">
          <div className="empty__icon">✦</div>
          <h3>Preparando sua avaliação</h3>
          <p>Carregando as questões e configurando seu teste.</p>
        </Surface>
      </div>
    );
  }

  if (!draft || !current) {
    return (
      <div className="exam-page">
        <PublicHeader />
        <Surface className="empty">
          <h3>Não foi possível carregar a prova</h3>
          <p>{message || 'Tente iniciar uma nova avaliação.'}</p>
          <Button onClick={() => navigate('/language')}>Voltar ao início</Button>
        </Surface>
      </div>
    );
  }

  return (
    <div className="exam-page">
      <PublicHeader />

      <div className="exam-progress">
        <div>
          <Pill tone="purple">
            Questão {draft.currentIndex + 1} de {draft.questions.length}
          </Pill>
          <span>{progress}%</span>
        </div>
        <div className="progress-track">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="exam-layout">
        <Surface className="question-panel">
          <Pill tone={categoryTone(current.category)}>{categoryLabel(current.category)}</Pill>
          <h1>{current.prompt}</h1>

          {current.category === 'LISTENING' && (
            <Surface className="audio-player">
              <Button variant="secondary" onClick={toggleAudio}>
                {playing ? <Pause size={17} /> : <Play size={17} />}
                {playing ? 'Pausar' : 'Reproduzir'}
              </Button>
              <div className={`wave ${playing ? 'wave--playing' : ''}`}>
                {Array.from({ length: 18 }).map((_, index) => (
                  <i key={index} />
                ))}
              </div>
              <span>Áudio</span>
            </Surface>
          )}

          <div className="answer-list">
            {current.options.map((option, index) => {
              const selected = draft.answers[current.id] === option;
              return (
                <button
                  type="button"
                  key={option}
                  className={`answer ${selected ? 'answer--selected' : ''}`}
                  onClick={() => selectAnswer(option)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  <b>{option}</b>
                  {selected && <CheckCircle2 size={18} />}
                </button>
              );
            })}
          </div>

          <div className="exam-actions">
            <Button
              variant="secondary"
              disabled={draft.currentIndex === 0}
              onClick={() => goTo(draft.currentIndex - 1)}
            >
              <ArrowLeft size={17} /> Anterior
            </Button>

            {draft.currentIndex < draft.questions.length - 1 ? (
              <Button
                disabled={!draft.answers[current.id]}
                onClick={() => goTo(draft.currentIndex + 1)}
              >
                Próxima <ArrowRight size={17} />
              </Button>
            ) : (
              <Button
                disabled={!draft.answers[current.id]}
                onClick={() => navigate('/review')}
              >
                Revisar respostas <ArrowRight size={17} />
              </Button>
            )}
          </div>
        </Surface>

        <Surface className="exam-side">
          <h3>Seu progresso</h3>
          {categorySummary.map((item) => (
            <div className="skill-progress" key={item.category}>
              <div>
                <b>{categoryLabel(item.category)}</b>
                <span>
                  {item.answered}/{item.total}
                </span>
              </div>
              <div className="mini-track">
                <i
                  style={{
                    width: `${item.total ? (item.answered / item.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}

          <div className="tip">
            <Headphones size={18} />
            <div>
              <b>Dica</b>
              <p>Você pode avançar e voltar antes de finalizar.</p>
            </div>
          </div>

          <Button variant="ghost" className="full" onClick={resetCurrentAttempt}>
            <RotateCcw size={16} /> Limpar respostas
          </Button>

          <p className="muted" style={{ marginTop: 18, fontSize: 11 }}>
            {answeredCount} de {draft.questions.length} respondidas
          </p>
        </Surface>
      </div>

      {message && <Toast message={message} tone="error" />}
    </div>
  );
}

export function ReviewPage() {
  const navigate = useNavigate();
  const token = useAppStore((state) => state.token);
  const clearTestProfile = useAppStore((state) => state.clearTestProfile);
  const [draft, setDraft] = useState<ExamDraft | null>(() => loadExamDraft());
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  if (!token) return <Navigate to="/" replace />;
  if (!draft) return <Navigate to="/test" replace />;

  const pending = draft.questions.filter((question) => !draft.answers[question.id]);
  const answered = draft.questions.length - pending.length;

  function editQuestion(index: number) {
    const next = { ...draft, currentIndex: index };
    setDraft(next);
    saveExamDraft(next);
    navigate('/test');
  }

  async function finish() {
    if (pending.length) {
      setMessage('Responda todas as questões antes de finalizar.');
      return;
    }

    try {
      setSubmitting(true);
      setMessage('');
      const result = await api.submitTest(
        token,
        draft.attemptId,
        draft.questions.map((question) => ({
          questionId: question.id,
          selectedAnswer: draft.answers[question.id],
        })),
      );

      saveResult({ ...result, id: draft.attemptId, attemptId: draft.attemptId });
      clearExamDraft();
      clearTestProfile();
      navigate(`/result/${draft.attemptId}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Não foi possível finalizar a avaliação.');
      setSubmitting(false);
    }
  }

  return (
    <div className="public-page">
      <PublicHeader />
      <section className="page-intro">
        <Pill tone="purple">Revisão</Pill>
        <h1>Revise antes de finalizar</h1>
        <p>Veja rapidamente o que já foi respondido e volte onde quiser antes de enviar.</p>
      </section>

      <div className="review-grid">
        <Surface className="review-map">
          <h3>Questões</h3>
          <div className="question-map">
            {draft.questions.map((question, index) => {
              const isPending = !draft.answers[question.id];
              return (
                <button
                  type="button"
                  key={question.id}
                  className={isPending ? 'pending' : ''}
                  onClick={() => editQuestion(index)}
                >
                  <b>{index + 1}</b>
                  <span>{isPending ? 'Pendente' : 'Respondida'}</span>
                </button>
              );
            })}
          </div>
        </Surface>

        <Surface className="review-summary">
          <h3>Resumo</h3>
          <dl>
            <div>
              <dt>Respondidas</dt>
              <dd>{answered}</dd>
            </div>
            <div>
              <dt>Pendentes</dt>
              <dd>{pending.length}</dd>
            </div>
            <div>
              <dt>Progresso</dt>
              <dd>{Math.round((answered / draft.questions.length) * 100)}%</dd>
            </div>
          </dl>
          <p>
            {pending.length
              ? 'Toque em uma questão pendente para voltar até ela.'
              : 'Tudo pronto para finalizar sua avaliação.'}
          </p>
          <Button className="full" disabled={submitting || pending.length > 0} onClick={finish}>
            {submitting ? 'Calculando resultado...' : 'Finalizar avaliação'}{' '}
            <CheckCircle2 size={18} />
          </Button>
        </Surface>
      </div>

      {message && <Toast message={message} tone="error" />}
    </div>
  );
}
