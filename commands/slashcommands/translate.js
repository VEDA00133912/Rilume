const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { translator } = require('../../lib/translate/translator');
const invalidContentChecks = require('../../utils/invalidContentRegex');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('translate')
    .setDescription('他言語に翻訳します')
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ])
    .addStringOption((option) =>
      option
        .setName('text')
        .setDescription('翻訳したいテキスト')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(200),
    )
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('翻訳先の言語を選んでください')
        .setRequired(true)
        .addChoices(
          { name: '英語', value: 'en' },
          { name: '中国語', value: 'zh' },
          { name: '韓国語', value: 'ko' },
          { name: 'ロシア語', value: 'ru' },
          { name: 'アラビア語', value: 'ar' },
          { name: 'ドイツ語', value: 'de' },
          { name: '日本語', value: 'ja' },
        ),
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const text = interaction.options.getString('text');
    const targetLanguage = interaction.options.getString('language');

    if (!text) {
      return interaction.editReply({ content: 'テキストが指定されていません' });
    }

    for (const check of invalidContentChecks) {
      if (check.regex.test(text)) {
        return interaction.editReply({ content: check.error });
      }
    }

    const translatedText = await translator(text, '', targetLanguage);
    const embed = createEmbed(interaction, {
      title: '翻訳が完了しました！',
      fields: [
        { name: 'ja', value: text },
        { name: `${targetLanguage}`, value: translatedText },
      ],
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
