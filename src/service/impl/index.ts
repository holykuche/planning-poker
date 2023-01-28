import "reflect-metadata";
import { container } from "inversify.config";

import { SERVICE_TYPES, LobbyService, MemberService, SubscriptionService, TelegramDataService } from "../api";
import LobbyServiceImpl from "./LobbyServiceImpl";
import MemberServiceImpl from "./MemberServiceImpl";
import SubscriptionServiceImpl from "./SubscriptionServiceImpl";
import TelegramDataServiceImpl from "./TelegramDataServiceImpl";

container.bind<LobbyService>(SERVICE_TYPES.LobbyService).to(LobbyServiceImpl);
container.bind<MemberService>(SERVICE_TYPES.MemberService).to(MemberServiceImpl);
container.bind<SubscriptionService>(SERVICE_TYPES.SubscriptionService).to(SubscriptionServiceImpl);
container.bind<TelegramDataService>(SERVICE_TYPES.TelegramDataService).to(TelegramDataServiceImpl);
