import type { TestResult } from './api';

const KEY = 'idiomas-pro-results';

function readAll(): TestResult[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveResult(result: TestResult) {
  const id = result.id ?? result.attemptId;
  if (!id) return;
  const normalized: TestResult = {
    ...result,
    id,
    attemptId: id,
    completedAt: result.completedAt ?? new Date().toISOString(),
  };
  const next = [normalized, ...readAll().filter(item => (item.id ?? item.attemptId) !== id)].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getStoredResult(id: string) {
  return readAll().find(item => (item.id ?? item.attemptId) === id) ?? null;
}

export function getStoredHistory() {
  return readAll();
}
