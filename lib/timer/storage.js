const { Timer } = require('../../models/timer');

async function saveTimerToDB(userId, channelId, totalSeconds) {
  const existingTimer = await Timer.findOne({ userId });

  if (existingTimer) {
    existingTimer.channelId = channelId;
    existingTimer.timeLeft = totalSeconds;
    existingTimer.startTime = Date.now();
    await existingTimer.save();
  } else {
    const timer = new Timer({
      userId,
      channelId,
      timeLeft: totalSeconds,
      startTime: Date.now(),
    });

    await timer.save();
  }
}

async function removeTimerFromDB(userId) {
  await Timer.deleteOne({ userId });
}

async function loadTimersFromDB() {
  return await Timer.find();
}

async function hasTimer(userId) {
  const existingTimer = await Timer.findOne({ userId });

  return !!existingTimer;
}

module.exports = {
  saveTimerToDB,
  removeTimerFromDB,
  loadTimersFromDB,
  hasTimer,
};
