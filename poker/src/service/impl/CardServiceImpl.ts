import {Cacheable} from '@type-cacheable/core';
import {inject, injectable} from 'inversify';

import {CardDAO, DAO_TYPES} from '@/data/api';
import {Card} from '@/data/entity';
import {CardCode} from '@/data/enum';

import {CardService} from '../api';

@injectable()
export default class CardServiceImpl implements CardService {
  @inject(DAO_TYPES.CardDAO)
  private readonly cardDAO: CardDAO;

  @Cacheable({
    cacheKey: 'CardServiceImpl.getAll()',
  })
  getAll(): Promise<Card[]> {
    return this.cardDAO.getAll();
  }

  @Cacheable({
    cacheKey: ([cardCode]) => `CardServiceImpl.getByCode(${cardCode})`,
  })
  getByCode(cardCode: CardCode): Promise<Card> {
    return this.cardDAO.getByCode(cardCode);
  }
}
