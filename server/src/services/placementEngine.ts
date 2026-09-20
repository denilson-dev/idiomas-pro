export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type Category = 'GRAMMAR' | 'VOCABULARY' | 'LISTENING';

export interface ScoredAnswer {
  category: Category;
  isCorrect: boolean;
}

export interface BreakdownItem {
  category: Category;
  label: string;
  correct: number;
  total: number;
  percentage: number;
}

export function mapScoreToCefr(score: number): CefrLevel {
  if (score <= 20) return 'A1';
  if (score <= 40) return 'A2';
  if (score <= 60) return 'B1';
  if (score <= 80) return 'B2';
  if (score <= 95) return 'C1';
  return 'C2';
}

export function calculateBreakdown(answers: ScoredAnswer[]): BreakdownItem[] {
  const labels: Record<Category, string> = {
    GRAMMAR: 'Gramática',
    VOCABULARY: 'Vocabulário',
    LISTENING: 'Listening',
  };

  return (Object.keys(labels) as Category[]).map((category) => {
    const items = answers.filter((answer) => answer.category === category);
    const correct = items.filter((answer) => answer.isCorrect).length;
    const total = items.length;

    return {
      category,
      label: labels[category],
      correct,
      total,
      percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
    };
  });
}

export function calculatePlacement(answers: ScoredAnswer[]) {
  const correct = answers.filter((answer) => answer.isCorrect).length;
  const total = answers.length;
  const score = total === 0 ? 0 : Math.round((correct / total) * 100);

  return {
    score,
    cefrLevel: mapScoreToCefr(score),
    correct,
    total,
    breakdown: calculateBreakdown(answers),
  };
}

export function getRecommendations(level: CefrLevel) {
  const next: Record<CefrLevel, Array<{ title: string; description: string; tag: string }>> = {
    A1: [
      { title: 'Espanhol Essencial A1', description: 'Base de comunicação, apresentação, números e situações cotidianas.', tag: 'Fundamentos' },
      { title: 'Pronúncia sem medo', description: 'Treino guiado de sons, ritmo e compreensão inicial.', tag: 'Conversação' },
    ],
    A2: [
      { title: 'Espanhol Prático A2', description: 'Amplie vocabulário e ganhe autonomia em viagens e rotina.', tag: 'Evolução' },
      { title: 'Listening A2', description: 'Áudios curtos e conversas reais em velocidade controlada.', tag: 'Listening' },
    ],
    B1: [
      { title: 'Espanhol Intermediário B1', description: 'Consolide tempos verbais e argumentação em situações reais.', tag: 'Intermediário' },
      { title: 'Conversação B1+', description: 'Aulas focadas em fluência, vocabulário ativo e correção.', tag: 'Conversação' },
    ],
    B2: [
      { title: 'Fluência B2', description: 'Aprofunde estruturas, compreensão e espontaneidade.', tag: 'Avançado' },
      { title: 'Espanhol Profissional', description: 'Reuniões, apresentações, e-mails e contexto corporativo.', tag: 'Carreira' },
    ],
    C1: [
      { title: 'Domínio C1', description: 'Nuances, registros, precisão lexical e compreensão de alta complexidade.', tag: 'Proficiência' },
      { title: 'Conversação avançada', description: 'Debates, improvisação e refinamento de naturalidade.', tag: 'Conversação' },
    ],
    C2: [
      { title: 'Laboratório C2', description: 'Manutenção de proficiência, repertório cultural e linguagem especializada.', tag: 'Excelência' },
      { title: 'Mentoria de Proficiência', description: 'Plano individual para objetivos acadêmicos ou profissionais.', tag: 'Mentoria' },
    ],
  };

  return next[level];
}
