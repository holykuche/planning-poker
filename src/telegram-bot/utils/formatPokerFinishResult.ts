import { PokerResultItemDto } from "service/dto";
import formatPokerResult from "./formatPokerResult";

export default function(items: PokerResultItemDto[]): string {
    if (!items.length) {
        return "Unanimously!";
    }

    return "Explain your choice:\n\t" + formatPokerResult(items).replace(/\n/g, "\n\t");
};
