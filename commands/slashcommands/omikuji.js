const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const Omikuji = require('../../models/omikuji');
const { drawOmikuji } = require('../../lib/omikuji/drawOmikuji');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('omikuji')
    .setDescription('今日のおみくじを引きます（一日一回まで）'),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userId = interaction.user.id;

    const now = new Date();
    const jstOffset = 9 * 60;
    const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);
    const jstYear = jstTime.getUTCFullYear();
    const jstMonth = jstTime.getUTCMonth();
    const jstDate = jstTime.getUTCDate();

    const todayStart = new Date(Date.UTC(jstYear, jstMonth, jstDate, 0, 0, 0));

    const alreadyDrawn = await Omikuji.findOne({
      userId,
      date: { $gte: todayStart },
    });

    if (alreadyDrawn) {
      await interaction.editReply(
        '今日のおみくじはもう引いています。明日また引いてください！',
      );
      return;
    }

    const result = drawOmikuji();
    await Omikuji.create({ userId, date: new Date() });

    const embed = createEmbed(interaction.client, {
      description: `あなたは今日は **${result.label}** です！`,
      image: { url: `attachment://${result.name}.png` },
    });

    await interaction.editReply({
      embeds: [embed],
      files: [{ attachment: result.imagePath, name: `${result.name}.png` }],
    });
  },
};
