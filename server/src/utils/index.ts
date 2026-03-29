import { BASE_POINTS, MILLE_SEC } from '../constants';
import { USERS, WS_TO_USER } from '../store/store';
import { Game, WebSocketType } from '../types';

export const getUserByWs = (ws: WebSocketType) => {
  const userName = WS_TO_USER.get(ws);

  if (!userName) return null;

  return USERS.get(userName) || null;
};

export const send = (ws: WebSocketType, type: string, data: any) => {
  ws.send(
    JSON.stringify({
      type,
      data,
      id: 0,
    }),
  );
};

export const broadcastGame = (game: Game, type: string, data: any) => {
  game.players.forEach((p) => {
    p.ws?.send(JSON.stringify({ type, data, id: 0 }));
  });

  game.hostWs?.send(JSON.stringify({ type, data, id: 0 }));
};

export const sendError = (ws: WebSocketType, message: string) => {
  ws.send(
    JSON.stringify({
      type: 'error',
      data: {
        message,
      },
      id: 0,
    }),
  );
};

export const generateCode = () => {
  const chars = 'ABCDEFGHIJ0123456789KLMNOPQRSTUVWXYZ';

  let code = '';

  for (let i = 0; i < 6; i++) {
    const num = Math.floor(Math.random() * 20);
    code += chars[num || 0];
  }

  return code;
};

export const finalizeQuestion = (game: Game) => {
  if (game.status !== 'in_progress') return;

  const question = game.questions[game.currentQuestion];

  const playerResults: any[] = [];

  game.players.forEach((player) => {
    const answer = game.playerAnswers.get(player.index);
    const isCorrect = question.correctIndex === answer?.answerIndex;

    let pointsEarned = 0;

    if (answer && isCorrect && game.questionStartTime) {
      const timeLimitMilleSec = question.timeLimitSec * MILLE_SEC;
      const timeTaken = answer.timestamp - game.questionStartTime;
      const timeRemaining = Math.max(0, timeLimitMilleSec - timeTaken);

      pointsEarned = Math.floor(BASE_POINTS * (timeRemaining / timeLimitMilleSec));
    }

    player.score += pointsEarned;

    playerResults.push({
      name: player.name,
      answered: !!answer,
      correct: isCorrect,
      pointsEarned,
      totalScore: player.score,
    });
  });

  broadcastGame(game, 'question_result', {
    questionIndex: game.currentQuestion,
    correctIndex: question.correctIndex,
    playerResults,
  });
};

export const nextQuestion = (game: Game) => {
  game.currentQuestion++;

  if (game.currentQuestion >= game.questions.length) {
    game.status = 'finished';

    const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

    const scoreboard = sortedPlayers.map((player, index) => ({
      name: player.name,
      score: player.score,
      rank: index + 1,
    }));

    broadcastGame(game, 'game_finished', {
      scoreboard,
    });

    return;
  }

  const question = game.questions[game.currentQuestion];

  game.playerAnswers = new Map();
  game.questionStartTime = Date.now();

  broadcastGame(game, 'question', {
    questionNumber: game.currentQuestion + 1,
    totalQuestions: game.questions.length,
    text: question.text,
    options: question.options,
    timeLimitSec: question.timeLimitSec,
  });

  game.questionTimer = setTimeout(() => {
    finishAndNext(game);
  }, question.timeLimitSec * 1000);
};

export const finishAndNext = (game: Game) => {
  finalizeQuestion(game);

  setTimeout(() => {
    nextQuestion(game);
  }, 1500);
};
