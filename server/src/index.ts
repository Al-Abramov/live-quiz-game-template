import { WebSocketServer } from 'ws';
import { handlerMessage } from './handlers/mainHandler';
import { GAMES, USERS, WS_TO_USER } from './store/store';
import { broadcastGame } from './utils';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// WebSocket server
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', (ws) => {
  console.log('Connected');

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg.toString());

      handlerMessage(ws, data);
    } catch (error) {
      console.log('Invalid JSON');
      return;
    }
  });

  ws.on('close', () => {
    const userName = WS_TO_USER.get(ws);
    const user = USERS.get(userName || '');

    if (!user) return;

    for (const game of GAMES.values()) {
      game.players = game.players.filter((p) => p.index !== user?.index);

      broadcastGame(
        game,
        'update_players',
        game.players.map(({ index, name, score }) => {
          return {
            name,
            index,
            score,
          };
        }),
      );
    }

    WS_TO_USER.delete(ws);
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
