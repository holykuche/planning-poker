import { inject, injectable } from "inversify";

import { Member } from "data/entity";
import { CardCode, LobbyState } from "data/enum";
import { DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";

import { LobbyService, MemberService, SERVICE_TYPES } from "../api";
import { MemberIsNotInLobbyError, PokerIsNotStartedError, UnknownMemberError } from "../error";
import { DispatchPokerResult, MemberId, ResetLobbyLifetime } from "../aop";

@injectable()
export default class MemberServiceImpl implements MemberService {

    @inject(DAO_TYPES.MemberDAO)
    private readonly memberDAO: MemberDAO;

    @inject(DAO_TYPES.MemberCardXrefDAO)
    private readonly memberCardXrefDAO: MemberCardXrefDAO;

    @inject(DAO_TYPES.MemberLobbyXrefDAO)
    private readonly memberLobbyXrefDAO: MemberLobbyXrefDAO;

    @inject(DAO_TYPES.LobbyDAO)
    private readonly lobbyDAO: LobbyDAO;

    @inject(SERVICE_TYPES.LobbyService)
    private readonly lobbyService: LobbyService;

    getById(memberId: number): Promise<Member> {
        return this.memberDAO.getById(memberId)
            .then(member => {
                if (!member) {
                    throw new UnknownMemberError();
                }
                return member;
            });
    }

    getMembersLobbyId(memberId: number): Promise<number> {
        return this.memberLobbyXrefDAO.getMembersBinding(memberId)
            .then(lobbyId => {
                if (!lobbyId) {
                    return this.getById(memberId)
                        .then(member => {
                            throw new MemberIsNotInLobbyError(member.name);
                        });
                }

                return lobbyId;
            });
    }

    isMemberInLobby(memberId: number): Promise<boolean> {
        return this.memberLobbyXrefDAO.isMemberBound(memberId);
    }

    @ResetLobbyLifetime
    @DispatchPokerResult
    putCard(@MemberId memberId: number, cardCode: CardCode): Promise<void> {
        return this.getMembersLobbyId(memberId)
            .then(lobbyId => this.lobbyDAO.getById(lobbyId))
            .then(lobby => {
                if (lobby.state !== LobbyState.Playing) {
                    throw new PokerIsNotStartedError(lobby);
                }
            })
            .then(() => this.memberCardXrefDAO.put(memberId, cardCode))
            .then();


    }

    @ResetLobbyLifetime
    @DispatchPokerResult
    removeCard(@MemberId memberId: number): Promise<void> {
        return this.getMembersLobbyId(memberId)
            .then(lobbyId => this.lobbyDAO.getById(lobbyId))
            .then(lobby => {
                if (lobby.state !== LobbyState.Playing) {
                    throw new PokerIsNotStartedError(lobby);
                }
            })
            .then(() => this.memberCardXrefDAO.removeByMemberId(memberId));
    }

}
