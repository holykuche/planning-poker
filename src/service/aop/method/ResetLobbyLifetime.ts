import { container } from "inversify.config";
import CONFIG_TYPES from "config/types";
import { DAO_TYPES, LobbyDAO, MemberCardXrefDAO, MemberDAO, MemberLobbyXrefDAO } from "data/api";
import { TaskType } from "scheduler/enum";
import { SCHEDULER_TYPES, TimeoutScheduler } from "scheduler/api";

import { EventType } from "../../event";
import { SERVICE_TYPES, SubscriptionService } from "../../api";

import MetadataKey from "../MetadataKey";

export default function (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<Function>) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const result = method.apply(this, args);

        const memberLobbyXrefDAO = container.get<MemberLobbyXrefDAO>(DAO_TYPES.MemberLobbyXrefDAO);
        const memberCardXrefDAO = container.get<MemberCardXrefDAO>(DAO_TYPES.MemberCardXrefDAO);
        const memberDAO = container.get<MemberDAO>(DAO_TYPES.MemberDAO);
        const lobbyDAO = container.get<LobbyDAO>(DAO_TYPES.LobbyDAO);
        const subscriptionService = container.get<SubscriptionService>(SERVICE_TYPES.SubscriptionService);
        const timeoutScheduler = container.get<TimeoutScheduler>(SCHEDULER_TYPES.TimeoutScheduler);
        const lobbyLifetimeMs = container.get<number>(CONFIG_TYPES.LobbyLifetimeMs);

        let lobbyId: number;

        const lobbyIdParameterIndex = Reflect.getOwnMetadata(MetadataKey.LobbyId, target, propertyKey);
        const memberIdParameterIndex = Reflect.getOwnMetadata(MetadataKey.MemberId, target, propertyKey);
        if (typeof lobbyIdParameterIndex === "number") {
            lobbyId = args[ lobbyIdParameterIndex ];
        } else if (typeof memberIdParameterIndex === "number") {
            const memberId = args[ memberIdParameterIndex ];
            lobbyId = memberLobbyXrefDAO.getMembersBinding(memberId);
        } else {
            throw new Error("Wrong resetLobbyLifetime usage. You should mark lobbyId or memberId in parameters.")
        }

        const memberIds = memberLobbyXrefDAO.getMemberIdsByLobbyId(lobbyId);

        const destroyLobby = () => {
            subscriptionService.dispatch(lobbyId, {
                type: EventType.LobbyWasDestroyed,
            });

            memberCardXrefDAO.removeByMemberIds(memberIds);
            memberLobbyXrefDAO.unbindMembers(lobbyId);
            memberDAO.deleteByIds(memberIds);
            lobbyDAO.deleteById(lobbyId);

            subscriptionService.unregister(lobbyId);
        };

        if (memberIds.length) {
            timeoutScheduler.schedule(TaskType.Lobby, lobbyId, lobbyLifetimeMs / 1000, destroyLobby);
        } else {
            timeoutScheduler.cancel(TaskType.Lobby, lobbyId);
            destroyLobby();
        }

        return result;
    }
};
