import {Card} from '../entity';
import {CardCode} from '../enum';

export interface CardClient {
  getAll(): Promise<Card[]>;

  getByCode(cardCode: CardCode): Promise<Card>;
}
