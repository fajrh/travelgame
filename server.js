const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let players = {};
const playerColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#F0E68C', '#F7CAC9', '#92A8D1'];

function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

function broadcastToOthers(ws, data) {
    wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

wss.on('connection', (ws) => {
    const playerId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const playerColor = playerColors[Math.floor(Math.random() * playerColors.length)];
    
    // Send initial data to the new player
    ws.send(JSON.stringify({
        type: 'init',
        playerId: playerId,
        players: players
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'login':
                    players[playerId] = {
                        id: playerId,
                        name: data.name,
                        x: data.x,
                        y: data.y,
                        isFacingRight: false,
                        color: playerColor
                    };
                    broadcastToOthers(ws, { type: 'player_joined', player: players[playerId] });
                    console.log(`Player ${data.name} (${playerId}) joined.`);
                    break;

                case 'move':
                    if (players[playerId]) {
                        players[playerId].x = data.x;
                        players[playerId].y = data.y;
                        players[playerId].isFacingRight = data.isFacingRight;
                        broadcastToOthers(ws, { type: 'player_moved', id: playerId, x: data.x, y: data.y, isFacingRight: data.isFacingRight });
                    }
                    break;
                
                case 'chat':
                    if (players[playerId]) {
                         broadcast({ type: 'chat_message', id: playerId, name: players[playerId].name, text: data.text, color: players[playerId].color });
                    }
                    break;
            }
        } catch (error) {
            console.error('Failed to parse message or handle client data:', error);
        }
    });

    ws.on('close', () => {
        if (players[playerId]) {
            console.log(`Player ${players[playerId].name} (${playerId}) disconnected.`);
            delete players[playerId];
            broadcast({ type: 'player_left', id: playerId });
        }
    });
    
    ws.on('error', (error) => {
        console.error(`WebSocket error for player ${playerId}:`, error);
    });
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
