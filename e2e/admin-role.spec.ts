import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const admin = JSON.parse(readFileSync('.e2e-admin.json', 'utf8')) as {
  name: string;
  email: string;
  secret: string;
};

test('administrador acessa sua conta mas não o painel pedagógico', async ({ page }) => {
  await page.goto('/professor');

  await page.getByPlaceholder('professor@escola.com').fill(admin.email);
  await page.getByPlaceholder('Sua senha').fill(admin.secret);
  await page.getByRole('button', { name: /entrar no painel/i }).click();

  await expect(page).toHaveURL(/\/professor\/administracao$/);
  await expect(page.getByRole('link', { name: 'Minha conta' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sair da conta' })).toBeVisible();

  await page.getByRole('link', { name: 'Minha conta' }).click();
  await expect(page).toHaveURL(/\/professor\/settings$/);
  await expect(page.getByText('Conta e preferências')).toBeVisible();
  await expect(page.getByText('Administrador').last()).toBeVisible();

  await page.goto('/professor/painel');
  await expect(page).toHaveURL(/\/professor\/administracao$/);
  await expect(page.getByText('Organização da plataforma')).toBeVisible();
});


test('entrada pública da equipe exige nova autenticação mesmo após sessão administrativa', async ({ page }) => {
  await page.goto('/professor');
  await page.getByPlaceholder('professor@escola.com').fill(admin.email);
  await page.getByPlaceholder('Sua senha').fill(admin.secret);
  await page.getByRole('button', { name: /entrar no painel/i }).click();

  await expect(page).toHaveURL(/\/professor\/administracao$/);

  await page.goto('/');
  await page.getByRole('button', { name: /acessar área da equipe/i }).click();

  await expect(page).toHaveURL(/\/professor$/);
  await expect(page.getByRole('button', { name: /entrar no painel/i })).toBeVisible();

  await page.goto('/professor/administracao');
  await expect(page).toHaveURL(/\/professor$/);
});
