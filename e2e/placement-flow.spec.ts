import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const teacher = JSON.parse(readFileSync('.e2e-teacher.json', 'utf8')) as {
  name: string;
  email: string;
  secret: string;
};

test('aluno conclui o nivelamento premium e professor visualiza o resultado', async ({ page }, testInfo) => {
  const studentName = `Aluno ${testInfo.project.name}`;
  const studentEmail = `aluno.${testInfo.project.name.replace(/[^a-z0-9]/gi, '.')}@example.com`;

  page.on('pageerror', (error) => console.log('[browser-pageerror]', error.message));
  page.on('requestfailed', (request) =>
    console.log('[browser-requestfailed]', request.url(), request.failure()?.errorText),
  );

  await page.goto('/');

  const anonymousResponsePromise = page.waitForResponse(
    (response) => response.url().endsWith('/api/auth/anonymous'),
  );

  await page.getByRole('button', { name: /começar avaliação/i }).click();
  expect((await anonymousResponsePromise).status()).toBe(201);
  await expect(page).toHaveURL(/\/language$/, { timeout: 10000 });

  await page.getByRole('button', { name: /continuar/i }).click();
  await expect(page).toHaveURL(/\/setup$/);

  await page.getByPlaceholder('Digite seu nome completo').fill(studentName);
  await page.getByPlaceholder('seuemail@exemplo.com').fill(studentEmail);
  await page.getByRole('combobox').selectOption({ label: teacher.name });
  await page.getByRole('button', { name: /começar avaliação/i }).click();

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

  await expect(page).toHaveURL(/\/review$/);
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
  await expect(page.getByText('Visão pedagógica')).toBeVisible();
  await expect(page.getByText(studentName).first()).toBeVisible();

  const row = page.locator('.table__row').filter({ hasText: studentName }).first();
  await row.getByRole('button', { name: /abrir/i }).click();

  await expect(page).toHaveURL(/\/professor\/aluno\//);
  await expect(page.getByText('Respostas da avaliação')).toBeVisible();
});
