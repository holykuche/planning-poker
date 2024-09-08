import {injectable} from 'inversify';

import {MemberDAO} from '../api';
import {Member} from '../entity';
import {TableName} from '../enum';

import AbstractDAOImpl from './AbstractDAOImpl';

@injectable()
export default class MemberDAOImpl
  extends AbstractDAOImpl<Member>
  implements MemberDAO
{
  constructor() {
    super(TableName.Member);
  }

  getById(id: number): Promise<Member> {
    return this.find('id', id);
  }

  getByIds(ids: number[]): Promise<Member[]> {
    return Promise.all(ids.map(id => this.getById(id))).then(members =>
      members.filter(m => !!m)
    );
  }

  getByName(name: string): Promise<Member> {
    return this.find('name', name);
  }

  deleteById(id: number): Promise<void> {
    return this.delete('id', id);
  }

  deleteByIds(ids: number[]): Promise<void> {
    return Promise.all(ids.map(id => this.deleteById(id))).then();
  }
}
