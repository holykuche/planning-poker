import { PokerResultItemDto } from "service/dto";
import formatPokerResult from "./formatPokerResult";

export default function(items: PokerResultItemDto[], telegramUserId: number): string {
    if (!items.length) {
        return "Unanimously!";
    }

    return "Explain your choice:\n"
        + formatPokerResult(items, telegramUserId).replace(/\n/g, "\n");
};
