import {User} from 'node-telegram-bot-api';

import {TelegramMemberDto} from '@/service/dto';

import formatTelegramUserName from './formatTelegramUserName';

export default function (user: User): TelegramMemberDto {
  return {
    telegramUserId: user.id,
    name: formatTelegramUserName(user),
  };
}
