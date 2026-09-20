import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const teacher = JSON.parse(readFileSync('.e2e-teacher.json', 'utf8')) as {
  name: string;
  email: string;
  secret: string;
};

test('aluno conclui o nivelamento e professor visualiza o resultado', async ({ page }) => {
  await page.goto('/');

  const anonymousResponsePromise = page.waitForResponse(
    (response) => response.url().endsWith('/api/auth/anonymous'),
  );
  await page.getByRole('button', { name: /começar avaliação/i }).click();
  const anonymousResponse = await anonymousResponsePromise;
  expect(anonymousResponse.status()).toBe(201);
  await expect(page).toHaveURL(/\/language$/, { timeout: 10000 });

  await page.getByRole('button', { name: /continuar/i }).click();
  await expect(page).toHaveURL(/\/setup$/);

  await page.getByPlaceholder('Digite seu nome completo').fill('Aluno E2E');
  await page.getByPlaceholder('seuemail@exemplo.com').fill('aluno.e2e@example.com');
  await page.getByRole('combobox').selectOption({ label: teacher.name });
  await page.getByRole('button', { name: /começar teste/i }).click();

  await expect(page).toHaveURL(/\/test$/);

  for (let index = 0; index < 18; index += 1) {
    const options = page.locator('button[aria-pressed]');
    await expect(options.first()).toBeVisible();
    await options.first().click();

    if (index < 17) {
      await page.getByRole('button', { name: /próxima questão/i }).click();
    } else {
      await page.getByRole('button', { name: /revisar respostas/i }).click();
    }
  }

  await expect(page.getByText(/18 de 18 respondidas/i)).toBeVisible();
  await page.getByRole('button', { name: /finalizar avaliação/i }).click();

  await expect(page).toHaveURL(/\/result\//);
  await expect(page.getByText('Seu nível é')).toBeVisible();
  await expect(page.getByText(/^(A1|A2|B1|B2|C1|C2)$/)).toBeVisible();

  await page.goto('/professor');
  await page.getByPlaceholder('professor@escola.com').fill(teacher.email);
  await page.getByPlaceholder('Sua senha').fill(teacher.secret);
  await page.getByRole('button', { name: /entrar no painel/i }).click();

  await expect(page).toHaveURL(/\/professor\/painel$/);
  await expect(page.getByText('Resultados dos alunos')).toBeVisible();
  await expect(page.getByText('Aluno E2E')).toBeVisible();

  await page.getByRole('button', { name: /Aluno E2E/i }).click();
  await expect(page).toHaveURL(/\/professor\/aluno\//);
  await expect(page.getByText('Respostas da avaliação')).toBeVisible();
});
