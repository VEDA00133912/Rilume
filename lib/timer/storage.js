const { Timer } = require('../../models/timer');

async function saveTimerToDB(userId, channelId, totalSeconds) {
  await Timer.updateOne(
    { userId },
    { $set: { channelId, timeLeft: totalSeconds, startTime: Date.now() } },
    { upsert: true },
  );
}

async function removeTimerFromDB(userId) {
  await Timer.deleteOne({ userId });
}

async function loadTimersFromDB() {
  console.log('Successfully loaded Timer.');
  return Timer.find();
}

async function hasTimer(userId) {
  return !!(await Timer.exists({ userId }));
}

module.exports = {
  saveTimerToDB,
  removeTimerFromDB,
  loadTimersFromDB,
  hasTimer,
};
