import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const admin = JSON.parse(readFileSync('.e2e-admin.json', 'utf8')) as {
  name: string;
  email: string;
  secret: string;
};

test('sessão administrativa não é herdada por outro navegador', async ({ browser }) => {
  const firstContext = await browser.newContext();
  const firstPage = await firstContext.newPage();

  await firstPage.goto('/professor');
  await firstPage.getByPlaceholder('professor@escola.com').fill(admin.email);
  await firstPage.getByPlaceholder('Sua senha').fill(admin.secret);
  await firstPage.getByRole('button', { name: /entrar no painel/i }).click();
  await expect(firstPage).toHaveURL(/\/professor\/administracao$/);

  const secondContext = await browser.newContext();
  const secondPage = await secondContext.newPage();

  await secondPage.goto('/professor');
  await expect(secondPage).toHaveURL(/\/professor$/);
  await expect(secondPage.getByRole('button', { name: /entrar no painel/i })).toBeVisible();
  await expect(secondPage.getByText(/sessão ativa neste navegador/i)).toHaveCount(0);

  await secondContext.close();
  await firstContext.close();
});

test('novo login da mesma conta invalida a sessão privilegiada anterior', async ({ browser }) => {
  const firstContext = await browser.newContext();
  const firstPage = await firstContext.newPage();

  await firstPage.goto('/professor');
  await firstPage.getByPlaceholder('professor@escola.com').fill(admin.email);
  await firstPage.getByPlaceholder('Sua senha').fill(admin.secret);
  await firstPage.getByRole('button', { name: /entrar no painel/i }).click();
  await expect(firstPage).toHaveURL(/\/professor\/administracao$/);

  const secondContext = await browser.newContext();
  const secondPage = await secondContext.newPage();

  await secondPage.goto('/professor');
  await secondPage.getByPlaceholder('professor@escola.com').fill(admin.email);
  await secondPage.getByPlaceholder('Sua senha').fill(admin.secret);
  await secondPage.getByRole('button', { name: /entrar no painel/i }).click();
  await expect(secondPage).toHaveURL(/\/professor\/administracao$/);

  await firstPage.reload();
  await expect(firstPage).toHaveURL(/\/professor$/);
  await expect(firstPage.getByRole('button', { name: /entrar no painel/i })).toBeVisible();

  await secondContext.close();
  await firstContext.close();
});

test('sessão privilegiada legada em localStorage não concede acesso', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'idiomas-pro-session',
      JSON.stringify({
        state: {
          teacherToken: 'legacy-privileged-token',
          teacher: {
            id: 'legacy-admin',
            name: 'Administrador',
            email: 'legacy@example.com',
            role: 'ADMIN',
          },
        },
        version: 1,
      }),
    );
  });

  await page.goto('/professor');

  await expect(page).toHaveURL(/\/professor$/);
  await expect(page.getByRole('button', { name: /entrar no painel/i })).toBeVisible();
  await expect(page.getByText(/sessão ativa neste navegador/i)).toHaveCount(0);
});
