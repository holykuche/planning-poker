import {injectable} from 'inversify';

import {TelegramMessageDAO} from '../api';
import {TelegramMessage} from '../entity';
import {TelegramMessageType, TableName} from '../enum';

import AbstractDAOImpl from './AbstractDAOImpl';

@injectable()
export default class TelegramMessageDAOImpl
  extends AbstractDAOImpl<TelegramMessage>
  implements TelegramMessageDAO
{
  constructor() {
    super(TableName.TelegramMessage);
  }

  getMessage(
    lobby_id: number,
    chat_id: number,
    message_type: TelegramMessageType
  ): Promise<TelegramMessage | null> {
    return this.findMany('lobby_id', lobby_id)
      .then(messages =>
        messages.find(
          message =>
            message.chat_id === chat_id && message.message_type === message_type
        )
      )
      .then(message => message || null);
  }

  getAllMessages(lobby_id: number): Promise<TelegramMessage[]> {
    return this.findMany('lobby_id', lobby_id);
  }

  addMessage(message: TelegramMessage): Promise<TelegramMessage> {
    return this.save(message);
  }

  deleteMessageById(id: number): Promise<void> {
    return this.delete('id', id);
  }

  async deleteMessages(
    lobby_id: number,
    message_type: TelegramMessageType
  ): Promise<void> {
    await this.findMany('lobby_id', lobby_id)
      .then(messages =>
        messages.filter(message => message.message_type === message_type)
      )
      .then(messages => messages.map(message => message.id))
      .then(messageIds =>
        Promise.all(messageIds.map(id => this.delete('id', id)))
      );
  }

  deleteAllMessages(lobby_id: number): Promise<void> {
    return this.delete('lobby_id', lobby_id);
  }

  async deleteAllMessagesFromChat(
    lobby_id: number,
    chat_id: number
  ): Promise<void> {
    await this.findMany('lobby_id', lobby_id)
      .then(messages => messages.filter(message => message.chat_id === chat_id))
      .then(messages => messages.map(message => message.id))
      .then(messageIds =>
        Promise.all(messageIds.map(id => this.delete('id', id)))
      );
  }
}
