import { Member } from "data/entity";

import membersComparatorFactory from "./membersComparatorFactory";
import bold from "./bold";
import italic from "./italic";

export default function(members: Member[], telegramUserId: number): string {
    const membersComparator = membersComparatorFactory(telegramUserId);
    const membersStr = members
        .sort(membersComparator)
        .map(m => m.telegramUserId === telegramUserId ? bold(italic(m.name)) : italic(m.name))
        .join(", ");
    return `Members: ${membersStr}`;
}