import { Emoji } from "../enum";
import italic from "./italic";

export default function(text: string): string {
    const namesRegexp = /".+?"/g;
    const formattedText = (text.match(namesRegexp) || [])
        .reduce((res, name) => res.replace(name, italic(name)), text);
    return `${Emoji.Warning} ${formattedText}`;
}