import { container } from "inversify.config";
import CONFIG_TYPES from "config/types";
import { DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import { SCHEDULER_TYPES, TimeoutScheduler } from "scheduler/api";
import { TaskType } from "scheduler/enum";

import { SERVICE_TYPES, SubscriptionService } from "../../api";
import { EventType } from "../../event";

import MetadataKey from "../MetadataKey";

interface Dependencies {
    memberLobbyXrefDAO: MemberLobbyXrefDAO,
    memberCardXrefDAO: MemberCardXrefDAO,
    memberDAO: MemberDAO,
    lobbyDAO: LobbyDAO,
    subscriptionService: SubscriptionService,
    timeoutScheduler: TimeoutScheduler,
    lobbyLifetimeMs: number,
}

const destroyLobby = function (lobbyId: number, memberIds: number[], dependencies: Dependencies): void {
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
            memberLobbyXrefDAO: container.get<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO),
            memberCardXrefDAO: container.get<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO),
            memberDAO: container.get<MemberDAO>(DAO_TYPES.MemberDAO),
            lobbyDAO: container.get<LobbyDAO>(DAO_TYPES.LobbyDAO),
            subscriptionService: container.get<SubscriptionService>(SERVICE_TYPES.SubscriptionService),
            timeoutScheduler: container.get<TimeoutScheduler>(SCHEDULER_TYPES.TimeoutScheduler),
            lobbyLifetimeMs: container.get<number>(CONFIG_TYPES.LobbyLifetimeMs),
        };

        let lobbyId: number;

        const lobbyIdParameterIndex = Reflect.getOwnMetadata(MetadataKey.LobbyId, target, propertyKey);
        const memberIdParameterIndex = Reflect.getOwnMetadata(MetadataKey.MemberId, target, propertyKey);
        if (typeof lobbyIdParameterIndex === "number") {
            lobbyId = args[ lobbyIdParameterIndex ];
        } else if (typeof memberIdParameterIndex === "number") {
            const memberId = args[ memberIdParameterIndex ];
            lobbyId = dependencies.memberLobbyXrefDAO.getMembersBinding(memberId);
        } else {
            throw new Error("Wrong ResetLobbyLifetime usage. You should mark lobbyId or memberId in parameters.")
        }

        const memberIds = dependencies.memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);

        if (memberIds.length) {
            dependencies.timeoutScheduler.schedule(
                TaskType.Lobby,
                lobbyId,
                dependencies.lobbyLifetimeMs / 1000,
                () => destroyLobby(lobbyId, memberIds, dependencies));
        } else {
            dependencies.timeoutScheduler.cancel(TaskType.Lobby, lobbyId);
            destroyLobby(lobbyId, memberIds, dependencies);
        }

        return result;
    }
};
