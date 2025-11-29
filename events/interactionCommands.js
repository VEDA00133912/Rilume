const { Events, MessageFlags, Collection } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    const { client } = interaction;

    if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    if (interaction.isChatInputCommand()) {
      const cooldownResult = await handleCooldown(client, interaction, command);
      if (cooldownResult) return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${command.data.name}:`, error);
      await sendErrorReply(interaction, command.data.name);
    }
  },
};

/**
 * クールダウン処理
 * @returns {boolean} クールダウン中ならtrue
 */
async function handleCooldown(client, interaction, command) {
  const cooldownAmount = (command.cooldown ?? 0) * 1000;
  if (cooldownAmount <= 0) return false;

  const { cooldowns } = client;
  const timestamps = cooldowns.get(command.data.name) ?? new Collection();
  const now = Date.now();
  const userLastUsed = timestamps.get(interaction.user.id);

  if (userLastUsed && now < userLastUsed + cooldownAmount) {
    const remaining = ((userLastUsed + cooldownAmount - now) / 1000).toFixed(1);

    await interaction.reply({
      content: `このコマンドはクールダウン中です。${remaining}秒後に再試行してください`,
      flags: MessageFlags.Ephemeral,
    });

    return true;
  }

  timestamps.set(interaction.user.id, now);
  cooldowns.set(command.data.name, timestamps);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  return false;
}

/**
 * エラーリプライ送信
 */
async function sendErrorReply(interaction, commandName) {
  const content = `**${commandName}**の実行中にエラーが発生しました`;
  const options = { content, flags: MessageFlags.Ephemeral };

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(options);
    } else {
      await interaction.reply(options);
    }
  } catch (err) {
    console.error('Failed to send error reply:', err.message);
  }
}
