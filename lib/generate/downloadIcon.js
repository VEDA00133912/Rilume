/**
 * 指定URLの画像をダウンロードしてBufferで返す
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
async function downloadImage(url) {
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`HTTP Status Code ${res.status}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

module.exports = { downloadImage };
