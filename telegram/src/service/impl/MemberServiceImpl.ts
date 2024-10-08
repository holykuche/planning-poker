import {inject, injectable} from 'inversify';

import {GRPC_CLIENT_TYPES, MemberClient} from '@/grpc-client/api';
import {Member} from '@/grpc-client/entity';
import {CardCode} from '@/grpc-client/enum';

import {MemberService} from '../api';

import AbstractServiceImpl from './AbstractServiceImpl';

@injectable()
export default class MemberServiceImpl
  extends AbstractServiceImpl
  implements MemberService
{
  @inject(GRPC_CLIENT_TYPES.MemberClient)
  private readonly memberClient: MemberClient;

  getById(memberId: number): Promise<Member> {
    return this.memberClient
      .getById(memberId)
      .catch(MemberServiceImpl.handleGrpcError);
  }

  getMembersLobbyId(memberId: number): Promise<number> {
    return this.memberClient
      .getMembersLobbyId(memberId)
      .catch(MemberServiceImpl.handleGrpcError);
  }

  isMemberInLobby(memberId: number): Promise<boolean> {
    return this.memberClient
      .isMemberInLobby(memberId)
      .catch(MemberServiceImpl.handleGrpcError);
  }

  putCard(memberId: number, cardCode: CardCode): Promise<void> {
    return this.memberClient
      .putCard(memberId, cardCode)
      .catch(MemberServiceImpl.handleGrpcError);
  }

  removeCard(memberId: number): Promise<void> {
    return this.memberClient
      .removeCard(memberId)
      .catch(MemberServiceImpl.handleGrpcError);
  }

  save(member: Member): Promise<Member> {
    return this.memberClient
      .save(member)
      .catch(MemberServiceImpl.handleGrpcError);
  }

  deleteById(memberId: number): Promise<void> {
    return this.memberClient
      .deleteById(memberId)
      .catch(MemberServiceImpl.handleGrpcError);
  }
}
