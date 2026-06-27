// Generates deterministic sample data for the price finder.
// Run with: npm run seed  (writes data/products.json)
//
// The data is intentionally synthetic: real merchant integrations require
// external APIs/feeds that are out of scope for this prototype. The shape,
// however, mirrors what a real ingestion pipeline would produce.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// --- Tiny seeded PRNG (mulberry32) for reproducible output -----------------
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260627);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const between = (min, max) => min + rand() * (max - min);
const round2 = (n) => Math.round(n * 100) / 100;
const chance = (p) => rand() < p;

// --- Reference data --------------------------------------------------------
const MERCHANTS = [
  { name: 'Radwelt24', rating: 4.6, country: 'DE', freeShipFrom: 99 },
  { name: 'BikeDiscount', rating: 4.4, country: 'DE', freeShipFrom: 75 },
  { name: 'VeloPro', rating: 4.7, country: 'DE', freeShipFrom: 120 },
  { name: 'CycleStore EU', rating: 4.2, country: 'AT', freeShipFrom: 150 },
  { name: 'PedalPalast', rating: 4.5, country: 'DE', freeShipFrom: 50 },
  { name: 'BergabBikes', rating: 4.3, country: 'CH', freeShipFrom: 200 },
];

const VOUCHERS = [
  { code: 'FRUEHLING10', text: '10% Rabatt ab 100 €', minOrder: 100, percent: 10 },
  { code: 'VERSANDFREI', text: 'Versandkostenfrei', minOrder: 0, percent: 0 },
  { code: 'NEU15', text: '15 € für Neukunden ab 150 €', minOrder: 150, amount: 15 },
];

const COLORS = ['Schwarz', 'Weiß', 'Rot', 'Blau', 'Grün', 'Grau', 'Anthrazit', 'Türkis'];

// category -> generator config
const CATALOG = {
  Komplettrad: {
    types: ['City', 'Trekking', 'Rennrad', 'Mountainbike', 'E-Bike', 'Kinderrad', 'Gravel'],
    brands: ['Cube', 'Canyon', 'Trek', 'Giant', 'Specialized', 'Scott', 'Bulls', 'Kalkhoff'],
    basePrice: [299, 3499],
    wheelSizes: ['26"', '27,5"', '28"', '29"'],
    frameSizes: ['S', 'M', 'L', 'XL'],
    materials: ['Aluminium', 'Carbon', 'Stahl'],
    gears: [1, 7, 8, 9, 10, 11, 12],
    brakes: ['Scheibenbremse (hydraulisch)', 'Scheibenbremse (mechanisch)', 'Felgenbremse'],
  },
  Komponente: {
    types: ['Schaltung', 'Bremse', 'Laufradsatz', 'Reifen', 'Sattel', 'Lenker', 'Kette', 'Pedale'],
    brands: ['Shimano', 'SRAM', 'Continental', 'Schwalbe', 'DT Swiss', 'Selle Italia', 'Race Face'],
    basePrice: [9, 899],
    materials: ['Aluminium', 'Carbon', 'Stahl', 'Gummi'],
  },
  Zubehör: {
    types: ['Helm', 'Schloss', 'Beleuchtung', 'Tasche', 'Gepäckträger', 'Pumpe', 'Flaschenhalter', 'Computer'],
    brands: ['ABUS', 'Garmin', 'Sigma', 'Ortlieb', 'Topeak', 'Lezyne', 'Uvex'],
    basePrice: [5, 399],
    materials: ['Aluminium', 'Kunststoff', 'Carbon'],
  },
  Bekleidung: {
    types: ['Trikot', 'Radhose', 'Handschuhe', 'Jacke', 'Schuhe', 'Socken'],
    brands: ['Gore Wear', 'Castelli', 'Vaude', 'Endura', 'Shimano', 'Uvex'],
    basePrice: [12, 299],
    materials: ['Polyester', 'Merino', 'Goretex'],
    frameSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
};

const COUNT_PER_CATEGORY = { Komplettrad: 45, Komponente: 30, Zubehör: 30, Bekleidung: 20 };

// --- Helpers ---------------------------------------------------------------
function ean() {
  let s = '';
  for (let i = 0; i < 13; i++) s += Math.floor(rand() * 10);
  return s;
}

function buildPriceHistory(currentLowest) {
  // 180 days of daily lowest prices ending at currentLowest, with a mild
  // downward drift and occasional dips so the "good price" logic has signal.
  const days = 180;
  const history = [];
  let price = currentLowest * between(1.05, 1.35);
  for (let d = days; d >= 0; d--) {
    const drift = between(-0.012, 0.006); // slight downward tendency
    price = price * (1 + drift);
    if (chance(0.05)) price *= between(0.9, 0.97); // promo dip
    const date = new Date(Date.UTC(2026, 5, 27) - d * 86400000); // count back from 2026-06-27
    history.push({ date: date.toISOString().slice(0, 10), price: round2(price) });
  }
  // pin the last point to the actual current lowest
  history[history.length - 1].price = round2(currentLowest);
  return history;
}

function buildOffers(base, type) {
  const n = 2 + Math.floor(rand() * 4); // 2..5 merchants
  const chosen = [...MERCHANTS].sort(() => rand() - 0.5).slice(0, n);
  return chosen.map((m) => {
    const price = round2(base * between(0.92, 1.18));
    const inStock = chance(0.82);
    const shipping = price >= m.freeShipFrom ? 0 : round2(between(3.9, 12.9));
    const offer = {
      merchant: m.name,
      merchantRating: m.rating,
      country: m.country,
      price,
      shipping,
      total: round2(price + shipping),
      inStock,
      deliveryDays: inStock ? 1 + Math.floor(rand() * 5) : 7 + Math.floor(rand() * 14),
      url: `https://example.com/${encodeURIComponent(m.name.toLowerCase())}/${encodeURIComponent(type.toLowerCase())}`,
      affiliate: true,
    };
    if (chance(0.25)) offer.voucher = pick(VOUCHERS);
    return offer;
  });
}

function specsFor(category, cfg, type) {
  const specs = { Typ: type };
  if (cfg.materials) specs.Material = pick(cfg.materials);
  if (category === 'Komplettrad') {
    specs.Laufradgröße = pick(cfg.wheelSizes);
    specs.Rahmengröße = pick(cfg.frameSizes);
    specs.Gänge = pick(cfg.gears);
    specs.Bremse = pick(cfg.brakes);
    if (type === 'E-Bike') {
      specs.Motor = pick(['Bosch Performance', 'Shimano Steps', 'Yamaha PW']);
      specs.Akku = `${pick([400, 500, 625, 750])} Wh`;
    }
  }
  if (category === 'Bekleidung' && cfg.frameSizes) specs.Größe = pick(cfg.frameSizes);
  return specs;
}

// --- Generate --------------------------------------------------------------
const products = [];
let id = 1;
for (const [category, cfg] of Object.entries(CATALOG)) {
  const count = COUNT_PER_CATEGORY[category];
  for (let i = 0; i < count; i++) {
    const type = pick(cfg.types);
    const brand = pick(cfg.brands);
    const base = round2(between(cfg.basePrice[0], cfg.basePrice[1]));
    const color = pick(COLORS);
    const modelNo = 100 + Math.floor(rand() * 900);
    const year = pick([2024, 2025, 2026]);
    const name = `${brand} ${type} ${modelNo}${category === 'Komplettrad' ? ` ${year}` : ''}`;
    const offers = buildOffers(base, type);
    const lowest = Math.min(...offers.map((o) => o.total));
    const history = buildPriceHistory(lowest);
    const prices = history.map((h) => h.price);
    const rrp = round2(Math.max(...prices) * between(1.0, 1.1));
    const specs = specsFor(category, cfg, type);

    products.push({
      id: id++,
      name,
      brand,
      category,
      type,
      color,
      ean: ean(),
      rrp, // unverbindliche Preisempfehlung
      lowestPrice: round2(lowest),
      rating: round2(between(3.4, 5.0)),
      reviewCount: Math.floor(between(0, 850)),
      year: category === 'Komplettrad' ? year : undefined,
      specs,
      image: `https://placehold.co/600x400?text=${encodeURIComponent(brand + ' ' + type)}`,
      offers,
      priceHistory: history,
    });
  }
}

const out = {
  generatedAt: '2026-06-27',
  currency: 'EUR',
  count: products.length,
  merchants: MERCHANTS,
  vouchers: VOUCHERS,
  products,
};

mkdirSync(join(root, 'data'), { recursive: true });
writeFileSync(join(root, 'data', 'products.json'), JSON.stringify(out, null, 2));
console.log(`Wrote ${products.length} products to data/products.json`);
