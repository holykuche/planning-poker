const SPECIAL_SYMBOL_REGEXPS = [
  '\\_',
  '\\*',
  '\\[',
  '\\]',
  '\\(',
  '\\)',
  '\\~',
  '\\`',
  '\\>',
  '\\#',
  '\\+',
  '\\-',
  '\\=',
  '\\|',
  '\\{',
  '\\}',
  '\\.',
  '\\!',
];

export default function (text: string) {
  return SPECIAL_SYMBOL_REGEXPS.reduce(
    (res, s) => res.replace(new RegExp(s, 'g'), s),
    text
  );
}
