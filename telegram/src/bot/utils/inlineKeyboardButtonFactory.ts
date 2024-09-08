import {InlineKeyboardButton} from 'node-telegram-bot-api';

import {CardCode} from '@/grpc-client/enum';

import {ButtonCommand} from '../enum';

import getCardDtoByCode from './getCardDtoByCode';

function inlineKeyboardButtonFactory(
  buttonCommand: ButtonCommand.Leave
): InlineKeyboardButton;
function inlineKeyboardButtonFactory(
  buttonCommand: ButtonCommand.PutCard,
  option: CardCode
): InlineKeyboardButton;
function inlineKeyboardButtonFactory(
  buttonCommand: ButtonCommand.RemoveCard
): InlineKeyboardButton;

function inlineKeyboardButtonFactory(
  buttonCommand: ButtonCommand,
  option?: unknown
): InlineKeyboardButton {
  switch (buttonCommand) {
    case ButtonCommand.Leave:
      return {text: 'Leave', callback_data: ButtonCommand.Leave};
    case ButtonCommand.PutCard:
      return {
        text: getCardDtoByCode(option as CardCode).label,
        callback_data: `${ButtonCommand.PutCard} ${option}`,
      };
    case ButtonCommand.RemoveCard:
      return {text: 'Remove card', callback_data: ButtonCommand.RemoveCard};
    default:
      throw new Error('Unknown button command');
  }
}

export default inlineKeyboardButtonFactory;
