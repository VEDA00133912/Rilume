/**
 * 素因数分解
 * @param {number} num 分解する整数
 * @returns {{prime: boolean, formula: string}}
 */
function isPrime(num) {
  if (num <= 1) return { prime: false, formula: '' };

  const factors = new Map();
  let n = num;

  const divide = (divisor) => {
    while (n % divisor === 0) {
      factors.set(divisor, (factors.get(divisor) || 0) + 1);
      n /= divisor;
    }
  };

  divide(2);
  divide(3);

  for (let i = 5; i * i <= n; i += 6) {
    divide(i);
    divide(i + 2);
  }

  if (n > 1) factors.set(n, (factors.get(n) || 0) + 1);

  const keys = [...factors.keys()];
  const prime = keys.length === 1 && keys[0] === num;

  const formula = keys
    .map((k) => (factors.get(k) > 1 ? `${k}^${factors.get(k)}` : `${k}`))
    .join(' * ');

  return { prime, formula };
}

module.exports = { isPrime };
