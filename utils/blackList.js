const BlacklistUser = require('../models/blacklistUser');

const messageLinkCount = new Map();
const TIME_WINDOW = 5000; // 5秒
const LINK_THRESHOLD = 5;

/**
 * ブラックリスト確認
 * @param {string} userId DiscordユーザーID
 * @returns {Promise<boolean>} ブラックリストに登録されていれば true
 */
async function checkBlacklist(userId) {
  return !!(await BlacklistUser.findOne({ userId }));
}

/**
 * スパム判定 & ブラックリスト登録
 * @param {string} userId DiscordユーザーID
 * @returns {Promise<boolean>} ブラックリストに登録されたら true
 */
async function handleSpamCheck(userId) {
  const now = Date.now();

  if (!messageLinkCount.has(userId)) {
    messageLinkCount.set(userId, []);
  }

  const timestamps = messageLinkCount.get(userId);

  timestamps.push(now);

  while (timestamps.length && now - timestamps[0] > TIME_WINDOW) {
    timestamps.shift();
  }

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
