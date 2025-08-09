const { createEmbed } = require('../../utils/createEmbed');

function createTimerEmbed(minutes, seconds, interaction) {
  return createEmbed(interaction.client, {
    title: '⏰️ 時間になりました',
    description: `${minutes}分${seconds}秒が経過しました！`,
  });
}

function validateTime(minutes, seconds) {
  return minutes >= 0 && minutes <= 60 && seconds >= 0 && seconds < 60;
}

module.exports = {
  createTimerEmbed,
  validateTime,
};
