const crypto = require('crypto');

function generatNitroCode(type, count) {
  const baseUrl = 'nitro'
    ? 'https://discord.gift/'
    : 'https://discord.com/billing/promotions/';
  const length = type === 'gift' ? 16 : 24; // ギフトは16文字、プロモーションは24文字
  const nitroLinks = [];

  for (let i = 0; i < count; i++) {
    const randomBytes = crypto.randomBytes(length);
    let code = randomBytes.toString('base64url').slice(0, length);

    if (type === 'promo') {
      code = code.match(/.{1,4}/g).join('-');
    }

    nitroLinks.push(`${baseUrl}${code}`);
  }

  return nitroLinks;
}

module.exports = {
  generatNitroCode,
};
