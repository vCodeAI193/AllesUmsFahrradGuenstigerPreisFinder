// Zero-dependency HTTP server: JSON API + static frontend.
// Start with: npm start  (PORT env var optional, default 3000)

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { dirname, join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as data from './data.js';
import * as store from './store.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}

function userOf(url, req) {
  return url.searchParams.get('user') || req.headers['x-user'] || 'demo';
}

// --- API router -----------------------------------------------------------
async function handleApi(req, res, url) {
  const path = url.pathname;
  const p = url.searchParams;

  // GET /api/meta
  if (req.method === 'GET' && path === '/api/meta') return sendJson(res, 200, data.meta());

  // GET /api/facets
  if (req.method === 'GET' && path === '/api/facets') return sendJson(res, 200, data.facets());

  // GET /api/products
  if (req.method === 'GET' && path === '/api/products') {
    const params = {
      q: p.get('q') || '',
      category: p.get('category'),
      type: p.get('type'),
      brand: p.get('brand'),
      color: p.get('color'),
      material: p.get('material'),
      wheelSize: p.get('wheelSize'),
      frameSize: p.get('frameSize'),
      brakeType: p.get('brakeType'),
      gears: p.get('gears'),
      motor: p.get('motor'),
      country: p.get('country'),
      minPrice: p.get('minPrice'),
      maxPrice: p.get('maxPrice'),
      inStock: p.get('inStock'),
      onSale: p.get('onSale'),
      sort: p.get('sort'),
      page: p.get('page'),
      pageSize: p.get('pageSize'),
    };
    const result = data.query(params);
    if (result.total === 0 && params.q) result.didYouMean = data.didYouMean(params.q);
    return sendJson(res, 200, result);
  }

  // GET /api/products/:id  and  /api/products/:id/similar
  const productMatch = path.match(/^\/api\/products\/(\d+)(\/similar)?$/);
  if (req.method === 'GET' && productMatch) {
    const id = Number(productMatch[1]);
    if (productMatch[2]) return sendJson(res, 200, { items: data.similar(id) });
    const product = data.getById(id);
    if (!product) return sendJson(res, 404, { error: 'Produkt nicht gefunden' });
    return sendJson(res, 200, product);
  }

  // GET /api/deals
  if (req.method === 'GET' && path === '/api/deals')
    return sendJson(res, 200, { items: data.deals(Number(p.get('limit')) || 24) });

  // GET /api/suggest
  if (req.method === 'GET' && path === '/api/suggest')
    return sendJson(res, 200, { items: data.suggest(p.get('q') || '') });

  // --- Alerts ---
  if (path === '/api/alerts') {
    const user = userOf(url, req);
    if (req.method === 'GET') return sendJson(res, 200, { items: store.listAlerts(user) });
    if (req.method === 'POST') {
      const body = await readBody(req);
      if (!body.productId || body.targetPrice == null)
        return sendJson(res, 400, { error: 'productId und targetPrice erforderlich' });
      try {
        return sendJson(res, 201, store.addAlert({ user, productId: body.productId, targetPrice: body.targetPrice }));
      } catch (e) {
        return sendJson(res, 400, { error: e.message });
      }
    }
  }
  const alertMatch = path.match(/^\/api\/alerts\/(\d+)$/);
  if (req.method === 'DELETE' && alertMatch) {
    const ok = store.deleteAlert(userOf(url, req), Number(alertMatch[1]));
    return sendJson(res, ok ? 200 : 404, { deleted: ok });
  }

  // GET /api/export — GDPR data export for the current user
  if (req.method === 'GET' && path === '/api/export') {
    const body = JSON.stringify(store.exportUserData(userOf(url, req)), null, 2);
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="meine-daten.json"',
    });
    return res.end(body);
  }

  // --- Wishlist ---
  if (path === '/api/wishlist') {
    const user = userOf(url, req);
    if (req.method === 'GET') return sendJson(res, 200, { items: store.listWishlist(user) });
    if (req.method === 'POST') {
      const body = await readBody(req);
      if (!body.productId) return sendJson(res, 400, { error: 'productId erforderlich' });
      try {
        return sendJson(res, 201, { items: store.addToWishlist(user, body.productId) });
      } catch (e) {
        return sendJson(res, 400, { error: e.message });
      }
    }
  }
  const wishMatch = path.match(/^\/api\/wishlist\/(\d+)$/);
  if (req.method === 'DELETE' && wishMatch)
    return sendJson(res, 200, { items: store.removeFromWishlist(userOf(url, req), Number(wishMatch[1])) });

  return sendJson(res, 404, { error: 'Unbekannter Endpunkt' });
}

// --- Static file server ---------------------------------------------------
async function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === '/') rel = '/index.html';
  const filePath = normalize(join(publicDir, rel));
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) throw new Error('dir');
    const body = await readFile(filePath);
    const isHtml = extname(filePath) === '.html';
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] || 'application/octet-stream',
      // HTML must stay fresh (SPA shell); other assets may be cached briefly.
      'Cache-Control': isHtml ? 'no-cache' : 'public, max-age=3600',
    });
    res.end(body);
  } catch {
    // SPA fallback to index.html for unknown non-API routes
    try {
      const body = await readFile(join(publicDir, 'index.html'));
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  }
}

export const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    return await serveStatic(req, res, url);
  } catch (e) {
    sendJson(res, 500, { error: 'Interner Serverfehler', detail: String(e.message || e) });
  }
});

// Only listen when run directly (not when imported by tests).
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`Günstiger-Preis-Finder läuft auf http://localhost:${PORT}`);
  });
}
