import {Member} from '../entity';

export default interface MemberDAO {
  getById(id: number): Promise<Member>;

  getByIds(ids: number[]): Promise<Member[]>;

  getByName(name: string): Promise<Member>;

  save(member: Member): Promise<Member>;

  deleteById(id: number): Promise<void>;

  deleteByIds(ids: number[]): Promise<void>;
}
