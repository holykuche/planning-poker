import {injectable} from 'inversify';

import {CardDAO} from '../api';
import {Card} from '../entity';
import {CardCode, TableName} from '../enum';

import AbstractDAOImpl from './AbstractDAOImpl';

@injectable()
export default class CardDAOImpl
  extends AbstractDAOImpl<Card>
  implements CardDAO
{
  constructor() {
    super(TableName.Card);
  }

  getAll(): Promise<Card[]> {
    return super.findAll();
  }

  getByCode(cardCode: CardCode): Promise<Card> {
    return super.find('code', cardCode);
  }
}
