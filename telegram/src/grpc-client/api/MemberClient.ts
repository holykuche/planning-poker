import {Member} from '../entity';
import {CardCode} from '../enum';

export default interface MemberClient {
  getById(memberId: number): Promise<Member>;

  getMembersLobbyId(memberId: number): Promise<number>;

  isMemberInLobby(memberId: number): Promise<boolean>;

  putCard(memberId: number, cardCode: CardCode): Promise<void>;

  removeCard(memberId: number): Promise<void>;

  save(member: Member): Promise<Member>;

  deleteById(memberId: number): Promise<void>;
}
