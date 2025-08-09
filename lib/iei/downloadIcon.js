const https = require('https');

/**
 * 指定URLの画像をダウンロードしてBufferで返す
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP Status Code ${res.statusCode}`));

          return;
        }

        const chunks = [];

        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

module.exports = { downloadImage };
