const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const invalidContentChecks = require('../utils/invalidContentRegex');
const { createEmbed } = require('../utils/createEmbed');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (
      interaction.isModalSubmit() &&
      interaction.customId === 'embedBuilderModal'
    ) {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const title = interaction.fields.getTextInputValue('embedTitle');
      const description =
        interaction.fields.getTextInputValue('embedDescription');
      const colorInput = interaction.fields.getTextInputValue('embedColor');
      const footer = interaction.fields.getTextInputValue('embedFooter');

      function checkInvalidContent(text) {
        for (const check of invalidContentChecks) {
          if (check.regex.test(text)) {
            return check.error;
          }
        }

        return null;
      }

      for (const text of [title, description, footer || '']) {
        const error = checkInvalidContent(text);

        if (error) {
          return interaction.editReply({ content: error });
        }
      }

      let color;

      if (colorInput && /^#[0-9A-Fa-f]{6}$/.test(colorInput)) {
        color = colorInput;
      } else {
        color = undefined; // createEmbed のデフォルトカラーを使う
      }

      const previewEmbed = createEmbed(interaction, {
        title,
        description,
        footer,
        color,
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`embedConfirm:${interaction.user.id}`)
          .setLabel('送信')
          .setStyle(ButtonStyle.Success),
      );

      await interaction.editReply({
        content: '以下の内容で送信しますか？',
        embeds: [previewEmbed],
        components: [row],
      });
    }

    if (interaction.isButton()) {
      if (!interaction.customId.startsWith('embedConfirm:')) return;
      const embed = interaction.message.embeds[0];

      await interaction.channel.send({ embeds: [embed] });

      await interaction.update({
        content: '送信が完了しました',
        embeds: [],
        components: [],
      });
    }
  },
};
