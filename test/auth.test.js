import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../src/server.js';

let base;
const email = `user${process.pid}@test.de`;
const password = 'geheim123';
let token;

before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}`;
});
after(async () => {
  // clean up the account created during the run
  if (token) await fetch(base + '/api/account', { method: 'DELETE', headers: { authorization: 'Bearer ' + token } });
  server.close();
});

const post = (path, body, headers = {}) =>
  fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });

test('register creates an account and returns a token', async () => {
  const res = await post('/api/auth/register', { email, password, name: 'Tester' });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.ok(body.token);
  assert.equal(body.user.email, email);
  assert.equal(body.user.name, 'Tester');
  token = body.token;
});

test('register rejects duplicates and weak passwords', async () => {
  assert.equal((await post('/api/auth/register', { email, password })).status, 400);
  assert.equal((await post('/api/auth/register', { email: `x${process.pid}@t.de`, password: '123' })).status, 400);
});

test('login succeeds with correct credentials, fails otherwise', async () => {
  assert.equal((await post('/api/auth/login', { email, password })).status, 200);
  assert.equal((await post('/api/auth/login', { email, password: 'wrong' })).status, 401);
});

test('GET /api/auth/me requires a valid token', async () => {
  assert.equal((await fetch(base + '/api/auth/me')).status, 401);
  const me = await fetch(base + '/api/auth/me', { headers: { authorization: 'Bearer ' + token } }).then((r) => r.json());
  assert.equal(me.email, email);
});

test('wishlist is scoped to the authenticated account', async () => {
  const auth = { authorization: 'Bearer ' + token };
  await post('/api/wishlist', { productId: 7 }, auth);
  const mine = await fetch(base + '/api/wishlist', { headers: auth }).then((r) => r.json());
  assert.ok(mine.items.some((p) => p.id === 7));
  // a guest must not see the account's wishlist
  const guest = await fetch(base + '/api/wishlist', { headers: { 'x-user': 'someone-else' } }).then((r) => r.json());
  assert.ok(!guest.items.some((p) => p.id === 7));
});

test('PATCH /api/auth/me updates the display name', async () => {
  const auth = { authorization: 'Bearer ' + token };
  const updated = await fetch(base + '/api/auth/me', {
    method: 'PATCH', headers: { 'content-type': 'application/json', ...auth }, body: JSON.stringify({ name: 'Neuer Name' }),
  }).then((r) => r.json());
  assert.equal(updated.name, 'Neuer Name');
});

test('logout invalidates the token', async () => {
  // use a throwaway session so the cleanup token stays valid
  const second = await post('/api/auth/login', { email, password }).then((r) => r.json());
  await post('/api/auth/logout', {}, { authorization: 'Bearer ' + second.token });
  const after = await fetch(base + '/api/auth/me', { headers: { authorization: 'Bearer ' + second.token } });
  assert.equal(after.status, 401);
});
