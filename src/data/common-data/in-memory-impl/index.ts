import "reflect-metadata";
import { container } from "inversify.config";

import {
    LobbyDAO,
    MemberCardXrefDAO,
    MemberDAO,
    MemberLobbyXrefDAO,
    COMMON_DAO_TYPES,
} from "../api";

import LobbyDAOImpl from "./LobbyDAOImpl";
import MemberDAOImpl from "./MemberDAOImpl";
import MemberCardXrefDAOImpl from "./MemberCardXrefDAOImpl";
import MemberLobbyXrefDAOImpl from "./MemberLobbyXrefDAOImpl";

container.bind<LobbyDAO>(COMMON_DAO_TYPES.LobbyDAO).to(LobbyDAOImpl);
container.bind<MemberDAO>(COMMON_DAO_TYPES.MemberDAO).to(MemberDAOImpl);
container.bind<MemberCardXrefDAO>(COMMON_DAO_TYPES.MemberCardXrefDAO).to(MemberCardXrefDAOImpl);
container.bind<MemberLobbyXrefDAO>(COMMON_DAO_TYPES.MemberLobbyXrefDAO).to(MemberLobbyXrefDAOImpl);
