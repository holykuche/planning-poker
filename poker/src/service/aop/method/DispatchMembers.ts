import { container } from "config/inversify";

import { COMMON_DAO_TYPES, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import { Member } from "data/entity";

import { COMMON_SERVICE_TYPES, SubscriptionService } from "../../api";
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
            memberLobbyXrefDAO: container.get<MemberLobbyXrefDAO>(COMMON_DAO_TYPES.MemberLobbyXrefDAO),
            memberDAO: container.get<MemberDAO>(COMMON_DAO_TYPES.MemberDAO),
            subscriptionService: container.get<SubscriptionService>(COMMON_SERVICE_TYPES.SubscriptionService),
        };

        const lobbyId = resolveLobbyId(dependencies, args, target, propertyKey);

        return Promise.resolve(result)
            .then(resultValue =>
                getMembers(dependencies, lobbyId)
                    .then(members => dependencies.subscriptionService.dispatch(lobbyId, {
                        type: EventType.MembersWasChanged,
                        payload: { members },
                    }))
                    .then(() => resultValue)
            );
    }
}
