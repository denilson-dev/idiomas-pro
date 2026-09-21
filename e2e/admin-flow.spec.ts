import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

const admin = JSON.parse(readFileSync('.e2e-admin.json', 'utf8')) as {
  name: string;
  email: string;
  secret: string;
};

test('administrador gerencia alunos e professores pelo painel premium', async ({ page }, testInfo) => {
  const suffix = testInfo.project.name.replace(/[^a-z0-9]/gi, '.').toLowerCase();
  const studentEmail = `admin.student.${suffix}@example.com`;
  const teacherEmail = `admin.teacher.${suffix}@example.com`;

  await page.goto('/professor');
  await page.getByPlaceholder('professor@escola.com').fill(admin.email);
  await page.getByPlaceholder('Sua senha').fill(admin.secret);
  await page.getByRole('button', { name: /entrar no painel/i }).click();

  await expect(page).toHaveURL(/\/professor\/administracao/);
  await expect(page.getByText('Controle da plataforma')).toBeVisible();

  await page.getByRole('button', { name: /^Alunos$/i }).first().click();
  await page.getByRole('button', { name: /novo aluno/i }).click();

  await page.getByLabel('Nome completo').fill('Aluno Administrado');
  await page.getByLabel('E-mail').fill(studentEmail);
  await page.getByLabel('Senha').fill('StudentAdmin123!');
  await page.getByRole('button', { name: /cadastrar conta/i }).click();

  const studentRow = page.locator('.table__row').filter({ hasText: studentEmail });
  await expect(studentRow).toBeVisible();

  await studentRow.getByTitle('Editar').click();
  await page.getByLabel('Nome completo').fill('Aluno Administrado Editado');
  await page.getByRole('button', { name: /salvar alterações/i }).click();

  const editedStudentRow = page.locator('.table__row').filter({ hasText: studentEmail });
  await expect(editedStudentRow).toContainText('Aluno Administrado Editado');

  await editedStudentRow.getByTitle('Desativar').click();
  await expect(page.locator('.table__row').filter({ hasText: studentEmail })).toContainText('Inativo');

  await page.locator('.table__row').filter({ hasText: studentEmail }).getByTitle('Ativar').click();
  await expect(page.locator('.table__row').filter({ hasText: studentEmail })).toContainText('Ativo');

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('.table__row').filter({ hasText: studentEmail }).getByTitle('Excluir').click();
  await expect(page.locator('.table__row').filter({ hasText: studentEmail })).toHaveCount(0);

  await page.getByRole('button', { name: /^Professores$/i }).first().click();
  await page.getByRole('button', { name: /novo professor/i }).click();

  await page.getByLabel('Nome completo').fill('Professor Administrado');
  await page.getByLabel('E-mail').fill(teacherEmail);
  await page.getByLabel('Senha').fill('TeacherAdmin123!');
  await page.getByRole('button', { name: /cadastrar conta/i }).click();

  const teacherRow = page.locator('.table__row').filter({ hasText: teacherEmail });
  await expect(teacherRow).toBeVisible();

  await teacherRow.getByTitle('Editar').click();
  await page.getByLabel('Nome completo').fill('Professor Administrado Editado');
  await page.getByRole('button', { name: /salvar alterações/i }).click();

  await expect(page.locator('.table__row').filter({ hasText: teacherEmail }))
    .toContainText('Professor Administrado Editado');

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('.table__row').filter({ hasText: teacherEmail }).getByTitle('Excluir').click();
  await expect(page.locator('.table__row').filter({ hasText: teacherEmail })).toHaveCount(0);
});
