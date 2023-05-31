import "reflect-metadata";
import { container } from "config/inversify";

import { CardService, LobbyService, MemberService, SERVICE_TYPES, SubscriptionService } from "../api";

import CardServiceImpl from "./CardServiceImpl";
import LobbyServiceImpl from "./LobbyServiceImpl";
import MemberServiceImpl from "./MemberServiceImpl";
import SubscriptionServiceImpl from "./SubscriptionServiceImpl";

container.bind<CardService>(SERVICE_TYPES.CardService).to(CardServiceImpl);
container.bind<LobbyService>(SERVICE_TYPES.LobbyService).to(LobbyServiceImpl);
container.bind<MemberService>(SERVICE_TYPES.MemberService).to(MemberServiceImpl);
container.bind<SubscriptionService>(SERVICE_TYPES.SubscriptionService).to(SubscriptionServiceImpl);
