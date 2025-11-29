const {
  SlashCommandBuilder,
  MessageFlags,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');

const isValidUrl = (str) =>
  URL.canParse?.(str) ?? (() => { try { new URL(str); return true; } catch { return false; } })();

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
    .setName('qrcode')
    .setDescription('指定したURLからQRコードを生成します')
    .addStringOption((opt) =>
      opt.setName('url').setDescription('QRコード化するURL').setRequired(true),
    )
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    const url = interaction.options.getString('url');

    if (!isValidUrl(url)) {
      return interaction.reply({
        content: '有効なURLを指定してください',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.reply({
      embeds: [
        createEmbed(interaction, {
          title: 'QRコード生成完了',
          description: `[URL](${url})`,
          image: `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=512x512&format=png`,
        }),
      ],
      flags: MessageFlags.Ephemeral,
    });
  },
};
