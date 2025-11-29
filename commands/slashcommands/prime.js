const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { isPrime } = require('../../lib/calc/prime');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('prime')
    .setDescription('素数かどうか判定します')
    .addNumberOption((opt) =>
      opt
        .setName('number')
        .setDescription('判定する数字')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(9000000000000000),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),
  async execute(interaction) {
    await interaction.deferReply();

    const number = interaction.options.getNumber('number');
    const { prime, formula } = isPrime(number);

    if (prime) {
      await interaction.editReply(`${number} は素数です`);
    } else {
      await interaction.editReply(
        `${number} は素数ではありません。\n以下のように素因数分解ができます\`\`\`${formula}\`\`\``,
      );
    }
  },
};
