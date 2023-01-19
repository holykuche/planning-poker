import { PokerResultItemDto } from "service/dto";

import { Emoji } from "../enum";
import bold from "./bold";
import italic from "./italic";
import membersComparatorFactory from "./membersComparatorFactory";

export default function(items: PokerResultItemDto[], telegramUserId: number): string {
    const isAllMembersVoted = items.every(item => !!item.card);
    const membersComparator = membersComparatorFactory(telegramUserId);

    return items
        .sort((left, right) => membersComparator(left.member, right.member))
        .map(({ member, card }) => {
            let cardLabel;

            if (isAllMembersVoted || member.telegramUserId === telegramUserId) {
                cardLabel = card?.label || Emoji.ThinkingFace;
            } else {
                cardLabel = card ? Emoji.ElectricLampBulb : Emoji.ThinkingFace;
            }

            const memberName = member.telegramUserId === telegramUserId
                ? bold(italic(member.name))
                : italic(member.name);

            return `${ memberName }: ${italic(cardLabel)}`;
        })
        .join("\n");
};