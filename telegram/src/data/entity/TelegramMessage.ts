import {TelegramMessageType} from '../enum';

export default interface TelegramMessage {
  id?: number;
  lobby_id: number;
  chat_id: number;
  message_id: number;
  message_type: TelegramMessageType;
}
