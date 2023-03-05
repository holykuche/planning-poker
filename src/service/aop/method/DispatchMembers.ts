import { container } from "inversify.config";

import { DAO_TYPES, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import { Member } from "data/entity";

import { SERVICE_TYPES, SubscriptionService } from "../../api";
import { EventType } from "../../event";

import resolveLobbyId from "../resolveLobbyId";

interface Dependencies {
    memberLobbyXrefDAO: MemberLobbyXrefDAO;
    memberDAO: MemberDAO;
    subscriptionService: SubscriptionService;
}

const getMembers = function (dependencies: Dependencies, lobbyId: number): Member[] {
    const memberIds = dependencies.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);
    return dependencies.memberDAO.getByIds(memberIds);
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

        const lobbyId = resolveLobbyId(dependencies, args, target, propertyKey);

        dependencies.subscriptionService.dispatch(lobbyId, {
            type: EventType.MembersWasChanged,
            payload: { members: getMembers(dependencies, lobbyId) },
        });

        return result;
    }
}
