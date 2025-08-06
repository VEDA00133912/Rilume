function generateTotsuzenshi(str) {
  const count =
    Math.floor(
      [...str].reduce(
        (acc, char) => acc + (char.charCodeAt(0) <= 0xff ? 1 : 2),
        0,
      ) / 2,
    ) + 2;
  const up = '人'.repeat(count + (count > 15 ? 1 : 0));
  const under = '^Y'.repeat(count);
  return `＿${up}＿\n＞　${str.replace(/\n/g, '　＜\n＞　')}　＜\n￣${under}￣`;
}

module.exports = { generateTotsuzenshi };
