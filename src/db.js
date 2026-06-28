// Single source of truth for the JSON file store. Both store.js (wishlist,
// alerts, newsletter) and auth.js (users, sessions) read/write through here so
// they never clobber each other's keys. The file lives at data/store.json and
// is gitignored. Node is single-threaded, so read-modify-write is atomic enough
// for this prototype.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const storeFile = join(__dirname, '..', 'data', 'store.json');

const DEFAULTS = { alerts: [], wishlist: {}, newsletter: [], users: {}, sessions: {} };

export function readState() {
  if (!existsSync(storeFile)) return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(readFileSync(storeFile, 'utf8')) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function writeState(state) {
  writeFileSync(storeFile, JSON.stringify(state, null, 2));
}
