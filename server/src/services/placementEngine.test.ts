import { describe, expect, it } from 'vitest';
import {
  calculateBreakdown,
  calculatePlacement,
  mapScoreToCefr,
  type ScoredAnswer,
} from './placementEngine.js';

describe('mapScoreToCefr', () => {
  it.each([
    [0, 'A1'], [20, 'A1'],
    [21, 'A2'], [40, 'A2'],
    [41, 'B1'], [60, 'B1'],
    [61, 'B2'], [80, 'B2'],
    [81, 'C1'], [95, 'C1'],
    [96, 'C2'], [100, 'C2'],
  ] as const)('mapeia %i%% para %s', (score, expected) => {
    expect(mapScoreToCefr(score)).toBe(expected);
  });
});

describe('calculatePlacement', () => {
  it('calcula nota, nível e total corretamente', () => {
    const answers: ScoredAnswer[] = [
      { category: 'GRAMMAR', isCorrect: true },
      { category: 'GRAMMAR', isCorrect: true },
      { category: 'VOCABULARY', isCorrect: false },
      { category: 'LISTENING', isCorrect: true },
    ];

    const result = calculatePlacement(answers);

    expect(result.score).toBe(75);
    expect(result.cefrLevel).toBe('B2');
    expect(result.correct).toBe(3);
    expect(result.total).toBe(4);
  });

  it('retorna A1 e nota zero quando não há respostas', () => {
    const result = calculatePlacement([]);
    expect(result.score).toBe(0);
    expect(result.cefrLevel).toBe('A1');
    expect(result.total).toBe(0);
  });
});

describe('calculateBreakdown', () => {
  it('separa desempenho por habilidade', () => {
    const breakdown = calculateBreakdown([
      { category: 'GRAMMAR', isCorrect: true },
      { category: 'GRAMMAR', isCorrect: false },
      { category: 'VOCABULARY', isCorrect: true },
      { category: 'LISTENING', isCorrect: true },
    ]);

    expect(breakdown).toEqual([
      expect.objectContaining({ category: 'GRAMMAR', correct: 1, total: 2, percentage: 50 }),
      expect.objectContaining({ category: 'VOCABULARY', correct: 1, total: 1, percentage: 100 }),
      expect.objectContaining({ category: 'LISTENING', correct: 1, total: 1, percentage: 100 }),
    ]);
  });
});
