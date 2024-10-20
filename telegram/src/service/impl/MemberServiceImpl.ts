import {inject, injectable} from 'inversify';

import {GRPC_CLIENT_TYPES, MemberClient} from '@/grpc-client/api';
import {Member} from '@/grpc-client/entity';
import {CardCode} from '@/grpc-client/enum';

import {MemberService} from '../api';

@injectable()
export default class MemberServiceImpl implements MemberService {
  @inject(GRPC_CLIENT_TYPES.MemberClient)
  private readonly memberClient: MemberClient;

  getById(member_id: number): Promise<Member> {
    return this.memberClient.getById(member_id);
  }

  getMembersLobbyId(member_id: number): Promise<number> {
    return this.memberClient.getMembersLobbyId(member_id);
  }

  isMemberInLobby(member_id: number): Promise<boolean> {
    return this.memberClient.isMemberInLobby(member_id);
  }

  putCard(member_id: number, card_code: CardCode): Promise<void> {
    return this.memberClient.putCard(member_id, card_code);
  }

  removeCard(member_id: number): Promise<void> {
    return this.memberClient.removeCard(member_id);
  }

  save(member: Member): Promise<Member> {
    return this.memberClient.save(member);
  }

  deleteById(member_id: number): Promise<void> {
    return this.memberClient.deleteById(member_id);
  }
}
