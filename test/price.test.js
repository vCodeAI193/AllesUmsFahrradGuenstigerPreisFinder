import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceStats, ratePrice, discountVsRrp, bestOffer } from '../src/price.js';

const history = [
  { date: '2026-01-01', price: 100 },
  { date: '2026-01-02', price: 120 },
  { date: '2026-01-03', price: 80 },
];

test('priceStats computes min/max/avg/current', () => {
  const s = priceStats(history);
  assert.equal(s.min, 80);
  assert.equal(s.max, 120);
  assert.equal(s.avg, 100);
  assert.equal(s.current, 80);
});

test('ratePrice flags an all-time low as bestprice', () => {
  const r = ratePrice(history);
  assert.equal(r.rating, 'bestprice');
  assert.equal(r.isAllTimeLow, true);
});

test('ratePrice rates clearly above average as "eher teuer"', () => {
  const r = ratePrice([
    { date: 'a', price: 80 },
    { date: 'b', price: 80 },
    { date: 'c', price: 120 },
  ]);
  assert.equal(r.rating, 'eher teuer');
});

test('discountVsRrp returns rounded percentage and 0 when no discount', () => {
  assert.equal(discountVsRrp(100, 75), 25);
  assert.equal(discountVsRrp(100, 100), 0);
  assert.equal(discountVsRrp(0, 50), 0);
});

test('bestOffer prefers cheapest in-stock total', () => {
  const offers = [
    { merchant: 'A', total: 90, inStock: false },
    { merchant: 'B', total: 100, inStock: true },
    { merchant: 'C', total: 110, inStock: true },
  ];
  assert.equal(bestOffer(offers).merchant, 'B');
});

test('bestOffer falls back to cheapest overall when nothing in stock', () => {
  const offers = [
    { merchant: 'A', total: 90, inStock: false },
    { merchant: 'B', total: 80, inStock: false },
  ];
  assert.equal(bestOffer(offers).merchant, 'B');
});
