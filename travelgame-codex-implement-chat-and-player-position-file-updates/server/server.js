import { createServer } from 'http';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const PORT = Number.parseInt(process.env.PORT ?? '8080', 10);
const PLAYER_TIMEOUT = 15000; // 15 seconds
const CHAT_HISTORY_LIMIT = 100;
const SAVE_INTERVAL = 5000; // Persist state at least every 5 seconds

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');
const DATA_FILE = path.resolve(__dirname, 'chatlog.txt');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

const players = new Map(); // id -> player state
const chatHistory = [];
let dirty = false;

loadStateFromDisk();

const server = createServer(async (req, res) => {
  if (!req.url) {
    writeJson(res, 400, { error: 'bad_request', message: 'Missing request URL.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    writeOptions(res);
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // --- API Routes ---
  if (pathname === '/status') {
    const state = getSerializableState();
    writeJson(res, 200, {
      status: 'ok',
      uptime: process.uptime(),
      players: state.players.length,
      chatMessages: state.chat.length,
      endpoints: ['/healthz', '/state', '/chatlog.txt', '/update', '/chat'],
    });
    return;
  }

  if (pathname === '/healthz') {
    const state = getSerializableState();
    writeJson(res, 200, { status: 'ok', players: state.players.length });
    return;
  }

  if (pathname === '/state') {
    const state = persistStateToDisk();
    writeJson(res, 200, state);
    return;
  }

  if (pathname === '/chatlog.txt') {
    const state = persistStateToDisk();
    writeJson(res, 200, state, {
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
    return;
  }

  if (pathname === '/update' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      if (!payload || typeof payload.id !== 'string') {
        writeJson(res, 400, { error: 'missing_id' });
        return;
      }

      const now = Date.now();
      const playerId = payload.id;
      const name = sanitiseName(payload.name);
      const emoji = typeof payload.emoji === 'string' ? payload.emoji.slice(0, 16) : '🧍';
      const zone = typeof payload.zone === 'string' ? payload.zone.slice(0, 32) : 'arrival';
      const city = sanitiseCity(payload.city, zone);
      const direction = typeof payload.direction === 'string' ? payload.direction.slice(0, 32) : 'down';

      const existing = players.get(playerId);
      const player = existing ?? {
        id: playerId,
        name: 'Traveler',
        emoji: '🧍',
        x: 0,
        y: 0,
        zone: 'arrival',
        city: 'Toronto',
        direction: 'down',
        lastUpdated: now,
      };

      const x = clampNumber(payload.x, -5000, 5000, player.x);
      const y = clampNumber(payload.y, -5000, 5000, player.y);

      Object.assign(player, {
        name,
        emoji,
        x,
        y,
        zone,
        city,
        direction,
        lastUpdated: now,
      });

      players.set(playerId, player);
      markDirty();

      writeJson(res, 200, { status: 'ok' });
    } catch (error) {
      writeJson(res, 400, { error: 'invalid_json', message: 'Unable to parse request body.' });
    }
    return;
  }

  if (pathname === '/chat' && req.method === 'POST') {
    try {
      const payload = await parseJsonBody(req);
      if (!payload || typeof payload.id !== 'string') {
        writeJson(res, 400, { error: 'missing_id' });
        return;
      }

      const message = sanitiseMessage(payload.message);
      if (!message) {
        writeJson(res, 400, { error: 'empty_message' });
        return;
      }

      const playerId = payload.id;
      const name = sanitiseName(payload.name);
      const zone = typeof payload.zone === 'string' ? payload.zone.slice(0, 32) : players.get(playerId)?.zone ?? 'arrival';
      const city = sanitiseCity(payload.city, zone);
      const timestamp = Date.now();

      const entry = {
        id: randomUUID(),
        playerId,
        name,
        message,
        zone,
        city,
        timestamp,
      };

      chatHistory.push(entry);
      if (chatHistory.length > CHAT_HISTORY_LIMIT) {
        chatHistory.splice(0, chatHistory.length - CHAT_HISTORY_LIMIT);
      }

      const player = players.get(playerId);
      if (player) {
        player.lastUpdated = timestamp;
        player.zone = zone;
        player.city = city;
      }

      markDirty();
      writeJson(res, 200, { status: 'ok' });
    } catch (error) {
      writeJson(res, 400, { error: 'invalid_json', message: 'Unable to parse request body.' });
    }
    return;
  }

  // --- Static asset handling ---
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(distPath, requestedPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        fs.readFile(path.join(distPath, 'index.html'), (err, indexContent) => {
          if (err) {
            writeJson(res, 500, { error: 'internal_error', message: 'Could not read index.html' });
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        writeJson(res, 500, { error: 'internal_error', message: `Server error: ${error.code}` });
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`multiplayer server listening on :${PORT}`);
});

setInterval(() => {
  pruneStalePlayers();
  if (dirty) {
    try {
      persistStateToDisk();
    } catch (error) {
      console.error('Failed to persist state', error);
    }
  } else if (!fs.existsSync(DATA_FILE)) {
    try {
      persistStateToDisk();
    } catch (error) {
      console.error('Failed to create initial state file', error);
    }
  }
}, SAVE_INTERVAL);

// --- Helper functions ---

function loadStateFromDisk() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      persistStateToDisk({ players: [], chat: [], updatedAt: Date.now() });
      return;
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    if (!raw) return;

    const data = JSON.parse(raw);
    if (Array.isArray(data.players)) {
      data.players.forEach((p) => {
        if (!p || typeof p.id !== 'string') return;
        players.set(p.id, {
          id: p.id,
          name: sanitiseName(p.name),
          emoji: typeof p.emoji === 'string' ? p.emoji.slice(0, 16) : '🧍',
          x: clampNumber(p.x, -5000, 5000, 0),
          y: clampNumber(p.y, -5000, 5000, 0),
          zone: typeof p.zone === 'string' ? p.zone.slice(0, 32) : 'arrival',
          city: sanitiseCity(p.city, p.zone),
          direction: typeof p.direction === 'string' ? p.direction.slice(0, 32) : 'down',
          lastUpdated: typeof p.lastUpdated === 'number' ? p.lastUpdated : Date.now(),
        });
      });
    }

    if (Array.isArray(data.chat)) {
      data.chat.forEach((entry) => {
        if (!entry || typeof entry.id !== 'string') return;
        chatHistory.push({
          id: entry.id,
          playerId: typeof entry.playerId === 'string' ? entry.playerId : 'unknown',
          name: sanitiseName(entry.name),
          message: sanitiseMessage(entry.message),
          zone: typeof entry.zone === 'string' ? entry.zone.slice(0, 32) : 'arrival',
          city: sanitiseCity(entry.city, entry.zone),
          timestamp: typeof entry.timestamp === 'number' ? entry.timestamp : Date.now(),
        });
      });
      if (chatHistory.length > CHAT_HISTORY_LIMIT) {
        chatHistory.splice(0, chatHistory.length - CHAT_HISTORY_LIMIT);
      }
    }
  } catch (error) {
    console.error('Failed to load state file', error);
  }
}

function getSerializableState() {
  pruneStalePlayers();
  return {
    updatedAt: Date.now(),
    players: Array.from(players.values()).map((player) => ({
      id: player.id,
      name: player.name,
      emoji: player.emoji,
      x: player.x,
      y: player.y,
      zone: player.zone,
      city: player.city,
      direction: player.direction,
      lastUpdated: player.lastUpdated,
    })),
    chat: chatHistory.slice(-CHAT_HISTORY_LIMIT),
  };
}

function persistStateToDisk(state = null) {
  const snapshot = state ?? getSerializableState();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
    dirty = false;
  } catch (error) {
    console.error('Failed to write state file', error);
  }
  return snapshot;
}

function pruneStalePlayers() {
  const now = Date.now();
  let removed = false;
  for (const [id, player] of players) {
    if (now - player.lastUpdated > PLAYER_TIMEOUT) {
      players.delete(id);
      removed = true;
    }
  }
  if (removed) {
    markDirty();
  }
}

function markDirty() {
  dirty = true;
}

function sanitiseName(name) {
  if (typeof name !== 'string') return 'Traveler';
  return name.trim().replace(/\s+/g, ' ').slice(0, 24) || 'Traveler';
}

function sanitiseMessage(message) {
  if (typeof message !== 'string') return '';
  return message.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 280);
}

function sanitiseCity(city, zone) {
  if (typeof city === 'string' && city.trim()) {
    return city.trim().slice(0, 64);
  }
  if (zone === 'arrival') {
    return 'Toronto';
  }
  if (typeof zone === 'string' && zone.trim()) {
    return zone.trim().slice(0, 64);
  }
  return 'Toronto';
}

function clampNumber(value, min, max, fallback = 0) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', (error) => reject(error));
  });
}

function writeJson(res, statusCode, payload, options = {}) {
  const { allowBody = true, headers = {} } = options;
  const body = JSON.stringify(payload);
  const responseHeaders = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    ...headers,
  };

  if (allowBody) {
    responseHeaders['content-length'] = Buffer.byteLength(body).toString();
  }

  res.writeHead(statusCode, responseHeaders);
  res.end(allowBody ? body : undefined);
}

function writeOptions(res) {
  res.writeHead(204, {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'content-length': '0',
  });
  res.end();
}
