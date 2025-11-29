const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const Omikuji = require('../../models/omikuji');
const { drawOmikuji } = require('../../lib/omikuji/drawOmikuji');

function getJstMidnight() {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate()));
}

module.exports = {
  cooldown: 60,
  data: new SlashCommandBuilder()
    .setName('omikuji')
    .setDescription('今日のおみくじを引きます（一日一回まで）')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userId = interaction.user.id;
    const todayStart = getJstMidnight();

    const alreadyDrawn = await Omikuji.findOne({
      userId,
      date: { $gte: todayStart },
    });

    if (alreadyDrawn) {
      return interaction.editReply(
        '今日のおみくじはもう引いています。明日また引いてください！',
      );
    }

    const result = drawOmikuji();
    await Omikuji.create({ userId, date: new Date() });

    await interaction.editReply({
      embeds: [
        createEmbed(interaction, {
          description: `あなたは今日は **${result.label}** です！`,
          image: `attachment://${result.name}.png`,
        }),
      ],
      files: [{ attachment: result.imagePath, name: `${result.name}.png` }],
    });
  },
};
