// Data access layer: loads the seed catalog, enriches each product with
// computed price fields, and offers query/search/facet helpers.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { priceStats, ratePrice, discountVsRrp, bestOffer } from './price.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataFile = join(__dirname, '..', 'data', 'products.json');

let catalog = null;

export function load() {
  if (catalog) return catalog;
  const raw = JSON.parse(readFileSync(dataFile, 'utf8'));
  raw.products = raw.products.map(enrich);
  catalog = raw;
  return catalog;
}

function enrich(p) {
  const stats = priceStats(p.priceHistory);
  const rating = ratePrice(p.priceHistory);
  const best = bestOffer(p.offers);
  return {
    ...p,
    lowestPrice: best.total,
    bestOffer: best,
    priceStats: stats,
    priceRating: rating,
    discountPercent: discountVsRrp(p.rrp, best.total),
    inStock: p.offers.some((o) => o.inStock),
    merchantCount: p.offers.length,
  };
}

// --- Normalisation for search --------------------------------------------
function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
}

// Simple Levenshtein for "did you mean?" suggestions.
export function levenshtein(a, b) {
  a = norm(a); b = norm(b);
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function matchesQuery(p, q) {
  if (!q) return true;
  const haystack = norm([p.name, p.brand, p.category, p.type, p.color, p.ean].join(' '));
  return norm(q).split(/\s+/).every((term) => haystack.includes(term));
}

// --- Public query API -----------------------------------------------------
export function query(params = {}) {
  const { products } = load();
  let items = products.filter((p) => matchesQuery(p, params.q));

  if (params.category) items = items.filter((p) => p.category === params.category);
  if (params.type) items = items.filter((p) => p.type === params.type);
  if (params.brand) items = items.filter((p) => p.brand === params.brand);
  if (params.color) items = items.filter((p) => p.color === params.color);
  if (params.material) items = items.filter((p) => p.specs.Material === params.material);
  if (params.wheelSize) items = items.filter((p) => p.specs.Laufradgröße === params.wheelSize);
  if (params.frameSize)
    items = items.filter((p) => p.specs.Rahmengröße === params.frameSize || p.specs.Größe === params.frameSize);
  if (params.brakeType) items = items.filter((p) => p.specs.Bremse === params.brakeType);
  if (params.minPrice != null) items = items.filter((p) => p.lowestPrice >= Number(params.minPrice));
  if (params.maxPrice != null) items = items.filter((p) => p.lowestPrice <= Number(params.maxPrice));
  if (params.inStock === true || params.inStock === 'true') items = items.filter((p) => p.inStock);
  if (params.onSale === true || params.onSale === 'true') items = items.filter((p) => p.discountPercent > 0);

  items = sort(items, params.sort);

  const total = items.length;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(60, Math.max(1, Number(params.pageSize) || 24));
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize).map(toSummary);

  return { total, page, pageSize, pageCount: Math.ceil(total / pageSize), items: paged };
}

function sort(items, key) {
  const by = {
    price_asc: (a, b) => a.lowestPrice - b.lowestPrice,
    price_desc: (a, b) => b.lowestPrice - a.lowestPrice,
    discount: (a, b) => b.discountPercent - a.discountPercent,
    rating: (a, b) => b.rating - a.rating,
    popularity: (a, b) => b.reviewCount - a.reviewCount,
    newest: (a, b) => (b.year || 0) - (a.year || 0) || b.id - a.id,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return [...items].sort(by[key] || by.popularity);
}

function toSummary(p) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    type: p.type,
    color: p.color,
    image: p.image,
    rrp: p.rrp,
    lowestPrice: p.lowestPrice,
    discountPercent: p.discountPercent,
    priceRating: p.priceRating.rating,
    isAllTimeLow: p.priceRating.isAllTimeLow,
    rating: p.rating,
    reviewCount: p.reviewCount,
    inStock: p.inStock,
    merchantCount: p.merchantCount,
    bestMerchant: p.bestOffer.merchant,
  };
}

export function getById(id) {
  const { products } = load();
  const p = products.find((x) => x.id === Number(id));
  if (!p) return null;
  return { ...p, offers: [...p.offers].sort((a, b) => a.total - b.total) };
}

export function similar(id, limit = 6) {
  const { products } = load();
  const p = products.find((x) => x.id === Number(id));
  if (!p) return [];
  return products
    .filter((x) => x.id !== p.id && x.category === p.category && x.type === p.type)
    .sort((a, b) => Math.abs(a.lowestPrice - p.lowestPrice) - Math.abs(b.lowestPrice - p.lowestPrice))
    .slice(0, limit)
    .map(toSummary);
}

// Best current deals: largest discount vs. rrp, in stock.
export function deals(limit = 24) {
  const { products } = load();
  return products
    .filter((p) => p.discountPercent > 0 && p.inStock)
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, limit)
    .map(toSummary);
}

// Autocomplete suggestions from product names + brands.
export function suggest(q, limit = 8) {
  if (!q || q.length < 2) return [];
  const { products } = load();
  const nq = norm(q);
  const seen = new Set();
  const out = [];
  for (const p of products) {
    for (const candidate of [p.name, p.brand, `${p.brand} ${p.type}`]) {
      const key = candidate.toLowerCase();
      if (!seen.has(key) && norm(candidate).includes(nq)) {
        seen.add(key);
        out.push(candidate);
        if (out.length >= limit) return out;
      }
    }
  }
  return out;
}

// "Did you mean?" when a query yields no/few matches.
export function didYouMean(q) {
  if (!q) return null;
  const { products } = load();
  const vocab = new Set();
  for (const p of products) {
    vocab.add(p.brand);
    p.name.split(/\s+/).forEach((w) => w.length > 2 && vocab.add(w));
  }
  let best = null, bestDist = Infinity;
  for (const term of vocab) {
    const d = levenshtein(q, term);
    if (d < bestDist && d <= 2 && d > 0) { bestDist = d; best = term; }
  }
  return best;
}

// Facets for building filter UIs, computed over the whole catalog.
export function facets() {
  const { products } = load();
  const count = (fn) => {
    const m = {};
    for (const p of products) {
      const v = fn(p);
      if (v == null) continue;
      m[v] = (m[v] || 0) + 1;
    }
    return Object.entries(m).map(([value, n]) => ({ value, count: n })).sort((a, b) => b.count - a.count);
  };
  return {
    categories: count((p) => p.category),
    types: count((p) => p.type),
    brands: count((p) => p.brand),
    colors: count((p) => p.color),
    materials: count((p) => p.specs.Material),
    wheelSizes: count((p) => p.specs.Laufradgröße),
    frameSizes: count((p) => p.specs.Rahmengröße || p.specs.Größe),
    priceRange: priceRange(products),
  };
}

function priceRange(products) {
  const prices = products.map((p) => p.lowestPrice);
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
}

export function meta() {
  const c = load();
  return { generatedAt: c.generatedAt, currency: c.currency, count: c.count, merchants: c.merchants, vouchers: c.vouchers };
}
