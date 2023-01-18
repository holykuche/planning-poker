import { PokerResultItemDto } from "service/dto";
import { Emoji } from "../enum";

export default function(items: PokerResultItemDto[], telegramUserId?: number): string {
    const isAllMembersVoted = items.every(item => !!item.card);

    return items
        .map(({ member, card }) => {
            let cardLabel;

            if (isAllMembersVoted || member.telegramUserId === telegramUserId) {
                cardLabel = card?.label || Emoji.ThinkingFace;
            } else {
                cardLabel = card ? Emoji.ElectricLampBulb : Emoji.ThinkingFace;
            }

            return `${member.name}: ${cardLabel}`;
        })
        .join("\n");
};