const { join } = require('node:path');

const ASSETS_DIR = join(__dirname, '../../assets/omikuji');

const OMIKUJI_LIST = [
  { name: 'daikichi', prob: 0.001, label: '大吉' },
  { name: 'daikyou', prob: 0.001, label: '大凶' },
  { name: 'kichi', prob: 0.1996, label: '吉' },
  { name: 'chukichi', prob: 0.1996, label: '中吉' },
  { name: 'shokichi', prob: 0.1996, label: '小吉' },
  { name: 'suekichi', prob: 0.1996, label: '末吉' },
  { name: 'kyou', prob: 0.1996, label: '凶' },
];

function drawOmikuji() {
  const rand = Math.random();
  let cumulative = 0;

  for (const o of OMIKUJI_LIST) {
    cumulative += o.prob;
    if (rand <= cumulative) {
      return {
        name: o.name,
        label: o.label,
        imagePath: join(ASSETS_DIR, `${o.name}.png`),
      };
    }
  }

  const fallback = OMIKUJI_LIST.at(-1);
  return {
    name: fallback.name,
    label: fallback.label,
    imagePath: join(ASSETS_DIR, `${fallback.name}.png`),
  };
}

module.exports = { drawOmikuji };
