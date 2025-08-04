// interactionCreate.js
// コマンドが実行されたときのイベントハンドラ

const { Events, MessageFlags, Collection } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    // クールダウン
    const cooldowns = interaction.client.cooldowns;

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name) ?? new Collection();
    const cooldownAmount = (command.cooldown ?? 0) * 1000;

    if (cooldownAmount > 0) {
      const userLastUsed = timestamps.get(interaction.user.id);

      if (userLastUsed && now < userLastUsed + cooldownAmount) {
        const remaining = ((userLastUsed + cooldownAmount - now) / 1000).toFixed(1);
        return interaction.reply({ content: `このコマンドはクールダウン中です。${remaining}秒後に再試行してください`, flags: MessageFlags.Ephemeral });
      }

      timestamps.set(interaction.user.id, now);
      cooldowns.set(command.data.name, timestamps);

      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      // エラーハンドリング
      console.error(`Error executing ${command.data.name}:`, error);
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: 'コマンド実行中にエラーが発生しました',
            flags: MessageFlags.Ephemeral,
          });
        } else {
          await interaction.reply({
            content: 'コマンド実行中にエラーが発生しました',
            flags: MessageFlags.Ephemeral,
          });
        }
      } catch (err) {
        console.error('Failed to send error reply:', err);
      }
    }
  },
};