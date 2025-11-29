const {
  SlashCommandBuilder,
  InteractionContextType,
  ApplicationIntegrationType,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  LabelBuilder,
  PermissionFlagsBits,
} = require('discord.js');
const { checkBotPermissions } = require('../../utils/checkPermissions');

const REQUIRED_PERMISSIONS = [
  PermissionFlagsBits.SendMessages,
  PermissionFlagsBits.ViewChannel,
  PermissionFlagsBits.EmbedLinks,
];

module.exports = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName('embedbuilder')
    .setDescription('埋め込みを作成します')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]),

  async execute(interaction) {
    if (!(await checkBotPermissions(interaction, REQUIRED_PERMISSIONS))) return;

    const inputs = [
      { id: 'embedTitle', label: 'タイトルを設定', dsc: 'ここに埋め込みのタイトルを入力', style: TextInputStyle.Short, required: true, max: 50 },
      { id: 'embedDescription', label: '内容を設定', dsc: 'ここに埋め込みに表示したい内容を入力', style: TextInputStyle.Paragraph, required: true, max: 400 },
      { id: 'embedColor', label: '色を設定 (例: #FF0000)', dsc: 'ここに色を指定(HEXで)', style: TextInputStyle.Short, required: false, min: 7, max: 7 },
      { id: 'embedFooter', label: 'フッターを設定', dsc: 'ここに埋め込みのフッターに表示したい内容を入力', style: TextInputStyle.Short, required: false, min: 1, max: 50 },
    ];

    const modal = new ModalBuilder()
      .setCustomId('embedBuilderModal')
      .setTitle('Embed作成');

    modal.addLabelComponents(
      ...inputs.map((cfg) => {
        const input = new TextInputBuilder()
          .setCustomId(cfg.id)
          .setStyle(cfg.style)
          .setPlaceholder(cfg.dsc)
          .setRequired(cfg.required);

        if (cfg.min) input.setMinLength(cfg.min);
        if (cfg.max) input.setMaxLength(cfg.max);

        const labelComponent = new LabelBuilder()
          .setLabel(cfg.label)
          .setTextInputComponent(input);

        return labelComponent;
      })
    );

    await interaction.showModal(modal);
  },
};
