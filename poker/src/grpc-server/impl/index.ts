import "reflect-metadata";
import { container } from "config/inversify";

import { LobbyGrpcService, MemberGrpcService, GRPC_SERVER_TYPES } from "../api";
import LobbyGrpcServiceImpl from "./LobbyGrpcServiceImpl";
import MemberGrpcServiceImpl from "./MemberGrpcServiceImpl";

container.bind<LobbyGrpcService>(GRPC_SERVER_TYPES.LobbyGrpcService).to(LobbyGrpcServiceImpl);
container.bind<MemberGrpcService>(GRPC_SERVER_TYPES.MemberGrpcService).to(MemberGrpcServiceImpl);