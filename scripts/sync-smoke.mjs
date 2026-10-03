// Verifica os fluxos sincronizados usando Chrome e uma API local simulada.
// Não acessa nem altera o backend real. Execute: node scripts/sync-smoke.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
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
let customers = Array.from({ length: 6 }, (_, index) => ({ id: index + 1, name: `Cliente Teste ${index + 1}`, cpf: '12345678901', email: `cliente${index + 1}@example.com`, phone: '11999999999', active: true, address, createdAt: '2026-09-29T12:00:00Z', createdBy: 'admin' }));
let files = [{ id: 1, customerId: 1, name: 'Contrato', originalFileName: 'contrato.pdf', contentType: 'application/pdf', size: 100, createdAt: '2026-09-23T12:00:00Z' }];
files.push({ id: 3, customerId: 1, name: 'Foto documento', originalFileName: 'foto.png', contentType: 'image/png', size: 50, createdAt: '2026-09-23T12:00:00Z' });
const users = [{ ...profile, createdAt: '2026-09-29T12:00:00Z', createdBy: 'admin', roles: ['ROLE_ADMINISTRADOR', 'ROLE_CLIENTE'] }, { ...profile, id: 2, name: 'Cliente Usuário', roles: ['ROLE_CLIENTE'] }];
const token = (authorities, exp = Math.floor(Date.now() / 1000) + 3600) =>
  `e30.${Buffer.from(JSON.stringify({ exp, user_name: 'teste@example.com', authorities })).toString('base64url')}.test`;
const organizationAuthorities = ['DEPARTMENT', 'POSITION', 'EMPLOYEE', 'SUPPLIER'].flatMap((name) => ['READ', 'WRITE', 'DELETE'].map((action) => `${name}_${action}`));
const financialAuthorities = ['PAYABLE', 'RECEIVABLE', 'METHODS', 'FREQUENCY'].flatMap((name) => ['READ', 'WRITE', 'DELETE'].map((action) => `${name}_${action}`));
const adminToken = token([...organizationAuthorities, ...financialAuthorities, 'FINANCIAL_SETTINGS_READ', 'FINANCIAL_SETTINGS_WRITE', 'FINANCIAL_REPORTS_READ', 'ROLE_ADMINISTRADOR', 'USER_READ', 'USER_WRITE', 'USER_PROFILE_READ', 'ROLE_READ', 'ROLE_WRITE', 'CUSTOMER_READ', 'CUSTOMER_WRITE', 'CUSTOMER_DELETE', 'SYSTEM_SETTING_READ', 'SYSTEM_SETTING_WRITE']);

const audit = { createdAt: '2026-09-29T12:00:00Z', updatedAt: '2026-09-29T13:00:00Z', createdBy: 'admin', updatedBy: 'gestor' };
const organization = {
  departments: Array.from({ length: 6 }, (_, index) => ({ id: index + 1, name: `Setor ${index + 1}`, description: 'Descrição do setor', ...audit })),
  positions: [{ id: 1, name: 'Motorista', ...audit }],
  employees: Array.from({ length: 6 }, (_, index) => ({ id: index + 1, name: `Funcionário ${index + 1}`, employeeCode: `MAT00${index + 1}`, email: 'funcionario@example.com', phone: '11999999999', address: 'Rua do Funcionário', salary: 2300.5, employmentType: 'CLT', hireDate: '2026-01-10', terminationDate: null, active: true, position: { id: 1, name: 'Motorista' }, department: { id: 1, name: 'Setor 1' }, ...audit })),
  suppliers: [{ id: 1, name: 'Andaimes Primavera', tradeName: 'Primavera', companyName: 'Primavera Ltda', cnpj: '98765004000165', phoneNumber: '11999900004', email: '[contato@example.com](mailto:contato@example.com)', address, ...audit }],
};
const organizationFiles = { employees: [], suppliers: [] };
let financialSetting = { id: 1, defaultLateFeePercent: 2, defaultLateInterestPercent: 1, ...audit };
const accountAudit = { createdAt: audit.createdAt, updatedAt: audit.updatedAt, createdByName: 'admin', updatedByName: 'gestor', paidByName: 'admin' };
const accountFixtures = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1, description: `Conta Teste ${index + 1}`, amount: 100, originalAmount: 100,
  dueDate: '2099-10-20', paymentDate: null, paid: false, canceled: false, residual: false,
  remainingBalance: 100, currentAmountWithLateCharges: 102.5, subtotal: 0,
  fee: 0, lateFee: 0, lateInterest: 0, discount: 0, overdueDays: 0,
  calculatedLateFee: 0, calculatedLateInterest: 0,
  paymentMethodId: 1, paymentMethodName: 'Cartão', paymentFrequencyId: 1, paymentFrequency: 'Mensal',
  customerId: 1, customerName: 'Cliente financeiro', supplierId: 1, supplierName: 'Fornecedor financeiro', employeeId: 1, employeeName: 'Funcionário financeiro', ...accountAudit,
}));
Object.assign(accountFixtures[1], { amount: 200, originalAmount: 200, remainingBalance: 200, dueDate: '2020-01-01', currentAmountWithLateCharges: 215, calculatedLateFee: 10, calculatedLateInterest: 5, overdueDays: 10 });
Object.assign(accountFixtures[2], { paymentDate: '2026-10-01', subtotal: 30, remainingBalance: 70, currentAmountWithLateCharges: 71.75 });
Object.assign(accountFixtures[3], { paid: true, paymentDate: '2026-10-01', subtotal: 100, remainingBalance: 0, currentAmountWithLateCharges: 107.5, fee: 2.5, lateFee: 5 });
Object.assign(accountFixtures[4], { canceled: true });
Object.assign(accountFixtures[5], { amount: 50, originalAmount: 100, remainingBalance: 50, residual: true, parentPayableId: 3, parentReceivableId: 3 });
const financial = {
  'payment-methods': [
    { id: 1, name: 'Cartão', fee: 2.5, ...audit },
    { id: 2, name: 'PIX', fee: 0, ...audit },
    { id: 3, name: 'Boleto', fee: 1, ...audit },
    ...Array.from({ length: 3 }, (_, index) => ({ id: index + 4, name: `Método ${index + 4}`, fee: null, ...audit })),
  ],
  'payment-frequencies': Array.from({ length: 6 }, (_, index) => ({ id: index + 1, frequency: index === 0 ? 'Mensal' : `Frequência ${index + 1}`, days: 30 + index, ...audit })),
  payables: accountFixtures.map((record) => ({ ...record })),
  receivables: accountFixtures.map((record) => ({ ...record })),
};
const financialFiles = { payables: [], receivables: [] };


const server = await createServer({
  server: { host: '127.0.0.1', port, strictPort: true },
  plugins: [{ name: 'sync-test-api', configureServer(vite) {
    vite.middlewares.use('/mock-api', async (req, res) => {
      let body = '';
      try {
        for await (const chunk of req) body += chunk;
      } catch {
        // A navegação pode cancelar uma requisição pendente da API simulada.
        return;
      }
      const url = new URL(req.url, origin);
      requests.push({ method: req.method, path: url.pathname, search: url.search, body, headers: req.headers });
      res.setHeader('Content-Type', 'application/json');
      if (url.pathname === failPath) {
        res.statusCode = 400;
        res.end(JSON.stringify({ message: 'Falha simulada' }));
        return;
      }
      let data = {};
      const parts = url.pathname.split('/');
      const resource = parts[1];
      if (url.pathname === '/financial-settings') {
        if (req.method === 'PUT') financialSetting = { ...financialSetting, ...JSON.parse(body) };
        res.end(JSON.stringify(financialSetting)); return;
      }
      if (url.pathname.startsWith('/reports/financial-reports/')) {
        if (parts[3] === 'comparison') {
          data = { year: Number(url.searchParams.get('year') || 2026), receivableTotal: 250, payableTotal: 100, balance: 150, receivableCount: 3, payableCount: 2,
            months: Array.from({ length: 12 }, (_, index) => ({ month: index + 1, label: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][index], receivableTotal: index === 0 ? 250 : 0, payableTotal: index === 0 ? 100 : 0 })) };
          res.end(JSON.stringify(data)); return;
        }
        res.setHeader('Content-Type', parts[4] === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end(parts[4] === 'pdf' ? '%PDF-1.4 test' : 'mock excel'); return;
      }
      if (Object.hasOwn(financial, resource)) {
        const id = Number(parts[2]);
        if (parts[3] === 'receipt' || parts[3] === 'fiscal-coupon') {
          res.setHeader('Content-Type', 'application/pdf'); res.end('%PDF-1.4 test'); return;
        }
        if (parts[3] === 'files') {
          if (parts[5] === 'view' || parts[5] === 'download') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', "attachment; filename*=UTF-8''comprovante%20assinado.pdf");
            res.end('%PDF-1.4 test'); return;
          }
          if (req.method === 'POST') {
            data = { id: financialFiles[resource].length + 1, name: 'Comprovante', originalFileName: 'conta.pdf', contentType: 'application/pdf', size: 100, [resource === 'payables' ? 'payableId' : 'receivableId']: id, ...audit };
            financialFiles[resource].push(data);
          } else if (req.method === 'DELETE') financialFiles[resource] = financialFiles[resource].filter((file) => file.id !== Number(parts[4]));
          else data = financialFiles[resource].filter((file) => file[resource === 'payables' ? 'payableId' : 'receivableId'] === id);
        } else if (parts[2] === 'report') {
          data = { totalItems: 12, totalAmount: 1200, paidAmount: 100, openAmount: 1100 };
        } else if (parts[3] === 'payments') {
          const payment = JSON.parse(body);
          const account = financial[resource].find((record) => record.id === id);
          const total = account.remainingBalance + payment.fee + payment.lateFee + payment.lateInterest;
          data = { ...account, paymentDate: payment.paymentDate, paymentMethodId: payment.paymentMethodId, paid: payment.paymentAmount >= total, remainingBalance: Math.max(0, account.remainingBalance - payment.paymentAmount), subtotal: payment.paymentAmount, currentAmountWithLateCharges: total, fee: payment.fee, lateFee: payment.lateFee, lateInterest: payment.lateInterest };
          financial[resource] = financial[resource].map((record) => record.id === id ? data : record);
        } else if (req.method === 'DELETE') {
          const ids = parts[2] === 'all' ? JSON.parse(body) : [id];
          financial[resource] = financial[resource].filter((record) => !ids.includes(record.id));
        } else if (req.method === 'POST' || req.method === 'PUT') {
          data = { ...JSON.parse(body), id: req.method === 'POST' ? 20 : id, ...audit, ...accountAudit };
          if (req.method === 'POST') financial[resource].push(data);
          else financial[resource] = financial[resource].map((record) => record.id === id ? { ...record, ...data } : record);
        } else if (parts[2]) data = financial[resource].find((record) => record.id === id);
        else {
          const field = resource === 'payment-frequencies' ? 'frequency' : resource.includes('payment-') ? 'name' : 'description';
          const filter = url.searchParams.get(resource.includes('payment-') ? field : 'search') || '';
          const filtered = financial[resource].filter((record) => record[field].includes(filter));
          const size = Number(url.searchParams.get('linesPerPage') || 5);
          const start = Number(url.searchParams.get('page') || 0) * size;
          data = { content: filtered.slice(start, start + size), totalElements: filtered.length };
        }
        res.end(JSON.stringify(data)); return;
      }
      if (Object.hasOwn(organization, resource)) {
        const id = Number(parts[2]);
        if (parts[3] === 'photo' || parts[3] === 'image') {
          res.statusCode = 204; res.end(); return;
        }
        if (parts[3] === 'files') {
          if (parts[5] === 'view' || parts[5] === 'download') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', "attachment; filename*=UTF-8''documento%20assinado.pdf");
            res.end('%PDF-1.4 test'); return;
          }
          if (req.method === 'POST') {
            data = { id: 1, name: 'Documento anexado', originalFileName: 'documento.pdf', contentType: 'application/pdf', size: 100, ...audit };
            organizationFiles[resource].push(data);
          } else if (req.method === 'DELETE') organizationFiles[resource] = [];
          else data = organizationFiles[resource];
        } else if (req.method === 'DELETE') {
          const ids = parts[2] === 'all' ? JSON.parse(body) : [id];
          organization[resource] = organization[resource].filter((record) => !ids.includes(record.id));
        } else if (req.method === 'PATCH') {
          organization[resource] = organization[resource].map((record) => record.id === id ? { ...record, active: JSON.parse(body) } : record);
        } else if (req.method === 'POST' || req.method === 'PUT') {
          const payload = JSON.parse(body);
          data = { ...payload, id: req.method === 'POST' ? 20 : id, ...audit };
          if (resource === 'employees') {
            data.position = organization.positions.find((item) => item.id === payload.positionId);
            data.department = organization.departments.find((item) => item.id === payload.departmentId);
          }
          if (req.method === 'POST') organization[resource].push(data);
          else organization[resource] = organization[resource].map((record) => record.id === id ? data : record);
        } else if (parts[2]) data = organization[resource].find((record) => record.id === id);
        else {
          const filtered = organization[resource].filter((record) => record.name.includes(url.searchParams.get('name') || ''));
          const size = Number(url.searchParams.get('linesPerPage') || 5);
          const start = Number(url.searchParams.get('page') || 0) * size;
          data = { content: filtered.slice(start, start + size), totalElements: filtered.length };
        }
        res.end(JSON.stringify(data)); return;
      }
      if (url.pathname.startsWith('/customers')) {
        const parts = url.pathname.split('/');
        const id = Number(parts[2]);
        if (parts[3] === 'photo') {
          res.statusCode = 204; res.end(); return;
        }
        if (parts[3] === 'files') {
          if (parts[5] === 'view' || parts[5] === 'download') {
            if (parts[4] === '3') {
              res.setHeader('Content-Type', 'image/png');
              res.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aFOsAAAAASUVORK5CYII=', 'base64')); return;
            }
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', "attachment; filename*=UTF-8''contrato%20assinado.pdf");
            res.end('%PDF-1.4 test'); return;
          }
          if (req.method === 'POST') {
            data = { id: 2, customerId: id, name: 'Documento novo', originalFileName: 'novo.pdf', contentType: 'application/pdf', createdAt: '2026-09-23T12:00:00Z' };
            files.push(data);
          } else if (req.method === 'DELETE') {
            files = files.filter((file) => file.id !== Number(parts[4]));
          } else data = files;
        } else if (req.method === 'DELETE') {
          const ids = parts[2] === 'all' ? JSON.parse(body) : [id];
          customers = customers.filter((customer) => !ids.includes(customer.id));
        } else if (req.method === 'PATCH') {
          customers = customers.map((customer) => customer.id === id ? { ...customer, active: JSON.parse(body) } : customer);
        } else if (req.method === 'POST') {
          data = { ...JSON.parse(body), id: 20 }; customers.push(data);
        } else if (req.method === 'PUT') {
          data = { ...JSON.parse(body), id }; customers = customers.map((customer) => customer.id === id ? data : customer);
        } else if (parts[2]) data = customers.find((customer) => customer.id === id);
        else {
          const filtered = customers.filter((customer) => customer.name.includes(url.searchParams.get('name') || ''));
          const size = Number(url.searchParams.get('linesPerPage') || 5);
          const start = Number(url.searchParams.get('page') || 0) * size;
          data = { content: filtered.slice(start, start + size), totalElements: filtered.length };
        }
        res.end(JSON.stringify(data)); return;
      }
      if (url.pathname === '/listing-exports/excel') {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.end('mock excel'); return;
      }
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
      } else if (url.pathname === '/users') data = { content: users, totalElements: users.length, totalPages: 1 };
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
async function click(selector) {
  await waitFor(`!!document.querySelector(${JSON.stringify(selector)})`);
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
}
async function select(selector, value) {
  await evaluate(`(() => { const input = document.querySelector(${JSON.stringify(selector)}); input.value = ${JSON.stringify(String(value))}; input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
}
async function number(selector, value) {
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).focus()`);
  await fill(selector, value);
  await evaluate(`document.querySelector(${JSON.stringify(selector)}).blur()`);
}
async function authenticate(value) { await evaluate(`localStorage.setItem('token', ${JSON.stringify(value)})`); }
async function screenshot(name) {
  if (!process.env.SYNC_SCREENSHOTS) return;
  await new Promise((done) => setTimeout(done, 400));
  const directory = resolve('node_modules/.sync-screenshots');
  mkdirSync(directory, { recursive: true });
  const result = await cdp('Page.captureScreenshot', { format: 'png' });
  writeFileSync(resolve(directory, name + '.png'), Buffer.from(result.data, 'base64'));
}
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
  await visit('/customer-account/register', '#name');
  assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"), true);
  const registration = { name: 'Cliente Público', cpf: '12345678901', email: 'publico@example.com', phone: '11999999999', street: 'Rua Pública', number: '5', complement: 'Casa', neighborhood: 'Centro', city: 'Recife', state: 'PE', zipCode: '50000000' };
  for (const [field, value] of Object.entries(registration)) await fill(`#${field}`, value);
  await fill('#cpf', '123');
  assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"), true);
  await fill('#cpf', registration.cpf);
  await fill('#email', 'a..b@example.com');
  assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"), true);
  await fill('#email', registration.email);
  await click('button[type=submit]');
  await waitFor("location.pathname === '/customer-account/resend' && document.querySelector('#email')?.value === 'publico@example.com'");
  await screenshot('resend-desktop');
  assert.deepEqual(JSON.parse(latest('/customer-accounts', 'POST').body), registration);
  assert.equal(latest('/customer-accounts', 'POST').headers.authorization, undefined);
  await click('button[type=submit]');
  await waitFor("document.body.textContent.includes('Um novo link de ativação foi enviado.')");
  assert.deepEqual(JSON.parse(latest('/customer-accounts/resend-activation', 'POST').body), { email: registration.email });
  assert.equal(latest('/customer-accounts/resend-activation', 'POST').headers.authorization, undefined);
  await visit('/customer-account/create-password', '#password');
  assert.equal(await evaluate("document.body.textContent.includes('Token não encontrado.')"), true);
  assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"), true);
  await visit('/customer-account/create-password?token=customer-token', '#password');
  await fill('#password', 'secret123');
  await fill('#passwordConfirmation', 'different');
  await click('button[type=submit]');
  await waitFor("document.body.textContent.includes('As senhas não conferem.')");
  assert.equal(latest('/customer-accounts/create-password', 'POST'), undefined);
  await fill('#passwordConfirmation', 'secret123');
  await click('button[type=submit]');
  await waitFor("location.pathname === '/login'");
  assert.deepEqual(JSON.parse(latest('/customer-accounts/create-password', 'POST').body), { password: 'secret123', passwordConfirmation: 'secret123' });
  assert.equal(latest('/customer-accounts/create-password', 'POST').search, '?token=customer-token');
  assert.equal(latest('/customer-accounts/create-password', 'POST').headers.authorization, undefined);
  assert.equal(await evaluate("document.querySelector('a[href=\"/customer-account/register\"]').textContent"), 'Ainda não é um cliente?');
  console.log('OK cadastro público, validações, reenvio, criação de senha e ausência de JWT');

  await authenticate(token([]));
  for (const path of ['/users', '/users/create', '/users/1/edit', '/users/profile', '/roles', '/roles/create', '/customers', '/customers/create', '/customers/1/edit', '/system-settings', ...Object.keys(organization).flatMap((name) => [`/${name}`, `/${name}/create`, `/${name}/1/edit`])]) {
    await cdp('Page.navigate', { url: origin + path });
    await waitFor("location.pathname === '/not-authorized' && document.body.textContent.includes('Acesso negado!')");
  }
  await cdp('Page.navigate', { url: origin + '/rota-inexistente' });
  await waitFor("location.pathname === '/page-not-found' && document.body.textContent.includes('Página não encontrada')");
  await visit('/home', '.sidebar');
  assert.equal(await evaluate("document.querySelector('.sidebar').textContent.includes('Administração')"), false);
  assert.equal(await evaluate("document.querySelector('.sidebar').textContent.includes('Organização')"), false);
  await authenticate(token(['CUSTOMER_READ']));
  await visit('/customers', '.customer-list-screen .p-datatable-tbody tr');
  assert.equal(await evaluate("!!document.querySelector('a[href=\"/customers/create\"]')"), false);
  assert.equal(await evaluate("document.querySelectorAll('.customer-list-screen .selection-column').length"), 0);
  assert.equal(await evaluate("document.querySelectorAll('.customer-list-screen .pi-trash, .customer-list-screen .pi-pencil, .customer-list-screen .pi-ban').length"), 0);
  await click('.customer-list-screen .pi-folder-open');
  await waitFor("!!document.querySelector('.customer-files-dialog')");
  assert.equal(await evaluate("!!document.querySelector('.customer-files-dialog form')"), false);
  assert.equal(await evaluate("!!document.querySelector('.customer-files-dialog .pi-trash')"), false);
  console.log('OK guards de todas as rotas, páginas 403/404, menus e ações por permissão');

  await authenticate(adminToken);
  await visit('/users', '.p-datatable-tbody tr');
  assert.equal(await evaluate("document.querySelectorAll('.p-datatable-tbody tr')[0].querySelector('.p-button-danger').disabled"), true);
  assert.equal(await evaluate("document.querySelectorAll('.p-datatable-tbody tr')[1].querySelector('.p-button-danger').disabled"), false);
  await click('.p-datatable-thead .p-checkbox-box');
  await waitFor("!!document.querySelector('.user-actions-group .btn-danger')");
  await click('.user-actions-group .btn-danger');
  await waitFor("!!document.querySelector('.p-confirm-dialog-accept')");
  await click('.p-confirm-dialog-accept');
  await waitFor("!document.querySelector('.p-confirm-dialog')");
  assert.deepEqual(JSON.parse(latest('/users/all', 'DELETE').body), [2]);
  console.log('OK administrador protegido, inclusive na seleção e exclusão em lote');

  await visit('/customers/create', 'input[placeholder="Nome"]');
  await screenshot('customer-form-desktop');
  const formFields = { Nome: 'Cliente Criado', 'E-mail': 'criado@example.com', Telefone: '11999999999', CPF: '12345678901', CEP: '50000000', Rua: 'Rua Nova', Número: '10', Complemento: 'Casa', Bairro: 'Centro', Cidade: 'Recife', UF: 'PE' };
  for (const [placeholder, value] of Object.entries(formFields)) await fill(`input[placeholder="${placeholder}"]`, value);
  await evaluate(`(() => { const data = new DataTransfer(); data.items.add(new File(['photo'], 'cliente.png', { type: 'image/png' })); const input = document.querySelector('#photo'); input.files = data.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await click('button[type=submit]');
  await waitFor("['/customers', '/customers/'].includes(location.pathname) && !!document.querySelector('.customer-list-screen')");
  const inserted = JSON.parse(latest('/customers', 'POST').body);
  assert.deepEqual(Object.keys(inserted).sort(), ['active', 'address', 'cpf', 'email', 'name', 'phone']);
  assert.equal(inserted.phone, '11999999999');
  assert.equal(inserted.address.zipCode, '50000000');
  assert.equal(inserted.cpf, '12345678901');
  assert.match(latest('/customers/20/photo', 'PUT').body, /name="file"; filename="cliente.png"/);
  await visit('/customers/20/edit', 'input[placeholder="Nome"]');
  await waitFor("document.querySelector('input[placeholder=Nome]').value === 'Cliente Criado'");
  await fill('input[placeholder="Nome"]', 'Cliente Atualizado');
  await click('button[type=submit]');
  await waitFor("['/customers', '/customers/'].includes(location.pathname)");
  assert.equal(JSON.parse(latest('/customers/20', 'PUT').body).name, 'Cliente Atualizado');
  await visit('/customers', '.p-datatable-tbody tr');
  await fill('input[placeholder="Digite o nome do cliente"]', 'Atualizado');
  await click('.filter-search-icon');
  await waitFor("document.querySelector('.p-datatable-tbody').textContent.includes('Cliente Atualizado') && document.querySelectorAll('.p-datatable-tbody tr').length === 1");
  assert.equal(new URLSearchParams(latest('/customers', 'GET').search).get('name'), 'Atualizado');
  await click('.customer-list-screen .pi-eye');
  await waitFor("document.querySelector('.customer-details-dialog')?.textContent.includes('Cliente Atualizado')");
  await click('.customer-details-dialog .p-dialog-header-close');
  await click('.customer-list-screen .pi-ban');
  await waitFor("!!document.querySelector('.customer-list-screen .row-inactive')");
  assert.equal(latest('/customers/20/active', 'PATCH').body, 'false');
  await click('.customer-list-screen .pi-file-excel');
  await waitFor("!!document.querySelector('.p-confirm-dialog-accept')");
  await click('.p-confirm-dialog-accept');
  await waitFor("document.body.textContent.includes('Clientes') && !document.querySelector('.p-confirm-dialog')");
  await new Promise((done) => setTimeout(done, 200));
  assert.equal(JSON.parse(latest('/listing-exports/excel', 'POST').body).title, 'Clientes');
  assert.equal(JSON.parse(latest('/listing-exports/excel', 'POST').body).rows.length, 1);
  console.log('OK CRUD cliente, máscaras, foto multipart, filtros, detalhes, status e exportação');

  await visit('/customers', '.p-datatable-tbody tr');
  await click('.customer-list-screen .pi-folder-open');
  await waitFor("document.querySelector('.customer-files-dialog')?.textContent.includes('Contrato')");
  await waitFor("!!document.querySelector('.customer-files-dialog .file-photo')");
  await screenshot('customer-files-desktop');
  await click('.customer-files-dialog .file-photo');
  await waitFor("!!document.querySelector('.file-view img[src^=\"blob:\"]')");
  await evaluate("[...document.querySelectorAll('.customer-files-dialog .p-dialog-header-close')].at(-1).click()");
  await click('.customer-files-dialog .pi-file-pdf');
  await waitFor("!!document.querySelector('.file-view iframe[src^=\"blob:\"]')");
  await evaluate("[...document.querySelectorAll('.customer-files-dialog .p-dialog-header-close')].at(-1).click()");
  await evaluate("window.lastDownload = ''; const originalClick = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function() { window.lastDownload = this.download; originalClick.call(this); }");
  await click('.customer-files-dialog .pi-download');
  await waitFor("window.lastDownload === 'contrato assinado.pdf'");
  await evaluate(`(() => { const data = new DataTransfer(); data.items.add(new File(['%PDF-1.4 novo'], 'novo.pdf', { type: 'application/pdf' })); const input = document.querySelector('#fileInput'); input.files = data.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await waitFor("document.querySelector('#fileName').value === 'novo.pdf'");
  await fill('#fileName', 'Documento novo');
  await click('.customer-files-dialog button[type=submit]');
  await waitFor("document.querySelector('.customer-files-dialog')?.textContent.includes('Documento novo')");
  assert.match(latest('/customers/1/files', 'POST').body, /name="name"\r\n\r\nDocumento novo/);
  assert.match(latest('/customers/1/files', 'POST').body, /name="file"; filename="novo.pdf"/);
  await click('.customer-files-dialog .pi-trash');
  await waitFor("!!document.querySelector('.p-confirm-dialog-accept')");
  await click('.p-confirm-dialog-accept');
  await waitFor("!document.querySelector('.customer-files-dialog').textContent.includes('Contrato')");
  assert.ok(latest('/customers/1/files/1', 'DELETE'));
  console.log('OK anexos, upload, visualização, download com nome UTF-8 e exclusão');

  await visit('/customers', '.p-datatable-tbody tr');
  await click('.customer-list-screen .p-datatable-tbody .p-checkbox-box');
  await click('.customer-list-screen .p-paginator-next');
  await waitFor("document.querySelector('.p-datatable-tbody').textContent.includes('Cliente Teste 6')");
  assert.equal(new URLSearchParams(latest('/customers', 'GET').search).get('page'), '1');
  await click('.customer-list-screen .p-datatable-tbody .p-checkbox-box');
  await click('.customer-actions-group .btn-danger');
  await waitFor("!!document.querySelector('.p-confirm-dialog-accept')");
  await click('.p-confirm-dialog-accept');
  await waitFor("!document.querySelector('.p-confirm-dialog')");
  assert.deepEqual(JSON.parse(latest('/customers/all', 'DELETE').body), [1, 6]);
  console.log('OK paginação e seleção de clientes entre páginas');

  await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  for (const [path, selector] of [['/customer-account/register', '#name'], ['/customer-account/create-password', '#password'], ['/customer-account/resend', '#email'], ['/customers/create', '#photo'], ['/customers', '.customer-list-screen']]) {
    await visit(path, selector);
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, path);
    await screenshot(path.replaceAll('/', '-') + '-mobile');
  }
  await cdp('Emulation.clearDeviceMetricsOverride');
  console.log('OK responsividade das novas telas');

  await authenticate(adminToken);
  for (const [resource, single] of [['users', 'user'], ['customers', 'customer']]) {
    await visit(`/${resource}`, '.p-datatable-tbody tr');
    await click('.table-toolbar .pi-cog');
    await waitFor("document.querySelectorAll('.field-option').length > 0");
    await evaluate(`(() => { for (const label of ['Data cadastro', 'Criado por']) { const option = [...document.querySelectorAll('.field-option')].find((item) => item.textContent.trim() === label); const input = option.querySelector('input'); if (!input.checked) input.click(); } })()`);
    await click('.modal-actions button');
    await waitFor("document.querySelector('.p-datatable-tbody').textContent.includes('29/09/2026') && document.querySelector('.p-datatable-tbody').textContent.includes('admin')");
  }
  console.log('OK auditoria em listagens de usuários e clientes');

  for (const [resource, single] of [['departments', 'department'], ['positions', 'position'], ['employees', 'employee'], ['suppliers', 'supplier']]) {
    await visit(`/${resource}`, `.${single}-list-screen .p-datatable-tbody tr`);
    await waitFor(`document.querySelector('.${single}-list-screen .p-datatable-tbody').textContent.includes(${JSON.stringify(organization[resource][0].name)})`);
    await click(`.${single}-list-screen .pi-eye`);
    await waitFor(`document.querySelector('.${single}-details-dialog')?.textContent.includes('admin')`);
    await click(`.${single}-details-dialog .p-dialog-header-close`);
    await fill(`input[placeholder^="Digite o nome"]`, organization[resource][0].name);
    await click('.filter-search-icon');
    await waitFor("document.querySelectorAll('.p-datatable-tbody tr').length === 1");
    assert.equal(new URLSearchParams(latest(`/${resource}`, 'GET').search).get('name'), organization[resource][0].name);
    await click(`.${single}-list-screen .pi-file-excel`);
    await click('.p-confirm-dialog-accept');
    await new Promise((done) => setTimeout(done, 200));
    assert.equal(JSON.parse(latest('/listing-exports/excel', 'POST').body).rows.length, 1);
    await screenshot(`${resource}-desktop`);
    await authenticate(token([`${single.toUpperCase()}_READ`]));
    await visit(`/${resource}`, `.${single}-list-screen .p-datatable-tbody tr`);
    assert.equal(await evaluate(`document.querySelectorAll('.${single}-list-screen .pi-pencil, .${single}-list-screen .pi-trash, .${single}-list-screen .pi-ban, .${single}-list-screen .selection-column').length`), 0);
    assert.equal(await evaluate(`!!document.querySelector('a[href="/${resource}/create"]')`), false);
    if (resource === 'employees' || resource === 'suppliers') {
      await click(`.${single}-list-screen .pi-folder-open`);
      await waitFor(`!!document.querySelector('.${single}-files-dialog')`);
      assert.equal(await evaluate(`!!document.querySelector('.${single}-files-dialog form')`), false);
      await click(`.${single}-files-dialog .p-dialog-header-close`);
    }
    await authenticate(adminToken);
  }
  console.log('OK novos módulos: listagem, filtro, detalhes, auditoria, exportação e permissões');

  await visit('/departments/create', '#name');
  await fill('#name', 'AB');
  assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"), true);
  await fill('#name', 'Setor novo');
  await evaluate(`(() => { const input = document.querySelector('#description'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, 'Descrição nova'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await click('button[type=submit]');
  await waitFor("location.pathname.split('/').filter(Boolean).join('/') === 'departments'");
  assert.deepEqual(JSON.parse(latest('/departments', 'POST').body), { name: 'Setor novo', description: 'Descrição nova' });
  await visit('/departments/20/edit', '#name');
  await waitFor("document.querySelector('#name').value === 'Setor novo'");
  await fill('#name', 'Setor editado');
  await click('button[type=submit]');
  await waitFor("location.pathname.split('/').filter(Boolean).join('/') === 'departments'");
  assert.deepEqual(JSON.parse(latest('/departments/20', 'PUT').body), { name: 'Setor editado', description: 'Descrição nova' });

  await visit('/positions/create', '#name');
  await fill('#name', '  Cargo novo  ');
  await click('button[type=submit]');
  await waitFor("location.pathname.split('/').filter(Boolean).join('/') === 'positions'");
  assert.deepEqual(JSON.parse(latest('/positions', 'POST').body), { name: 'Cargo novo' });
  await visit('/positions/20/edit', '#name');
  await waitFor("document.querySelector('#name').value === 'Cargo novo'");
  await fill('#name', '  Cargo editado  ');
  await click('button[type=submit]');
  await waitFor("location.pathname.split('/').filter(Boolean).join('/') === 'positions'");
  assert.deepEqual(JSON.parse(latest('/positions/20', 'PUT').body), { id: 20, name: 'Cargo editado' });
  console.log('OK departamentos e cargos: criação, edição, validações e payloads distintos');

  await visit('/employees/create', '#name');
  assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"), true);
  await fill('#name', 'Funcionário novo');
  await fill('#employeeCode', 'MAT999');
  await fill('#email', 'novo@example.com');
  await fill('#phone', '11999999999');
  await fill('#address', 'Rua do Funcionário');
  await fill('#employmentType', 'CLT');
  await fill('#hireDate', '2026-09-20');
  await fill('#terminationDate', '2026-09-19');
  await waitFor("document.querySelectorAll('#position option').length > 1 && document.querySelectorAll('#department option').length > 1");
  for (const name of ['position', 'department']) await evaluate(`(() => { const input = document.querySelector('#${name}'); input.value = '1'; input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await click('button[type=submit]');
  await waitFor("document.body.textContent.includes('A data de desligamento não pode ser menor')");
  assert.equal(latest('/employees', 'POST'), undefined);
  await fill('#terminationDate', '');
  await evaluate(`(() => { const data = new DataTransfer(); data.items.add(new File(['photo'], 'employee.png', { type: 'image/png' })); const input = document.querySelector('#photo'); input.files = data.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await click('button[type=submit]');
  await waitFor("location.pathname.split('/').filter(Boolean).join('/') === 'employees'");
  const employeePayload = JSON.parse(latest('/employees', 'POST').body);
  assert.deepEqual(employeePayload, { name: 'Funcionário novo', employeeCode: 'MAT999', email: 'novo@example.com', phone: '11999999999', address: 'Rua do Funcionário', salary: null, hireDate: '2026-09-20', terminationDate: null, employmentType: 'CLT', active: true, positionId: 1, departmentId: 1 });
  assert.match(latest('/employees/20/photo', 'PUT').body, /name="file"; filename="employee.png"/);
  await visit('/employees/1/edit', '#name');
  await waitFor("document.querySelector('#name').value === 'Funcionário 1' && document.querySelector('#position').value === '1'");
  assert.equal(await evaluate("document.querySelector('#salary').value.includes('2.300,50')"), true);
  await fill('#name', 'Funcionário editado');
  await click('button[type=submit]');
  await waitFor("location.pathname.split('/').filter(Boolean).join('/') === 'employees'");
  assert.equal(JSON.parse(latest('/employees/1', 'PUT').body).salary, 2300.5);
  assert.equal(JSON.parse(latest('/employees/1', 'PUT').body).positionId, 1);
  await waitFor("!!document.querySelector('.employee-list-screen .pi-ban')");
  await click('.employee-list-screen .pi-ban');
  await waitFor("!!document.querySelector('.employee-list-screen .row-inactive')");
  assert.equal(latest('/employees/1/active', 'PATCH').body, 'false');
  console.log('OK funcionários: relações, salário, datas, foto multipart, edição e status');

  await visit('/suppliers/create', '#photo');
  const supplierFields = { Nome: 'Fornecedor novo', 'Nome fantasia': 'Nome fantasia novo', 'Razão social': 'Razão social nova', 'E-mail': 'fornecedor@example.com', Telefone: '1133334444', CNPJ: '12345678000199', CEP: '12345678', Rua: 'Rua nova', Número: '10', Bairro: 'Centro', Cidade: 'São Paulo', UF: 'SP' };
  for (const [field, value] of Object.entries(supplierFields)) await fill(`input[placeholder="${field}"]`, value);
  assert.equal(await evaluate("document.querySelector('input[placeholder=CNPJ]').value"), '12.345.678/0001-99');
  assert.equal(await evaluate("document.querySelector('input[placeholder=Telefone]').value"), '(11) 3333-4444');
  await evaluate(`(() => { const data = new DataTransfer(); data.items.add(new File(['photo'], 'supplier.png', { type: 'image/png' })); const input = document.querySelector('#photo'); input.files = data.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
  await click('button[type=submit]');
  await waitFor("location.pathname.split('/').filter(Boolean).join('/') === 'suppliers'");
  const supplierPayload = JSON.parse(latest('/suppliers', 'POST').body);
  assert.deepEqual(Object.keys(supplierPayload).sort(), ['address', 'cnpj', 'companyName', 'email', 'name', 'phoneNumber', 'tradeName']);
  assert.equal(supplierPayload.cnpj, '12345678000199');
  assert.equal(supplierPayload.phoneNumber, '1133334444');
  assert.match(latest('/suppliers/20/image', 'PUT').body, /name="file"; filename="supplier.png"/);
  await visit('/suppliers/1/edit', '#photo');
  await waitFor("document.querySelector('input[placeholder=Nome]').value === 'Andaimes Primavera'");
  assert.equal(await evaluate("document.querySelector('input[placeholder=\"E-mail\"]').value"), 'contato@example.com');
  await fill('input[placeholder=Nome]', 'Fornecedor editado');
  await click('button[type=submit]');
  await waitFor("location.pathname.split('/').filter(Boolean).join('/') === 'suppliers'");
  assert.equal(JSON.parse(latest('/suppliers/1', 'PUT').body).id, 1);
  console.log('OK fornecedores: CNPJ, telefone fixo, endereço, imagem e e-mail normalizado');

  for (const [resource, single] of [['employees', 'employee'], ['suppliers', 'supplier']]) {
    await visit(`/${resource}`, `.${single}-list-screen .pi-folder-open`);
    await click(`.${single}-list-screen .pi-folder-open`);
    await waitFor(`!!document.querySelector('.${single}-files-dialog #fileInput')`);
    await evaluate(`(() => { const data = new DataTransfer(); data.items.add(new File(['%PDF test'], 'documento.pdf', { type: 'application/pdf' })); const input = document.querySelector('#fileInput'); input.files = data.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()`);
    await fill('#fileName', 'Documento anexado');
    await cdp('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await waitFor("getComputedStyle(document.querySelector('.file-chip')).display === 'block'");
    assert.equal(await evaluate("getComputedStyle(document.querySelector('.file-chip')).marginTop"), '8px');
    await screenshot(`${resource}-files-mobile`);
    await cdp('Emulation.clearDeviceMetricsOverride');
    await click(`.${single}-files-dialog button[type=submit]`);
    await waitFor(`document.querySelector('.${single}-files-dialog .p-datatable-tbody').textContent.includes('Documento anexado')`);
    assert.match(latest(`/${resource}/1/files`, 'POST').body, /name="name"\r\n\r\nDocumento anexado/);
    await click(`.${single}-files-dialog .pi-file-pdf`);
    await waitFor("!!document.querySelector('.file-view iframe')");
    await evaluate(`[...document.querySelectorAll('.${single}-files-dialog .p-dialog-header-close')].at(-1).click()`);
    await evaluate("window.lastDownload = ''; HTMLAnchorElement.prototype.click = function() { window.lastDownload = this.download; }");
    await click(`.${single}-files-dialog .pi-download`);
    await waitFor("window.lastDownload === 'documento assinado.pdf'");
    await click(`.${single}-files-dialog .pi-trash`);
    await click('.p-confirm-dialog-accept');
    await waitFor(`!document.querySelector('.${single}-files-dialog .p-datatable-tbody').textContent.includes('Documento anexado')`);
    assert.ok(latest(`/${resource}/1/files/1`, 'DELETE'));
  }
  console.log('OK anexos de funcionários e fornecedores: upload, preview, download, exclusão e espaçamento mobile');

  await visit('/employees', '.employee-list-screen .p-checkbox-box');
  await click('.employee-list-screen .p-datatable-tbody .p-checkbox-box');
  await click('.employee-list-screen .p-paginator-next');
  await waitFor("document.querySelector('.p-datatable-tbody').textContent.includes('Funcionário 6')");
  await click('.employee-list-screen .p-datatable-tbody .p-checkbox-box');
  await click('.employee-actions-group .btn-danger');
  await click('.p-confirm-dialog-accept');
  await waitFor("!document.querySelector('.p-confirm-dialog')");
  assert.deepEqual(JSON.parse(latest('/employees/all', 'DELETE').body), [1, 6]);
  await visit('/departments', '.department-list-screen .p-checkbox-box');
  await click('.department-list-screen .p-datatable-tbody .p-checkbox-box');
  await evaluate("document.querySelectorAll('.department-list-screen .p-datatable-tbody .p-checkbox-box')[1].click()");
  failPath = '/departments/2';
  await click('.department-actions-group .btn-danger');
  await click('.p-confirm-dialog-accept');
  await waitFor("document.body.textContent.includes('A exclusão foi interrompida.')");
  failPath = '';
  assert.ok(latest('/departments/1', 'DELETE'));
  assert.ok(latest('/departments/2', 'DELETE'));
  await waitFor("!document.querySelector('.p-datatable-tbody').textContent.includes('Setor 1') && document.querySelector('.p-datatable-tbody').textContent.includes('Setor 2')");
  console.log('OK exclusão de funcionários entre páginas e exclusão parcial sequencial de departamentos');

  for (const [resource, single] of [['departments', 'department'], ['positions', 'position'], ['employees', 'employee'], ['suppliers', 'supplier']]) {
    await visit(`/${resource}`, `.${single}-list-screen .pi-trash`);
    await click(`.${single}-list-screen .pi-trash`);
    await click('.p-confirm-dialog-accept');
    await waitFor("!document.querySelector('.p-confirm-dialog')");
    assert.ok(requests.some((request) => request.method === 'DELETE' && new RegExp(`^/${resource}/[0-9]+$`).test(request.path)));
  }
  for (const width of [390, 767, 768, 1024]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: false });
    for (const [resource, single] of [['departments', 'department'], ['positions', 'position'], ['employees', 'employee'], ['suppliers', 'supplier']]) {
      await visit(`/${resource}`, `.${single}-list-screen .global-table`);
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `${resource} ${width}`);
      if (width < 768) {
        await waitFor("!!document.querySelector('.p-datatable-tbody td:not(.selection-column) .p-column-title')");
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.p-datatable-tbody tr:not(.p-datatable-emptymessage) td:not(.selection-column)')).flexDirection"), 'column');
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.p-datatable-tbody tr:not(.p-datatable-emptymessage) td:not(.selection-column)')).alignItems"), 'flex-start');
        assert.equal(await evaluate("getComputedStyle(document.querySelector('.global-table .actions-wrap')).justifyContent"), 'flex-start');
      }
      if (width === 390) await screenshot(`${resource}-list-mobile`);
      await visit(`/${resource}/create`, 'button[type=submit]');
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `${resource} form ${width}`);
    }
  }
  await visit('/home', '.navbar-hamburger-desktop');
  assert.notEqual(await evaluate("getComputedStyle(document.querySelector('.navbar-hamburger-desktop')).display"), 'none');
  await click('.navbar-hamburger-desktop');
  await waitFor("getComputedStyle(document.querySelector('.sidebar')).visibility === 'hidden'");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.main-navbar')).left"), '0px');
  await click('.navbar-hamburger-desktop');
  await waitFor("Math.round(document.querySelector('.sidebar').getBoundingClientRect().left) === 0");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.sidebar')).transitionDuration.includes('0.3s')"), true);
  await cdp('Emulation.setDeviceMetricsOverride', { width: 767, height: 844, deviceScaleFactor: 1, mobile: false });
  await waitFor("getComputedStyle(document.querySelector('.sidebar')).visibility === 'hidden'");
  await click('.navbar-hamburger:not(.navbar-hamburger-desktop)');
  await waitFor("document.querySelector('.sidebar').classList.contains('show')");
  await click('.navbar-hamburger:not(.navbar-hamburger-desktop)');
  await waitFor("getComputedStyle(document.querySelector('.sidebar')).visibility === 'hidden'");
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1024, height: 844, deviceScaleFactor: 1, mobile: false });
  await waitFor("Math.round(document.querySelector('.sidebar').getBoundingClientRect().left) === 0");
  await cdp('Emulation.clearDeviceMetricsOverride');
  console.log('OK tabelas e formulários nos breakpoints 390/767/768/1024, sidebar desktop/mobile e transições');

  await authenticate(token([]));
  const financialRoutes = ['/financial-settings', '/reports/financial-reports', '/reports', ...['payables', 'receivables', 'payment-methods', 'payment-frequencies'].flatMap((resource) => [`/${resource}`, `/${resource}/create`, `/${resource}/1/edit`])];
  for (const path of financialRoutes) {
    await cdp('Page.navigate', { url: origin + path });
    await waitFor("location.pathname === '/not-authorized'");
  }
  await authenticate(token(['POSITION_READ']));
  await visit('/positions', '.position-list-screen');
  assert.equal(await evaluate("document.querySelector('.sidebar').textContent.includes('Organização')"), true);
  await authenticate(token(['FINANCIAL_REPORTS_READ']));
  await cdp('Page.navigate', { url: origin + '/reports' });
  await waitFor("location.pathname === '/reports/financial-reports' && !!document.querySelector('.financial-report-list-screen')");
  await authenticate(adminToken);
  await visit('/home', '#submenuFinancialDesktop');
  assert.equal(await evaluate("document.querySelectorAll('#submenuAdministracaoDesktop').length"), 1);
  assert.equal(await evaluate("document.querySelectorAll('#submenuReportsDesktop').length"), 1);
  await click('[data-bs-target="#submenuReportsDesktop"]');
  await waitFor("document.querySelector('#submenuReportsDesktop').classList.contains('show')");
  assert.equal(await evaluate("document.querySelector('#submenuAdministracaoDesktop').classList.contains('show')"), false);
  console.log('OK novas rotas financeiras, permissões, redirecionamento e menus independentes');

  for (const [resource, single, authority] of [['payment-methods', 'payment-method', 'METHODS'], ['payment-frequencies', 'payment-frequency', 'FREQUENCY'], ['payables', 'payable', 'PAYABLE'], ['receivables', 'receivable', 'RECEIVABLE']]) {
    await authenticate(token([`${authority}_READ`]));
    await visit(`/${resource}`, `.${single}-list-screen`);
    await waitFor(`!document.querySelector('.${single}-list-screen [aria-busy=true]')`);
    assert.equal(await evaluate(`document.querySelectorAll('.${single}-list-screen .pi-pencil, .${single}-list-screen .pi-trash, .${single}-list-screen .pi-check-circle, a[href="/${resource}/create"]').length`), 0);
    if (resource === 'payables' || resource === 'receivables') {
      await click(`.${single}-list-screen .pi-folder-open`);
      await waitFor(`!!document.querySelector('.${single}-files-dialog')`);
      assert.equal(await evaluate(`!!document.querySelector('.${single}-files-dialog form')`), false);
      assert.equal(await evaluate(`!!document.querySelector('.${single}-files-dialog .pi-trash')`), false);
    }
  }
  await authenticate(token(['FINANCIAL_SETTINGS_READ']));
  await visit('/financial-settings', '#defaultLateFeePercent');
  assert.equal(await evaluate("document.querySelectorAll('button[type=submit]').length"), 0);
  await authenticate(adminToken);
  console.log('OK ações financeiras e anexos respeitam READ/WRITE/DELETE');

  for (const [resource, single, field, modelName] of [['payment-methods', 'payment-method', 'name', 'Forma nova'], ['payment-frequencies', 'payment-frequency', 'frequency', 'Frequência nova']]) {
    await visit(`/${resource}/create`, `#${field}`);
    assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"), true);
    await fill(`#${field}`, 'ab');
    assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"), true);
    await fill(`#${field}`, modelName);
    if (resource === 'payment-methods') await number('#fee', '3,50');
    else {
      assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"), true);
      await number('#days', '0');
    }
    await click('button[type=submit]');
    await waitFor(`location.pathname.split('/').filter(Boolean).join('/') === '${resource}'`);
    const insertedCatalog = JSON.parse(latest(`/${resource}`, 'POST').body);
    assert.deepEqual(insertedCatalog, resource === 'payment-methods' ? { name: modelName, fee: 3.5 } : { frequency: modelName, days: 0 });
    await visit(`/${resource}/20/edit`, `#${field}`);
    await waitFor(`document.querySelector('#${field}').value === '${modelName}'`);
    await fill(`#${field}`, `${modelName} editada`);
    await click('button[type=submit]');
    await waitFor(`location.pathname.split('/').filter(Boolean).join('/') === '${resource}'`);
    assert.equal(JSON.parse(latest(`/${resource}/20`, 'PUT').body).id, 20);
    await fill(`.${single}-list-screen .filter-name-container input`, 'editada');
    await click(`.${single}-list-screen .filter-search-icon`);
    await waitFor(`document.querySelector('.${single}-list-screen .p-datatable-tbody').textContent.includes('editada')`);
    await click(`.${single}-list-screen .pi-eye`);
    await waitFor(`document.querySelector('.${single}-details-dialog')?.textContent.includes('editada')`);
    await click(`.${single}-details-dialog .p-dialog-header-close`);
    await click(`.${single}-list-screen .pi-file-excel`);
    await click('.p-confirm-dialog-accept');
    await waitFor("!document.querySelector('.p-confirm-dialog')");
    assert.equal(JSON.parse(latest('/listing-exports/excel', 'POST').body).rows.length, 1);
    await click(`.${single}-list-screen .pi-trash`);
    await click('.p-confirm-dialog-accept');
    await waitFor(`document.querySelector('.${single}-list-screen .p-datatable-emptymessage') != null`);
    assert.ok(latest(`/${resource}/20`, 'DELETE'));
  }
  console.log('OK formas/frequências: validações, criação, edição, filtro, detalhes, Excel e exclusão');

  await visit('/financial-settings', '#defaultLateFeePercent');
  await waitFor("document.querySelector('#defaultLateFeePercent').value.includes('2,00')");
  await number('#defaultLateFeePercent', '4,50');
  await number('#defaultLateInterestPercent', '1,25');
  await click('button[type=submit]');
  await waitFor("document.body.textContent.includes('Configurações financeiras atualizadas com sucesso!')");
  assert.deepEqual(JSON.parse(latest('/financial-settings', 'PUT').body), { defaultLateFeePercent: 4.5, defaultLateInterestPercent: 1.25 });
  assert.equal(await evaluate('location.pathname'), '/financial-settings');
  console.log('OK configurações de multa e juros sem descontos antigos');

  for (const [resource, single] of [['payables', 'payable'], ['receivables', 'receivable']]) {
    await visit(`/${resource}/create`, '#description');
    assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"), true);
    await fill('#description', 'Conta criada');
    await number('#amount', '123,45');
    await fill('#dueDate', '2099-10-20');
    let customerId = null;
    if (resource === 'receivables') {
      assert.equal(await evaluate("document.querySelector('button[type=submit]').disabled"), true);
      await waitFor("document.querySelectorAll('#customerId option').length > 1");
      customerId = Number(await evaluate("document.querySelectorAll('#customerId option')[1].value"));
      await select('#customerId', customerId);
    }
    await waitFor("document.querySelectorAll('#paymentMethodId option').length > 1 && document.querySelectorAll('#paymentFrequencyId option').length > 1");
    await select('#paymentMethodId', 1);
    await select('#paymentFrequencyId', 1);
    await evaluate("(() => { const data = new DataTransfer(); data.items.add(new File(['pdf'], 'conta.pdf', { type: 'application/pdf' })); const input = document.querySelector('#file'); input.files = data.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()");
    await click('button[type=submit]');
    await waitFor(`location.pathname.split('/').filter(Boolean).join('/') === '${resource}'`);
    const accountBody = JSON.parse(latest(`/${resource}`, 'POST').body);
    assert.equal(accountBody.amount, 123.45);
    assert.equal(accountBody.paymentMethodId, 1);
    assert.equal(accountBody.paymentFrequencyId, 1);
    assert.equal(accountBody.fileName, 'conta.pdf');
    assert.equal(accountBody.customerId ?? null, customerId);
    assert.equal('installments' in accountBody, false);
    assert.equal('discount' in accountBody, false);
    assert.match(latest(`/${resource}/20/files`, 'POST').headers['content-type'], /multipart\/form-data; boundary=/);
    await visit(`/${resource}/20/edit`, '#description');
    await waitFor("document.querySelector('#description').value === 'Conta criada'");
    await fill('#description', 'Conta editada');
    await click('button[type=submit]');
    await waitFor(`location.pathname.split('/').filter(Boolean).join('/') === '${resource}'`);
    assert.equal(JSON.parse(latest(`/${resource}/20`, 'PUT').body).id, 20);
    await visit(`/${resource}`, `.${single}-card`);
    await waitFor(`document.querySelectorAll('.${single}-card').length === 10`);
    assert.equal(new URLSearchParams(latest(`/${resource}`, 'GET').search).get('orderBy'), 'dueDate');
    await click(`.${single}-list-screen .p-paginator-next`);
    await waitFor(`document.querySelector('.${single}-id')?.textContent === '#11'`);
    assert.equal(new URLSearchParams(latest(`/${resource}`, 'GET').search).get('page'), '1');
    await click(`.${single}-list-screen .p-paginator-prev`);
    await waitFor(`document.querySelector('.${single}-id')?.textContent === '#1'`);
    await fill(`#${single}-search`, '  Conta Teste 1  ');
    await click(`.${single}-filters button[type=submit]`);
    await waitFor(`document.querySelectorAll('.${single}-card').length === 4`);
    assert.equal(new URLSearchParams(latest(`/${resource}`, 'GET').search).get('search'), 'Conta Teste 1');
    await click(`.${single}-filters .btn-outline-danger`);
    await waitFor(`document.querySelectorAll('.${single}-card').length === 10`);
    await evaluate(`document.querySelector('.${single}-quick-period-screen .quick-period-chip').click()`);
    await waitFor(`document.querySelector('.${single}-quick-period-screen .quick-period-chip').classList.contains('selected')`);
    const today = await evaluate("(() => { const date = new Date(); return date.getFullYear() + '-' + String(date.getMonth()+1).padStart(2,'0') + '-' + String(date.getDate()).padStart(2,'0'); })()");
    await waitFor(`document.querySelector('#${single}-start-date').value === '${today}'`);
    assert.equal(new URLSearchParams(latest(`/${resource}`, 'GET').search).get('startDate'), today);
    await fill(`#${single}-start-date`, '2020-01-01');
    await waitFor(`!document.querySelector('.${single}-quick-period-screen .quick-period-chip.selected')`);
    await click(`.${single}-filters .btn-outline-danger`);
    await waitFor(`document.querySelector('.${single}-id')?.textContent === '#1'`);
    assert.equal(await evaluate(`document.querySelectorAll('.${single}-card-canceled button[aria-label="Baixar conta total ou parcial"]').length`), 0);
    await click(`.${single}-list-screen button[aria-label="Detalhamento da conta"]`);
    await waitFor(`document.querySelector('.${single}-details-dialog')?.textContent.includes('Conta Teste 1')`);
    await click(`.${single}-details-dialog .p-dialog-header-close`);

    await click(`.${single}-card button[aria-label="Baixar conta total ou parcial"]`);
    await waitFor(`document.querySelector('.${single}-payment-dialog #payment-amount')?.value.includes('102,50')`);
    await number('#payment-amount', '200,00');
    assert.equal(await evaluate(`document.querySelector('.${single}-payment-dialog button[type=submit]').disabled`), true);
    await select('#payment-method', 2);
    await waitFor("document.querySelector('#payment-amount').value.includes('100,00')");
    await select('#payment-method', 3);
    await waitFor("document.querySelector('#payment-amount').value.includes('101,00')");
    await select('#payment-method', 1);
    await waitFor("document.querySelector('#payment-amount').value.includes('102,50')");
    await click(`.${single}-payment-dialog button[type=submit]`);
    await waitFor(`!document.querySelector('.${single}-payment-dialog') && !!document.querySelector('.${single}-card-paid')`);
    const fullPayment = JSON.parse(latest(`/${resource}/1/payments`, 'POST').body);
    assert.equal(fullPayment.paymentAmount, 102.5);
    assert.equal(fullPayment.fee, 2.5);
    assert.equal(fullPayment.subtotal, 100);
    assert.equal(fullPayment.lateFee, 0);
    assert.equal(fullPayment.lateInterest, 0);
    assert.equal('discount' in fullPayment, false);
    assert.equal('installments' in fullPayment, false);

    await evaluate(`document.querySelectorAll('.${single}-card')[2].querySelector('[aria-label="Baixar conta total ou parcial"]').click()`);
    await waitFor("document.querySelector('#payment-amount')?.value.includes('71,75')");
    await number('#payment-amount', '50,00');
    await click(`.${single}-payment-dialog button[type=submit]`);
    await waitFor(`!document.querySelector('.${single}-payment-dialog')`);
    const partialPayment = JSON.parse(latest(`/${resource}/3/payments`, 'POST').body);
    assert.equal(partialPayment.paymentAmount, 50);
    assert.equal(partialPayment.fee, 1.75);
    assert.equal(partialPayment.subtotal, 100);

    await evaluate(`document.querySelectorAll('.${single}-card')[1].querySelector('.due-date-button').click()`);
    await waitFor(`document.querySelector('.${single}-overdue-dialog')?.textContent.includes('Dias em atraso')`);
    await click(`.${single}-overdue-dialog .p-dialog-header-close`);
    await evaluate(`document.querySelectorAll('.${single}-card')[1].querySelector('[aria-label="Baixar conta total ou parcial"]').click()`);
    await waitFor(`!!document.querySelector('.${single}-payment-choice-dialog')`);
    await click(`.${single}-payment-choice-dialog .btn-primary`);
    await waitFor("document.querySelector('#payment-amount')?.value.includes('220,00')");
    await click(`.${single}-payment-dialog .p-dialog-header-close`);
    await evaluate(`document.querySelectorAll('.${single}-card')[1].querySelector('[aria-label="Baixar conta total ou parcial"]').click()`);
    await click(`.${single}-payment-choice-dialog .btn-outline-primary`);
    await waitFor("!!document.querySelector('#editedLateFee')");
    await number('#editedLateFee', '4,00');
    await number('#editedLateInterest', '6,00');
    await click(`.${single}-payment-charges-dialog button[type=submit]`);
    await waitFor("document.querySelector('#payment-amount')?.value.includes('215,00')");
    await click(`.${single}-payment-dialog button[type=submit]`);
    await waitFor(`!document.querySelector('.${single}-payment-dialog')`);
    const overduePayment = JSON.parse(latest(`/${resource}/2/payments`, 'POST').body);
    assert.equal(overduePayment.paymentAmount, 215);
    assert.equal(overduePayment.fee, 5);
    assert.equal(overduePayment.lateFee, 4);
    assert.equal(overduePayment.lateInterest, 6);
    console.log(`OK ${resource}: formulário, anexo, edição, paginação, filtros, baixa total/parcial, taxa e encargos`);
  }


  for (const [resource, single] of [['payables', 'payable'], ['receivables', 'receivable']]) {
    await visit(`/${resource}`, `.${single}-card`);
    await click(`.${single}-list-screen .pi-cog`);
    await waitFor("!!document.querySelector('.fields-list')");
    for (const label of ['Valor atual', resource === 'payables' ? 'Valor pago' : 'Valor recebido', 'Taxa']) {
      await evaluate(`(() => { const field = [...document.querySelectorAll('.field-option')].find((option) => option.textContent === ${JSON.stringify(label)}); if (!field.querySelector('input').checked) field.querySelector('input').click(); })()`);
    }
    await evaluate("[...document.querySelectorAll('.field-option')].find((field) => field.textContent === 'Taxa').querySelector('input').click()");
    await evaluate("[...document.querySelectorAll('.field-option')].find((field) => field.textContent === 'Taxa').querySelector('input').click()");
    await click('.modal-actions button');
    await waitFor("!document.querySelector('.fields-list')");
    assert.ok(JSON.parse(await evaluate(`localStorage.getItem('${single}-visible-fields')`)).includes('currentAmountWithLateCharges'));
    const paidValues = await evaluate(`(() => { const record = document.querySelectorAll('.${single}-card')[3]; return [record.querySelector('.current-amount dd').textContent, record.querySelector('.paid-amount dd').textContent]; })()`);
    assert.equal(paidValues[0], paidValues[1]);
    await click(`.${single}-list-tools .pi-file-excel`);
    await click('.p-confirm-dialog-accept');
    await waitFor("!document.querySelector('.p-confirm-dialog')");
    const exported = JSON.parse(latest('/listing-exports/excel', 'POST').body);
    assert.equal(exported.rows.length, 13);
    assert.ok(exported.columns.includes('Valor atual'));
    assert.equal(exported.rows[3][exported.columns.indexOf('Valor atual')], exported.rows[3][exported.columns.indexOf(resource === 'payables' ? 'Valor pago' : 'Valor recebido')]);

    const party = resource === 'payables' ? 'supplier' : 'customer';
    await waitFor(`document.querySelectorAll('#${single}-${party}s option').length > 0`);
    const partyName = await evaluate(`document.querySelector('#${single}-${party}s option').value`);
    await fill(`#${single}-${party}`, ` ${partyName.toUpperCase()} `);
    await select(`#${single}-period-type`, 'PAYMENT_DATE');
    await select(`#${single}-status`, 'PARTIALLY_PAID');
    await select(`#${single}-payment-method`, 2);
    await select(`#${single}-payment-frequency`, 1);
    await fill(`#${single}-minimum-amount`, '0');
    await fill(`#${single}-maximum-amount`, '500');
    await select(`#${single}-sort`, 2);
    await click(`.${single}-filters button[type=submit]`);
    await waitFor(`document.querySelector('.${single}-list').getAttribute('aria-busy') === 'false'`);
    const query = new URLSearchParams(latest(`/${resource}`, 'GET').search);
    assert.equal(query.get('minimumAmount'), '0');
    assert.equal(query.get('maximumAmount'), '500');
    assert.equal(query.get('periodType'), 'PAYMENT_DATE');
    assert.equal(query.get('status'), 'PARTIALLY_PAID');
    assert.equal(query.get('paymentMethodId'), '2');
    assert.equal(query.get('paymentFrequencyId'), '1');
    assert.equal(query.get('orderBy'), 'amount');
    assert.equal(query.get('direction'), 'DESC');
    assert.ok(Number(query.get(`${party}Id`)) > 0);
    await click(`.${single}-filters .btn-outline-danger`);
    await waitFor(`document.querySelector('.${single}-list').getAttribute('aria-busy') === 'false'`);

    await click(`.${single}-card button[aria-label="Arquivos da conta"]`);
    await waitFor(`!!document.querySelector('.${single}-files-dialog #fileName')`);
    await fill('#fileName', 'Comprovante assinado');
    await evaluate("(() => { const data = new DataTransfer(); data.items.add(new File(['pdf'], 'documento.pdf', { type: 'application/pdf' })); const input = document.querySelector('#fileInput'); input.files = data.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()");
    await click(`.${single}-files-dialog button[type=submit]`);
    await waitFor(`!!document.querySelector('.${single}-files-dialog .pi-download')`);
    const upload = latest(`/${resource}/1/files`, 'POST');
    assert.match(upload.headers['content-type'], /multipart\/form-data; boundary=/);
    assert.match(upload.body, /Comprovante assinado/);
    assert.match(upload.body, /filename="documento.pdf"/);
    await click(`.${single}-files-dialog .pi-file-pdf`);
    await waitFor(`!!document.querySelector('.${single}-files-dialog .file-view iframe')`);
    await click(`.${single}-files-dialog:has(iframe) .p-dialog-header-close`);
    await evaluate("window.lastDownload = ''; HTMLAnchorElement.prototype.click = function() { window.lastDownload = this.download; }");
    await click(`.${single}-files-dialog .pi-download`);
    await waitFor("window.lastDownload === 'comprovante assinado.pdf'");
    assert.ok(latest(`/${resource}/1/files/2/download`, 'GET'));
    await click(`.${single}-files-dialog .pi-trash`);
    await click('.p-confirm-dialog-accept');
    await waitFor(`!document.querySelector('.${single}-files-dialog .pi-trash')`);
    assert.ok(latest(`/${resource}/1/files/2`, 'DELETE'));
    await click(`.${single}-files-dialog .p-dialog-header-close`);
  }
  console.log('OK valores pagos equivalentes ao total, personalização, Excel, filtros completos e anexos financeiros');

  await visit('/receivables', '.receivable-card');
  await evaluate("window.lastOpened = ''; window.open = (url) => { window.lastOpened = url; return null; }");
  await click('.receivable-card button[aria-label="Recibo"]');
  await waitFor("window.lastOpened.startsWith('blob:')");
  assert.ok(latest('/receivables/1/receipt', 'GET'));
  assert.equal(await evaluate("(async () => (await fetch(window.lastOpened)).headers.get('Content-Type'))()"), 'application/pdf');
  await evaluate("window.lastOpened = ''");
  await click('.receivable-card button[aria-label="Cupom fiscal"]');
  await waitFor("window.lastOpened.startsWith('blob:')");
  assert.ok(latest('/receivables/1/fiscal-coupon', 'GET'));
  console.log('OK recibo e cupom fiscal de contas recebidas');

  await visit('/reports/financial-reports', '.financial-report-list-screen');
  await waitFor("document.querySelectorAll('.month-group').length === 12 && document.querySelector('.comparison-summary').textContent.includes('250,00')");
  await select('#report-type', 'financial');
  assert.equal(await evaluate("!!document.querySelector('#report-customer') && !!document.querySelector('#report-supplier') && !!document.querySelector('#report-employee')"), true);
  await fill('#report-search', '  aluguel  ');
  await fill('#report-start-date', '2026-01-01');
  await fill('#report-end-date', '2026-12-31');
  await select('#report-period-type', 'PAYMENT_DATE');
  await select('#report-status', 'PENDING');
  await select('#report-payment-method', 1);
  await fill('#report-minimum-amount', '0');
  await fill('#report-maximum-amount', '500');
  await evaluate("window.lastDownload = ''; HTMLAnchorElement.prototype.click = function() { window.lastDownload = this.download; }; window.lastOpened = ''; window.open = (url) => { window.lastOpened = url; return null; }");
  await click('.financial-report-form-buttons .btn-success');
  await waitFor("window.lastDownload === 'financeiro.xlsx'");
  const reportQuery = new URLSearchParams(latest('/reports/financial-reports/financial/xlsx', 'GET').search);
  assert.equal(reportQuery.get('search'), 'aluguel');
  assert.equal(reportQuery.get('minimumAmount'), '0');
  assert.equal(reportQuery.get('maximumAmount'), '500');
  assert.equal(reportQuery.get('periodType'), 'PAYMENT_DATE');
  assert.equal(reportQuery.get('status'), 'PENDING');
  assert.equal(reportQuery.get('paymentMethodId'), '1');
  assert.equal(reportQuery.get('startDate'), '2026-01-01');
  assert.equal(reportQuery.get('endDate'), '2026-12-31');
  await click('.financial-report-form-buttons .btn-primary');
  await waitFor("window.lastOpened.startsWith('blob:')");
  assert.ok(latest('/reports/financial-reports/financial/pdf', 'GET'));
  assert.equal(await evaluate("(async () => (await fetch(window.lastOpened)).headers.get('Content-Type'))()"), 'application/pdf');
  for (const [type, visible, hidden] of [['summary-customer', '#report-customer', '#report-supplier'], ['summary-supplier', '#report-supplier', '#report-employee'], ['summary-employee', '#report-employee', '#report-customer']]) {
    await select('#report-type', type);
    assert.equal(await evaluate(`!!document.querySelector('${visible}')`), true);
    assert.equal(await evaluate(`!!document.querySelector('${hidden}')`), false);
    assert.equal(await evaluate("!!document.querySelector('#report-status')"), false);
  }
  await select('#report-type', 'annual-balance');
  assert.equal(await evaluate("!!document.querySelector('#report-year') && !document.querySelector('#report-start-date') && !document.querySelector('#report-search')"), true);
  await fill('#report-year', '1800');
  await click('.financial-report-form-buttons .btn-success');
  await waitFor("document.body.textContent.includes('Informe um ano válido.')");
  assert.equal(latest('/reports/financial-reports/annual-balance/xlsx', 'GET'), undefined);
  await fill('#report-year', '2027');
  await evaluate("window.lastDownload = ''");
  await click('.financial-report-form-buttons .btn-success');
  await waitFor("window.lastDownload === 'balanco-anual.xlsx'");
  assert.equal(new URLSearchParams(latest('/reports/financial-reports/annual-balance/xlsx', 'GET').search).get('year'), '2027');
  await click('.financial-report-form-buttons .btn-outline-primary');
  await waitFor("document.querySelector('.comparison-header').textContent.includes('2027') && !document.querySelector('.loading-label')");
  await click('.financial-report-form-buttons .btn-outline-danger');
  await waitFor("document.querySelector('#report-type').value === 'receivables' && !document.querySelector('.loading-label')");
  await fill('#report-start-date', '2026-12-31');
  await fill('#report-end-date', '2026-01-01');
  const beforeInvalidReport = requests.filter((request) => request.path === '/reports/financial-reports/receivables/pdf').length;
  await click('.financial-report-form-buttons .btn-primary');
  await waitFor("document.body.textContent.includes('Data inicial não pode ser maior')");
  assert.equal(requests.filter((request) => request.path === '/reports/financial-reports/receivables/pdf').length, beforeInvalidReport);
  await fill('#report-start-date', '');
  await fill('#report-end-date', '');
  await fill('#report-minimum-amount', '500');
  await fill('#report-maximum-amount', '100');
  await click('.financial-report-form-buttons .btn-primary');
  await waitFor("document.body.textContent.includes('Valor inicial não pode ser maior')");
  await click('.financial-report-form-buttons .btn-outline-danger');
  await waitFor("!document.querySelector('.loading-label')");
  failPath = '/reports/financial-reports/comparison';
  await click('.financial-report-form-buttons .btn-outline-primary');
  await waitFor("document.body.textContent.includes('Falha simulada') && !document.querySelector('.loading-label')");
  failPath = '';
  await screenshot('financial-reports-desktop');
  console.log('OK relatórios: gráfico, filtros, validações, PDF, Excel, sintéticos, balanço anual e erro HTTP');

  for (const [resource, single] of [['payment-methods', 'payment-method'], ['payment-frequencies', 'payment-frequency']]) {
    await visit(`/${resource}`, `.${single}-list-screen .p-datatable-tbody .p-checkbox-box`);
    await evaluate(`document.querySelectorAll('.${single}-list-screen .p-datatable-tbody .p-checkbox-box')[3].click()`);
    await click(`.${single}-list-screen .p-paginator-next`);
    await waitFor(`document.querySelector('.${single}-list-screen .p-datatable-tbody').textContent.includes('${resource === 'payment-methods' ? 'Método 6' : 'Frequência 6'}')`);
    await click(`.${single}-list-screen .p-datatable-tbody .p-checkbox-box`);
    await click(`.${single}-actions-group .btn-danger`);
    await click('.p-confirm-dialog-accept');
    await waitFor("!document.querySelector('.p-confirm-dialog')");
    assert.deepEqual(JSON.parse(latest(`/${resource}/all`, 'DELETE').body), [4, 6]);
  }
  console.log('OK exclusão em lote de métodos e frequências com seleção entre páginas');

  await evaluate("localStorage.removeItem('payable-visible-fields'); localStorage.setItem('payable-card-visible-fields', JSON.stringify(['amount', 'currentAmount', 'paidAmount', 'balance', 'createdBy', 'invalid']));");
  await visit('/payables', '.payable-card');
  assert.equal(await evaluate("!!document.querySelector('.payable-card .current-amount') && !!document.querySelector('.payable-card .paid-amount')"), true);
  await evaluate("localStorage.removeItem('payable-card-visible-fields'); localStorage.removeItem('payable-visible-fields');");
  await visit('/payables/create', '#description');
  await fill('#description', 'Conta com falha no anexo');
  await number('#amount', '25,00');
  await fill('#dueDate', '2099-01-01');
  await evaluate("(() => { const data = new DataTransfer(); data.items.add(new File(['pdf'], 'conta.pdf', { type: 'application/pdf' })); const input = document.querySelector('#file'); input.files = data.files; input.dispatchEvent(new Event('change', { bubbles: true })); })()");
  failPath = '/payables/20/files';
  await click('button[type=submit]');
  await waitFor("location.pathname.split('/').filter(Boolean).join('/') === 'payables' && document.body.textContent.includes('Conta cadastrada, mas falhou ao enviar o arquivo.')");
  failPath = '';
  console.log('OK preferências de campos antigas e falha parcial no envio de anexo');

  for (const width of [390, 576, 767, 768, 1024]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: false });
    for (const [resource, single] of [['payables', 'payable'], ['receivables', 'receivable'], ['payment-methods', 'payment-method'], ['payment-frequencies', 'payment-frequency']]) {
      await visit(`/${resource}`, `.${single}-list-screen`);
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `${resource} list ${width}`);
      if (width === 390) await screenshot(`${resource}-list-mobile`);
      await visit(`/${resource}/create`, 'button[type=submit]');
      assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `${resource} form ${width}`);
      if (width === 390) await screenshot(`${resource}-form-mobile`);
    }
    await visit('/financial-settings', '#defaultLateFeePercent');
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `financial-settings ${width}`);
    await visit('/reports/financial-reports', '.financial-report-list-screen');
    await waitFor("document.querySelectorAll('.month-group').length === 12");
    assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth'), true, `financial-reports ${width}`);
    if (width === 390) await screenshot('financial-reports-mobile');
    await visit('/receivables', '.receivable-card');
    await click('.receivable-card button[aria-label="Arquivos da conta"]');
    await waitFor("!!document.querySelector('.receivable-files-dialog')");
    assert.equal(await evaluate("document.querySelector('.receivable-files-dialog').scrollWidth <= document.querySelector('.receivable-files-dialog').clientWidth + 1"), true, `receivable files ${width}`);
  }
  await cdp('Emulation.clearDeviceMetricsOverride');
  console.log('OK telas financeiras nos breakpoints 390/576/767/768/1024 sem transbordamento');


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
} catch (error) {
  console.error('Falha no teste de navegação:', error);
  console.error(await evaluate('({ path: location.pathname, text: document.body.innerText.slice(0, 2000) })'));
  throw error;
} finally {
  const browserClosed = new Promise((done) => chrome.once('exit', done));
  chrome.kill();
  await server.close();
  await browserClosed;
  rmSync(browserDirectory, { recursive: true, force: true });
}
