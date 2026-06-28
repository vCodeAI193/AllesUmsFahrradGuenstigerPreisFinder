// Real user accounts with secure password hashing (scrypt) and opaque session
// tokens. No external dependencies — everything uses node:crypto. Users and
// sessions are persisted in the shared JSON store (data/store.json).

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { readState, writeState } from './db.js';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

// Public view of a user (never leaks the password hash).
function publicUser(u) {
  return { email: u.email, name: u.name, createdAt: u.createdAt, prefs: u.prefs || {} };
}

function newToken() {
  return randomBytes(24).toString('hex');
}

export function register({ email, password, name }) {
  email = String(email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw new Error('Ungültige E-Mail-Adresse');
  if (String(password || '').length < 6) throw new Error('Passwort muss mindestens 6 Zeichen haben');
  const state = readState();
  if (state.users[email]) throw new Error('E-Mail ist bereits registriert');
  const user = {
    email,
    name: String(name || '').trim() || email.split('@')[0],
    password: hashPassword(password),
    createdAt: '2026-06-27',
    prefs: {},
  };
  state.users[email] = user;
  const token = newToken();
  state.sessions[token] = { email, createdAt: '2026-06-27' };
  writeState(state);
  return { token, user: publicUser(user) };
}

export function login({ email, password }) {
  email = String(email || '').trim().toLowerCase();
  const state = readState();
  const user = state.users[email];
  if (!user || !verifyPassword(password, user.password)) throw new Error('E-Mail oder Passwort ist falsch');
  const token = newToken();
  state.sessions[token] = { email, createdAt: '2026-06-27' };
  writeState(state);
  return { token, user: publicUser(user) };
}

export function logout(token) {
  const state = readState();
  if (state.sessions[token]) {
    delete state.sessions[token];
    writeState(state);
  }
  return { ok: true };
}

// Resolves a bearer token to the account email, or null if invalid.
export function emailFromToken(token) {
  if (!token) return null;
  const session = readState().sessions[token];
  return session ? session.email : null;
}

// Removes the account and all its sessions (used by GDPR erasure).
export function deleteAccount(email) {
  const state = readState();
  delete state.users[email];
  for (const [token, s] of Object.entries(state.sessions)) {
    if (s.email === email) delete state.sessions[token];
  }
  writeState(state);
  return { ok: true };
}

export function getProfile(email) {
  const user = readState().users[email];
  return user ? publicUser(user) : null;
}

export function updateProfile(email, { name, prefs }) {
  const state = readState();
  const user = state.users[email];
  if (!user) throw new Error('Nicht angemeldet');
  if (typeof name === 'string' && name.trim()) user.name = name.trim();
  if (prefs && typeof prefs === 'object') user.prefs = { ...user.prefs, ...prefs };
  writeState(state);
  return publicUser(user);
}
