import { container } from "config/inversify";

import { DAO_TYPES, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import { Member } from "data/entity";

import { SERVICE_TYPES, SubscriptionService } from "../../api";
import { EventType } from "../../event";

import { resolveLobbyId } from "../common";

interface Dependencies {
    memberLobbyXrefDAO: MemberLobbyXrefDAO;
    memberDAO: MemberDAO;
    subscriptionService: SubscriptionService;
}

const getMembers = function (dependencies: Dependencies, lobbyId: number): Promise<Member[]> {
    return dependencies.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId)
        .then(memberIds => dependencies.memberDAO.getByIds(memberIds));
}

export default function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const result = method.apply(this, args);

        const dependencies: Dependencies = {
            memberLobbyXrefDAO: container.get<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO),
            memberDAO: container.get<MemberDAO>(DAO_TYPES.MemberDAO),
            subscriptionService: container.get<SubscriptionService>(SERVICE_TYPES.SubscriptionService),
        };

        return Promise.resolve(result)
            .then(resultValue =>
                resolveLobbyId(dependencies, args, target, propertyKey)
                    .then(lobbyId =>
                        getMembers(dependencies, lobbyId)
                            .then(members => ({
                                lobbyId,
                                members,
                            }))
                    )
                    .then(({ lobbyId, members }) => dependencies.subscriptionService.dispatch(lobbyId, {
                        type: EventType.MembersWasChanged,
                        payload: { members },
                    }))
                    .then(() => resultValue)
            );
    }
}
