const { SlashCommandBuilder, Colors, MessageFlags, ApplicationIntegrationType, InteractionContextType } = require('discord.js');
const axios = require('axios');
const { createEmbed } = require('../../utils/createEmbed');
const { getServerEmoji } = require('../../utils/emoji');

const shadowbanAPI_URL = 'https://shadowban.lami.zip/api/test';

module.exports = {
  cooldown: 15,
  data: new SlashCommandBuilder()
    .setName('shadowban')
    .setDescription('指定したTwitterアカウントがシャドウバンされているかチェックします')
    .addStringOption(option =>
      option
        .setName('username')
        .setDescription('Twitterのユーザー名(@なしで)')
        .setRequired(true),
    )
    .setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const username = interaction.options.getString('username');

    // ここでエラーが出ると Discord 側にそのまま投げられる
    const res = await axios.get(`${shadowbanAPI_URL}?screen_name=${username}`);
    const data = res.data;

    if (data.not_found) {
      return interaction.editReply({
        embeds: [
          createEmbed(interaction, {
            description: `**@${username}** のアカウントは存在しません`,
            color: Colors.Red,
          }),
        ],
      });
    }

    const user = data.user.legacy;

    const embed = createEmbed(interaction, {
      title: `${user.name} (@${user.screen_name})`,
      url: `https://twitter.com/${user.screen_name}`,
      thumbnail: user.profile_image_url_https,
      color: Colors.Blue,
      fields: [
        { name: `${getServerEmoji('TWITTER')} Followers`, value: user.followers_count.toString(), inline: true },
        { name: `${getServerEmoji('SEARCH')} Search Ban (検索結果で非表示)`, value: data.search_ban ? 'Yes' : 'No', inline: true },
        { name: `${getServerEmoji('SUGGEST')} Suggestion Ban (検索順位低下)`, value: data.search_suggestion_ban ? 'Yes' : 'No', inline: true },
        { name: `${getServerEmoji('GHOST')} Ghost Ban (TLやリプで非表示)`, value: data.ghost_ban ? 'Yes' : 'No', inline: true },
        { name: `${getServerEmoji('REPLY')} Reply Deboosting (リプ非表示)`, value: data.reply_deboosting ? 'Yes' : 'No', inline: true },
      ],
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
