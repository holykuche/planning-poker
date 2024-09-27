import {CardCode} from '@/data/enum';

export default interface Card {
  code: CardCode;
  label: string;
  value?: number;
}
