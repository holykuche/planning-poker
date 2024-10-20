import {Card, Member} from '@/grpc-client/entity';

export default interface PokerResultItemDto<TMember extends Member> {
  member: TMember;
  card: Card;
}
