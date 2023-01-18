import { container } from "inversify.config";

import { LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO, TelegramDataDAO, DAO_TYPES } from "../api";
import LobbyDAOImpl from "./LobbyDAOImpl";
import MemberDAOImpl from "./MemberDAOImpl";
import MemberCardXrefDAOImpl from "./MemberCardXrefDAOImpl";
import MemberLobbyXrefDAOImpl from "./MemberLobbyXrefDAOImpl";
import TelegramDataDAOImpl from "./TelegramDataDAOImpl";

container.bind<LobbyDAO>(DAO_TYPES.LobbyDAO).to(LobbyDAOImpl);
container.bind<MemberDAO>(DAO_TYPES.MemberDAO).to(MemberDAOImpl);
container.bind<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO).to(MemberCardXrefDAOImpl);
container.bind<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO).to(MemberLobbyXrefDAOImpl);
container.bind<TelegramDataDAO>(DAO_TYPES.TelegramDataDAO).to(TelegramDataDAOImpl);
