import 'reflect-metadata';
import {
  loadPackageDefinition,
  Server,
  ServiceClientConstructor,
  ServerCredentials,
} from '@grpc/grpc-js';
import {loadSync} from '@grpc/proto-loader';

import {container} from '@/config/inversify';

import {LobbyGrpcService, MemberGrpcService, GRPC_SERVER_TYPES} from './api';

const PROTO_PATH = __dirname + '/poker.proto';

const packageDefinition = loadSync(PROTO_PATH, {
  enums: String,
  keepCase: true,
});
const protoDescriptor = loadPackageDefinition(packageDefinition);

const lobbyService = container.get<LobbyGrpcService>(
  GRPC_SERVER_TYPES.LobbyGrpcService
);
const memberService = container.get<MemberGrpcService>(
  GRPC_SERVER_TYPES.MemberGrpcService
);

const server = new Server();
server.addService(
  (protoDescriptor.LobbyService as ServiceClientConstructor).service,
  {
    GetById: lobbyService.getById,
    GetByName: lobbyService.getByName,
    CreateLobby: lobbyService.createLobby,
    GetMembersLobby: lobbyService.getMembersLobby,
    EnterMember: lobbyService.enterMember,
    LeaveMember: lobbyService.leaveMember,
    StartPoker: lobbyService.startPoker,
    CancelPoker: lobbyService.cancelPoker,
  }
);
server.addService(
  (protoDescriptor.MemberService as ServiceClientConstructor).service,
  {
    GetById: memberService.getById,
    GetMembersLobbyId: memberService.getMembersLobbyId,
    IsMemberInLobby: memberService.isMemberInLobby,
    PutCard: memberService.putCard,
    RemoveCard: memberService.removeCard,
  }
);
server.bindAsync(
  `0.0.0.0:${process.env.POKER_PORT}`,
  ServerCredentials.createInsecure(),
  () => {
    server.start();
    console.log(
      `The server has successfully started on port ${process.env.POKER_PORT}`
    );
  }
);
