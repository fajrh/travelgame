import { createServer } from 'http';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const PORT = Number.parseInt(process.env.PORT ?? '8080', 10);
const PLAYER_TIMEOUT = 15000; // 15 seconds
const CHAT_HISTORY_LIMIT = 100;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '..', 'dist');

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

async function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', (err) => {
            reject(err);
        });
    });
}

const server = createServer(async (req, res) => {
    if (!req.url) {
        return writeJson(res, 400, { error: 'bad_request' });
    }
     if (req.method === 'OPTIONS') {
        return writeOptions(res);
    }

    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    // API Routes
    if (pathname === '/state') {
        return writeJson(res, 200, {
            players: Array.from(players.values()),
            chat: chatHistory,
        });
    }

    if (pathname === '/update' && req.method === 'POST') {
        try {
            const payload = await parseJsonBody(req);
            if (!payload.id) return writeJson(res, 400, { error: 'missing_id' });

            const player = players.get(payload.id) || {};
            
            Object.assign(player, {
                id: payload.id,
                name: sanitiseName(payload.name),
                emoji: typeof payload.emoji === 'string' ? payload.emoji.slice(0, 16) : '🧍',
                x: clampNumber(payload.x, -5000, 5000, 0),
                y: clampNumber(payload.y, -5000, 5000, 0),
                zone: typeof payload.zone === 'string' ? payload.zone.slice(0, 32) : 'arrival',
                direction: typeof payload.direction === 'string' ? payload.direction.slice(0, 32) : 'down',
                lastUpdated: Date.now(),
            });
            
            players.set(payload.id, player);

            return writeJson(res, 200, { status: 'ok' });
        } catch (error) {
            return writeJson(res, 400, { error: 'invalid_json' });
        }
    }

    if (pathname === '/chat' && req.method === 'POST') {
        try {
            const payload = await parseJsonBody(req);
            const message = sanitiseMessage(payload.message);

            if (!message || !payload.id || !payload.name) {
                return writeJson(res, 400, { error: 'invalid_chat_payload' });
            }
            
            const entry = {
                id: randomUUID(),
                playerId: payload.id,
                name: sanitiseName(payload.name),
                message,
                timestamp: Date.now(),
            };

            chatHistory.push(entry);
            if (chatHistory.length > CHAT_HISTORY_LIMIT) {
                chatHistory.splice(0, chatHistory.length - CHAT_HISTORY_LIMIT);
            }

            return writeJson(res, 200, { status: 'ok' });
        } catch (error) {
            return writeJson(res, 400, { error: 'invalid_json' });
        }
    }
    
    // Static file serving for other routes
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
  console.log(`Polling server listening on :${PORT}`);
});

// Cleanup inactive players
setInterval(() => {
  const now = Date.now();
  for (const [id, player] of players.entries()) {
    if (now - player.lastUpdated > PLAYER_TIMEOUT) {
      players.delete(id);
    }
  }
}, 5000);


// --- Utility Functions ---

function sanitiseName(name) {
  if (typeof name !== 'string') return 'Traveler';
  return name.trim().replace(/\s+/g, ' ').slice(0, 24) || 'Traveler';
}

function sanitiseMessage(message) {
  if (typeof message !== 'string') return '';
  return message.replace(/[\r\n\t]+/g, ' ').trim().slice(0, 280);
}

function clampNumber(value, min, max, fallback = 0) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

function writeJson(res, statusCode, payload, options = {}) {
  const { headers = {} } = options;
  const body = JSON.stringify(payload);
  const responseHeaders = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, HEAD, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'content-length': Buffer.byteLength(body).toString(),
    ...headers,
  };

  res.writeHead(statusCode, responseHeaders);
  res.end(body);
}

function writeOptions(res) {
  res.writeHead(204, {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, HEAD, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'content-length': '0',
  });
  res.end();
}