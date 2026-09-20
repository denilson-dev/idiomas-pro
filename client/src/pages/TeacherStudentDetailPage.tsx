import { ArrowLeft, CheckCircle2, Headphones, Mail, UserRound, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import BrandHeader from '../components/BrandHeader';
import { api, type TeacherAttemptDetail } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function TeacherStudentDetailPage() {
  const teacherToken = useAppStore((state) => state.teacherToken);
  const navigate = useNavigate();
  const { attemptId } = useParams();
  const [data, setData] = useState<TeacherAttemptDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!teacherToken || !attemptId) return;
    api.getTeacherAttempt(teacherToken, attemptId)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Resultado indisponível.'));
  }, [teacherToken, attemptId]);

  if (!teacherToken) return <Navigate to="/professor" replace />;

  if (!data) {
    return <main className="safe-page grid place-items-center px-6 text-center font-bold text-[#7656a7]">{error || 'Carregando resultado do aluno...'}</main>;
  }

  return (
    <main className="safe-page px-4 sm:px-6">
      <div className="app-shell">
        <BrandHeader subtitle="Detalhes do aluno" />
        <button onClick={() => navigate('/professor/painel')} className="secondary-cta mt-4 flex min-h-11 items-center gap-2 rounded-2xl px-4 font-black"><ArrowLeft size={18}/> Voltar ao painel</button>

        <section className="paper-card mt-5 rounded-[1.8rem] p-5 sm:p-7">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[.15em] text-[#008f81]">Resultado do nivelamento</p>
              <h1 className="mt-2 text-3xl font-black text-[#2b0d71] sm:text-4xl">{data.studentName || 'Aluno'}</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-[#7656a7]">
                <span className="flex items-center gap-1.5"><Mail size={15}/>{data.studentEmail || 'Sem e-mail'}</span>
                <span className="flex items-center gap-1.5"><UserRound size={15}/>{data.completedAt ? new Date(data.completedAt).toLocaleString('pt-BR') : 'Data indisponível'}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right"><div className="text-sm font-bold text-[#7656a7]">Aproveitamento</div><div className="text-3xl font-black text-[#ff2d5f]">{data.score ?? 0}%</div></div>
              <div className="grid h-24 w-24 place-items-center rounded-[1.5rem] bg-[#e8faf6] text-4xl font-black text-[#008f81]">{data.cefrLevel ?? '—'}</div>
            </div>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-3 gap-2 sm:gap-4">
          {(data.breakdown ?? []).map((item) => (
            <article key={item.category} className="soft-card rounded-2xl p-3 sm:p-4">
              <div className="text-xl font-black text-[#2b0d71]">{item.percentage}%</div>
              <div className="mt-1 truncate text-xs font-black text-[#7656a7]">{item.label}</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eee8f7]"><div className="h-full rounded-full bg-gradient-to-r from-[#ff2d5f] to-[#00a38f]" style={{ width: `${item.percentage}%` }}/></div>
            </article>
          ))}
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center gap-2"><Headphones size={20} className="text-[#5d238e]"/><h2 className="text-2xl font-black text-[#2b0d71]">Respostas da avaliação</h2></div>
          <div className="space-y-3">
            {data.answers.map((answer, index) => (
              <article key={index} className={`rounded-[1.4rem] border p-4 ${answer.isCorrect ? 'border-[#bdebe0] bg-[#f0fcf8]' : 'border-[#f5ccd7] bg-[#fff6f8]'}`}>
                <div className="flex items-start gap-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${answer.isCorrect ? 'bg-[#dff8f1] text-[#008f81]' : 'bg-[#ffe5ec] text-[#d62f59]'}`}>
                    {answer.isCorrect ? <CheckCircle2 size={19}/> : <XCircle size={19}/>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-black text-[#2b0d71]">{answer.question}</div>
                    <div className="mt-2 text-xs text-[#7656a7]">Resposta do aluno: <strong>{answer.selectedAnswer}</strong></div>
                    {!answer.isCorrect && <div className="mt-1 text-xs text-[#008f81]">Resposta correta: <strong>{answer.correctAnswer}</strong></div>}
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[#7656a7]">{answer.category}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
