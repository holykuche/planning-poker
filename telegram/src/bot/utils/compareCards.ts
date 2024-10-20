import {Card} from '@/grpc-client/entity';
import {CardCode} from '@/grpc-client/enum';

export default function (left: Card, right: Card) {
  if (right.code === CardCode.DontKnow) {
    return -1;
  }
  if (left.code === CardCode.DontKnow) {
    return 1;
  }

  if (right.code === CardCode.Skip) {
    return -1;
  }
  if (left.code === CardCode.Skip) {
    return 1;
  }

  return left.value! - right.value!;
}
