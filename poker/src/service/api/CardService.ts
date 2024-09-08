import {Card} from '@/data/entity';
import {CardCode} from '@/data/enum';

export default interface CardService {
  getAll(): Promise<Card[]>;

  getByCode(cardCode: CardCode): Promise<Card>;
}
