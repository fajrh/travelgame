

import { createServer } from 'http';
import { randomUUID, createHash } from 'crypto';
import { EventEmitter } from 'events';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const PORT = Number.parseInt(process.env.PORT ?? '8080', 10);
const PING_INTERVAL = 30000;
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
const sockets = new Map(); // ws -> metadata
const chatHistory = [];

const WS_MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

class SimpleWebSocketServer extends EventEmitter {
  constructor(server) {
    super();
    this.server = server;
    this.clients = new Set();

    server.on('upgrade', (request, socket, head) => {
      if (!request.headers.upgrade || request.headers.upgrade.toLowerCase() !== 'websocket') {
        socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        socket.destroy();
        return;
      }

      const key = request.headers['sec-websocket-key'];
      if (!key) {
        socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        socket.destroy();
        return;
      }

      const accept = createHash('sha1').update(key + WS_MAGIC).digest('base64');
      const headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${accept}`,
      ];

      const protocol = request.headers['sec-websocket-protocol'];
      if (protocol) {
        headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
      }

      headers.push('\r\n');
      socket.write(headers.join('\r\n'));

      socket.setNoDelay(true);

      const connection = new SimpleWebSocketConnection(socket);
      this.clients.add(connection);
      connection.once('close', () => this.clients.delete(connection));

      if (head && head.length > 0) {
        connection.feed(head);
      }

      this.emit('connection', connection, request);
    });
  }
}

class SimpleWebSocketConnection extends EventEmitter {
  constructor(socket) {
    super();
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.closed = false;

    socket.on('data', (chunk) => this.feed(chunk));
    socket.on('close', () => this.handleClose());
    socket.on('end', () => this.handleClose());
    socket.on('error', (error) => {
      if (!this.closed) {
        this.emit('error', error);
      }
    });
  }

  feed(chunk) {
    if (this.closed) return;
    if (!chunk || chunk.length === 0) return;

    this.buffer = Buffer.concat([this.buffer, chunk]);
    this.processBuffer();
  }

  send(data) {
    if (this.closed) return;
    const payload = Buffer.isBuffer(data) ? data : Buffer.from(String(data));
    this.writeFrame(0x1, payload);
  }

  close() {
    if (this.closed) return;
    this.writeFrame(0x8, Buffer.alloc(0));
    this.socket.end();
    this.handleClose();
  }

  terminate() {
    if (this.closed) return;
    this.socket.destroy();
    this.handleClose();
  }

  processBuffer() {
    while (this.buffer.length >= 2 && !this.closed) {
      const first = this.buffer[0];
      const second = this.buffer[1];

      const fin = (first & 0x80) === 0x80;
      const opcode = first & 0x0f;
      const masked = (second & 0x80) === 0x80;
      let payloadLength = second & 0x7f;
      let offset = 2;

      if (!masked) {
        this.close();
        return;
      }

      if (payloadLength === 126) {
        if (this.buffer.length < offset + 2) return;
        payloadLength = this.buffer.readUInt16BE(offset);
        offset += 2;
      } else if (payloadLength === 127) {
        if (this.buffer.length < offset + 8) return;
        const high = this.buffer.readUInt32BE(offset);
        const low = this.buffer.readUInt32BE(offset + 4);
        payloadLength = high * 2 ** 32 + low;
        offset += 8;
      }

      if (this.buffer.length < offset + 4 + payloadLength) {
        return;
      }

      const maskingKey = this.buffer.slice(offset, offset + 4);
      offset += 4;

      const payload = this.buffer.slice(offset, offset + payloadLength);
      this.buffer = this.buffer.slice(offset + payloadLength);

      for (let i = 0; i < payload.length; i += 1) {
        payload[i] ^= maskingKey[i % 4];
      }

      if (!fin) {
        this.close();
        return;
      }

      switch (opcode) {
        case 0x1: {
          this.emit('message', payload.toString('utf8'));
          break;
        }
        case 0x8: {
          this.close();
          return;
        }
        case 0x9: {
          this.writeFrame(0xA, payload);
          break;
        }
        case 0xA: {
          break;
        }
        default: {
          this.close();
          return;
        }
      }
    }
  }

  writeFrame(opcode, payload) {
    if (this.closed) return;

    const length = payload.length;
    let header;
    if (length < 126) {
      header = Buffer.alloc(2);
      header[0] = 0x80 | (opcode & 0x0f);
      header[1] = length;
    } else if (length < 65536) {
      header = Buffer.alloc(4);
      header[0] = 0x80 | (opcode & 0x0f);
      header[1] = 126;
      header.writeUInt16BE(length, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x80 | (opcode & 0x0f);
      header[1] = 127;
      const high = Math.floor(length / 2 ** 32);
      const low = length >>> 0;
      header.writeUInt32BE(high, 2);
      header.writeUInt32BE(low, 6);
    }

    try {
      this.socket.write(header);
      if (length > 0) {
        this.socket.write(payload);
      }
    } catch (error) {
      this.terminate();
    }
  }

  handleClose() {
    if (this.closed) return;
    this.closed = true;
    this.emit('close');
  }
}

const server = createServer((req, res) => {
  if (!req.url) {
    writeJson(res, 400, { error: 'bad_request', message: 'Missing request URL.' });
    return;
  }

  if (req.method === 'OPTIONS') {
    writeOptions(res);
    return;
  }

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  
  // API routes
  if (pathname === '/status') {
    writeJson(res, 200, {
        status: 'ok',
        uptime: process.uptime(),
        players: players.size,
        chatMessages: chatHistory.length,
        endpoints: ['/healthz', '/state'],
      });
    return;
  }
  if (pathname === '/healthz') {
    writeJson(res, 200, { status: 'ok', players: players.size });
    return;
  }
  if (pathname === '/state') {
    writeJson(res, 200, {
        players: Array.from(players.values()),
        chat: chatHistory,
      });
    return;
  }

  // Static file serving
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(distPath, requestedPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // If the file is not found, serve index.html as a fallback for client-side routing.
        fs.readFile(path.join(distPath, 'index.html'), (err, indexContent) => {
          if (err) {
            writeJson(res, 500, { error: 'internal_error', message: `Could not read index.html`});
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

const wss = new SimpleWebSocketServer(server);

wss.on('connection', (ws, request) => {
  const playerId = randomUUID();

  const clientMeta = {
    id: playerId,
    name: 'Traveler',
    isRegistered: false,
    lastPing: Date.now(),
    address: request.socket.remoteAddress ?? 'unknown',
  };

  sockets.set(ws, clientMeta);

  ws.on('message', (data) => {
    clientMeta.lastPing = Date.now();

    const raw = data.toString('utf8');
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch (error) {
      send(ws, {
        type: 'error',
        error: 'invalid_json',
        message: 'Messages must be valid JSON.',
      });
      return;
    }

    if (!payload || typeof payload.type !== 'string') {
      send(ws, {
        type: 'error',
        error: 'invalid_payload',
        message: 'Missing message type.',
      });
      return;
    }

    switch (payload.type) {
      case 'hello':
        handleHello(ws, clientMeta, payload);
        break;
      case 'update_position':
        handlePositionUpdate(ws, clientMeta, payload);
        break;
      case 'chat':
        handleChat(ws, clientMeta, payload);
        break;
      case 'pong':
        break;
      default:
        send(ws, {
          type: 'error',
          error: 'unknown_type',
          message: `Unknown message type: ${payload.type}`,
        });
    }
  });

  ws.on('close', () => {
    sockets.delete(ws);
    const player = players.get(clientMeta.id);
    if (player) {
      players.delete(clientMeta.id);
      broadcast({ type: 'player_left', id: clientMeta.id });
    }
  });

  ws.on('error', () => {
    ws.close();
  });

  send(ws, { type: 'hello_ack', id: playerId });
});

server.listen(PORT, () => {
  console.log(`multiplayer server listening on :${PORT}`);
});

setInterval(() => {
  const now = Date.now();
  for (const [ws, meta] of sockets) {
    if (now - meta.lastPing > PING_INTERVAL * 2) {
      ws.terminate();
      continue;
    }

    try {
      ws.send(JSON.stringify({ type: 'ping', timestamp: now }));
    } catch (error) {
      ws.terminate();
    }
  }
}, PING_INTERVAL);

function handleHello(ws, meta, payload) {
  const name = sanitiseName(payload.name);
  meta.name = name; // Always update the name in the socket metadata

  const player = players.get(meta.id);

  const playerStateData = {
    id: meta.id,
    name,
    x: clampNumber(payload.x ?? 0, -5000, 5000),
    y: clampNumber(payload.y ?? 0, -5000, 5000),
    zone: typeof payload.zone === 'string' ? payload.zone.slice(0, 32) : 'arrival',
    direction:
      typeof payload.direction === 'string' ? payload.direction.slice(0, 32) : 'down',
    emoji: typeof payload.emoji === 'string' ? payload.emoji.slice(0, 16) : '🧳',
    lastUpdated: Date.now(),
  };

  if (meta.isRegistered && player) {
    // This is an update (e.g., name change).
    Object.assign(player, playerStateData);
    // Use player_moved to broadcast the full update to all clients
    broadcast({ type: 'player_moved', player });
    return;
  }
  
  // This is a new registration.
  meta.isRegistered = true;
  players.set(meta.id, playerStateData);

  send(ws, {
    type: 'welcome',
    self: playerStateData,
    players: Array.from(players.values()),
    chat: chatHistory,
  });

  broadcastExcept(ws, {
    type: 'player_joined',
    player: playerStateData,
  });
}

function handlePositionUpdate(ws, meta, payload) {
  if (!meta.isRegistered) {
    send(ws, {
      type: 'error',
      error: 'not_registered',
      message: 'Send a hello message first.',
    });
    return;
  }

  const player = players.get(meta.id);
  if (!player) {
    return;
  }

  const x = clampNumber(payload.x, -5000, 5000, player.x);
  const y = clampNumber(payload.y, -5000, 5000, player.y);
  const zone = typeof payload.zone === 'string' ? payload.zone.slice(0, 32) : player.zone;
  const direction =
    typeof payload.direction === 'string' ? payload.direction.slice(0, 32) : player.direction;

  Object.assign(player, {
    x,
    y,
    zone,
    direction,
    lastUpdated: Date.now(),
  });

  broadcastExcept(ws, {
    type: 'player_moved',
    player,
  });
}

function handleChat(ws, meta, payload) {
  if (!meta.isRegistered) {
    send(ws, {
      type: 'error',
      error: 'not_registered',
      message: 'Send a hello message first.',
    });
    return;
  }

  const message = sanitiseMessage(payload.message);
  if (!message) {
    send(ws, {
      type: 'error',
      error: 'empty_message',
      message: 'Chat messages must contain text.',
    });
    return;
  }

  const entry = {
    id: randomUUID(),
    playerId: meta.id,
    name: meta.name,
    message,
    timestamp: Date.now(),
  };

  chatHistory.push(entry);
  if (chatHistory.length > CHAT_HISTORY_LIMIT) {
    chatHistory.splice(0, chatHistory.length - CHAT_HISTORY_LIMIT);
  }

  broadcast({ type: 'chat', entry });
}

function broadcast(message) {
  const payload = JSON.stringify(message);
  for (const ws of sockets.keys()) {
    try {
      ws.send(payload);
    } catch (error) {
      ws.terminate();
    }
  }
}

function broadcastExcept(except, message) {
  const payload = JSON.stringify(message);
  for (const ws of sockets.keys()) {
    if (ws === except) continue;
    try {
      ws.send(payload);
    } catch (error) {
      ws.terminate();
    }
  }
}

function send(ws, message) {
  try {
    ws.send(JSON.stringify(message));
  } catch (error) {
    ws.terminate();
  }
}

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
  const { allowBody = true, headers = {} } = options;
  const body = JSON.stringify(payload);
  const responseHeaders = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, HEAD, OPTIONS',
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
    'access-control-allow-methods': 'GET, HEAD, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'content-length': '0',
  });
  res.end();
}
