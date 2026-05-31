const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed } = require('../utils/embed');
const { parseDuration, formatDuration } = require('../utils/helpers');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Reminder commands')
    .addSubcommand(s => s.setName('set').setDescription('Set a reminder').addStringOption(o => o.setName('time').setDescription('When e.g. 10m, 1h, 2d').setRequired(true)).addStringOption(o => o.setName('message').setDescription('Reminder message').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('View your reminders'))
    .addSubcommand(s => s.setName('delete').setDescription('Delete a reminder').addIntegerOption(o => o.setName('id').setDescription('Reminder ID').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('clear').setDescription('Clear all your reminders'))
    .addSubcommand(s => s.setName('snooze').setDescription('Snooze a reminder').addIntegerOption(o => o.setName('id').setDescription('Reminder ID').setRequired(true)).addStringOption(o => o.setName('time').setDescription('Snooze duration e.g. 10m').setRequired(true)))
    .addSubcommand(s => s.setName('dm').setDescription('Toggle DM reminders on/off')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const key = `reminders_${userId}`;

    if (sub === 'set') {
      const timeStr = interaction.options.getString('time');
      const msg = interaction.options.getString('message');
      const duration = parseDuration(timeStr);
      if (!duration) return interaction.reply({ embeds: [errorEmbed('Invalid time format. Use e.g. `10m`, `1h`, `2d`.')], ephemeral: true });
      const reminders = (await db.get(key)) || [];
      const id = reminders.length + 1;
      const fireAt = Date.now() + duration;
      reminders.push({ id, message: msg, fireAt, channelId: interaction.channel.id, guildId: interaction.guild.id });
      await db.set(key, reminders);
      setTimeout(async () => {
        try {
          const dmToggle = await db.get(`reminder_dm_${userId}`);
          if (dmToggle) {
            await interaction.user.send({ embeds: [infoEmbed('⏰ Reminder!', msg)] });
          } else {
            const ch = interaction.guild.channels.cache.get(interaction.channel.id);
            if (ch) await ch.send({ content: `<@${userId}>`, embeds: [infoEmbed('⏰ Reminder!', msg)] });
          }
          const current = (await db.get(key)) || [];
          const idx = current.findIndex(r => r.id === id && r.fireAt === fireAt);
          if (idx !== -1) { current.splice(idx, 1); await db.set(key, current); }
        } catch (err) {
          console.error('[REMINDER]', err);
        }
      }, duration);
      return interaction.reply({ embeds: [successEmbed('⏰ Reminder Set', `I'll remind you about **${msg}** in **${formatDuration(duration)}**.`)] });
    }

    if (sub === 'list') {
      const reminders = (await db.get(key)) || [];
      if (!reminders.length) return interaction.reply({ embeds: [infoEmbed('Reminders', 'You have no active reminders.')], ephemeral: true });
      const list = reminders.map(r => `**#${r.id}** — ${r.message} — <t:${Math.floor(r.fireAt / 1000)}:R>`).join('\n');
      return interaction.reply({ embeds: [infoEmbed('⏰ Your Reminders', list)], ephemeral: true });
    }

    if (sub === 'delete') {
      const id = interaction.options.getInteger('id');
      const reminders = (await db.get(key)) || [];
      const idx = reminders.findIndex(r => r.id === id);
      if (idx === -1) return interaction.reply({ embeds: [errorEmbed(`Reminder #${id} not found.`)], ephemeral: true });
      reminders.splice(idx, 1);
      await db.set(key, reminders);
      return interaction.reply({ embeds: [successEmbed('Reminder Deleted', `Reminder #${id} deleted.`)], ephemeral: true });
    }

    if (sub === 'clear') {
      await db.delete(key);
      return interaction.reply({ embeds: [successEmbed('Reminders Cleared', 'All your reminders have been deleted.')], ephemeral: true });
    }

    if (sub === 'snooze') {
      const id = interaction.options.getInteger('id');
      const timeStr = interaction.options.getString('time');
      const duration = parseDuration(timeStr);
      if (!duration) return interaction.reply({ embeds: [errorEmbed('Invalid time format.')], ephemeral: true });
      const reminders = (await db.get(key)) || [];
      const r = reminders.find(r => r.id === id);
      if (!r) return interaction.reply({ embeds: [errorEmbed(`Reminder #${id} not found.`)], ephemeral: true });
      r.fireAt = Date.now() + duration;
      await db.set(key, reminders);
      return interaction.reply({ embeds: [successEmbed('Snoozed', `Reminder #${id} snoozed for **${formatDuration(duration)}**.`)], ephemeral: true });
    }

    if (sub === 'dm') {
      const current = await db.get(`reminder_dm_${userId}`);
      await db.set(`reminder_dm_${userId}`, !current);
      return interaction.reply({ embeds: [successEmbed('DM Reminders', `DM reminders ${!current ? 'enabled' : 'disabled'}.`)], ephemeral: true });
    }
  }
};
