const path = require('node:path');

const omikujiList = [
  { name: 'daikichi', probability: 0.001, label: '大吉' },
  { name: 'daikyou', probability: 0.001, label: '大凶' },
  { name: 'kichi', probability: null, label: '吉' },
  { name: 'chukichi', probability: null, label: '中吉' },
  { name: 'shokichi', probability: null, label: '小吉' },
  { name: 'suekichi', probability: null, label: '末吉' },
  { name: 'kyou', probability: null, label: '凶' },
];

const remainingProbability = 1 - 0.002;
const defaultProb = remainingProbability / 5;
for (const o of omikujiList) {
  if (o.probability === null) {
    o.probability = defaultProb;
  }
}

function drawOmikuji() {
  const r = Math.random();
  let sum = 0;

  for (const omikuji of omikujiList) {
    sum += omikuji.probability;
    if (r <= sum) {
      return {
        name: omikuji.name,
        imagePath: path.join(
          __dirname,
          '../../assets/omikuji/',
          omikuji.name + '.png',
        ),
        label: omikuji.label,
      };
    }
  }

  const last = omikujiList[omikujiList.length - 1];
  return {
    name: last.name,
    imagePath: path.join(
      __dirname,
      '../../assets/omikuji/',
      last.name + '.png',
    ),
    label: last.label,
  };
}

module.exports = { drawOmikuji };
