const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('embedbuilder')
    .setDescription('埋め込みを作成します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId('embedBuilderModal')
      .setTitle('Embed作成');

    const titleInput = new TextInputBuilder()
      .setCustomId('embedTitle')
      .setLabel('タイトルを設定')
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMaxLength(50);

    const descInput = new TextInputBuilder()
      .setCustomId('embedDescription')
      .setLabel('内容を設定')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(400);

    const colorInput = new TextInputBuilder()
      .setCustomId('embedColor')
      .setLabel('色を設定 (例: #FF0000)')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setMinLength(7)
      .setMaxLength(7);

    const footerInput = new TextInputBuilder()
      .setCustomId('embedFooter')
      .setLabel('フッターを設定')
      .setStyle(TextInputStyle.Short)
      .setRequired(false)
      .setMinLength(1)
      .setMaxLength(50);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(descInput),
      new ActionRowBuilder().addComponents(colorInput),
      new ActionRowBuilder().addComponents(footerInput),
    );

    await interaction.showModal(modal);
  },
};
