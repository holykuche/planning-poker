import "reflect-metadata";
import { container } from "config/inversify";

import { CardDAO, DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "../api";

import CardDAOImpl from "./CardDAOImpl";
import LobbyDAOImpl from "./LobbyDAOImpl";
import MemberDAOImpl from "./MemberDAOImpl";
import MemberCardXrefDAOImpl from "./MemberCardXrefDAOImpl";
import MemberLobbyXrefDAOImpl from "./MemberLobbyXrefDAOImpl";

container.bind<CardDAO>(DAO_TYPES.CardDAO).to(CardDAOImpl);
container.bind<LobbyDAO>(DAO_TYPES.LobbyDAO).to(LobbyDAOImpl);
container.bind<MemberDAO>(DAO_TYPES.MemberDAO).to(MemberDAOImpl);
container.bind<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO).to(MemberCardXrefDAOImpl);
container.bind<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO).to(MemberLobbyXrefDAOImpl);
