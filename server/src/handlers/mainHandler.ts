import { WSMessage } from '../types';
import { WebSocket } from 'ws';
import { regHandler } from './regHandler';
import { createGameHandler } from './createGameHandler';
import { joinGameHandler } from './joinGameHandler';
import { startGameHandler } from './startGameHandler';

export const handlerMessage = (ws: WebSocket, message: WSMessage) => {
  const { type, data } = message;
  console.log('type!!!!!!!', type);
  switch (type) {
    case 'reg':
      regHandler(ws, data);
      break;

    case 'create_game':
      createGameHandler(ws, data);
      break;

    case 'join_game':
      joinGameHandler(ws, data);
      break;

    case 'start_game':
      startGameHandler(ws, data);
      break;

    case 'update_players':
      break;

    case 'answer_accepted':
      // confirmation from server — we already set hasAnswered optimistically
      break;

    case 'question':
      //   setCurrentQuestion(data as QuestionMessage);
      break;

    case 'question_result':
      //   setQuestionResult(data as QuestionResultMessage);
      break;

    case 'game_finished':
      //   setFinalResults(data as GameFinishedMessage);
      break;

    case 'error':
      break;

    default:
      console.log('Unhandled message type:', type);
  }
};
