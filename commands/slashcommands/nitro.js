const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const { generatNitroCode } = require('../../lib/generate/nitro');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('nitro')
    .setDescription('偽Nitroリンクを生成します')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('生成するコードのタイプ')
        .setRequired(true)
        .addChoices(
          { name: 'Gift Nitro', value: 'gift' },
          { name: 'Promotion Nitro', value: 'promo' },
        ),
    )
    .addIntegerOption((option) =>
      option
        .setName('count')
        .setDescription('生成するコードの数')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(20),
    ),
  async execute(interaction) {
    const type = interaction.options.getString('type');
    const count = interaction.options.getInteger('count');

    const prepareEmbed = createEmbed(interaction.client, {
      title: 'Nitroリンク生成中',
      description: `タイプ: ${type}\n生成数: ${count}`,
      color: '#de98f1', // nitroカラー。de98f1かd29cf3
    });

    await interaction.reply({
      embeds: [prepareEmbed],
      flags: MessageFlags.Ephemeral,
    });
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 1秒待機
    const nitroLinks = generatNitroCode(type, count);

    const embed = createEmbed(interaction.client, {
      description: `**生成が完了しました**\n${nitroLinks.join('\n')}`,
      color: '#de98f1',
      footer: {
        text: 'このコードは実際に使えるものではありません。あくまでジョークコマンドです',
      },
    });

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
