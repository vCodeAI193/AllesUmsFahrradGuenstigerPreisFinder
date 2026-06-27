import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../src/server.js';

let base;
const user = 'test-' + process.pid; // isolate this run's store entries

before(async () => {
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}`;
});
after(() => server.close());

const get = (p) => fetch(base + p).then((r) => r.json());

test('GET /api/meta returns catalog metadata', async () => {
  const meta = await get('/api/meta');
  assert.equal(meta.currency, 'EUR');
  assert.ok(meta.count > 0);
});

test('GET /api/products supports search + pagination', async () => {
  const r = await get('/api/products?q=trek&pageSize=5');
  assert.ok(Array.isArray(r.items));
  assert.ok(r.pageSize === 5);
});

test('GET /api/products/:id returns offers; 404 for unknown', async () => {
  const ok = await fetch(base + '/api/products/1');
  assert.equal(ok.status, 200);
  const missing = await fetch(base + '/api/products/999999');
  assert.equal(missing.status, 404);
});

test('static frontend is served at /', async () => {
  const res = await fetch(base + '/');
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Günstiger-Preis-Finder/);
});

test('alert lifecycle: create, list, delete', async () => {
  const created = await fetch(base + '/api/alerts', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-user': user },
    body: JSON.stringify({ productId: 1, targetPrice: 1 }),
  }).then((r) => r.json());
  assert.ok(created.id);

  const list = await get(`/api/alerts?user=${user}`);
  assert.ok(list.items.some((a) => a.id === created.id));

  const del = await fetch(`${base}/api/alerts/${created.id}?user=${user}`, { method: 'DELETE' }).then((r) => r.json());
  assert.equal(del.deleted, true);
});

test('GET /api/export returns user data as a download', async () => {
  const res = await fetch(`${base}/api/export?user=${user}`);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-disposition') || '', /attachment/);
  const body = await res.json();
  assert.equal(body.user, user);
  assert.ok('alerts' in body && 'wishlist' in body);
});

test('alert types: drop and restock are accepted without targetPrice', async () => {
  for (const type of ['drop', 'restock']) {
    const r = await fetch(base + '/api/alerts', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user': user },
      body: JSON.stringify({ productId: 1, type }),
    }).then((r) => r.json());
    assert.equal(r.type, type);
    assert.ok('triggered' in r);
  }
  // clean up
  await fetch(`${base}/api/account?user=${user}`, { method: 'DELETE' });
});

test('alert with unknown type is rejected', async () => {
  const res = await fetch(base + '/api/alerts', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-user': user },
    body: JSON.stringify({ productId: 1, type: 'bogus' }),
  });
  assert.equal(res.status, 400);
});

test('POST /api/newsletter validates the email address', async () => {
  const bad = await fetch(base + '/api/newsletter', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' }),
  });
  assert.equal(bad.status, 400);
  const ok = await fetch(base + '/api/newsletter', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'rad@fahrer.de' }),
  }).then((r) => r.json());
  assert.equal(ok.subscribed, true);
});

test('DELETE /api/account erases the user data', async () => {
  await fetch(base + '/api/wishlist', {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-user': user },
    body: JSON.stringify({ productId: 3 }),
  });
  const del = await fetch(`${base}/api/account?user=${user}`, { method: 'DELETE' }).then((r) => r.json());
  assert.equal(del.deleted, true);
  const wl = await get(`/api/wishlist?user=${user}`);
  assert.equal(wl.items.length, 0);
});

test('wishlist add then remove', async () => {
  const add = await fetch(base + '/api/wishlist', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-user': user },
    body: JSON.stringify({ productId: 2 }),
  }).then((r) => r.json());
  assert.ok(add.items.some((p) => p.id === 2));

  const rem = await fetch(`${base}/api/wishlist/2?user=${user}`, { method: 'DELETE' }).then((r) => r.json());
  assert.ok(!rem.items.some((p) => p.id === 2));
});
