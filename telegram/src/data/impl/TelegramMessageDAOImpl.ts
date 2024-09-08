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
    lobbyId: number,
    chatId: number,
    messageType: TelegramMessageType
  ): Promise<TelegramMessage> {
    return this.findMany('lobbyId', lobbyId)
      .then(messages =>
        messages.find(
          message =>
            message.chatId === chatId && message.messageType === messageType
        )
      )
      .then(message => message || null);
  }

  getAllMessages(lobbyId: number): Promise<TelegramMessage[]> {
    return this.findMany('lobbyId', lobbyId);
  }

  addMessage(message: TelegramMessage): Promise<TelegramMessage> {
    return this.save(message);
  }

  deleteMessageById(id: number): Promise<void> {
    return this.delete('id', id);
  }

  async deleteMessages(
    lobbyId: number,
    messageType: TelegramMessageType
  ): Promise<void> {
    await this.findMany('lobbyId', lobbyId)
      .then(messages =>
        messages.filter(message => message.messageType === messageType)
      )
      .then(messages => messages.map(message => message.id))
      .then(messageIds =>
        Promise.all(messageIds.map(id => this.delete('id', id)))
      );
  }

  deleteAllMessages(lobbyId: number): Promise<void> {
    return this.delete('lobbyId', lobbyId);
  }

  async deleteAllMessagesFromChat(
    lobbyId: number,
    chatId: number
  ): Promise<void> {
    await this.findMany('lobbyId', lobbyId)
      .then(messages => messages.filter(message => message.chatId === chatId))
      .then(messages => messages.map(message => message.id))
      .then(messageIds =>
        Promise.all(messageIds.map(id => this.delete('id', id)))
      );
  }
}
