const { userMention } = require('discord.js');
const { createTimerEmbed } = require('./helpers');
const { saveTimerToDB, removeTimerFromDB, loadTimersFromDB } = require('./storage');

async function setTimer(interaction, totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  await saveTimerToDB(interaction.user.id, interaction.channel.id, totalSeconds);

  setTimeout(async () => {
    await interaction.channel.send({
      content: userMention(interaction.user.id),
      embeds: [createTimerEmbed(minutes, seconds, interaction)],
    });
    await removeTimerFromDB(interaction.user.id);
  }, totalSeconds * 1000);
}

async function resumeTimers(client) {
  const timers = await loadTimersFromDB();

  for (const timer of timers) {
    const elapsed = Math.floor((Date.now() - timer.startTime) / 1000);
    const remaining = timer.timeLeft - elapsed;

    if (remaining > 0) {
      setTimeout(async () => {
        const channel = await client.channels.fetch(timer.channelId).catch(() => null);
        if (!channel) return removeTimerFromDB(timer.userId);

        const minutes = Math.floor(timer.timeLeft / 60);
        const seconds = timer.timeLeft % 60;

        await channel.send({
          content: userMention(timer.userId),
          embeds: [createTimerEmbed(minutes, seconds, { user: { id: timer.userId } })],
        });
        await removeTimerFromDB(timer.userId);
      }, remaining * 1000);
    } else {
      await removeTimerFromDB(timer.userId);
    }
  }
}

module.exports = { setTimer, resumeTimers };
