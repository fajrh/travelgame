# Multiplayer Server

This directory contains the lightweight Node.js WebSocket server that keeps the travel game in sync across players. It relies solely on built-in Node.js modules, so no additional dependencies are required beyond the tooling already used for the frontend.

## Running locally

```bash
npm install
npm start
```

The server listens on the port in the `PORT` environment variable (defaults to `8080`). When deploying to services such as Google Cloud Run or App Engine, the provided `npm start` script satisfies their expectations for a startup command.

## HTTP endpoints

| Endpoint   | Description |
|------------|-------------|
| `GET /` or `GET /status` | Returns a short summary with current lobby counts and available endpoints. |
| `GET /healthz` | Liveness probe that reports the number of tracked players. |
| `GET /state` | Returns the current list of players and recent chat messages. |

All responses include permissive CORS headers, and the server will also reply to `HEAD` and `OPTIONS` requests for observability tooling.

## WebSocket contract

1. **Connect** to `ws://<host>:<port>`.
2. **Send** a `hello` message to register:
   ```json
   {
     "type": "hello",
     "name": "Traveler",
     "x": 0,
     "y": 0,
     "zone": "arrival",
     "direction": "down",
     "emoji": "🧳"
   }
   ```
3. The server responds with `welcome`, the current lobby snapshot, and continues to broadcast:
   - `player_joined`
   - `player_moved`
   - `player_left`
   - `chat`

Send `update_position` and `chat` messages to share movement updates or IRC-style chat lines with the rest of the room.

The server periodically emits `ping` messages; reply with a `pong` payload to keep the connection active if the client is idle.