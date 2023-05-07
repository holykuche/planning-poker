import { container } from "config/inversify";
import { LOBBY_LIFETIME_SEC } from "config/app";
import { DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import { SCHEDULER_TYPES, TimeoutScheduler } from "scheduler/api";
import { TaskType } from "scheduler/enum";

import { COMMON_SERVICE_TYPES, SubscriptionService } from "../../api";
import { EventType } from "../../event";

import { resolveLobbyId } from "../common";

interface Dependencies {
    memberLobbyXrefDAO: MemberLobbyXrefDAO;
    memberCardXrefDAO: MemberCardXrefDAO;
    memberDAO: MemberDAO;
    lobbyDAO: LobbyDAO;
    subscriptionService: SubscriptionService;
    timeoutScheduler: TimeoutScheduler;
}

const destroyLobby = function (dependencies: Dependencies, lobbyId: number, memberIds: number[]): Promise<void> {
    return Promise.all([
        dependencies.memberCardXrefDAO.removeByMemberIds(memberIds),
        dependencies.memberLobbyXrefDAO.unbindMembers(lobbyId),
        dependencies.memberDAO.deleteByIds(memberIds),
        dependencies.lobbyDAO.deleteById(lobbyId),
    ])
        .then(() => {
            dependencies.subscriptionService.dispatch(lobbyId, {
                type: EventType.LobbyWasDestroyed,
            });
            dependencies.subscriptionService.unregister(lobbyId);
        });
};

export default function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const result = method.apply(this, args);

        const dependencies: Dependencies = {
            memberLobbyXrefDAO: container.get<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO),
            memberCardXrefDAO: container.get<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO),
            memberDAO: container.get<MemberDAO>(DAO_TYPES.MemberDAO),
            lobbyDAO: container.get<LobbyDAO>(DAO_TYPES.LobbyDAO),
            subscriptionService: container.get<SubscriptionService>(COMMON_SERVICE_TYPES.SubscriptionService),
            timeoutScheduler: container.get<TimeoutScheduler>(SCHEDULER_TYPES.TimeoutScheduler),
        };

        const lobbyId = resolveLobbyId(dependencies, args, target, propertyKey);

        return Promise.resolve(result)
            .then(resultValue =>
                dependencies.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId)
                    .then(memberIds => {
                        if (!memberIds.length) {
                            dependencies.timeoutScheduler.cancel(TaskType.Lobby, lobbyId);
                            return destroyLobby(dependencies, lobbyId, memberIds);
                        }

                        dependencies.timeoutScheduler.schedule(
                            TaskType.Lobby,
                            lobbyId,
                            LOBBY_LIFETIME_SEC,
                            () => destroyLobby(dependencies, lobbyId, memberIds));

                        return Promise.resolve();
                    })
                    .then(() => resultValue)
            );
    }
};
