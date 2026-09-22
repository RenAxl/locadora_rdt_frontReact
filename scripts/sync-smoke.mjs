// Verifica os fluxos sincronizados usando Chrome e uma API local simulada.
// Não acessa nem altera o backend real. Execute: node scripts/sync-smoke.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { createServer } from 'vite';

const port = 4179;
const origin = `http://127.0.0.1:${port}`;
process.env.VITE_API_URL = `${origin}/mock-api`;
const requests = [];
const address = { street: 'Rua Teste', number: '12', complement: '', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', zipCode: '12345678' };
let profile = { id: 1, name: 'Renan Teste', email: 'teste@example.com', telephone: '11999999999', address };
let setting = { id: 1, companyName: 'Locadora Teste', icon: 'fa-gamepad', address };
let failPath = '';
const token = (authorities, exp = Math.floor(Date.now() / 1000) + 3600) =>
  `e30.${Buffer.from(JSON.stringify({ exp, user_name: 'teste@example.com', authorities })).toString('base64url')}.test`;
const adminToken = token(['SYSTEM_SETTING_READ', 'SYSTEM_SETTING_WRITE']);

const server = await createServer({
  server: { host: '127.0.0.1', port, strictPort: true },
  plugins: [{ name: 'sync-test-api', configureServer(vite) {
    vite.middlewares.use('/mock-api', async (req, res) => {
      let body = '';
      for await (const chunk of req) body += chunk;
      const url = new URL(req.url, origin);
      requests.push({ method: req.method, path: url.pathname, search: url.search, body, headers: req.headers });
      res.setHeader('Content-Type', 'application/json');
      if (url.pathname === failPath) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Falha simulada' }));
        return;
      }
      let data = {};
      if (url.pathname === '/oauth/token') data = { access_token: adminToken, token_type: 'bearer' };
      else if (url.pathname === '/user-profile/me') {
        if (req.method === 'PUT') profile = { ...profile, ...JSON.parse(body) };
        data = profile;
      } else if (url.pathname === '/system-settings') {
        if (req.method === 'PUT') setting = { ...setting, ...JSON.parse(body) };
        data = setting;
      } else if (url.pathname.endsWith('/photo')) {
        res.statusCode = req.method === 'GET' ? 404 : 204;
        res.end();
        return;
      } else if (url.pathname === '/users') data = { content: [], totalElements: 0, totalPages: 0 };
      else if (url.pathname === '/roles') data = { content: [{ id: 1, authority: 'ADMIN', permissionsCount: 1 }], totalElements: 1, totalPages: 1 };
      else if (url.pathname === '/roles/1') data = { id: 1, authority: 'ADMIN', permissions: [{ id: 1, name: 'USER_READ', groupName: 'USERS' }] };
      else if (url.pathname === '/permissions/groups') data = ['USERS', 'SYSTEM_SETTINGS'];
      else if (url.pathname === '/permissions') {
        data = url.searchParams.get('groupName') === 'USERS'
          ? [{ id: 1, name: 'USER_READ', groupName: 'USERS' }, { id: 2, name: 'USER_WRITE', groupName: 'USERS' }]
          : [{ id: 3, name: 'SYSTEM_SETTING_READ', groupName: 'SYSTEM_SETTINGS' }, { id: 4, name: 'SYSTEM_SETTING_WRITE', groupName: 'SYSTEM_SETTINGS' }];
      }
      res.end(JSON.stringify(data));
    });
  } }],
});
await server.listen();
const browserDirectory = mkdtempSync(resolve('node_modules/.sync-browser-'));
const chrome = spawn(process.env.CHROME_BIN || '/usr/bin/google-chrome', [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-pipe', `--user-data-dir=${browserDirectory}`,
], { stdio: ['ignore', 'ignore', 'ignore', 'pipe', 'pipe'] });
let sequence = 0;
let pendingText = '';
const pending = new Map();
const browserErrors = [];
chrome.stdio[4].on('data', (chunk) => {
  pendingText += chunk.toString();
  let index;
  while ((index = pendingText.indexOf('\0')) >= 0) {
    const message = JSON.parse(pendingText.slice(0, index));
    pendingText = pendingText.slice(index + 1);
    if (message.method === 'Runtime.exceptionThrown') browserErrors.push(message.params.exceptionDetails.text);
    if (message.id && pending.has(message.id)) {
      const callback = pending.get(message.id);
      pending.delete(message.id);
      callback(message);
    }
  }
});
function send(method, params = {}, sessionId) {
  return new Promise((resolveMessage, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(id, (message) => {
      clearTimeout(timer);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolveMessage(message.result);
    });
    chrome.stdio[3].write(JSON.stringify({ id, method, params, sessionId }) + '\0');
  });
}
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (method, params) => send(method, params, sessionId);
await cdp('Runtime.enable');
await cdp('Page.enable');
async function evaluate(expression) {
  const result = await cdp('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function waitFor(expression) {
  const until = Date.now() + 12000;
  while (Date.now() < until) {
    if (await evaluate(expression)) return;
    await new Promise((done) => setTimeout(done, 100));
  }
  throw new Error(`Condição não atendida: ${expression}`);
}
async function visit(path, selector) {
  await cdp('Page.navigate', { url: origin + path });
  await waitFor(`location.pathname === ${JSON.stringify(path.split('?')[0])} && !!document.querySelector(${JSON.stringify(selector)})`);
}
async function fill(selector, value) {
  await evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
}
async function click(selector) { await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); }
async function authenticate(value) { await evaluate(`localStorage.setItem('token', ${JSON.stringify(value)})`); }
const latest = (path, method) => [...requests].reverse().find((request) => request.path === path && request.method === method);

try {
  await visit('/login', '#email');
  await fill('#email', 'teste@example.com');
  await fill('#password', 'secret');
  await click('button[type=submit]');
  await waitFor("location.pathname === '/home' && document.querySelector('.user-name')?.textContent === 'Renan'");
  assert.equal(latest('/oauth/token', 'POST').body, 'username=teste%40example.com&password=secret&grant_type=password');
  assert.match(latest('/oauth/token', 'POST').headers.authorization, /^Basic /);
  assert.equal(latest('/user-profile/me', 'GET').headers.authorization, `Bearer ${adminToken}`);
  await waitFor("document.querySelector('#sidebarOffcanvasLabel')?.textContent === 'Locadora Teste'");
  assert.equal(await evaluate("document.querySelectorAll('.p-toast-message-error').length"), 0);
  console.log('OK login, JWT, perfil, sidebar e ausência de foto');

  await visit('/system-settings', 'input[placeholder="Nome da empresa"]');
  await fill('input[placeholder="Nome da empresa"]', 'Empresa Atualizada');
  await click('.p-dropdown');
  await waitFor("!!document.querySelector('.p-dropdown-filter')");
  await fill('.p-dropdown-filter', 'PlayStation');
  await waitFor("document.querySelectorAll('.p-dropdown-item').length === 1");
  await click('.p-dropdown-item');
  await click('button[type=submit]');
  await waitFor("location.pathname === '/home' && document.querySelector('#sidebarOffcanvasLabel')?.textContent === 'Empresa Atualizada'");
  assert.equal(JSON.parse(latest('/system-settings', 'PUT').body).icon, 'fa-playstation');
  assert.equal(await evaluate("!!document.querySelector('.sidebar .fa-brands.fa-playstation')"), true);
  console.log('OK configurações, pesquisa de ícone, persistência e atualização imediata');

  await visit('/users/profile', 'input[placeholder="Nome"]');
  await waitFor("document.querySelector('input[placeholder=Nome]').value === 'Renan Teste'");
  await fill('input[placeholder="Nome"]', 'Maria Teste');
  await fill('input[placeholder="Senha atual"]', 'old-secret');
  await fill('input[placeholder="Nova senha"]', 'new-secret');
  await fill('input[placeholder="Confirmar nova senha"]', 'new-secret');
  await evaluate(`(() => { const data = new DataTransfer(); data.items.add(new File([Uint8Array.from(atob('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aFOsAAAAASUVORK5CYII='), (c) => c.charCodeAt(0))], 'photo.png', { type: 'image/png' })); const input = document.querySelector('#photo'); input.files = data.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await click('button[type=submit]');
  await waitFor("location.pathname === '/home' && document.querySelector('.user-name')?.textContent === 'Maria'");
  assert.deepEqual(Object.keys(JSON.parse(latest('/user-profile/me', 'PUT').body)).sort(), ['address','email','name','telephone']);
  assert.deepEqual(JSON.parse(latest('/user-profile/me/password', 'PUT').body), { currentPassword: 'old-secret', newPassword: 'new-secret' });
  assert.match(latest('/user-profile/me/photo', 'PUT').headers['content-type'], /multipart\/form-data; boundary=/);
  assert.match(latest('/user-profile/me/photo', 'PUT').body, /name="file"; filename="photo.png"/);
  assert.equal(await evaluate("!!document.querySelector('.main-navbar img[src^=\"blob:\"]')"), true);
  console.log('OK perfil, senha, upload multipart e navbar sem refresh');

  await visit('/users/profile', 'input[placeholder="Nome"]');
  await waitFor("document.querySelector('input[placeholder=Nome]').value === 'Maria Teste'");
  await fill('input[placeholder="Senha atual"]', 'wrong-secret');
  await fill('input[placeholder="Nova senha"]', 'new-secret');
  await fill('input[placeholder="Confirmar nova senha"]', 'new-secret');
  failPath = '/user-profile/me/password';
  await click('button[type=submit]');
  await waitFor("document.body.textContent.includes('Perfil atualizado, mas não foi possível alterar a senha.')");
  assert.equal(await evaluate('location.pathname'), '/users/profile');
  failPath = '';
  console.log('OK falha parcial de senha mantém o formulário aberto');

  await visit('/roles', '.actions-wrap button');
  await click('.actions-wrap button');
  await waitFor("document.querySelectorAll('.permission-item').length === 2");
  await fill('input[placeholder="Ex: USER_READ"]', 'READ');
  await click('.role-permissions-dialog .p-dropdown');
  await waitFor("!!document.querySelector('.p-dropdown-item')");
  await evaluate("[...document.querySelectorAll('.p-dropdown-item')].find((item) => item.textContent === 'SYSTEM_SETTINGS').click()");
  await waitFor("document.querySelectorAll('.permission-item').length === 1 && document.querySelector('.permission-item').textContent === 'SYSTEM_SETTING_READ'");
  assert.equal(await evaluate("document.querySelector('input[placeholder=\"Ex: USER_READ\"]').value"), 'READ');
  await click('.permission-item .p-checkbox');
  await click('.permission-buttons .p-button-primary');
  await waitFor("!document.querySelector('.role-permissions-dialog')");
  assert.deepEqual(JSON.parse(latest('/roles/1/permissions', 'PUT').body), { permissionIds: [1, 3] });
  console.log('OK modal de permissões, filtro entre grupos e seleção preservada');

  await authenticate(token(['SYSTEM_SETTING_READ']));
  await visit('/system-settings', 'input[placeholder="Nome da empresa"]');
  assert.equal(await evaluate("document.querySelectorAll('button[type=submit]').length"), 0);
  await click('a[href="/home"].system-setting-form-button');
  await waitFor("location.pathname === '/home'");
  await authenticate(token([]));
  await cdp('Page.navigate', { url: origin + '/system-settings' });
  await waitFor("location.pathname === '/not-authorized'");
  await authenticate(token(['SYSTEM_SETTING_READ'], 1));
  await cdp('Page.navigate', { url: origin + '/system-settings' });
  await waitFor("location.pathname === '/login' && !!document.querySelector('#email')");
  console.log('OK permissões READ/WRITE, Voltar e token expirado');

  await authenticate(adminToken);
  await evaluate(`(async () => {
    const { userService } = await import('/src/features/identity/users/services/user.service.ts');
    await userService.changeActive(1, false);
  })()`);
  assert.equal(latest('/users/1/active', 'PATCH').body, 'false');
  assert.match(latest('/users/1/active', 'PATCH').headers['content-type'], /application\/json/);
  console.log('OK contrato JSON de ativação/desativação de usuário');

  await visit('/activate?token=activation', '#password');
  await fill('#password', 'new-password');
  await fill('#confirmPassword', 'different');
  await click('button[type=submit]');
  await waitFor("document.body.textContent.includes('As senhas não conferem')");
  await fill('#confirmPassword', 'new-password');
  await click('button[type=submit]');
  await waitFor("location.pathname === '/login'");
  assert.equal(latest('/auth/activate', 'POST').search, '?token=activation');
  await visit('/password-recovery', '#email');
  await fill('#email', 'a..b@example.com');
  assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"), true);
  await fill('#email', 'teste@example.com');
  await click('button[type=submit]');
  await waitFor("location.pathname === '/login'");
  assert.deepEqual(JSON.parse(latest('/auth/request-password-reset', 'POST').body), { email: 'teste@example.com' });
  await visit('/password-recovery/password-reset?token=reset', '#password');
  await fill('#password', 'reset-password');
  await fill('#confirmPassword', 'reset-password');
  await click('button[type=submit]');
  await waitFor("location.pathname === '/login'");
  assert.equal(latest('/auth/password-reset', 'POST').search, '?token=reset');
  console.log('OK ativação, confirmação e recuperação/redefinição de senha');

  await authenticate(adminToken);
  await visit('/system-settings', 'input[placeholder="Nome da empresa"]');
  failPath = '/system-settings';
  await click('button[type=submit]');
  await waitFor("document.body.textContent.includes('Falha simulada')");
  assert.equal(await evaluate('location.pathname'), '/system-settings');
  failPath = '';
  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
  await click('.profile-trigger');
  await waitFor("!!document.querySelector('.overlay-item.logout')");
  await click('.overlay-item.logout');
  await waitFor("location.pathname === '/login'");
  assert.equal(await evaluate("localStorage.getItem('token')"), null);
  assert.deepEqual(browserErrors, []);
  console.log('OK falha HTTP, largura mobile, logout e ausência de erros JavaScript');
} finally {
  const browserClosed = new Promise((done) => chrome.once('exit', done));
  chrome.kill();
  await server.close();
  await browserClosed;
  rmSync(browserDirectory, { recursive: true, force: true });
}
