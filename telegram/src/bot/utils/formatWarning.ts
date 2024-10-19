import {Emoji} from '../enum';

import escape from './escape';
import italic from './italic';

const NAMES_REGEXP = /(".+?")|('.+?')/g;

export default function (text: string): string {
  const escapedText = escape(text);
  const formattedText = (escapedText.match(NAMES_REGEXP)?.slice() || []).reduce(
    (res, name) => res.replace(name, italic(name)),
    escapedText
  );
  return `${Emoji.Warning} ${formattedText}`;
}
