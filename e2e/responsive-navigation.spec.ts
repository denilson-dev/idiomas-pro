import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const teacher = JSON.parse(readFileSync('.e2e-teacher.json', 'utf8')) as {
  name: string;
  email: string;
  secret: string;
};

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth + 2);
}

test('homepage mantém composição, ações e largura corretas em qualquer viewport', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Descubra seu nível.')).toBeVisible();
  await expect(page.getByRole('button', { name: /começar avaliação/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /entrar como aluno/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /acessar área da equipe/i })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Idioma da interface: Português do Brasil' }),
  ).toBeVisible();

  await expectNoHorizontalOverflow(page);
});

test('fluxo do aluno mantém voltar, sair e idioma em qualquer viewport', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /começar avaliação/i }).click();
  await expect(page).toHaveURL(/\/language$/);

  await expect(page.getByRole('link', { name: 'Início' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sair da conta' })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Idioma da interface: Português do Brasil' }),
  ).toBeVisible();

  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: /continuar/i }).click();
  await expect(page).toHaveURL(/\/setup$/);
  await expect(page.getByRole('link', { name: 'Idiomas' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sair da conta' })).toBeVisible();

  await expectNoHorizontalOverflow(page);
});

test('portal do professor expõe a mesma navegação e saída em todos os dispositivos', async ({
  page,
}) => {
  await page.goto('/professor');
  await page.getByPlaceholder('professor@escola.com').fill(teacher.email);
  await page.getByPlaceholder('Sua senha').fill(teacher.secret);
  await page.getByRole('button', { name: /entrar no painel/i }).click();

  await expect(page).toHaveURL(/\/professor\/painel$/);
  await expect(page.getByRole('link', { name: /visão pedagógica/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /^alunos$/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /avaliações/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /minha conta/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sair da conta' })).toBeVisible();

  await expectNoHorizontalOverflow(page);

  await page.getByRole('link', { name: /^alunos$/i }).click();
  await expect(page).toHaveURL(/view=students/);
  await expect(page.getByText('Seus alunos')).toBeVisible();

  await page.getByRole('link', { name: /avaliações/i }).click();
  await expect(page).toHaveURL(/view=assessments/);
  await expect(page.getByText('Histórico de avaliações')).toBeVisible();

  await expectNoHorizontalOverflow(page);
});
