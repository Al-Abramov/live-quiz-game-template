import { WebSocketType } from '../types';
import { CODE_TO_GAME, GAMES } from '../store/store';
import { broadcastGame, getUserByWs, sendError } from '../utils';

export const joinGameHandler = (ws: WebSocketType, data: any) => {
  const gameId = CODE_TO_GAME.get(data.code);

  if (!gameId) {
    console.log('Game not found');
    sendError(ws, 'Game not found');
    return;
  }

  const game = GAMES.get(gameId);

  if (!game) {
    console.log('Game missing');
    sendError(ws, 'Game missing');
    return;
  }

  const user = getUserByWs(ws);

  if (!user) {
    console.log('User not found');
    sendError(ws, 'User not found');
    return;
  }

  // if (game.status !== 'waiting') {
  //   console.log('Game already started');
  //   return;
  // }

  const existingPlayer = game.players.find((p) => p.index === user.index);

  if (existingPlayer) {
    existingPlayer.ws = ws;

    ws.send(
      JSON.stringify({
        type: 'game_joined',
        data: { gameId },
        id: 0,
      }),
    );

    return;
  }

  const player = {
    name: user.name,
    index: user.index,
    score: 0,
    ws,
  };

  game.players.push(player);

  ws.send(
    JSON.stringify({
      type: 'game_joined',
      data: { gameId },
      id: 0,
    }),
  );

  game.players.forEach(({ ws }) => {
    broadcastGame(game, 'player_joined', {
      playerName: user.name,
      playerCount: game.players.length,
    });

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
  });
};
