import { Member } from "data/entity";

import { LobbyDto, PokerResultItemDto } from "../dto";

export default interface LobbyService {
    getById: (id: number) => LobbyDto;
    getByName: (name: string) => LobbyDto;
    delete: (id: number) => void;
    isExists: (name: string) => boolean;
    getMembers: (lobbyId: number) => Member[];
    enterMember: (member: Member, lobbyName: string) => { member: Member, lobby: LobbyDto };
    leaveMember: (memberId: number) => void;
    startPoker: (lobbyId: number, theme: string) => void;
    finishPoker: (lobbyId: number) => void;
    checkPokerFinishing: (lobbyId: number) => void;
    getPokerResult: (lobbyId: number) => PokerResultItemDto[];
    getPokerFinishResult: (lobbyId: number) => PokerResultItemDto[];
}
