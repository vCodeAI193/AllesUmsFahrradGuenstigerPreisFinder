// Lightweight JSON-file persistence for user-generated data:
// wishlists and price alerts. Keyed by a simple user token (no real auth in
// this prototype). The file lives at data/store.json and is gitignored.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getById } from './data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storeFile = join(__dirname, '..', 'data', 'store.json');

let seq = 1;

function read() {
  if (!existsSync(storeFile)) return { alerts: [], wishlist: {} };
  try {
    return JSON.parse(readFileSync(storeFile, 'utf8'));
  } catch {
    return { alerts: [], wishlist: {} };
  }
}

function write(state) {
  writeFileSync(storeFile, JSON.stringify(state, null, 2));
}

function nextId() {
  const state = read();
  const max = state.alerts.reduce((m, a) => Math.max(m, a.id || 0), 0);
  return Math.max(max + 1, seq++);
}

// --- Price alerts ---------------------------------------------------------
// type: 'target'  -> notify when lowest price <= targetPrice
//       'drop'    -> notify on any drop below the price at creation time
//       'restock' -> notify when the product is back in stock
const ALERT_TYPES = ['target', 'drop', 'restock'];

export function addAlert({ user = 'demo', productId, targetPrice, type = 'target' }) {
  const product = getById(productId);
  if (!product) throw new Error('Produkt nicht gefunden');
  if (!ALERT_TYPES.includes(type)) throw new Error('Unbekannter Alarm-Typ');
  if (type === 'target' && !(Number(targetPrice) > 0)) throw new Error('targetPrice erforderlich');
  const state = read();
  const alert = {
    id: nextId(),
    user,
    productId: Number(productId),
    productName: product.name,
    type,
    targetPrice: type === 'target' ? Number(targetPrice) : null,
    baselinePrice: product.lowestPrice, // reference for 'drop'
    baselineInStock: product.inStock, // reference for 'restock'
    createdAt: '2026-06-27',
  };
  state.alerts.push(alert);
  write(state);
  return decorate(alert);
}

export function listAlerts(user = 'demo') {
  return read().alerts.filter((a) => a.user === user).map(decorate);
}

export function deleteAlert(user, id) {
  const state = read();
  const before = state.alerts.length;
  state.alerts = state.alerts.filter((a) => !(a.user === user && a.id === Number(id)));
  write(state);
  return state.alerts.length < before;
}

// Re-evaluates an alert against the current product state.
function decorate(alert) {
  const product = getById(alert.productId);
  const current = product ? product.lowestPrice : null;
  const inStock = product ? product.inStock : false;
  let triggered = false;
  let label = '';
  if (current != null) {
    if (alert.type === 'restock') {
      triggered = !alert.baselineInStock && inStock;
      label = triggered ? 'Wieder verfügbar' : 'wartet auf Verfügbarkeit';
    } else if (alert.type === 'drop') {
      triggered = current < alert.baselinePrice;
      label = triggered ? `gefallen um ${Math.round((alert.baselinePrice - current) * 100) / 100} €` : 'noch kein Rückgang';
    } else {
      triggered = current <= alert.targetPrice;
      label = triggered ? 'Wunschpreis erreicht' : `${Math.round((current - alert.targetPrice) * 100) / 100} € über Ziel`;
    }
  }
  return { ...alert, currentPrice: current, inStock, triggered, statusLabel: label };
}

// Returns the alerts that are currently satisfied (would fire a notification).
export function dueAlerts(user = 'demo') {
  return listAlerts(user).filter((a) => a.triggered);
}

// --- GDPR data export -----------------------------------------------------
// Returns everything stored for a user, for transparency / portability.
export function exportUserData(user = 'demo') {
  return {
    user,
    exportedAt: '2026-06-27',
    alerts: listAlerts(user),
    wishlist: listWishlist(user),
  };
}

// Deletes all stored data for a user (GDPR "right to erasure").
export function deleteUserData(user = 'demo') {
  const state = read();
  state.alerts = state.alerts.filter((a) => a.user !== user);
  delete state.wishlist[user];
  write(state);
  return { deleted: true };
}

// --- Newsletter -----------------------------------------------------------
export function subscribeNewsletter(email) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(email))) throw new Error('Ungültige E-Mail-Adresse');
  const state = read();
  state.newsletter = state.newsletter || [];
  if (!state.newsletter.includes(email)) {
    state.newsletter.push(email);
    write(state);
  }
  return { subscribed: true, email };
}

// --- Wishlist -------------------------------------------------------------
export function addToWishlist(user = 'demo', productId) {
  const product = getById(productId);
  if (!product) throw new Error('Produkt nicht gefunden');
  const state = read();
  state.wishlist[user] = state.wishlist[user] || [];
  if (!state.wishlist[user].includes(Number(productId))) {
    state.wishlist[user].push(Number(productId));
    write(state);
  }
  return listWishlist(user);
}

export function removeFromWishlist(user = 'demo', productId) {
  const state = read();
  state.wishlist[user] = (state.wishlist[user] || []).filter((id) => id !== Number(productId));
  write(state);
  return listWishlist(user);
}

export function listWishlist(user = 'demo') {
  const ids = read().wishlist[user] || [];
  return ids
    .map((id) => getById(id))
    .filter(Boolean)
    .map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      image: p.image,
      lowestPrice: p.lowestPrice,
      discountPercent: p.discountPercent,
      priceRating: p.priceRating.rating,
    }));
}
