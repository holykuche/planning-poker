import { PokerResultItemDto, CardDto } from "service/dto";

import formatPokerResult from "./formatPokerResult";
import italic from "./italic";
import escape from "./escape";

export default function(theme: string, items: PokerResultItemDto[], totalScore: CardDto, telegramUserId: number): string {
    let result = `Theme: ${italic(escape(theme))}\n\n`;

    if (items.length) {
        result += "Explain your choice:\n" + formatPokerResult(items, telegramUserId);
    } else {
        result += "Unanimously\\!";
    }

    if (totalScore) {
        result += `\n\nTotal score: ${italic(totalScore.label)}`;
    }

    return result;
};
