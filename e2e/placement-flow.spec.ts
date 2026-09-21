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

  page.on('console', (message) => console.log('[browser-console]', message.type(), message.text()));
  page.on('pageerror', (error) => console.log('[browser-pageerror]', error.message));
  page.on('requestfailed', (request) =>
    console.log('[browser-requestfailed]', request.url(), request.failure()?.errorText),
  );

  await page.goto('/');

  const anonymousResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith('/api/auth/anonymous'),
  );
  await page.getByRole('button', { name: /começar avaliação/i }).click();
  const anonymousResponse = await anonymousResponsePromise;
  expect(anonymousResponse.status()).toBe(201);
  await expect(page).toHaveURL(/\/language$/, { timeout: 10000 });

  await page.getByRole('button', { name: /continuar/i }).click();
  await expect(page).toHaveURL(/\/setup$/);

  await page.getByLabel('Seu nome').fill(studentName);
  await page.getByLabel('E-mail').fill(studentEmail);
  await page.getByRole('combobox').selectOption({ label: teacher.name });
  await page.getByRole('button', { name: /começar avaliação/i }).click();

  await expect(page).toHaveURL(/\/test$/);

  for (let index = 0; index < 18; index += 1) {
    const options = page.locator('button[aria-pressed]');
    await expect(options.first()).toBeVisible();
    await options.first().click();

    if (index < 17) {
      await page.getByRole('button', { name: /^próxima/i }).click();
    } else {
      await page.getByRole('button', { name: /revisar respostas/i }).click();
    }
  }

  await expect(page).toHaveURL(/\/review$/);
  await expect(page.getByText('Revise antes de finalizar')).toBeVisible();
  await expect(page.getByText('18').first()).toBeVisible();
  await page.getByRole('button', { name: /finalizar avaliação/i }).click();

  await expect(page).toHaveURL(/\/result\//);
  await expect(page.getByText('Seu resultado chegou')).toBeVisible();
  await expect(page.locator('.level-card > strong')).toHaveText(/^(A1|A2|B1|B2|C1|C2)$/);

  await page.goto('/professor');
  await page.getByPlaceholder('professor@escola.com').fill(teacher.email);
  await page.getByPlaceholder('Sua senha').fill(teacher.secret);
  await page.getByRole('button', { name: /entrar no painel/i }).click();

  await expect(page).toHaveURL(/\/professor\/painel$/);
  await expect(page.getByText('Avaliações recentes')).toBeVisible();
  const row = page.locator('.table__row').filter({ hasText: studentName }).first();
  await expect(row).toBeVisible();
  await row.getByRole('button', { name: /abrir/i }).click();

  await expect(page).toHaveURL(/\/professor\/aluno\//);
  await expect(page.getByText('Respostas da avaliação')).toBeVisible();
  await expect(page.getByRole('button', { name: /gerar relatório/i })).toBeVisible();
});
