// Price analytics: statistics over a price history and a "good price" rating.
// Pure functions, no I/O — easy to unit test.

export function priceStats(history) {
  const prices = history.map((h) => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  return {
    min: round2(min),
    max: round2(max),
    avg: round2(avg),
    current: prices[prices.length - 1],
  };
}

// Rates the current lowest price against its own history.
// Returns one of: 'bestprice' | 'guter Preis' | 'durchschnittlich' | 'eher teuer'
export function ratePrice(history) {
  const { min, max, avg, current } = priceStats(history);
  if (max === min) return { rating: 'durchschnittlich', percentBelowAvg: 0, isAllTimeLow: true };
  const percentBelowAvg = round2(((avg - current) / avg) * 100);
  const isAllTimeLow = current <= min + 0.001;
  let rating;
  if (isAllTimeLow) rating = 'bestprice';
  else if (current <= avg * 0.95) rating = 'guter Preis';
  else if (current <= avg * 1.05) rating = 'durchschnittlich';
  else rating = 'eher teuer';
  return { rating, percentBelowAvg, isAllTimeLow };
}

// Discount of the current lowest price vs. the recommended retail price (rrp).
export function discountVsRrp(rrp, lowestPrice) {
  if (!rrp || rrp <= lowestPrice) return 0;
  return Math.round(((rrp - lowestPrice) / rrp) * 100);
}

// Picks the cheapest offer by total price (price + shipping), preferring in-stock.
export function bestOffer(offers) {
  const inStock = offers.filter((o) => o.inStock);
  const pool = inStock.length ? inStock : offers;
  return [...pool].sort((a, b) => a.total - b.total)[0];
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
