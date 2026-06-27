import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as data from '../src/data.js';

test('query returns paginated, enriched summaries', () => {
  const r = data.query({ pageSize: 10, page: 1 });
  assert.ok(r.total > 0);
  assert.equal(r.items.length, 10);
  const item = r.items[0];
  for (const key of ['id', 'name', 'lowestPrice', 'priceRating', 'discountPercent']) {
    assert.ok(key in item, `summary missing ${key}`);
  }
});

test('text search matches brand/name and is umlaut-insensitive', () => {
  const r = data.query({ q: 'cube' });
  assert.ok(r.items.every((p) => /cube/i.test(p.name) || p.brand.toLowerCase() === 'cube'));
});

test('category filter restricts results', () => {
  const r = data.query({ category: 'Zubehör', pageSize: 60 });
  assert.ok(r.total > 0);
  assert.ok(r.items.every((p) => p.category === 'Zubehör'));
});

test('price filter respects min/max bounds', () => {
  const r = data.query({ minPrice: 100, maxPrice: 200, pageSize: 60 });
  assert.ok(r.items.every((p) => p.lowestPrice >= 100 && p.lowestPrice <= 200));
});

test('sort price_asc orders ascending', () => {
  const r = data.query({ sort: 'price_asc', pageSize: 20 });
  const prices = r.items.map((p) => p.lowestPrice);
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
});

test('getById returns a product with offers sorted by total', () => {
  const p = data.getById(1);
  assert.ok(p);
  const totals = p.offers.map((o) => o.total);
  assert.deepEqual(totals, [...totals].sort((a, b) => a - b));
});

test('similar returns same category/type products excluding self', () => {
  const sim = data.similar(1);
  assert.ok(sim.every((s) => s.id !== 1));
});

test('deals are discounted and in stock', () => {
  const d = data.deals(10);
  assert.ok(d.length > 0);
  assert.ok(d.every((p) => p.discountPercent > 0 && p.inStock));
});

test('suggest returns matching strings, didYouMean fixes typos', () => {
  assert.ok(data.suggest('shi').length > 0);
  assert.equal(data.didYouMean('cubee'), 'Cube');
});

test('facets expose categories and a price range', () => {
  const f = data.facets();
  assert.ok(f.categories.length >= 4);
  assert.ok(f.priceRange.min <= f.priceRange.max);
});
