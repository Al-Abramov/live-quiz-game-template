import { GAMES } from '../store/store';
import { WebSocketType } from '../types';
import { finalizeQuestion, finishAndNext, getUserByWs, nextQuestion, sendError } from '../utils';

export const answerHandler = (ws: WebSocketType, data: any) => {
  const { gameId, questionIndex, answerIndex } = data;

  const game = GAMES.get(gameId);
  if (!game) {
    sendError(ws, 'Game not found');
    return;
  }

  const user = getUserByWs(ws);
  if (!user) return;

  if (game.status !== 'in_progress') {
    sendError(ws, 'Game is not in progress');
    return;
  }

  if (game.currentQuestion !== questionIndex) {
    sendError(ws, 'Invalid question index');
    return;
  }

  const player = game.players.find((p) => p.index === user.index);
  if (!player) {
    sendError(ws, 'Player not in game');
    return;
  }

  game.playerAnswers.set(player.index, {
    answerIndex,
    timestamp: Date.now(),
  });

  ws.send(
    JSON.stringify({
      type: 'answer_accepted',
      data: {
        questionIndex,
      },
      id: 0,
    }),
  );

  const allAnswered = game.players.every((p) => game.playerAnswers.has(p.index));

  if (allAnswered) {
    if (game.questionTimer) {
      clearTimeout(game.questionTimer);
    }

    finishAndNext(game);
  }
};
