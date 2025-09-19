const axios = require('axios');
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

const API_BASE_URL = 'https://api.fxtwitter.com/status/';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('twdown')
    .setDescription('ツイートの動画をダウンロードできるようにします')
    .addStringOption((option) =>
      option.setName('url').setDescription('ツイートのURL').setRequired(true),
    )
    .setContexts([
      InteractionContextType.Guild,
      InteractionContextType.PrivateChannel,
    ])
    .setIntegrationTypes([
      ApplicationIntegrationType.GuildInstall,
      ApplicationIntegrationType.UserInstall,
    ]),
    
  async execute(interaction) {
    const url = interaction.options.getString('url');
    const tweetIdMatch = url.match(/status\/(\d+)/);

    if (!tweetIdMatch) {
      return interaction.reply({
        content: '無効なURLです',
        flags: MessageFlags.Ephemeral,
      });
    }

    const tweetId = tweetIdMatch[1];
    const apiUrl = `${API_BASE_URL}${tweetId}`;

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const response = await axios.get(apiUrl);
    const tweet = response.data.tweet;

    if (!tweet.media?.videos?.length) {
      return interaction.editReply({
        content: 'このツイートには動画がありません',
        flags: MessageFlags.Ephemeral,
      });
    }

    const videosUnder1080p = tweet.media.videos.filter((v) => v.height <= 1080);

    if (videosUnder1080p.length === 0) {
      return interaction.editReply({
        content: '1080p以下の動画が見つかりませんでした',
        flags: MessageFlags.Ephemeral,
      });
    }

    // 同じURLのembedを同時に送ると1個目のやつに画像とボタンをまとめられるらしい。。。
    const embeds = [];
    const rows = [];

    videosUnder1080p.forEach((video, index) => {
      const embed = createEmbed(interaction, {
        title: `ツイートのURL`,
        url: tweet.url,
        description: tweet.text,
        author: {
          name: tweet.author.name,
          iconURL: tweet.author.avatar_url,
        },
        image: video.thumbnail_url,
      });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel(`動画${index + 1}`)
          .setStyle(ButtonStyle.Link)
          .setURL(video.url),
      );

      embeds.push(embed);
      rows.push(row);
    });

    await interaction.editReply({
      embeds,
      components: rows,
      flags: MessageFlags.Ephemeral,
    });
  },
};
