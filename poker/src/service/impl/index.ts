import "reflect-metadata";
import { container } from "config/inversify";

import { COMMON_SERVICE_TYPES, LobbyService, MemberService, SubscriptionService } from "../api";
import LobbyServiceImpl from "./LobbyServiceImpl";
import MemberServiceImpl from "./MemberServiceImpl";
import SubscriptionServiceImpl from "./SubscriptionServiceImpl";

container.bind<LobbyService>(COMMON_SERVICE_TYPES.LobbyService).to(LobbyServiceImpl);
container.bind<MemberService>(COMMON_SERVICE_TYPES.MemberService).to(MemberServiceImpl);
container.bind<SubscriptionService>(COMMON_SERVICE_TYPES.SubscriptionService).to(SubscriptionServiceImpl);
