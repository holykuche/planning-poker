import { inject, injectable } from "inversify";

import { Member } from "data/entity";
import { CardCode, LobbyState } from "data/enum";
import { DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";

import { LobbyService, MemberService, SERVICE_TYPES } from "../api";
import { PokerIsNotStartedError, MemberIsNotInLobbyError, UnknownMemberError } from "../error";
import { DispatchPokerResult, MemberId, ResetLobbyLifetime } from "../aop";

@injectable()
export default class MemberServiceImpl implements MemberService {

    @inject(DAO_TYPES.MemberDAO) private readonly memberDAO: MemberDAO;
    @inject(DAO_TYPES.MemberCardXrefDAO) private readonly memberCardXrefDAO: MemberCardXrefDAO;
    @inject(DAO_TYPES.MemberLobbyXrefDAO) private readonly memberLobbyXrefDAO: MemberLobbyXrefDAO;
    @inject(DAO_TYPES.LobbyDAO) private readonly lobbyDAO: LobbyDAO;
    @inject(SERVICE_TYPES.LobbyService) private readonly lobbyService: LobbyService;

    getById(memberId: number): Member {
        const member = this.memberDAO.getById(memberId);

        if (!member) {
            throw new UnknownMemberError();
        }

        return member;
    }

    getMembersLobbyId(memberId: number): number {
        const lobbyId = this.memberLobbyXrefDAO.getMembersBinding(memberId);

        if (!lobbyId) {
            throw new MemberIsNotInLobbyError(this.getById(memberId).name);
        }

        return lobbyId;
    }

    isMemberInLobby(memberId: number): boolean {
        return this.memberLobbyXrefDAO.isMemberBound(memberId);
    }

    @ResetLobbyLifetime
    @DispatchPokerResult
    putCard(@MemberId memberId: number, cardCode: CardCode): void {
        const lobbyId = this.getMembersLobbyId(memberId);

        const lobby = this.lobbyDAO.getById(lobbyId);

        if (lobby.state !== LobbyState.Playing) {
            throw new PokerIsNotStartedError(lobby);
        }

        this.memberCardXrefDAO.put(memberId, cardCode);
    }

    @ResetLobbyLifetime
    @DispatchPokerResult
    removeCard(@MemberId memberId: number): void {
        const lobbyId = this.getMembersLobbyId(memberId);

        const lobby = this.lobbyDAO.getById(lobbyId);

        if (lobby.state !== LobbyState.Playing) {
            throw new PokerIsNotStartedError(lobby);
        }

        this.memberCardXrefDAO.removeByMemberId(memberId);
    }

}
