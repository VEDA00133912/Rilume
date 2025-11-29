const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  MessageFlags,
} = require('discord.js');
const homo = require('../../lib/calc/homo.js');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('114514')
    .setDescription('数値を「114514」だけになるように変換します')
    .addIntegerOption((opt) =>
      opt
        .setName('number')
        .setDescription('変換したい数値')
        .setRequired(true),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    const num = interaction.options.getInteger('number');
    const result = homo(num);

    const embed = createEmbed(interaction, {
      description: `\`\`\`${result}\`\`\``,
    });

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};
