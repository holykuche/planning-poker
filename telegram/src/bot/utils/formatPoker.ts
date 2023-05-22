import { PokerResultItemDto } from "service/dto";

import italic from "./italic";
import escape from "./escape";
import formatPokerResult from "./formatPokerResult";

export default function (theme: string, items: PokerResultItemDto[], memberId: number): string {
    return `Theme: ${ italic(escape(theme)) }\n\n` + formatPokerResult(items, memberId);
};