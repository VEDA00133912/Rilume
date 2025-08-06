const {SlashCommandBuilder, MessageFlags, Colors,PermissionFlagsBits,ChannelType} = require('discord.js');
const {createEmbed} = require('../../utils/createEmbed');
const {checkBotPermissions} = require('../../utils/checkPermissions');

module.exports = {
    cooldown: 60,
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('低速モードを設定します')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('低速モードの秒数を選択')
                .setRequired(true)
                .addChoices(
                    { name: '解除 (0秒)', value: 0 },
                    { name: '5秒', value: 5 },
                    { name: '10秒', value: 10 },
                    { name: '15秒', value: 15 },
                    { name: '30秒', value: 30 },
                    { name: '1分', value: 60 },
                    { name: '2分', value: 120 },
                    { name: '5分', value: 300 },
                    { name: '10分', value: 600 },
                    { name: '15分', value: 900 },
                    { name: '1時間', value: 3600 },
                    { name: '2時間', value: 7200 },
                    { name: '6時間', value: 21600 }
                )
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const channel = interaction.channel;

        if (channel.type !== ChannelType.GuildText) {
            return interaction.editReply({
                content: 'このコマンドはテキストチャンネルでのみ使用できます',
            });
        }

        const requiredPermissions = [
            PermissionFlagsBits.ManageChannels
        ];

        if (!(await checkBotPermissions(interaction, requiredPermissions))) return;

        const seconds = interaction.options.getInteger('seconds');

        if (interaction.channel.rateLimitPerUser === seconds) {
            return interaction.editReply({
                content: `このチャンネルはすでに${seconds}秒の低速モードが設定されています`,
            });
        }
        
        await channel.setRateLimitPerUser(seconds);

        const embed = createEmbed(interaction.client, {
            title: '低速モードの設定が完了しました',
            description: `低速モードを${seconds}秒に設定しました`,
            color: Colors.Green,
        });

        await interaction.editReply({ embeds: [embed] });
    }
}
