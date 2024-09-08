import {TelegramMessageType} from '../enum';

export default interface TelegramMessage {
  id?: number;
  lobbyId: number;
  chatId: number;
  messageId: number;
  messageType: TelegramMessageType;
}
