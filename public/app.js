// Single-page frontend for the Günstiger-Preis-Finder. Zero dependencies.
// Hash-based routing, fetch against the JSON API, small SVG price chart.

const app = document.getElementById('app');
const euro = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---- Auth session state ----
let currentUser = null;
function authToken() { try { return localStorage.getItem('token'); } catch { return null; } }
function setToken(t) { try { t ? localStorage.setItem('token', t) : localStorage.removeItem('token'); } catch {} }
function authHeaders() {
  const t = authToken();
  return t ? { authorization: 'Bearer ' + t } : { 'x-user': 'demo' };
}

async function api(path) {
  const res = await fetch('/api' + path, { headers: { ...authHeaders() } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
async function send(method, path, body) {
  const res = await fetch('/api' + path, {
    method,
    headers: { 'content-type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// ---- Compare selection (persisted client-side, max 4) ----
const COMPARE_MAX = 4;
function getCompare() {
  try { return JSON.parse(localStorage.getItem('compare') || '[]'); } catch { return []; }
}
function setCompare(ids) {
  try { localStorage.setItem('compare', JSON.stringify(ids.slice(0, COMPARE_MAX))); } catch {}
  renderCompareBar();
}
function toggleCompare(id) {
  id = Number(id);
  const ids = getCompare();
  const i = ids.indexOf(id);
  if (i >= 0) ids.splice(i, 1);
  else if (ids.length < COMPARE_MAX) ids.push(id);
  setCompare(ids);
}
function renderCompareBar() {
  let bar = document.getElementById('compare-bar');
  const ids = getCompare();
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'compare-bar';
    bar.className = 'compare-bar';
    document.body.appendChild(bar);
  }
  bar.hidden = ids.length === 0;
  if (!ids.length) return;
  bar.innerHTML = `<span>${ids.length} Produkt${ids.length > 1 ? 'e' : ''} zum Vergleich</span>
    <a class="btn" href="#/vergleich" data-link>Vergleichen</a>
    <button class="btn secondary" id="compare-clear">Leeren</button>`;
  bar.querySelector('#compare-clear').addEventListener('click', () => setCompare([]));
  document.querySelectorAll('[data-compare]').forEach((b) => syncCompareBtn(b));
}
function syncCompareBtn(btn) {
  const active = getCompare().includes(Number(btn.dataset.compare));
  btn.classList.toggle('active', active);
  btn.title = active ? 'Aus Vergleich entfernen' : 'Zum Vergleich hinzufügen';
}

// ---- Recently viewed products (client-side history) ----
function getRecent() {
  try { return JSON.parse(localStorage.getItem('recentlyViewed') || '[]'); } catch { return []; }
}
function recordRecent(id) {
  id = Number(id);
  const ids = [id, ...getRecent().filter((x) => x !== id)].slice(0, 12);
  try { localStorage.setItem('recentlyViewed', JSON.stringify(ids)); } catch {}
}

// ---- Local image placeholder (no external network needed) ----
const THUMB_COLORS = ['#0a7d4b', '#1d6fb8', '#b8860b', '#7a3ea8', '#c2410c', '#0f766e', '#9d174d'];
function thumbFor(p) {
  const hash = String(p.brand + p.type).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const c1 = THUMB_COLORS[hash % THUMB_COLORS.length];
  const c2 = THUMB_COLORS[(hash + 3) % THUMB_COLORS.length];
  const label = esc(`${p.brand} · ${p.type}`);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
    <stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient></defs>
    <rect width='600' height='400' fill='url(#g)'/>
    <text x='300' y='200' font-family='system-ui,sans-serif' font-size='90' text-anchor='middle' fill='rgba(255,255,255,.85)'>🚲</text>
    <text x='300' y='300' font-family='system-ui,sans-serif' font-size='30' font-weight='700' text-anchor='middle' fill='#fff'>${label}</text>
  </svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

// ---- Rating pill helper ----
function ratingPill(rating, isLow) {
  const map = {
    bestprice: ['good', '🏆 Bestpreis'],
    'guter Preis': ['good', '👍 Guter Preis'],
    durchschnittlich: ['warn', '≈ Durchschnitt'],
    'eher teuer': ['bad', '↑ Eher teuer'],
  };
  const [cls, label] = map[rating] || ['warn', rating];
  return `<span class="pill ${cls}">${esc(label)}</span>`;
}
function stars(rating) {
  const full = Math.round(rating);
  return `<span class="stars" title="${rating} von 5">${'★'.repeat(full)}${'☆'.repeat(5 - full)}</span>`;
}

// ---- Product card ----
function card(p) {
  const discount = p.discountPercent > 0 ? `<span class="tag">-${p.discountPercent}%</span>` : '';
  const low = p.isAllTimeLow ? `<span class="tag best" style="top:auto;bottom:.5rem">Tiefstpreis</span>` : '';
  return `
  <article class="card">
    <a class="thumb" href="#/product/${p.id}" data-link>
      <img loading="lazy" src="${thumbFor(p)}" alt="${esc(p.name)}" />
      ${discount}${low}
    </a>
    <div class="body">
      <div class="brand">${esc(p.brand)} · ${esc(p.type)}</div>
      <a class="title" href="#/product/${p.id}" data-link>${esc(p.name)}</a>
      <div class="meta">${stars(p.rating)} <span class="muted">(${p.reviewCount})</span></div>
      <div class="meta">${ratingPill(p.priceRating, p.isAllTimeLow)}</div>
      <div class="price-line">
        <span class="price">${euro(p.lowestPrice)}</span>
        ${p.discountPercent > 0 ? `<span class="rrp">${euro(p.rrp)}</span>` : ''}
      </div>
      <div class="meta">${p.merchantCount} Händler · ab ${esc(p.bestMerchant)} ${p.inStock ? '· ✅ verfügbar' : '· ⏳ lieferbar'}</div>
      <div class="card-actions">
        <a class="primary" href="#/product/${p.id}" data-link>Details</a>
        <button data-compare="${p.id}" class="compare-btn" title="Zum Vergleich hinzufügen">⇄</button>
        <button data-wish="${p.id}" title="Zur Merkliste">♡</button>
      </div>
    </div>
  </article>`;
}

// ---- SVG price history chart ----
function priceChart(history, avg) {
  const w = 640, h = 220, pad = 34;
  const prices = history.map((d) => d.price);
  const min = Math.min(...prices), max = Math.max(...prices);
  const span = max - min || 1;
  const x = (i) => pad + (i / (history.length - 1)) * (w - pad * 2);
  const y = (v) => h - pad - ((v - min) / span) * (h - pad * 2);
  const pts = history.map((d, i) => `${x(i).toFixed(1)},${y(d.price).toFixed(1)}`);
  const area = `M${x(0)},${h - pad} L${pts.join(' L')} L${x(history.length - 1)},${h - pad} Z`;
  const line = `M${pts.join(' L')}`;
  const ay = y(avg).toFixed(1);
  const ticks = [0, Math.floor(history.length / 2), history.length - 1]
    .map((i) => `<text x="${x(i)}" y="${h - 8}" text-anchor="middle">${history[i].date.slice(5)}</text>`).join('');
  return `
  <svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Preisverlauf der letzten 6 Monate">
    <line class="axis" x1="${pad}" y1="${h - pad}" x2="${w - pad}" y2="${h - pad}" />
    <path class="area" d="${area}" />
    <path class="line" d="${line}" />
    <line class="avg" x1="${pad}" y1="${ay}" x2="${w - pad}" y2="${ay}" />
    <text x="${w - pad}" y="${ay - 4}" text-anchor="end">Ø ${euro(avg)}</text>
    <text x="${pad}" y="${y(max) - 4}">${euro(max)}</text>
    <text x="${pad}" y="${y(min) + 14}">${euro(min)}</text>
    ${ticks}
  </svg>`;
}

// ---- Views ------------------------------------------------------------
async function viewCatalog(params) {
  app.innerHTML = spinner();
  const facets = await api('/facets');
  const qs = new URLSearchParams(params).toString();
  const data = await api('/products' + (qs ? '?' + qs : ''));

  const isHome = !params.q && !hasFilters(params) && (Number(params.page) || 1) === 1;
  const hero = params.q || hasFilters(params) ? '' : heroBlock(facets);
  let homeStrips = '';
  if (isHome) homeStrips = await buildHomeStrips();
  const dym = data.didYouMean
    ? `<p class="notice">Keine Treffer für „${esc(params.q)}". Meintest du <a href="#/?q=${encodeURIComponent(data.didYouMean)}" data-link>${esc(data.didYouMean)}</a>?</p>`
    : '';

  app.innerHTML = `
    ${hero}
    ${homeStrips}
    <div class="layout">
      ${filterPanel(facets, params)}
      <section>
        <div class="toolbar">
          <span class="result-count">${data.total} Treffer${params.q ? ` für „${esc(params.q)}"` : ''}</span>
          <label>Sortieren:
            <select id="sort">
              ${sortOptions(params.sort)}
            </select>
          </label>
        </div>
        ${dym}
        ${data.items.length ? `<div class="grid">${data.items.map(card).join('')}</div>` : emptyState()}
        ${pagination(data)}
      </section>
    </div>`;

  wireFilters(params);
  wireSort(params);
}

// Builds the "Für dich" + "Zuletzt angesehen" rows for the home view.
async function buildHomeStrips() {
  let html = '';
  try {
    const foryou = await api('/foryou');
    if (foryou.items.length) {
      const title = foryou.personalized ? '✨ Für dich empfohlen' : '✨ Beliebte Empfehlungen';
      html += `<div class="section-title"><h2>${title}</h2>${foryou.personalized ? '' : `<a href="#/konto" data-link class="muted" style="font-size:.85rem">Personalisieren →</a>`}</div>
        <div class="grid">${foryou.items.slice(0, 8).map(card).join('')}</div>`;
    }
  } catch {}
  const recent = getRecent();
  if (recent.length) {
    try {
      const r = await api('/products/by-ids?ids=' + recent.join(','));
      if (r.items.length) {
        html += `<div class="section-title"><h2>🕘 Zuletzt angesehen</h2></div>
          <div class="grid">${r.items.slice(0, 8).map(card).join('')}</div>`;
      }
    } catch {}
  }
  return html;
}

function heroBlock(facets) {
  const cats = facets.categories.map((c) => `<a href="#/?category=${encodeURIComponent(c.value)}" data-link>${esc(c.value)} (${c.count})</a>`).join('');
  return `
  <div class="hero">
    <h1>Finde den günstigsten Preis rund ums Fahrrad</h1>
    <p>Preise vieler Händler vergleichen, Deals entdecken und bei Tiefstpreisen benachrichtigt werden.</p>
    <div class="chips">${cats}<a href="#/deals" data-link>🔥 Top-Deals</a></div>
  </div>`;
}

function filterPanel(facets, params) {
  const opt = (list, sel) => ['<option value="">Alle</option>',
    ...list.map((f) => `<option value="${esc(f.value)}" ${sel === f.value ? 'selected' : ''}>${esc(f.value)} (${f.count})</option>`)].join('');
  return `
  <aside class="filters">
    <h2>Filter</h2>
    <div class="filter-group"><label>Kategorie</label><select data-filter="category">${opt(facets.categories, params.category)}</select></div>
    <div class="filter-group"><label>Typ</label><select data-filter="type">${opt(facets.types, params.type)}</select></div>
    <div class="filter-group"><label>Marke</label><select data-filter="brand">${opt(facets.brands, params.brand)}</select></div>
    <div class="filter-group"><label>Material</label><select data-filter="material">${opt(facets.materials, params.material)}</select></div>
    <div class="filter-group"><label>Laufradgröße</label><select data-filter="wheelSize">${opt(facets.wheelSizes, params.wheelSize)}</select></div>
    <div class="filter-group"><label>Rahmen-/Kleidergröße</label><select data-filter="frameSize">${opt(facets.frameSizes, params.frameSize)}</select></div>
    <div class="filter-group"><label>Bremse</label><select data-filter="brakeType">${opt(facets.brakeTypes, params.brakeType)}</select></div>
    <div class="filter-group"><label>Gänge</label><select data-filter="gears">${opt(facets.gears, params.gears)}</select></div>
    <div class="filter-group"><label>E-Bike-Motor</label><select data-filter="motor">${opt(facets.motors, params.motor)}</select></div>
    <div class="filter-group"><label>Händlerland</label><select data-filter="country">${opt(facets.countries, params.country)}</select></div>
    <div class="filter-group"><label>Farbe</label><select data-filter="color">${opt(facets.colors, params.color)}</select></div>
    <div class="filter-group">
      <label>Preis (€)</label>
      <div class="price-row">
        <input type="number" data-filter="minPrice" placeholder="min" value="${params.minPrice || ''}" min="0" />
        <input type="number" data-filter="maxPrice" placeholder="max" value="${params.maxPrice || ''}" min="0" />
      </div>
    </div>
    <div class="filter-group">
      <label class="checkbox"><input type="checkbox" data-filter="onSale" ${params.onSale ? 'checked' : ''}/> Nur Angebote</label>
      <label class="checkbox"><input type="checkbox" data-filter="inStock" ${params.inStock ? 'checked' : ''}/> Nur verfügbar</label>
    </div>
    <button class="btn-reset" id="reset-filters">Filter zurücksetzen</button>
  </aside>`;
}

function sortOptions(sel) {
  const opts = [
    ['popularity', 'Beliebtheit'], ['price_asc', 'Preis aufsteigend'], ['price_desc', 'Preis absteigend'],
    ['discount', 'Höchster Rabatt'], ['rating', 'Beste Bewertung'], ['newest', 'Neuheiten'], ['name', 'Name A–Z'],
  ];
  return opts.map(([v, l]) => `<option value="${v}" ${sel === v ? 'selected' : ''}>${l}</option>`).join('');
}

function pagination(data) {
  if (data.pageCount <= 1) return '';
  const cur = data.page;
  let btns = '';
  const go = (p, label, opts = {}) =>
    `<button data-page="${p}" ${opts.disabled ? 'disabled' : ''} class="${opts.active ? 'active' : ''}">${label}</button>`;
  btns += go(cur - 1, '‹', { disabled: cur <= 1 });
  for (let i = 1; i <= data.pageCount; i++) {
    if (i === 1 || i === data.pageCount || Math.abs(i - cur) <= 1) btns += go(i, i, { active: i === cur });
    else if (Math.abs(i - cur) === 2) btns += '<span>…</span>';
  }
  btns += go(cur + 1, '›', { disabled: cur >= data.pageCount });
  return `<div class="pagination">${btns}</div>`;
}

async function viewProduct(id) {
  app.innerHTML = spinner();
  let p, similar;
  try {
    [p, similar] = await Promise.all([api('/products/' + id), api('/products/' + id + '/similar')]);
  } catch {
    app.innerHTML = emptyState('Produkt nicht gefunden.');
    return;
  }
  recordRecent(p.id);
  const best = p.offers[0];
  const offerRows = p.offers.map((o, i) => `
    <tr class="${i === 0 ? 'best' : ''}">
      <td><strong>${esc(o.merchant)}</strong><br><span class="muted">${stars(o.merchantRating)} · ${esc(o.country)}</span></td>
      <td>${euro(o.price)}<br><span class="muted">${o.shipping === 0 ? 'Versandfrei' : '+ ' + euro(o.shipping) + ' Versand'}</span></td>
      <td>${euro(o.total)}</td>
      <td>${o.inStock ? `✅ ${o.deliveryDays} Tage` : `⏳ ${o.deliveryDays} Tage`}</td>
      <td>${o.voucher ? `<span class="pill good" title="${esc(o.voucher.text)}">${esc(o.voucher.code)}</span>` : '–'}</td>
      <td><a class="btn" href="${esc(o.url)}" target="_blank" rel="noopener nofollow">Zum Shop</a></td>
    </tr>`).join('');

  const specs = Object.entries(p.specs).map(([k, v]) => `<li><span>${esc(k)}</span><span>${esc(v)}</span></li>`).join('');

  app.innerHTML = `
  <div class="detail">
    <nav class="breadcrumb"><a href="#/" data-link>Start</a> › <a href="#/?category=${encodeURIComponent(p.category)}" data-link>${esc(p.category)}</a> › ${esc(p.type)}</nav>
    <div class="detail-top">
      <div class="gallery"><img src="${thumbFor(p)}" alt="${esc(p.name)}" /></div>
      <div>
        <div class="brand muted">${esc(p.brand)}</div>
        <h1>${esc(p.name)}</h1>
        <div class="meta">${stars(p.rating)} ${p.rating} · ${p.reviewCount} Bewertungen</div>
        <p class="big-price">${euro(p.lowestPrice)} ${ratingPill(p.priceRating.rating, p.priceRating.isAllTimeLow)}</p>
        ${p.unitPrice ? `<p class="muted" style="margin-top:-.5rem">≈ ${euro(p.unitPrice.value)} ${esc(p.unitPrice.unit)} (${esc(p.unitPrice.label)})</p>` : ''}
        <p class="muted">
          ${p.discountPercent > 0 ? `<span class="rrp">UVP ${euro(p.rrp)}</span> · −${p.discountPercent}% · ` : ''}
          günstigster Anbieter: <strong>${esc(best.merchant)}</strong> (${euro(best.total)} inkl. Versand)
        </p>
        <div class="card-actions" style="display:flex;gap:.5rem;max-width:420px">
          <a class="btn" href="${esc(best.url)}" target="_blank" rel="noopener nofollow">Bestes Angebot öffnen</a>
          <button class="btn secondary" data-wish="${p.id}">♡ Merken</button>
          <button class="btn secondary" id="share-btn" title="Angebot teilen">🔗 Teilen</button>
        </div>
        <div class="panel" style="margin-top:1rem">
          <h2 style="font-size:1rem">🔔 Preisalarm setzen</h2>
          <p class="muted" style="margin:.2rem 0 .6rem">Benachrichtigung, sobald der Preis unter deinen Wunschpreis fällt.</p>
          <form id="alert-form" style="display:flex;flex-wrap:wrap;gap:.5rem">
            <select id="alert-type" style="padding:.5rem;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)">
              <option value="target">Wunschpreis</option>
              <option value="drop">Jede Preissenkung</option>
              <option value="restock">Wieder verfügbar</option>
            </select>
            <input type="number" id="alert-price" placeholder="Wunschpreis €" value="${Math.floor(p.lowestPrice * 0.9)}" min="1" style="flex:1;min-width:120px;padding:.5rem;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)" />
            <button class="btn" type="submit">Alarm anlegen</button>
          </form>
          <p id="alert-feedback" class="muted" style="margin:.5rem 0 0"></p>
        </div>
      </div>
    </div>

    <div class="panel">
      <h2>Preisvergleich (${p.offers.length} Händler)</h2>
      <div style="overflow-x:auto">
      <table class="offers">
        <thead><tr><th>Händler</th><th>Preis</th><th>Gesamt</th><th>Lieferung</th><th>Gutschein</th><th></th></tr></thead>
        <tbody>${offerRows}</tbody>
      </table>
      </div>
    </div>

    <div class="panel">
      <h2>Preisverlauf (6 Monate)</h2>
      <p class="muted">Tiefst ${euro(p.priceStats.min)} · Ø ${euro(p.priceStats.avg)} · Höchst ${euro(p.priceStats.max)}</p>
      ${priceChart(p.priceHistory, p.priceStats.avg)}
    </div>

    <div class="panel">
      <h2>Technische Daten</h2>
      <ul class="specs">${specs}</ul>
    </div>

    ${similar.items.length ? `<div class="section-title"><h2>Ähnliche Produkte</h2></div><div class="grid">${similar.items.map(card).join('')}</div>` : ''}
  </div>`;

  document.getElementById('share-btn').addEventListener('click', async () => {
    const url = location.href;
    const shareData = { title: p.name, text: `${p.name} ab ${euro(p.lowestPrice)}`, url };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(url); alert('Link in die Zwischenablage kopiert:\n' + url); }
    } catch { /* user cancelled share */ }
  });

  const alertType = document.getElementById('alert-type');
  const alertPrice = document.getElementById('alert-price');
  alertType.addEventListener('change', () => { alertPrice.style.display = alertType.value === 'target' ? '' : 'none'; });
  document.getElementById('alert-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const type = alertType.value;
    const targetPrice = type === 'target' ? Number(alertPrice.value) : undefined;
    const r = await send('POST', '/alerts', { productId: p.id, type, targetPrice });
    const fb = document.getElementById('alert-feedback');
    if (r.error) { fb.textContent = '⚠️ ' + r.error; return; }
    const msg = {
      target: r.triggered ? `✅ Aktiv – der Preis liegt bereits unter ${euro(targetPrice)}!` : `✅ Angelegt. Wir benachrichtigen dich, sobald der Preis ${euro(targetPrice)} erreicht.`,
      drop: '✅ Angelegt. Wir benachrichtigen dich bei jeder Preissenkung.',
      restock: '✅ Angelegt. Wir benachrichtigen dich, sobald das Produkt wieder verfügbar ist.',
    };
    fb.textContent = msg[type];
  });
}

async function viewDeals() {
  app.innerHTML = spinner();
  const data = await api('/deals?limit=24');
  const top = data.items[0];
  const featured = top ? `
    <div class="hero" style="display:grid;grid-template-columns:1fr;gap:1rem">
      <div>
        <span class="pill" style="background:rgba(255,255,255,.25);color:#fff">⭐ Deal des Tages</span>
        <h1 style="margin:.5rem 0">${esc(top.name)}</h1>
        <p>−${top.discountPercent}% statt ${euro(top.rrp)} · jetzt nur <strong>${euro(top.lowestPrice)}</strong> bei ${esc(top.bestMerchant)}</p>
        <div class="chips"><a href="#/product/${top.id}" data-link>Zum Deal →</a></div>
      </div>
    </div>` : '';
  app.innerHTML = `
    <div class="hero"><h1>🔥 Top-Deals</h1><p>Die größten Rabatte gegenüber der UVP – jetzt zugreifen.</p></div>
    ${featured}
    <div class="section-title"><h2>Alle Deals</h2></div>
    <div class="grid">${data.items.map(card).join('')}</div>`;
}

async function viewWishlist() {
  app.innerHTML = spinner();
  const data = await api('/wishlist');
  app.innerHTML = `
    <div class="section-title"><h2>❤️ Meine Merkliste</h2></div>
    ${data.items.length
      ? `<div class="grid">${data.items.map((p) => `
        <article class="card"><a class="thumb" href="#/product/${p.id}" data-link><img src="${thumbFor(p)}" alt="${esc(p.name)}"/></a>
        <div class="body"><div class="brand">${esc(p.brand)}</div>
        <a class="title" href="#/product/${p.id}" data-link>${esc(p.name)}</a>
        <div class="price-line"><span class="price">${euro(p.lowestPrice)}</span></div>
        <div class="card-actions"><a class="primary" href="#/product/${p.id}" data-link>Ansehen</a>
        <button data-unwish="${p.id}">Entfernen</button></div></div></article>`).join('')}</div>`
      : emptyState('Deine Merkliste ist leer. Füge Produkte über das ♡ hinzu.')}`;
  app.querySelectorAll('[data-unwish]').forEach((b) =>
    b.addEventListener('click', async () => { await send('DELETE', '/wishlist/' + b.dataset.unwish); refreshWishlistBadge(); viewWishlist(); }));
}

async function viewAlerts() {
  app.innerHTML = spinner();
  const data = await api('/alerts');
  const typeLabel = { target: 'Wunschpreis', drop: 'Preissenkung', restock: 'Verfügbarkeit' };
  const rows = data.items.map((a) => `
    <tr>
      <td><a href="#/product/${a.productId}" data-link>${esc(a.productName)}</a></td>
      <td>${esc(typeLabel[a.type] || a.type)}${a.type === 'target' ? `<br><span class="muted">${euro(a.targetPrice)}</span>` : ''}</td>
      <td>${a.currentPrice != null ? euro(a.currentPrice) : '–'}</td>
      <td>${a.triggered ? `<span class="pill good">🔔 ${esc(a.statusLabel)}</span>` : `<span class="pill warn">${esc(a.statusLabel || 'aktiv')}</span>`}</td>
      <td><button class="btn secondary" data-delalert="${a.id}">Löschen</button></td>
    </tr>`).join('');
  app.innerHTML = `
    <div class="section-title"><h2>🔔 Meine Preisalarme</h2></div>
    ${data.items.length
      ? `<div class="panel"><div style="overflow-x:auto"><table class="offers">
         <thead><tr><th>Produkt</th><th>Typ</th><th>Aktuell</th><th>Status</th><th></th></tr></thead>
         <tbody>${rows}</tbody></table></div></div>`
      : emptyState('Du hast noch keine Preisalarme. Lege einen auf einer Produktseite an.')}`;
  app.querySelectorAll('[data-delalert]').forEach((b) =>
    b.addEventListener('click', async () => { await send('DELETE', '/alerts/' + b.dataset.delalert); viewAlerts(); }));

  app.insertAdjacentHTML('beforeend', `
    <div class="panel" style="margin-top:1.5rem">
      <h2 style="font-size:1rem">🔒 Datenschutz</h2>
      <p class="muted" style="margin:.2rem 0 .6rem">Du kannst alle deine Daten (Merkliste & Preisalarme) exportieren oder unwiderruflich löschen.</p>
      <a class="btn secondary" href="/api/export" download>Daten exportieren</a>
      <button class="btn secondary" id="delete-account">Alle meine Daten löschen</button>
    </div>`);
  document.getElementById('delete-account').addEventListener('click', async () => {
    if (!confirm('Wirklich alle deine Daten (Merkliste & Preisalarme) löschen?')) return;
    await send('DELETE', '/account');
    refreshWishlistBadge();
    viewAlerts();
  });
}

async function viewCompare(params = {}) {
  app.innerHTML = spinner();
  // Support shareable compare links: #/vergleich?ids=1,2,3 seeds the selection.
  if (params.ids) {
    const seeded = params.ids.split(',').map(Number).filter((n) => n > 0);
    if (seeded.length) setCompare([...new Set([...getCompare(), ...seeded])]);
  }
  const ids = getCompare();
  if (!ids.length) { app.innerHTML = emptyState('Noch keine Produkte im Vergleich. Nutze das ⇄ auf den Produktkarten.'); return; }
  const products = (await Promise.all(ids.map((id) => api('/products/' + id).catch(() => null)))).filter(Boolean);
  // Rows: collect the union of spec keys plus core attributes.
  const specKeys = [...new Set(products.flatMap((p) => Object.keys(p.specs)))];
  const cell = (label, fn) => `<tr><th>${esc(label)}</th>${products.map((p) => `<td>${fn(p)}</td>`).join('')}</tr>`;
  app.innerHTML = `
    <div class="section-title"><h2>⇄ Produktvergleich</h2><button class="btn secondary" id="cmp-clear-page">Alle entfernen</button></div>
    <div class="panel" style="overflow-x:auto">
    <table class="offers compare-table">
      <thead><tr><th></th>${products.map((p) => `<th>
        <a href="#/product/${p.id}" data-link>${esc(p.name)}</a>
        <button class="btn secondary" data-compare="${p.id}" style="display:block;margin-top:.4rem;font-size:.8rem">Entfernen</button>
      </th>`).join('')}</tr></thead>
      <tbody>
        ${cell('Marke', (p) => esc(p.brand))}
        ${cell('Bester Preis', (p) => `<strong>${euro(p.lowestPrice)}</strong>`)}
        ${cell('UVP', (p) => p.rrp ? euro(p.rrp) : '–')}
        ${cell('Ersparnis', (p) => p.discountPercent > 0 ? `−${p.discountPercent}%` : '–')}
        ${cell('Preis-Einschätzung', (p) => ratingPill(p.priceRating.rating, p.priceRating.isAllTimeLow))}
        ${cell('Bewertung', (p) => `${stars(p.rating)} ${p.rating}`)}
        ${cell('Händler', (p) => p.offers.length)}
        ${cell('Verfügbar', (p) => p.offers.some((o) => o.inStock) ? '✅' : '⏳')}
        ${specKeys.map((k) => cell(k, (p) => esc(p.specs[k] ?? '–'))).join('')}
      </tbody>
    </table></div>`;
  document.getElementById('cmp-clear-page').addEventListener('click', () => { setCompare([]); viewCompare(); });
  app.querySelectorAll('[data-compare]').forEach((b) => b.addEventListener('click', () => setTimeout(viewCompare, 0)));
}

// ---- Account: auth + profile ----
async function refreshUser() {
  if (!authToken()) { currentUser = null; renderAccountNav(); return null; }
  try {
    const me = await api('/auth/me');
    currentUser = me.error ? null : me;
  } catch { currentUser = null; }
  if (!currentUser) setToken(null);
  renderAccountNav();
  return currentUser;
}
function renderAccountNav() {
  const el = document.getElementById('account-nav');
  if (!el) return;
  el.innerHTML = currentUser
    ? `<a href="#/konto" data-link title="Mein Konto">👤 ${esc(currentUser.name)}</a>`
    : `<a href="#/konto" data-link>Anmelden</a>`;
}

async function doLogout() {
  await send('POST', '/auth/logout');
  setToken(null);
  currentUser = null;
  renderAccountNav();
  refreshWishlistBadge();
  location.hash = '#/';
}

function viewAccount() {
  if (currentUser) return viewProfile();
  // Login / registration forms
  app.innerHTML = `
    <div class="section-title"><h2>👤 Konto</h2></div>
    <div class="layout" style="grid-template-columns:1fr;max-width:760px">
      <div class="auth-grid">
        <form id="login-form" class="panel">
          <h2 style="font-size:1.1rem">Anmelden</h2>
          <label>E-Mail<input type="email" name="email" required autocomplete="email" /></label>
          <label>Passwort<input type="password" name="password" required autocomplete="current-password" /></label>
          <button class="btn" type="submit">Anmelden</button>
          <p class="form-msg muted"></p>
        </form>
        <form id="register-form" class="panel">
          <h2 style="font-size:1.1rem">Neu registrieren</h2>
          <label>Name<input type="text" name="name" autocomplete="name" placeholder="optional" /></label>
          <label>E-Mail<input type="email" name="email" required autocomplete="email" /></label>
          <label>Passwort<input type="password" name="password" required minlength="6" autocomplete="new-password" placeholder="mind. 6 Zeichen" /></label>
          <button class="btn" type="submit">Konto erstellen</button>
          <p class="form-msg muted"></p>
        </form>
      </div>
    </div>
    <p class="muted" style="max-width:760px">Ohne Konto kannst du die Seite als Gast nutzen; Merkliste und Preisalarme werden dann nur lokal gespeichert. Mit Konto sind sie an dein Profil gebunden.</p>`;

  const handle = (formId, endpoint) => {
    const form = document.getElementById(formId);
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = Object.fromEntries(new FormData(form).entries());
      const r = await send('POST', endpoint, payload);
      if (r.token) {
        setToken(r.token);
        currentUser = r.user;
        renderAccountNav();
        refreshWishlistBadge();
        location.hash = '#/konto';
      } else {
        form.querySelector('.form-msg').textContent = '⚠️ ' + (r.error || 'Fehler');
      }
    });
  };
  handle('login-form', '/auth/login');
  handle('register-form', '/auth/register');
}

async function viewProfile() {
  app.innerHTML = spinner();
  const [wl, alerts, facets] = await Promise.all([api('/wishlist'), api('/alerts'), api('/facets')]);
  const prefs = currentUser.prefs || {};
  const multi = (name, list, selected = []) =>
    `<select name="${name}" multiple size="5" style="width:100%;padding:.4rem;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)">
      ${list.map((f) => `<option value="${esc(f.value)}" ${selected.includes(f.value) ? 'selected' : ''}>${esc(f.value)}</option>`).join('')}
    </select>`;
  const countryOpts = ['<option value="">Keine Vorauswahl</option>',
    ...facets.countries.map((c) => `<option value="${esc(c.value)}" ${prefs.country === c.value ? 'selected' : ''}>${esc(c.value)}</option>`)].join('');
  app.innerHTML = `
    <div class="section-title"><h2>👤 Mein Konto</h2><button class="btn secondary" id="logout-btn">Abmelden</button></div>
    <div class="panel">
      <p>Angemeldet als <strong>${esc(currentUser.email)}</strong> · Mitglied seit ${esc(currentUser.createdAt)}</p>
      <form id="profile-form" style="display:flex;gap:.5rem;align-items:flex-end;flex-wrap:wrap;margin-top:.5rem">
        <label>Anzeigename<input type="text" name="name" value="${esc(currentUser.name)}" style="display:block;padding:.5rem;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)" /></label>
        <button class="btn" type="submit">Speichern</button>
        <span class="form-msg muted"></span>
      </form>
    </div>
    <div class="panel">
      <h2 style="font-size:1.1rem">⚙️ Präferenzen</h2>
      <p class="muted" style="margin:.2rem 0 .8rem">Wähle deine Lieblingsmarken und -kategorien für personalisierte Empfehlungen auf der Startseite.</p>
      <form id="prefs-form" class="prefs-grid">
        <label>Lieblingsmarken${multi('brands', facets.brands, prefs.brands || [])}</label>
        <label>Lieblingskategorien${multi('categories', facets.categories, prefs.categories || [])}</label>
        <label>Bevorzugtes Versandland<select name="country" style="width:100%;padding:.45rem;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)">${countryOpts}</select></label>
        <div style="grid-column:1/-1;display:flex;gap:.5rem;align-items:center"><button class="btn" type="submit">Präferenzen speichern</button><span class="prefs-msg muted"></span></div>
      </form>
    </div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:1rem">
      <a class="panel" href="#/wishlist" data-link><h2 style="margin:0;font-size:1.05rem">❤️ Merkliste</h2><p class="muted" style="margin:.3rem 0 0">${wl.items.length} Produkte</p></a>
      <a class="panel" href="#/alerts" data-link><h2 style="margin:0;font-size:1.05rem">🔔 Preisalarme</h2><p class="muted" style="margin:.3rem 0 0">${alerts.items.length} aktiv</p></a>
      <a class="panel" href="/api/export" download><h2 style="margin:0;font-size:1.05rem">⬇️ Daten exportieren</h2><p class="muted" style="margin:.3rem 0 0">DSGVO-Export als JSON</p></a>
    </div>`;
  document.getElementById('logout-btn').addEventListener('click', doLogout);
  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = new FormData(e.target).get('name');
    const r = await send('PATCH', '/auth/me', { name });
    if (!r.error) { currentUser = r; renderAccountNav(); e.target.querySelector('.form-msg').textContent = '✅ Gespeichert'; }
  });
  document.getElementById('prefs-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const prefs = { brands: fd.getAll('brands'), categories: fd.getAll('categories'), country: fd.get('country') || '' };
    const r = await send('PATCH', '/auth/me', { prefs });
    if (!r.error) { currentUser = r; e.target.querySelector('.prefs-msg').textContent = '✅ Präferenzen gespeichert'; }
  });
}

async function viewMerchants() {
  app.innerHTML = spinner();
  const meta = await api('/meta');
  const rows = meta.merchants.map((m) => `
    <tr>
      <td><strong>${esc(m.name)}</strong></td>
      <td>${stars(m.rating)} ${m.rating}</td>
      <td>${esc(m.country)}</td>
      <td>versandkostenfrei ab ${euro(m.freeShipFrom)}</td>
      <td><a href="#/?country=${encodeURIComponent(m.country)}" data-link>Angebote aus ${esc(m.country)}</a></td>
    </tr>`).join('');
  app.innerHTML = `
    <div class="section-title"><h2>🏬 Angebundene Händler</h2></div>
    <div class="panel"><div style="overflow-x:auto"><table class="offers">
      <thead><tr><th>Händler</th><th>Bewertung</th><th>Land</th><th>Versand</th><th></th></tr></thead>
      <tbody>${rows}</tbody></table></div>
      <p class="muted" style="margin-top:1rem">Insgesamt ${meta.count} Produkte. Die Daten sind ein Prototyp – echte Händler-Feeds folgen.</p>
    </div>`;
}

const GLOSSARY = [
  ['UVP', 'Unverbindliche Preisempfehlung des Herstellers – Referenz für den Rabatt.'],
  ['Gravelbike', 'Vielseitiges Rad für Asphalt und Schotter, zwischen Renn- und Mountainbike.'],
  ['Schaltung', 'System aus Schalthebel, Schaltwerk und Ritzeln zur Übersetzungswahl.'],
  ['Scheibenbremse', 'Bremse, die auf eine Scheibe an der Nabe wirkt – stark und wetterunabhängig.'],
  ['Wh (Wattstunden)', 'Maß für die Akkukapazität eines E-Bikes – mehr Wh = mehr Reichweite.'],
  ['Laufradgröße', 'Durchmesser des Laufrads in Zoll (26", 27,5", 28", 29").'],
];
const FAQ = [
  ['Sind die Preise echt?', 'Nein. Dieser Prototyp nutzt synthetische Beispieldaten. Die Struktur entspricht aber realen Händler-Feeds.'],
  ['Wie funktioniert der Preisalarm?', 'Lege auf einer Produktseite einen Wunschpreis fest. Sobald der Preis darunter fällt, wird der Alarm als ausgelöst markiert.'],
  ['Was bedeutet „Guter Preis"?', 'Der aktuelle Preis wird mit dem eigenen 6-Monats-Verlauf verglichen. Liegt er deutlich unter dem Durchschnitt, gilt er als guter Preis bzw. Tiefstpreis.'],
  ['Wie werden meine Daten gespeichert?', 'Merkliste und Preisalarme liegen lokal. Über „Meine Daten exportieren" im Footer kannst du sie jederzeit als JSON herunterladen.'],
];
function viewFaq() {
  app.innerHTML = `
    <div class="section-title"><h2>❓ FAQ</h2></div>
    <div class="panel">${FAQ.map(([q, a]) => `<details style="margin:.4rem 0"><summary style="cursor:pointer;font-weight:600">${esc(q)}</summary><p class="muted">${esc(a)}</p></details>`).join('')}</div>
    <div class="section-title"><h2>📖 Glossar</h2></div>
    <div class="panel"><ul class="specs" style="grid-template-columns:1fr">${GLOSSARY.map(([t, d]) => `<li style="flex-direction:column;align-items:flex-start"><span style="color:var(--text);font-weight:700">${esc(t)}</span><span>${esc(d)}</span></li>`).join('')}</ul></div>`;
}

// ---- Shared UI helpers ----
const spinner = () => `<div class="spinner">⏳ Lädt …</div>`;
const emptyState = (msg = 'Keine Produkte gefunden. Passe Suche oder Filter an.') => `<div class="empty"><p style="font-size:2rem">🔍</p><p>${esc(msg)}</p></div>`;
function hasFilters(p) { return ['category', 'type', 'brand', 'material', 'wheelSize', 'frameSize', 'brakeType', 'gears', 'motor', 'country', 'color', 'minPrice', 'maxPrice', 'onSale', 'inStock'].some((k) => p[k]); }

// ---- Filter / sort wiring ----
function navigateWith(params) {
  const clean = {};
  for (const [k, v] of Object.entries(params)) if (v !== '' && v != null && v !== false) clean[k] = v;
  const qs = new URLSearchParams(clean).toString();
  location.hash = '#/' + (qs ? '?' + qs : '');
}
function wireFilters(params) {
  app.querySelectorAll('[data-filter]').forEach((el) => {
    const evt = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'change';
    el.addEventListener(evt, () => {
      const key = el.dataset.filter;
      const val = el.type === 'checkbox' ? el.checked : el.value;
      navigateWith({ ...params, [key]: val, page: 1 });
    });
  });
  const reset = document.getElementById('reset-filters');
  if (reset) reset.addEventListener('click', () => navigateWith({ q: params.q || '' }));
  app.querySelectorAll('[data-page]').forEach((b) =>
    b.addEventListener('click', () => !b.disabled && navigateWith({ ...params, page: b.dataset.page })));
}
function wireSort(params) {
  const sel = document.getElementById('sort');
  if (sel) sel.addEventListener('change', () => navigateWith({ ...params, sort: sel.value, page: 1 }));
}

// ---- Wishlist via event delegation (♡ buttons everywhere) ----
document.addEventListener('click', async (e) => {
  const wish = e.target.closest('[data-wish]');
  if (wish) {
    e.preventDefault();
    await send('POST', '/wishlist', { productId: Number(wish.dataset.wish) });
    wish.textContent = '♥';
    refreshWishlistBadge();
  }
  const cmp = e.target.closest('[data-compare]');
  if (cmp) {
    e.preventDefault();
    toggleCompare(cmp.dataset.compare);
    syncCompareBtn(cmp);
  }
  // Authenticated data export: a plain link cannot send the bearer token, so
  // intercept and download via fetch with auth headers.
  const exportLink = e.target.closest('a[href="/api/export"]');
  if (exportLink) {
    e.preventDefault();
    const res = await fetch('/api/export', { headers: { ...authHeaders() } });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'meine-daten.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const link = e.target.closest('[data-link]');
  if (link && link.getAttribute('href').startsWith('#')) hideSuggestions();
});

async function refreshWishlistBadge() {
  try {
    const data = await api('/wishlist');
    const badge = document.getElementById('wishlist-badge');
    badge.textContent = data.items.length;
    badge.hidden = data.items.length === 0;
  } catch {}
}

// ---- Search + autocomplete ----
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const suggestionsEl = document.getElementById('suggestions');
let suggestTimer;

// Recent searches (history), stored client-side.
function recentSearches() {
  try { return JSON.parse(localStorage.getItem('searchHistory') || '[]'); } catch { return []; }
}
function rememberSearch(q) {
  if (!q) return;
  const hist = [q, ...recentSearches().filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 8);
  try { localStorage.setItem('searchHistory', JSON.stringify(hist)); } catch {}
}
function showRecent() {
  const hist = recentSearches();
  if (!hist.length) return;
  suggestionsEl.innerHTML = `<li class="suggest-head" aria-disabled="true">Zuletzt gesucht</li>` +
    hist.map((s) => `<li data-recent="1">${esc(s)}</li>`).join('');
  suggestionsEl.hidden = false;
  suggestionsEl.querySelectorAll('li[data-recent]').forEach((li) =>
    li.addEventListener('click', () => { searchInput.value = li.textContent; hideSuggestions(); navigateWith({ q: li.textContent }); }));
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = searchInput.value.trim();
  rememberSearch(q);
  hideSuggestions();
  navigateWith({ q });
});
searchInput.addEventListener('focus', () => { if (searchInput.value.trim().length < 2) showRecent(); });
searchInput.addEventListener('input', () => {
  clearTimeout(suggestTimer);
  const q = searchInput.value.trim();
  if (q.length < 2) return hideSuggestions();
  suggestTimer = setTimeout(async () => {
    const data = await api('/suggest?q=' + encodeURIComponent(q));
    if (!data.items.length) return hideSuggestions();
    suggestionsEl.innerHTML = data.items.map((s) => `<li>${esc(s)}</li>`).join('');
    suggestionsEl.hidden = false;
    suggestionsEl.querySelectorAll('li').forEach((li) =>
      li.addEventListener('click', () => { searchInput.value = li.textContent; rememberSearch(li.textContent); hideSuggestions(); navigateWith({ q: li.textContent }); }));
  }, 160);
});
document.addEventListener('click', (e) => { if (!searchForm.contains(e.target)) hideSuggestions(); });
function hideSuggestions() { suggestionsEl.hidden = true; suggestionsEl.innerHTML = ''; }

// ---- Newsletter signup ----
const newsletterForm = document.getElementById('newsletter-form');
newsletterForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('newsletter-email').value.trim();
  const fb = document.getElementById('newsletter-feedback');
  const r = await send('POST', '/newsletter', { email });
  if (r.subscribed) { fb.textContent = '✅ Danke! Du erhältst künftig die besten Deals.'; newsletterForm.reset(); }
  else fb.textContent = '⚠️ ' + (r.error || 'Bitte gültige E-Mail eingeben.');
});

// ---- Theme toggle ----
const themeToggle = document.getElementById('theme-toggle');
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  themeToggle.textContent = t === 'dark' ? '☀️' : '🌙';
  try { localStorage.setItem('theme', t); } catch {}
}
themeToggle.addEventListener('click', () =>
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
(function initTheme() {
  let saved;
  try { saved = localStorage.getItem('theme'); } catch {}
  applyTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
})();

// ---- Router ----
function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const params = Object.fromEntries(new URLSearchParams(qs || ''));
  return { path, params };
}
async function route() {
  const { path, params } = parseHash();
  window.scrollTo(0, 0);
  try {
    if (path.startsWith('product/')) return await viewProduct(path.split('/')[1]);
    if (path === 'deals') return await viewDeals();
    if (path === 'vergleich') return await viewCompare(params);
    if (path === 'haendler') return await viewMerchants();
    if (path === 'faq') return viewFaq();
    if (path === 'konto') return viewAccount();
    if (path === 'wishlist') return await viewWishlist();
    if (path === 'alerts') return await viewAlerts();
    // default: catalog (home + search + filters)
    if (params.q) searchInput.value = params.q;
    return await viewCatalog(params);
  } catch (e) {
    app.innerHTML = emptyState('Etwas ist schiefgelaufen: ' + e.message);
  } finally {
    renderCompareBar();
  }
}
window.addEventListener('hashchange', route);

// ---- Service worker registration (PWA / offline) ----
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* offline support optional */ });
  });
}

// ---- Boot ----
(async function init() {
  await refreshUser();
  refreshWishlistBadge();
  try {
    const meta = await api('/meta');
    document.getElementById('meta-line').textContent =
      `${meta.count} Produkte · ${meta.merchants.length} Händler · Stand ${meta.generatedAt} · Währung ${meta.currency}`;
  } catch {}
  if (!location.hash) location.hash = '#/';
  route();
})();
