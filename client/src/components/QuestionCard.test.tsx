import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import QuestionCard from './QuestionCard';
import type { Question } from '../services/api';

const question: Question = {
  id: 'question-1',
  prompt: 'Complete: “Yo ___ estudiante.”',
  options: ['soy', 'eres', 'somos', 'está'],
  category: 'GRAMMAR',
  mediaType: null,
  mediaUrl: null,
};

describe('QuestionCard', () => {
  it('renderiza enunciado, categoria e alternativas', () => {
    render(<QuestionCard question={question} onSelect={() => undefined} />);

    expect(screen.getByText('Gramática')).toBeInTheDocument();
    expect(screen.getByText(question.prompt)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /soy/i })).toBeInTheDocument();
  });

  it('envia a alternativa escolhida', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<QuestionCard question={question} onSelect={onSelect} />);
    await user.click(screen.getByRole('button', { name: /eres/i }));

    expect(onSelect).toHaveBeenCalledWith('eres');
  });

  it('não exibe nível CEFR durante a questão', () => {
    render(<QuestionCard question={question} onSelect={() => undefined} />);

    expect(screen.queryByText(/\b(A1|A2|B1|B2|C1|C2)\b/)).not.toBeInTheDocument();
  });
});
