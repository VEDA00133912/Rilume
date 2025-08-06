// data/invalidContentRegex.js

module.exports = [
  {
    regex: /@everyone|@here/,
    error: '❌️ everyoneやhereを含めることはできません。',
  },
  {
    regex: /<@&\d+>|<@!\d+>|<@?\d+>/,
    error: '❌️ メンションを含めることはできません。',
  },
  {
    regex:
      /(?:https?:\/\/)?(?:discord\.(?:gg|com|me|app)(?:\/|\\)invite(?:\/|\\)?|discord\.(?:gg|me)(?:\/|\\)?)[a-zA-Z0-9]+/,
    error: '❌️ 招待リンクを含むメッセージは送信できません。',
  },
  {
    regex: /https?:\/\/[^\s]+/,
    error: '❌️ リンクを送信することはできません。',
  },
  {
    regex: /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/,
    error: '❌️ トークンを含めることはできません。',
  },
  {
    regex: /\|{4,}/,
    error: '❌️ 連続するスポイラーを含めることはできません。',
  },
  {
    regex: /(discord\.com|discord\.gg|invite|https|http)/i,
    error: '❌️ リンクを送信することはできません。',
  },
];
