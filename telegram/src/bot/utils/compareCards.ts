import {CardCode} from '@/grpc-client/enum';
import {CardDto} from '@/service/dto';

export default function (left: CardDto, right: CardDto) {
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

  return left.value - right.value;
}
