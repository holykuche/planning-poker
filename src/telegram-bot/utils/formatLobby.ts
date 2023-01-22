import { MemberDto } from "service/dto";

import membersComparatorFactory from "./membersComparatorFactory";
import bold from "./bold";
import italic from "./italic";

export default function(lobbyName: string, members: MemberDto[], telegramUserId: number): string {
    const membersComparator = membersComparatorFactory(telegramUserId);
    const membersStr = members
        .sort(membersComparator)
        .map(m => m.telegramUserId === telegramUserId ? bold(italic(m.name)) : italic(m.name))
        .join(", ");
    return `Lobby: ${italic(lobbyName)}\nMembers: ${membersStr}`;
}