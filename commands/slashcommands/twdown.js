const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
  InteractionContextType,
  ApplicationIntegrationType,
} = require('discord.js');
const { createEmbed } = require('../../utils/createEmbed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('twdown')
    .setDescription('ツイートの動画をダウンロードできるようにします')
    .addStringOption((opt) =>
      opt.setName('url').setDescription('ツイートのURL').setRequired(true),
    )
    .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),

  async execute(interaction) {
    const url = interaction.options.getString('url');
    const tweetId = url.match(/status\/(\d+)/)?.[1];

    if (!tweetId) {
      return interaction.reply({ content: '無効なURLです', flags: MessageFlags.Ephemeral });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const res = await fetch(`https://api.fxtwitter.com/status/${tweetId}`);
    const { tweet } = await res.json();

    const videos = tweet.media?.videos?.filter((v) => v.height <= 1080);

    if (!videos?.length) {
      return interaction.editReply({
        content: tweet.media?.videos?.length
          ? '1080p以下の動画が見つかりませんでした'
          : 'このツイートには動画がありません',
      });
    }

    await interaction.editReply({
      embeds: videos.map((video) =>
        createEmbed(interaction, {
          title: 'ツイートのURL',
          url: tweet.url,
          description: tweet.text,
          author: { name: tweet.author.name, iconURL: tweet.author.avatar_url },
          image: video.thumbnail_url,
        }),
      ),
      components: videos.map((video, i) =>
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel(`動画${i + 1}`)
            .setStyle(ButtonStyle.Link)
            .setURL(video.url),
        ),
      ),
    });
  },
};
