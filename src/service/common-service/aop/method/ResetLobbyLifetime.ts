import { container } from "inversify.config";
import CONFIG_TYPES from "config/types";
import { COMMON_DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/common-data/api";
import { SCHEDULER_TYPES, TimeoutScheduler } from "scheduler/api";
import { TaskType } from "scheduler/enum";

import { COMMON_SERVICE_TYPES, SubscriptionService } from "../../api";
import { EventType } from "../../event";

import resolveLobbyId from "../resolveLobbyId";

interface Dependencies {
    memberLobbyXrefDAO: MemberLobbyXrefDAO;
    memberCardXrefDAO: MemberCardXrefDAO;
    memberDAO: MemberDAO;
    lobbyDAO: LobbyDAO;
    subscriptionService: SubscriptionService;
    timeoutScheduler: TimeoutScheduler;
    lobbyLifetimeMs: number;
}

const destroyLobby = function (dependencies: Dependencies, lobbyId: number, memberIds: number[]): void {
    dependencies.subscriptionService.dispatch(lobbyId, {
        type: EventType.LobbyWasDestroyed,
    });

    dependencies.memberCardXrefDAO.removeByMemberIds(memberIds);
    dependencies.memberLobbyXrefDAO.unbindMembers(lobbyId);
    dependencies.memberDAO.deleteByIds(memberIds);
    dependencies.lobbyDAO.deleteById(lobbyId);

    dependencies.subscriptionService.unregister(lobbyId);
};

export default function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const result = method.apply(this, args);

        const dependencies: Dependencies = {
            memberLobbyXrefDAO: container.get<MemberLobbyXrefDAO>(COMMON_DAO_TYPES.MemberLobbyXrefDAO),
            memberCardXrefDAO: container.get<MemberCardXrefDAO>(COMMON_DAO_TYPES.MemberCardXrefDAO),
            memberDAO: container.get<MemberDAO>(COMMON_DAO_TYPES.MemberDAO),
            lobbyDAO: container.get<LobbyDAO>(COMMON_DAO_TYPES.LobbyDAO),
            subscriptionService: container.get<SubscriptionService>(COMMON_SERVICE_TYPES.SubscriptionService),
            timeoutScheduler: container.get<TimeoutScheduler>(SCHEDULER_TYPES.TimeoutScheduler),
            lobbyLifetimeMs: container.get<number>(CONFIG_TYPES.LobbyLifetimeMs),
        };

        const lobbyId = resolveLobbyId(dependencies, args, target, propertyKey);

        const memberIds = dependencies.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);

        if (memberIds.length) {
            dependencies.timeoutScheduler.schedule(
                TaskType.Lobby,
                lobbyId,
                dependencies.lobbyLifetimeMs / 1000,
                () => destroyLobby(dependencies, lobbyId, memberIds));
        } else {
            dependencies.timeoutScheduler.cancel(TaskType.Lobby, lobbyId);
            destroyLobby(dependencies, lobbyId, memberIds);
        }

        return result;
    }
};
