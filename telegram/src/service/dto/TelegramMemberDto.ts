import {Member} from '@/grpc-client/entity';

export default interface TelegramMemberDto extends Member {
  telegram_user_id: number;
}
