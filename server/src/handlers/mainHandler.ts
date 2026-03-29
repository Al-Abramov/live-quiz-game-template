import { WSMessage } from '../types';
import { WebSocket } from 'ws';
import { regHandler } from './regHandler';
import { createGameHandler } from './createGameHandler';
import { joinGameHandler } from './joinGameHandler';
import { startGameHandler } from './startGameHandler';
import { answerHandler } from './answerHandler';

export const handlerMessage = (ws: WebSocket, message: WSMessage) => {
  const { type, data } = message;

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

    case 'answer':
      answerHandler(ws, data);
      break;

    default:
      console.log('Unhandled message type:', type);
  }
};
