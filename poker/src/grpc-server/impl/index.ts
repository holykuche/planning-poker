import "reflect-metadata";
import { container } from "config/inversify";

import { CardGrpcService, GRPC_SERVER_TYPES, LobbyGrpcService, MemberGrpcService } from "../api";
import CardGrpcServiceImpl from "./CardGrpcServiceImpl";
import LobbyGrpcServiceImpl from "./LobbyGrpcServiceImpl";
import MemberGrpcServiceImpl from "./MemberGrpcServiceImpl";

container.bind<CardGrpcService>(GRPC_SERVER_TYPES.CardGrpcService).to(CardGrpcServiceImpl);
container.bind<LobbyGrpcService>(GRPC_SERVER_TYPES.LobbyGrpcService).to(LobbyGrpcServiceImpl);
container.bind<MemberGrpcService>(GRPC_SERVER_TYPES.MemberGrpcService).to(MemberGrpcServiceImpl);