import { TelegramMemberDto } from "service/telegram-service/dto";

import membersComparatorFactory from "./membersComparatorFactory";
import bold from "./bold";
import italic from "./italic";
import escape from "./escape";

export default function (lobbyName: string, members: TelegramMemberDto[], telegramUserId: number): string {
    const membersComparator = membersComparatorFactory(telegramUserId);
    const membersStr = members
        .sort(membersComparator)
        .map(m => m.telegramUserId === telegramUserId ? bold(italic(escape(m.name))) : italic(escape(m.name)))
        .join(", ");
    return `Lobby: ${ italic(escape(lobbyName)) }\nMembers: ${ membersStr }`;
}