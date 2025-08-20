/**
 * BigIntで累乗計算を行います
 * @param {number|string|BigInt} base 底
 * @param {number|string|BigInt} exponent 指数
 * @returns {BigInt} 計算結果
 */
function power(base, exponent) {
  return BigInt(base) ** BigInt(exponent);
}

module.exports = { power };
