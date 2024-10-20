import {TelegramMemberDto} from '@/service/dto';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function (value: any): value is TelegramMemberDto {
  return typeof value.telegram_user_id === 'number';
}
