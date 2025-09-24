module.exports = [
  {
    regex: /@everyone|@here/,
    error: '❌️ everyoneやhereが含まれています',
  },
  {
    regex: /<@&\d+>|<@!\d+>|<@?\d+>/,
    error: '❌️ メンションが含まれています',
  },
  {
    regex:
      /(?:https?:\/\/)?(?:discord\.(?:gg|com|me|app)(?:\/|\\)invite(?:\/|\\)?|discord\.(?:gg|me)(?:\/|\\)?)[a-zA-Z0-9]+/,
    error: '❌️ 招待リンクが含まれています',
  },
  {
    regex: /https?:\/\/[^\s]+/,
    error: '❌️ リンクが含まれています',
  },
  {
    regex: /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/,
    error: '❌️ トークンが含まれています',
  },
  {
    regex: /\|{4,}/,
    error: '❌️ 連続するスポイラーが含まれています',
  }
];
