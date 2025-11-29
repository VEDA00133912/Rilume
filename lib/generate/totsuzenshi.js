function generateTotsuzenshi(str) {
  let w = 0;
  for (let i = 0; i < str.length; i++) w += str.charCodeAt(i) > 0xff ? 2 : 1;
  const c = (w >> 1) + 2;
  return `＿${'人'.repeat(c + (c > 15))}＿\n＞　${str.replace(/\n/g, '　＜\n＞　')}　＜\n￣${'^Y'.repeat(c)}￣`;
}

module.exports = { generateTotsuzenshi };
