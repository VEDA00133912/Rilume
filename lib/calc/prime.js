/**
 * 素因数分解
 * @param {number} num 分解する整数
 * @returns {{prime: boolean, formula: string}}
 */
function isPrime(num) {
  if (num <= 1) return { prime: false, formula: '' };

  let n = num;
  const factorsCount = {};

  while (n % 2 === 0) {
    factorsCount[2] = (factorsCount[2] || 0) + 1;
    n /= 2;
  }

  while (n % 3 === 0) {
    factorsCount[3] = (factorsCount[3] || 0) + 1;
    n /= 3;
  }

  // 6k±1 の候補で割る
  let i = 5;

  while (i * i <= n) {
    while (n % i === 0) {
      factorsCount[i] = (factorsCount[i] || 0) + 1;
      n /= i;
    }

    while (n % (i + 2) === 0) {
      factorsCount[i + 2] = (factorsCount[i + 2] || 0) + 1;
      n /= i + 2;
    }

    i += 6;
  }

  if (n > 1) factorsCount[n] = (factorsCount[n] || 0) + 1;

  const keys = Object.keys(factorsCount).map(Number);
  const prime = keys.length === 1 && keys[0] === num;

  const formula = keys
    .map((k) => (factorsCount[k] > 1 ? `${k}^${factorsCount[k]}` : `${k}`))
    .join(' * ');

  return { prime, formula };
}

module.exports = { isPrime };
