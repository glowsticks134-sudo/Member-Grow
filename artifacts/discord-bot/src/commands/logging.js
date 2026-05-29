const { successEmbed, errorEmbed, infoEmbed } = require('../utils/embed');
const { resolveChannel } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Logging';

const LOG_EVENTS = ['message_delete', 'message_edit', 'member_join', 'member_leave', 'ban', 'unban', 'kick', 'role_add', 'role_remove', 'channel_create', 'channel_delete', 'voice_join', 'voice_leave', 'nickname_change'];

const commands = [
  {
    name: 'setlog',
    description: 'Set the log channel',
    usage: '!setlog <channel>',
    aliases: ['logchannel'],
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`log_channel_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('Log Channel Set', `All events will be logged in ${ch}.`)] });
    }
  },
  {
    name: 'removelog',
    description: 'Remove the log channel',
    usage: '!removelog',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      await db.delete(`log_channel_${message.guild.id}`);
      message.reply({ embeds: [successEmbed('Log Channel Removed', 'Logging has been disabled.')] });
    }
  },
  {
    name: 'logevent',
    description: 'Toggle a specific log event',
    usage: `!logevent <event>`,
    aliases: ['logevents'],
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const event = args[0]?.toLowerCase();
      if (!event || !LOG_EVENTS.includes(event)) {
        return message.reply({ embeds: [infoEmbed('Available Events', LOG_EVENTS.map(e => `\`${e}\``).join(', '))] });
      }
      const key = `log_events_${message.guild.id}`;
      const events = (await db.get(key)) || LOG_EVENTS;
      if (events.includes(event)) {
        const filtered = events.filter(e => e !== event);
        await db.set(key, filtered);
        return message.reply({ embeds: [successEmbed('Event Disabled', `\`${event}\` logging disabled.`)] });
      } else {
        events.push(event);
        await db.set(key, events);
        return message.reply({ embeds: [successEmbed('Event Enabled', `\`${event}\` logging enabled.`)] });
      }
    }
  },
  {
    name: 'logall',
    description: 'Enable logging for all events',
    usage: '!logall',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      await db.set(`log_events_${message.guild.id}`, [...LOG_EVENTS]);
      message.reply({ embeds: [successEmbed('All Events Enabled', 'All log events are now enabled.')] });
    }
  },
  {
    name: 'lognone',
    description: 'Disable logging for all events',
    usage: '!lognone',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      await db.set(`log_events_${message.guild.id}`, []);
      message.reply({ embeds: [successEmbed('All Events Disabled', 'All log events are now disabled.')] });
    }
  },
  {
    name: 'logsettings',
    description: 'View current log settings',
    usage: '!logsettings',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const chId = await db.get(`log_channel_${message.guild.id}`);
      const events = (await db.get(`log_events_${message.guild.id}`)) || LOG_EVENTS;
      const embed = infoEmbed('📋 Log Settings')
        .addFields(
          { name: 'Log Channel', value: chId ? `<#${chId}>` : 'Not set', inline: true },
          { name: 'Enabled Events', value: events.join(', ') || 'None', inline: false }
        );
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'setmodlog',
    description: 'Set a separate mod log channel',
    usage: '!setmodlog <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`modlog_channel_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('Mod Log Set', `Mod actions will be logged in ${ch}.`)] });
    }
  },
  {
    name: 'setmessagelog',
    description: 'Set a channel for message edit/delete logs',
    usage: '!setmessagelog <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`msglog_channel_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('Message Log Set', `Message logs will go to ${ch}.`)] });
    }
  },
  {
    name: 'setmemberlog',
    description: 'Set a channel for member join/leave logs',
    usage: '!setmemberlog <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`memberlog_channel_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('Member Log Set', `Member logs will go to ${ch}.`)] });
    }
  },
  {
    name: 'setvoicelog',
    description: 'Set a channel for voice activity logs',
    usage: '!setvoicelog <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`voicelog_channel_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('Voice Log Set', `Voice logs will go to ${ch}.`)] });
    }
  },
  {
    name: 'viewlogs',
    description: 'View recent server logs',
    usage: '!viewlogs',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const chId = await db.get(`log_channel_${message.guild.id}`);
      if (!chId) return message.reply({ embeds: [infoEmbed('Logs', 'No log channel configured. Use `!setlog <channel>`.')] });
      message.reply({ embeds: [infoEmbed('📋 Logs', `Logs are being sent to <#${chId}>. Check there for all events.`)] });
    }
  }
];

module.exports = { category, commands };
