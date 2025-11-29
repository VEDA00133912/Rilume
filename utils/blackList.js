const BlacklistUser = require('../models/blacklistUser');

const messageLinkCount = new Map();
const TIME_WINDOW = 5000;
const LINK_THRESHOLD = 5;

/**
 * ブラックリスト確認
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function checkBlacklist(userId) {
  return !!(await BlacklistUser.exists({ userId }));
}

/**
 * スパム判定 & ブラックリスト登録
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
async function handleSpamCheck(userId) {
  const now = Date.now();
  const timestamps = messageLinkCount.get(userId) ?? [];

  timestamps.push(now);

  // TIME_WINDOW外のタイムスタンプを削除
  while (timestamps.length && now - timestamps[0] > TIME_WINDOW) {
    timestamps.shift();
  }

  messageLinkCount.set(userId, timestamps);

  if (timestamps.length >= LINK_THRESHOLD) {
    await BlacklistUser.updateOne(
      { userId },
      { $set: { addedAt: new Date() } },
      { upsert: true },
    );
    console.log(`ユーザー ${userId} をブラックリストに追加しました`);
    return true;
  }

  return false;
}

module.exports = { checkBlacklist, handleSpamCheck };
