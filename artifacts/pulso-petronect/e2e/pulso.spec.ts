import { test, expect, type Page, type Locator } from '@playwright/test';

const EMAIL = 'analista@petronect.com.br';
const PASSWORD = '123456';

async function login(page: Page) {
  await page.goto('/');
  await page.locator('[data-testid="input-login-password"]').fill(PASSWORD);
  await page.locator('[data-testid="button-login-submit"]').click();
  await expect(page.locator('h1')).toHaveText('Visão geral executiva');
}

function metricValue(page: Page): Locator {
  return page
    .getByText('Total de acessos', { exact: true })
    .locator('..')
    .locator('div.mt-4')
    .first();
}

test.describe('Autenticação', () => {
  test('1: login com senha correta redireciona para a visão geral', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('h1')).toHaveText('Visão geral executiva');
  });

  test('2: senha incorreta exibe erro e permanece na página de login', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="input-login-password"]').fill('senha_errada');
    await page.locator('[data-testid="button-login-submit"]').click();
    await expect(page.getByText('Senha demonstrativa incorreta. Use 123456 para continuar.')).toBeVisible();
    await expect(page.locator('[data-testid="input-login-email"]')).toBeVisible();
  });

  test('3: login persiste após recarregar a página', async ({ page }) => {
    await login(page);
    await page.reload();
    await expect(page.locator('h1')).toHaveText('Visão geral executiva');
  });

  test('14: logout retorna para a página de login', async ({ page }) => {
    await login(page);
    await page.locator('[data-testid="button-logout"]').click();
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h2')).toContainText('Bem-vindo ao PULSO');
  });
});

test.describe('Pós-autenticação', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('4: navegação entre todas as rotas da aplicação', async ({ page }) => {
    const routes: Array<{ link: string; title: string; url: string }> = [
      { link: 'link-nav-jornada', title: 'Jornada dos usuários', url: '/jornada' },
      { link: 'link-nav-segmentos', title: 'Segmentos comportamentais', url: '/segmentos' },
      { link: 'link-nav-oportunidades', title: 'Central de oportunidades', url: '/oportunidades' },
      { link: 'link-nav-comunicacao', title: 'Comunicação inteligente', url: '/comunicacao' },
      { link: 'link-nav-importar', title: 'Importar dados', url: '/importar' },
      { link: 'link-nav-metodologia', title: 'Metodologia transparente', url: '/metodologia' },
      { link: 'link-nav-sobre', title: 'Sobre o projeto', url: '/sobre' },
      { link: 'link-nav-overview', title: 'Visão geral executiva', url: '/' },
    ];
    for (const route of routes) {
      await page.locator(`[data-testid="${route.link}"]`).click();
      await expect(page.locator('h1')).toHaveText(route.title);
      expect(new URL(page.url()).pathname).toBe(route.url);
    }
  });

  test('5: filtro de período altera os indicadores e persiste após recarregar', async ({ page }) => {
    const initial = await metricValue(page).textContent();
    await page.locator('[data-testid="select-period-overview"]').selectOption('14 dias');
    await expect(metricValue(page)).not.toHaveText(initial!);
    await page.reload();
    await expect(page.locator('[data-testid="select-period-overview"]')).toHaveValue('14 dias');
  });

  test('6: filtro por tipo de usuário altera os indicadores e persiste', async ({ page }) => {
    const initial = await metricValue(page).textContent();
    await page.locator('[data-testid="select-user-type-overview"]').selectOption('Recorrente');
    await expect(metricValue(page)).not.toHaveText(initial!);
    await page.reload();
    await expect(page.locator('[data-testid="select-user-type-overview"]')).toHaveValue('Recorrente');
  });

  test('7: importar CSV válido exibe status de processamento', async ({ page }) => {
    await page.locator('[data-testid="link-nav-importar"]').click();
    await expect(page.locator('h1')).toHaveText('Importar dados');
    const csv = [
      'user_id,session_id,timestamp,page,event_type,user_type,duration_seconds,previous_page,next_page,completed_action',
      'USR-IMP-001,SES-001,2026-05-10T10:15:00,/inicio,visualização,Novo,45,,/oportunidades,false',
    ].join('\n');
    await page.locator('[data-testid="input-import-file"]').setInputFiles({
      name: 'import-test.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv),
    });
    await expect(page.locator('[data-testid="status-import-parsed"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-import-parsed"]')).toContainText('1 eventos');
  });

  test('8: importar CSV inválido exibe mensagem de erro', async ({ page }) => {
    await page.locator('[data-testid="link-nav-importar"]').click();
    const invalid = 'foo,bar\nbaz,baz';
    await page.locator('[data-testid="input-import-file"]').setInputFiles({
      name: 'invalid.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(invalid),
    });
    await expect(page.locator('[data-testid="status-import-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-import-error"]')).toContainText('Colunas obrigatórias ausentes');
  });

  test('9: aplicar base importada atualiza o dashboard', async ({ page }) => {
    await page.locator('[data-testid="link-nav-importar"]').click();
    const csv = [
      'user_id,session_id,timestamp,page,event_type,user_type,duration_seconds,previous_page,next_page,completed_action',
      'USR-IMP-001,SES-001,2026-05-10T10:15:00,/inicio,visualização,Novo,45,,/oportunidades,false',
    ].join('\n');
    await page.locator('[data-testid="input-import-file"]').setInputFiles({
      name: 'import.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv),
    });
    await expect(page.locator('[data-testid="status-import-parsed"]')).toBeVisible();
    await page.locator('[data-testid="button-apply-import"]').click();
    await expect(page.locator('[data-testid="status-import-applied"]')).toBeVisible();
    await page.locator('[data-testid="link-nav-overview"]').click();
    await expect(metricValue(page)).toHaveText('1');
  });

  test('10: regenerar comunicação atualiza a versão e reseta aprovação', async ({ page }) => {
    await page.locator('[data-testid="link-nav-comunicacao"]').click();
    await expect(page.locator('h1')).toHaveText('Comunicação inteligente');
    await expect(page.locator('text=Rascunho v1')).toBeVisible();
    await page.locator('[data-testid="button-approve-communication"]').click();
    await expect(page.getByText('Aprovada na simulação')).toBeVisible();
    await page.locator('[data-testid="button-generate-version"]').click();
    await expect(page.locator('text=Rascunho v2')).toBeVisible();
    await expect(page.getByText('Revisão pendente')).toBeVisible();
  });

  test('11: alterar segmento, objetivo, canal e tom altera a mensagem', async ({ page }) => {
    await page.locator('[data-testid="link-nav-comunicacao"]').click();
    const initialBody = await page.locator('[data-testid="textarea-communication-body"]').inputValue();
    await page.locator('[data-testid="select-communication-segmento"]').selectOption('Recorrente');
    await page.locator('[data-testid="select-communication-objetivo"]').selectOption('Aumentar retorno');
    await page.locator('[data-testid="select-communication-canal"]').selectOption('Banner no portal');
    await page.locator('[data-testid="select-communication-tom"]').selectOption('Direto');
    await page.locator('[data-testid="button-generate-version"]').click();
    await expect(page.locator('[data-testid="textarea-communication-body"]')).not.toHaveValue(initialBody);
    await expect(page.getByRole('heading', { name: 'Mensagem para Recorrente' })).toBeVisible();
    await expect(page.locator('text=Rascunho v2')).toBeVisible();
  });

  test('12: copiar conteúdo editado para o clipboard', async ({ page }) => {
    await page.locator('[data-testid="link-nav-comunicacao"]').click();
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    const editedBody = 'Corpo editado pelo teste automatizado.';
    await page.locator('[data-testid="textarea-communication-body"]').fill(editedBody);
    await page.locator('[data-testid="button-copy-communication"]').click();
    await expect(page.locator('[data-testid="button-copy-communication"]')).toHaveText('Copiado');
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toContain(editedBody);
  });

  test('13: aprovar simulação atualiza badge de estado', async ({ page }) => {
    await page.locator('[data-testid="link-nav-comunicacao"]').click();
    await page.locator('[data-testid="button-approve-communication"]').click();
    await expect(page.getByText('Aprovada na simulação')).toBeVisible();
  });

  test('15: acesso direto a rota não quebra (sem 404)', async ({ page }) => {
    await page.goto('/segmentos');
    await expect(page.locator('h1')).toHaveText('Segmentos comportamentais');
    await expect(page.getByText('Página não encontrada')).not.toBeVisible();
  });
});
