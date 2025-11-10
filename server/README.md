# Multiplayer Server

This directory contains the lightweight Node.js polling server that keeps the
travel game in sync across players. Instead of WebSockets, the server persists
all player locations and chat history to `chatlog.txt` (a JSON file) and writes
an updated snapshot at least every five seconds. Clients simply POST their
changes and poll the file on a steady cadence.

## Running locally

```bash
npm install
npm start
```

The server listens on the port in the `PORT` environment variable (defaults to
`8080`). When deploying to services such as Google Cloud Run or App Engine, the
provided `npm start` script satisfies their expectations for a startup command.

## HTTP endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | `GET` | Summary with current lobby counts and available endpoints. |
| `/healthz` | `GET` | Liveness probe that reports the number of tracked players. |
| `/state` | `GET` | Returns the same JSON payload that is written to `chatlog.txt`. |
| `/chatlog.txt` | `GET` | Direct access to the persisted JSON file containing players and chat. |
| `/update` | `POST` | Accepts the player's latest position, city, emoji, etc. |
| `/chat` | `POST` | Adds a chat entry for the sender's current city. |

All responses include permissive CORS headers, and the server will also reply to
`OPTIONS` requests for observability tooling.

## State persistence

The server keeps an in-memory snapshot of players and the most recent chat
messages. Every change marks the state as "dirty", triggering a write to
`chatlog.txt` within five seconds (or immediately when `/chatlog.txt` or
`/state` is requested). Each record contains:

- Player ID, name, emoji, coordinates, facing direction, zone, and city.
- Chat message ID, author, timestamp, city, and the sanitised text.

Stale players that stop checking in are automatically removed after 15 seconds
of inactivity so the log stays accurate.

## Polling workflow

Clients follow a simple loop:

1. POST `/update` with their latest position, emoji, and city information.
2. Fetch `/chatlog.txt` to receive the complete snapshot for their city.
3. POST `/chat` whenever the user submits a new message.

This approach keeps deployment friction low while still supporting a shared
multiplayer experience.
