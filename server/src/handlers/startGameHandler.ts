import { WebSocketType } from '../types';
import { CODE_TO_GAME, GAMES } from '../store/store';
import { broadcastGame, getUserByWs, sendError } from '../utils';

export const startGameHandler = (ws: WebSocketType, data: any) => {
  const { gameId } = data;

  const game = GAMES.get(gameId);
  if (!game) {
    console.log('Game missing');
    sendError(ws, 'Game not found');
    return;
  }

  const user = getUserByWs(ws);
  if (!user) return;

  if (game.hostId !== user.index) {
    sendError(ws, 'Only host can start the game');
    return;
  }

  if (game.status !== 'waiting') {
    sendError(ws, 'Game already started');
    console.log('Starting game:', gameId);
    return;
  }

  game.status = 'in_progress';
  game.currentQuestion = 0;
  game.playerAnswers = new Map();
  game.questionStartTime = Date.now();

  const question = game.questions[game.currentQuestion];

  const sendQuestionData = {
    questionNumber: game.currentQuestion,
    totalQuestions: game.questions.length,
    text: question.text,
    options: question.options,
    timeLimitSec: question.timeLimitSec,
  };

  broadcastGame(game, 'question', sendQuestionData);

  game.questionTimer = setTimeout(() => {
    // finalizeQuestion(game);
  }, question.timeLimitSec * 1000);
};
