import { createServer } from 'node:http';
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PORT = Number.parseInt(process.env.PORT ?? '8787', 10);
const ONLINE_WINDOW_MS = 65_000;
const SAVE_INTERVAL_MS = 60_000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');
const IP_LOG_FILE = path.join(DATA_DIR, 'player-ips.log');

/** @type {Map<string, PlayerRecord>} */
const players = new Map();
let dirty = false;

await mkdir(DATA_DIR, { recursive: true });
await loadPlayers();

const server = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');

  if (!req.url) {
    writeJson(res, 400, { error: 'bad_request' });
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const { pathname, searchParams } = new URL(req.url, 'http://localhost');

  if (pathname === '/api/player' && req.method === 'GET') {
    const id = searchParams.get('id');
    if (!id) {
      writeJson(res, 400, { error: 'missing_id' });
      return;
    }

    const profile = players.get(id) ?? null;
    writeJson(res, 200, { profile: profile ? serialiseProfile(profile) : null });
    return;
  }

  if (pathname === '/api/player' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      if (!payload || typeof payload.id !== 'string') {
        writeJson(res, 400, { error: 'missing_id' });
        return;
      }

      const now = Date.now();
      const id = payload.id.trim();
      const name = sanitiseName(payload.name);
      const avatar = sanitiseAvatar(payload.avatar);
      const balance = sanitiseBalance(payload.balance);
      const locationId = sanitiseLocation(payload.locationId);
      const visitedLocationIds = sanitiseStringArray(payload.visitedLocationIds);
      const souvenirs = sanitiseStringArray(payload.souvenirs);
      const ip = extractIp(req.headers['x-forwarded-for'], req.socket.remoteAddress);

      const record = {
        id,
        name,
        avatar,
        balance,
        locationId,
        visitedLocationIds,
        souvenirs,
        updatedAt: now,
        lastSeen: now,
        ip,
      };

      players.set(id, record);
      markDirty();
      logIp(id, ip).catch((error) => {
        console.warn('Failed to log player IP', error);
      });

      writeJson(res, 200, { status: 'ok' });
    } catch (error) {
      writeJson(res, 400, { error: 'invalid_json' });
    }
    return;
  }

  if (pathname === '/api/players/online' && req.method === 'GET') {
    const now = Date.now();
    const count = Array.from(players.values()).filter((player) => now - player.lastSeen <= ONLINE_WINDOW_MS).length;
    writeJson(res, 200, { count });
    return;
  }

  writeJson(res, 404, { error: 'not_found' });
});

server.listen(PORT, () => {
  console.log(`Travel Game server listening on http://localhost:${PORT}`);
});

setInterval(() => {
  persistPlayers().catch((error) => {
    console.error('Failed to save player data', error);
  });
}, SAVE_INTERVAL_MS).unref();

process.on('SIGINT', async () => {
  try {
    await persistPlayers(true);
  } finally {
    process.exit(0);
  }
});

process.on('SIGTERM', async () => {
  try {
    await persistPlayers(true);
  } finally {
    process.exit(0);
  }
});

function serialiseProfile(record) {
  const { id, name, avatar, balance, locationId, visitedLocationIds, souvenirs, updatedAt } = record;
  return { id, name, avatar, balance, locationId, visitedLocationIds, souvenirs, updatedAt };
}

function sanitiseName(value) {
  if (typeof value !== 'string') {
    return 'Traveler';
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Traveler';
  }
  return trimmed.slice(0, 40);
}

function sanitiseAvatar(value) {
  if (typeof value !== 'string') {
    return '🛫';
  }
  return value.trim().slice(0, 16) || '🛫';
}

function sanitiseBalance(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return 0;
  }
  return Math.max(0, Math.round(number));
}

function sanitiseLocation(value) {
  if (typeof value !== 'string') {
    return 'initial';
  }
  return value.trim().slice(0, 64) || 'initial';
}

function sanitiseStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set();
  const result = [];
  for (const item of value) {
    const entry = typeof item === 'string' ? item.slice(0, 96) : String(item);
    if (!seen.has(entry)) {
      seen.add(entry);
      result.push(entry);
    }
  }
  return result;
}

async function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req
      .on('data', (chunk) => {
        data += chunk.toString();
      })
      .on('end', () => {
        try {
          resolve(data ? JSON.parse(data) : {});
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}

function writeJson(res, status, payload) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function markDirty() {
  dirty = true;
}

async function persistPlayers(force = false) {
  if (!dirty && !force) {
    return;
  }
  dirty = false;
  const serialised = {
    savedAt: Date.now(),
    players: Array.from(players.values()),
  };
  await writeFile(PLAYERS_FILE, JSON.stringify(serialised, null, 2), 'utf8');
}

async function loadPlayers() {
  try {
    const raw = await readFile(PLAYERS_FILE, 'utf8');
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.players)) {
      for (const entry of data.players) {
        if (!entry || typeof entry !== 'object') {
          continue;
        }
        const id = typeof entry.id === 'string' ? entry.id : undefined;
        if (!id) {
          continue;
        }
        players.set(id, {
          id,
          name: sanitiseName(entry.name),
          avatar: sanitiseAvatar(entry.avatar),
          balance: sanitiseBalance(entry.balance),
          locationId: sanitiseLocation(entry.locationId),
          visitedLocationIds: sanitiseStringArray(entry.visitedLocationIds),
          souvenirs: sanitiseStringArray(entry.souvenirs),
          updatedAt: typeof entry.updatedAt === 'number' ? entry.updatedAt : Date.now(),
          lastSeen: Date.now(),
          ip: typeof entry.ip === 'string' ? entry.ip : 'unknown',
        });
      }
    }
  } catch (error) {
    // File may not exist on first run; ignore errors
  }
}

async function logIp(id, ip) {
  const line = `${new Date().toISOString()}\t${id}\t${ip}\n`;
  await appendFile(IP_LOG_FILE, line, 'utf8');
}

function extractIp(forwardedForHeader, remoteAddress) {
  if (typeof forwardedForHeader === 'string' && forwardedForHeader.trim().length > 0) {
    return forwardedForHeader.split(',')[0].trim();
  }
  return remoteAddress ?? 'unknown';
}

/**
 * @typedef {Object} PlayerRecord
 * @property {string} id
 * @property {string} name
 * @property {string} avatar
 * @property {number} balance
 * @property {string} locationId
 * @property {string[]} visitedLocationIds
 * @property {string[]} souvenirs
 * @property {number} updatedAt
 * @property {number} lastSeen
 * @property {string} ip
 */
