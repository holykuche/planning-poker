import {CardCode} from '@/grpc-client/enum';
import {CardDto} from '@/service/dto';

// todo: move that to db
const VALUES: Map<CardCode, CardDto> = new Map<CardCode, CardDto>([
  [CardCode.Score0, {code: CardCode.Score0, label: '0', value: 0}],
  [CardCode.Score1, {code: CardCode.Score1, label: '1', value: 1}],
  [CardCode.Score2, {code: CardCode.Score2, label: '2', value: 2}],
  [CardCode.Score3, {code: CardCode.Score3, label: '3', value: 3}],
  [CardCode.Score5, {code: CardCode.Score5, label: '5', value: 5}],
  [CardCode.Score8, {code: CardCode.Score8, label: '8', value: 8}],
  [CardCode.Score13, {code: CardCode.Score13, label: '13', value: 13}],
  [CardCode.Score20, {code: CardCode.Score20, label: '20', value: 20}],
  [CardCode.Score40, {code: CardCode.Score40, label: '40', value: 40}],
  [CardCode.Score100, {code: CardCode.Score100, label: '100', value: 100}],
  [CardCode.DontKnow, {code: CardCode.DontKnow, label: '?'}],
  [CardCode.Skip, {code: CardCode.Skip, label: 'Skip'}],
]);

export default (cardCode: CardCode) => VALUES.get(cardCode);
