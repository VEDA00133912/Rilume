const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription(
      '多面ダイスを振ります(数指定無しの場合普通の6面サイコロです)',
    )
    .addIntegerOption((opt) =>
      opt
        .setName('count')
        .setDescription('振る個数を指定してください')
        .setMinValue(1)
        .setMaxValue(100),
    )
    .addIntegerOption((opt) =>
      opt
        .setName('max')
        .setDescription('サイコロの最大値を指定してください')
        .setMinValue(1)
        .setMaxValue(500),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const count = interaction.options.getInteger('count') || 1;
    const max = interaction.options.getInteger('max') || 6;

    const results = Array.from(
      { length: count },
      () => Math.floor(Math.random() * max) + 1,
    );

    const embed = createEmbed(interaction, {
      title: `🎲 ${count}d${max} Results`,
      description: `**${results.join(', ')}**`,
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
