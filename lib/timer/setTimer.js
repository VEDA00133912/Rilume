const { userMention } = require('discord.js');
const { createTimerEmbed } = require('./helpers');
const {
  saveTimerToDB,
  removeTimerFromDB,
  loadTimersFromDB,
} = require('./storage');

async function setTimer(interaction, totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  await saveTimerToDB(
    interaction.user.id,
    interaction.channel.id,
    totalSeconds,
  );

  setTimeout(async () => {
    const embed = createTimerEmbed(minutes, seconds, interaction);

    await interaction.channel.send({
      content: userMention(interaction.user.id),
      embeds: [embed],
    });
    await removeTimerFromDB(interaction.user.id);
  }, totalSeconds * 1000);
}

async function resumeTimers(client) {
  const timers = await loadTimersFromDB();

  timers.forEach(async (timer) => {
    const elapsedTime = Math.floor((Date.now() - timer.startTime) / 1000);
    const remainingTime = timer.timeLeft - elapsedTime;

    if (remainingTime > 0) {
      setTimeout(async () => {
        const channel = await client.channels.fetch(timer.channelId);
        const minutes = Math.floor(timer.timeLeft / 60);
        const seconds = timer.timeLeft % 60;
        const embed = createTimerEmbed(minutes, seconds, {
          user: { id: timer.userId },
        });

        channel.send({ content: userMention(timer.userId), embeds: [embed] });
        await removeTimerFromDB(timer.userId);
      }, remainingTime * 1000);
    } else {
      await removeTimerFromDB(timer.userId);
    }
  });
}

module.exports = {
  setTimer,
  resumeTimers,
};
