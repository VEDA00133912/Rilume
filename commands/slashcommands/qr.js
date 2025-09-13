const {
  SlashCommandBuilder,
  MessageFlags,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const QR_API_URL = 'https://api.qrserver.com/v1/create-qr-code/';

function isValidUrl(string) {
  try {
    new URL(string);

    return true;
  } catch {
    return false;
  }
}

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('qrcode')
    .setDescription('指定したURLからQRコードを生成します')
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('QRコード化するURL')
        .setRequired(true),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    const url = interaction.options.getString('url');

    if (!isValidUrl(url))
      return interaction.reply({
        content: '有効なURLを指定してください',
        flags: MessageFlags.Ephemeral,
      });

    const apiUrl = `${QR_API_URL}?data=${encodeURIComponent(
      url,
    )}&size=512x512&format=png`;

    const embed = createEmbed(interaction, {
      title: 'QRコード生成完了',
      description: `[URL](${url})`,
      image: apiUrl,
    });

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};
