const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');
const invalidContentChecks = require('../utils/invalidContentRegex');
const { createEmbed } = require('../utils/createEmbed');

const COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (interaction.isModalSubmit() && interaction.customId === 'embedBuilderModal') {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      const title = interaction.fields.getTextInputValue('embedTitle');
      const description = interaction.fields.getTextInputValue('embedDescription');
      const colorInput = interaction.fields.getTextInputValue('embedColor');
      const footer = interaction.fields.getTextInputValue('embedFooter');

      for (const text of [title, description, footer || '']) {
        const invalid = invalidContentChecks.find((c) => c.regex.test(text));
        if (invalid) return interaction.editReply(invalid.error);
      }

      const previewEmbed = createEmbed(interaction, {
        author: {
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        },
        title,
        description,
        footer,
        color: COLOR_REGEX.test(colorInput) ? colorInput : undefined,
      });

      await interaction.editReply({
        content: '以下の内容で送信しますか？',
        embeds: [previewEmbed],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(`embedConfirm:${interaction.user.id}`)
              .setLabel('送信')
              .setStyle(ButtonStyle.Success),
          ),
        ],
      });
    }

    if (interaction.isButton() && interaction.customId.startsWith('embedConfirm:')) {
      await interaction.channel.send({ embeds: [interaction.message.embeds[0]] });

      await interaction.update({
        content: '送信が完了しました',
        embeds: [],
        components: [],
      });
    }
  },
};
