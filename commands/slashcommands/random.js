const {
  SlashCommandBuilder,
  Colors,
  EmbedBuilder,
  AttachmentBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');
const { join } = require('path');

const GAMES = {
  taiko: {
    lib: require('../../lib/random/taiko'),
    title: '太鼓の達人 ランダム選曲',
    color: '#f94827',
    asset: 'taiko.png',
    defaultDiff: 'oni',
    optName: 'stars',
  },
  prsk: {
    lib: require('../../lib/random/prsk'),
    title: 'プロセカ ランダム選曲',
    color: '#77eedd',
    asset: 'prsk.png',
    defaultDiff: 'MASTER',
    optName: 'level',
  },
};

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
          opt.setName('count').setDescription('取得数(1〜10)').setMinValue(1).setMaxValue(10),
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
          opt.setName('stars').setDescription('★の数').setMinValue(1).setMaxValue(10),
        ),
    )
    .addSubcommand((sub) =>
      sub
        .setName('prsk')
        .setDescription('プロセカランダム選曲')
        .addIntegerOption((opt) =>
          opt.setName('count').setDescription('取得数(1〜10)').setMinValue(1).setMaxValue(10),
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
          opt.setName('level').setDescription('レベル').setMinValue(1).setMaxValue(32),
        ),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const game = GAMES[sub];

    const count = interaction.options.getInteger('count') ?? 1;
    const difficulty = interaction.options.getString('difficulty') ?? game.defaultDiff;
    const starOrLevel = interaction.options.getInteger(game.optName);

    await interaction.reply({
      embeds: [new EmbedBuilder().setDescription('選曲中です..').setColor(Colors.Yellow)],
    });

    try {
      const result = await game.lib.fetchRandom(count, difficulty, starOrLevel);

      await interaction.editReply({
        embeds: [
          createEmbed(interaction, {
            title: game.title,
            description: result.description,
            color: game.color,
            footer: { iconURL: `attachment://${game.asset}` },
          }),
        ],
        files: [
          new AttachmentBuilder(join(__dirname, '../../assets/random', game.asset), {
            name: game.asset,
          }),
        ],
      });
    } catch (err) {
      await interaction.editReply({
        content: err.response?.data?.error || '曲の取得に失敗しました',
        embeds: [],
      });
    }
  },
};
