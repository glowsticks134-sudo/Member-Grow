const { successEmbed, errorEmbed, infoEmbed } = require('../utils/embed');
const { parseDuration, formatDuration } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Reminders';

const commands = [
  {
    name: 'remind',
    description: 'Set a reminder',
    usage: '!remind <duration> <message>',
    aliases: ['reminder', 'remindme'],
    async execute(message, args, client) {
      const duration = parseDuration(args[0]);
      if (!duration) return message.reply({ embeds: [errorEmbed('Invalid duration. Ex: `10m`, `1h`, `2d`')] });
      if (duration < 10000) return message.reply({ embeds: [errorEmbed('Duration must be at least 10 seconds.')] });
      if (duration > 2592000000) return message.reply({ embeds: [errorEmbed('Duration cannot exceed 30 days.')] });
      const text = args.slice(1).join(' ');
      if (!text) return message.reply({ embeds: [errorEmbed('Please provide a reminder message.')] });
      const remindAt = Date.now() + duration;
      const key = `reminders_${message.author.id}`;
      const reminders = (await db.get(key)) || [];
      const id = Date.now().toString(36);
      reminders.push({ id, text, remindAt, channelId: message.channel.id, guildId: message.guild.id });
      await db.set(key, reminders);
      message.reply({ embeds: [successEmbed('⏰ Reminder Set', `I'll remind you in **${formatDuration(duration)}**.\n**Message:** ${text}`)] });
      setTimeout(async () => {
        try {
          const ch = client.channels.cache.get(message.channel.id);
          if (ch) ch.send({ content: `⏰ <@${message.author.id}>`, embeds: [infoEmbed('⏰ Reminder!', text)] });
        } catch {}
        const updated = (await db.get(key)) || [];
        const filtered = updated.filter(r => r.id !== id);
        await db.set(key, filtered);
      }, duration);
    }
  },
  {
    name: 'reminders',
    description: 'List your active reminders',
    usage: '!reminders',
    aliases: ['listreminders'],
    async execute(message, args) {
      const key = `reminders_${message.author.id}`;
      const reminders = (await db.get(key)) || [];
      if (!reminders.length) return message.reply({ embeds: [infoEmbed('⏰ Reminders', 'You have no active reminders.')] });
      const list = reminders.map((r, i) => `**${i + 1}.** ${r.text} — <t:${Math.floor(r.remindAt / 1000)}:R>`).join('\n');
      message.reply({ embeds: [infoEmbed('⏰ Your Reminders', list)] });
    }
  },
  {
    name: 'delreminder',
    description: 'Delete a reminder by index',
    usage: '!delreminder <index>',
    aliases: ['cancelreminder'],
    async execute(message, args) {
      const idx = parseInt(args[0]) - 1;
      if (isNaN(idx) || idx < 0) return message.reply({ embeds: [errorEmbed('Invalid index.')] });
      const key = `reminders_${message.author.id}`;
      const reminders = (await db.get(key)) || [];
      if (idx >= reminders.length) return message.reply({ embeds: [errorEmbed('No reminder at that index.')] });
      const removed = reminders.splice(idx, 1)[0];
      await db.set(key, reminders);
      message.reply({ embeds: [successEmbed('Reminder Deleted', `Removed: **${removed.text}**`)] });
    }
  },
  {
    name: 'clearreminders',
    description: 'Clear all your reminders',
    usage: '!clearreminders',
    async execute(message, args) {
      await db.delete(`reminders_${message.author.id}`);
      message.reply({ embeds: [successEmbed('Reminders Cleared', 'All your reminders have been cleared.')] });
    }
  },
  {
    name: 'remindhere',
    description: 'Set a reminder that pings you in this channel',
    usage: '!remindhere <duration> <message>',
    async execute(message, args, client) {
      const duration = parseDuration(args[0]);
      if (!duration) return message.reply({ embeds: [errorEmbed('Invalid duration.')] });
      const text = args.slice(1).join(' ') || 'No message set';
      message.reply({ embeds: [successEmbed('⏰ Reminder Set', `Pinging you here in **${formatDuration(duration)}**.\n**Message:** ${text}`)] });
      setTimeout(() => {
        const ch = client.channels.cache.get(message.channel.id);
        if (ch) ch.send({ content: `⏰ <@${message.author.id}>`, embeds: [infoEmbed('⏰ Reminder!', text)] });
      }, duration);
    }
  },
  {
    name: 'remindcount',
    description: 'Check how many reminders you have',
    usage: '!remindcount',
    async execute(message, args) {
      const reminders = (await db.get(`reminders_${message.author.id}`)) || [];
      message.reply({ embeds: [infoEmbed('⏰ Reminder Count', `You have **${reminders.length}** active reminder(s).`)] });
    }
  }
];

module.exports = { category, commands };
