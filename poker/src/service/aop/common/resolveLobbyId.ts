import { MemberLobbyXrefDAO } from "data/api";

import MetadataKey from "./MetadataKey";

interface Dependencies {
    memberLobbyXrefDAO: MemberLobbyXrefDAO;
}

export default function (dependencies: Dependencies, args: any[], target: Object, propertyKey: string) {
    const lobbyIdParameterIndex = Reflect.getOwnMetadata(MetadataKey.LobbyId, target, propertyKey);
    const memberIdParameterIndex = Reflect.getOwnMetadata(MetadataKey.MemberId, target, propertyKey);

    if (typeof lobbyIdParameterIndex === "number") {
        return args[ lobbyIdParameterIndex ];
    } else if (typeof memberIdParameterIndex === "number") {
        const memberId = args[ memberIdParameterIndex ];
        return dependencies.memberLobbyXrefDAO.getMembersBinding(memberId);
    } else {
        throw new Error("Can't resolve lobbyId. You should mark lobbyId or memberId in parameters.")
    }
}
