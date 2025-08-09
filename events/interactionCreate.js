const { Events, MessageFlags, Collection } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    const { client } = interaction;

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`,
        );

        return;
      }

      const cooldowns = client.cooldowns;
      const now = Date.now();
      const timestamps = cooldowns.get(command.data.name) ?? new Collection();
      const cooldownAmount = (command.cooldown ?? 0) * 1000;

      if (cooldownAmount > 0) {
        const userLastUsed = timestamps.get(interaction.user.id);

        if (userLastUsed && now < userLastUsed + cooldownAmount) {
          const remaining = (
            (userLastUsed + cooldownAmount - now) /
            1000
          ).toFixed(1);

          return interaction.reply({
            content: `このコマンドはクールダウン中です。${remaining}秒後に再試行してください`,
            flags: MessageFlags.Ephemeral,
          });
        }

        timestamps.set(interaction.user.id, now);
        cooldowns.set(command.data.name, timestamps);
        setTimeout(
          () => timestamps.delete(interaction.user.id),
          cooldownAmount,
        );
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${command.data.name}`, error.message);
        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: `**${command.data.name}**の実行中にエラーが発生しました`,
              flags: MessageFlags.Ephemeral,
            });
          } else {
            await interaction.reply({
              content: `**${command.data.name}**の実行中にエラーが発生しました`,
              flags: MessageFlags.Ephemeral,
            });
          }
        } catch (err) {
          console.error('Failed to send error reply:', err);
        }
      }
    } else if (interaction.isContextMenuCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No context menu command matching ${interaction.commandName} was found.`,
        );

        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(
          `Error executing context menu command ${command.data.name}:`,
          error.message,
        );
        try {
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
              content: `**${command.data.name}**の実行中にエラーが発生しました`,
              flags: MessageFlags.Ephemeral,
            });
          } else {
            await interaction.reply({
              content: `**${command.data.name}**の実行中にエラーが発生しました`,
              flags: MessageFlags.Ephemeral,
            });
          }
        } catch (err) {
          console.error('Failed to send error reply for context menu:', err);
        }
      }
    }
  },
};
