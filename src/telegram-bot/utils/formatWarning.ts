import { Emoji } from "../enum";
import italic from "./italic";
import escape from "./escape";

const NAMES_REGEXP = /(".+?")|('.+?')/g;

export default function (text: string): string {
    const escapedText = escape(text);

    const matchArray: string[] = escapedText.match(NAMES_REGEXP) || [];

    const formattedText = matchArray
        .reduce((res, name) => res.replace(name, italic(name)), escapedText);
    return `${ Emoji.Warning } ${ formattedText }`;
}