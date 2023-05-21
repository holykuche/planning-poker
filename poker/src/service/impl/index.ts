import "reflect-metadata";
import { container } from "config/inversify";

import { SERVICE_TYPES, LobbyService, MemberService, SubscriptionService } from "../api";
import LobbyServiceImpl from "./LobbyServiceImpl";
import MemberServiceImpl from "./MemberServiceImpl";
import SubscriptionServiceImpl from "./SubscriptionServiceImpl";

container.bind<LobbyService>(SERVICE_TYPES.LobbyService).to(LobbyServiceImpl);
container.bind<MemberService>(SERVICE_TYPES.MemberService).to(MemberServiceImpl);
container.bind<SubscriptionService>(SERVICE_TYPES.SubscriptionService).to(SubscriptionServiceImpl);
