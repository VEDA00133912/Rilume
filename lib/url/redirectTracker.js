async function trackRedirects(url) {
  try {
    const res = await fetch(`https://ntool.online/api/redirectChecker?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    return data.length ? data.map(({ url }) => ({ url })) : { error: '取得に失敗しました。サイトに到達できていない可能性があります' };
  } catch (e) {
    console.error(e);
    return { error: 'API呼び出し中にエラーが発生しました' };
  }
}

module.exports = { trackRedirects };
