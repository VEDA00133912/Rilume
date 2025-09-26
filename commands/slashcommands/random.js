const {
  SlashCommandBuilder,
  Colors,
  EmbedBuilder,
  AttachmentBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const taikoLib = require('../../lib/random/taiko');
const prskLib = require('../../lib/random/prsk');
const path = require('path');

module.exports = {
  cooldown: 15,
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('ランダム選曲コマンド')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ])
    .addSubcommand((sub) =>
      sub
        .setName('taiko')
        .setDescription('太鼓の達人ランダム選曲')
        .addIntegerOption((opt) =>
          opt
            .setName('count')
            .setDescription('取得数(1〜10)')
            .setMinValue(1)
            .setMaxValue(10),
        )
        .addStringOption((opt) =>
          opt
            .setName('difficulty')
            .setDescription('難易度')
            .addChoices(
              { name: 'かんたん', value: 'easy' },
              { name: 'ふつう', value: 'normal' },
              { name: 'むずかしい', value: 'hard' },
              { name: 'おに', value: 'oni' },
              { name: 'おに(裏)', value: 'edit' },
              { name: 'おに+おに(裏)', value: 'oni-edit' },
            ),
        )
        .addIntegerOption((opt) =>
          opt
            .setName('stars')
            .setDescription('★の数')
            .setMinValue(1)
            .setMaxValue(10),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('prsk')
        .setDescription('プロセカランダム選曲')
        .addIntegerOption((opt) =>
          opt
            .setName('count')
            .setDescription('取得数(1〜10)')
            .setMinValue(1)
            .setMaxValue(10),
        )
        .addStringOption((opt) =>
          opt
            .setName('difficulty')
            .setDescription('難易度')
            .addChoices(
              { name: 'EASY', value: 'EASY' },
              { name: 'NORMAL', value: 'NORMAL' },
              { name: 'HARD', value: 'HARD' },
              { name: 'EXPERT', value: 'EXPERT' },
              { name: 'MASTER', value: 'MASTER' },
              { name: 'APPEND', value: 'APPEND' },
            ),
        )
        .addIntegerOption((opt) =>
          opt
            .setName('level')
            .setDescription('レベル')
            .setMinValue(1)
            .setMaxValue(32),
        ),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const count = interaction.options.getInteger('count') || 1;
    let difficulty = interaction.options.getString('difficulty');
    const starsOrLevel = interaction.options.getInteger(
      sub === 'taiko' ? 'stars' : 'level',
    );

    if (!difficulty) difficulty = sub === 'taiko' ? 'oni' : 'MASTER';

    const loadingEmbed = new EmbedBuilder()
      .setDescription('選曲中です..')
      .setColor(Colors.Yellow);

    await interaction.reply({ embeds: [loadingEmbed] });

    try {
      let result;
      let attachment;
      let attachmentName;

      if (sub === 'taiko') {
        result = await taikoLib.fetchRandom(count, difficulty, starsOrLevel);
        attachmentName = 'taiko.png';
        attachment = new AttachmentBuilder(
          path.join(__dirname, '../../assets/random/taiko.png'),
          { name: attachmentName },
        );
      } else {
        result = await prskLib.fetchRandom(count, difficulty, starsOrLevel);
        attachmentName = 'prsk.png';
        attachment = new AttachmentBuilder(
          path.join(__dirname, '../../assets/random/prsk.png'),
          { name: attachmentName },
        );
      }

      const embed = createEmbed(interaction, {
        title:
          sub === 'taiko' ? '太鼓の達人 ランダム選曲' : 'プロセカ ランダム選曲',
        description: result.description,
        color: sub === 'taiko' ? '#f94827' : '#77eedd',
        footer: {
          iconURL: `attachment://${attachmentName}`,
        },
      });

      await interaction.editReply({ embeds: [embed], files: [attachment] });
    } catch (err) {
      const apiError = err.response?.data?.error;

      await interaction.editReply({
        content: apiError || '曲の取得に失敗しました',
        embeds: [],
      });
    }
  },
};
