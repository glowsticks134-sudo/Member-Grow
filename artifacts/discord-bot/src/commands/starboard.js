const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { resolveChannel } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Starboard';

const commands = [
  {
    name: 'setstarboard',
    description: 'Set the starboard channel',
    usage: '!setstarboard <channel>',
    aliases: ['starboard'],
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`starboard_channel_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('Starboard Set', `Starboard channel set to ${ch}.`)] });
    }
  },
  {
    name: 'starboardmin',
    description: 'Set minimum stars to reach the starboard',
    usage: '!starboardmin <number>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const min = parseInt(args[0]);
      if (isNaN(min) || min < 1) return message.reply({ embeds: [errorEmbed('Please provide a valid number.')] });
      await db.set(`starboard_min_${message.guild.id}`, min);
      message.reply({ embeds: [successEmbed('Starboard Minimum', `Messages need **${min}** ⭐ to reach the starboard.`)] });
    }
  },
  {
    name: 'starboardemoji',
    description: 'Set the starboard emoji',
    usage: '!starboardemoji <emoji>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const emoji = args[0];
      if (!emoji) return message.reply({ embeds: [errorEmbed('Please provide an emoji.')] });
      await db.set(`starboard_emoji_${message.guild.id}`, emoji);
      message.reply({ embeds: [successEmbed('Starboard Emoji', `Starboard emoji set to ${emoji}.`)] });
    }
  },
  {
    name: 'starboardblacklist',
    description: 'Blacklist a channel from the starboard',
    usage: '!starboardblacklist <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      const list = (await db.get(`starboard_blacklist_${message.guild.id}`)) || [];
      if (!list.includes(ch.id)) list.push(ch.id);
      await db.set(`starboard_blacklist_${message.guild.id}`, list);
      message.reply({ embeds: [successEmbed('Starboard Blacklisted', `${ch} is now blacklisted from the starboard.`)] });
    }
  },
  {
    name: 'starboardwhitelist',
    description: 'Remove a channel from the starboard blacklist',
    usage: '!starboardwhitelist <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      let list = (await db.get(`starboard_blacklist_${message.guild.id}`)) || [];
      list = list.filter(id => id !== ch.id);
      await db.set(`starboard_blacklist_${message.guild.id}`, list);
      message.reply({ embeds: [successEmbed('Starboard Whitelisted', `${ch} is no longer blacklisted.`)] });
    }
  },
  {
    name: 'starboardstats',
    description: 'View starboard statistics',
    usage: '!starboardstats',
    async execute(message, args) {
      const count = (await db.get(`starboard_count_${message.guild.id}`)) || 0;
      const chId = await db.get(`starboard_channel_${message.guild.id}`);
      const min = (await db.get(`starboard_min_${message.guild.id}`)) || 3;
      const emoji = (await db.get(`starboard_emoji_${message.guild.id}`)) || '⭐';
      message.reply({ embeds: [infoEmbed('⭐ Starboard Stats')
        .addFields(
          { name: 'Channel', value: chId ? `<#${chId}>` : 'Not set', inline: true },
          { name: 'Min Stars', value: String(min), inline: true },
          { name: 'Emoji', value: emoji, inline: true },
          { name: 'Total Starred', value: String(count), inline: true }
        )
      ] });
    }
  },
  {
    name: 'togglestarboard',
    description: 'Enable or disable the starboard',
    usage: '!togglestarboard',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const key = `starboard_enabled_${message.guild.id}`;
      const current = (await db.get(key)) !== false;
      await db.set(key, !current);
      message.reply({ embeds: [successEmbed('Starboard', `Starboard ${!current ? 'enabled' : 'disabled'}.`)] });
    }
  },
  {
    name: 'starboardsettings',
    description: 'View all starboard settings',
    usage: '!starboardsettings',
    async execute(message, args) {
      const chId = await db.get(`starboard_channel_${message.guild.id}`);
      const min = (await db.get(`starboard_min_${message.guild.id}`)) || 3;
      const emoji = (await db.get(`starboard_emoji_${message.guild.id}`)) || '⭐';
      const enabled = (await db.get(`starboard_enabled_${message.guild.id}`)) !== false;
      const bl = (await db.get(`starboard_blacklist_${message.guild.id}`)) || [];
      message.reply({ embeds: [infoEmbed('⭐ Starboard Settings')
        .addFields(
          { name: 'Enabled', value: enabled ? 'Yes' : 'No', inline: true },
          { name: 'Channel', value: chId ? `<#${chId}>` : 'Not set', inline: true },
          { name: 'Min Stars', value: String(min), inline: true },
          { name: 'Emoji', value: emoji, inline: true },
          { name: 'Blacklisted Channels', value: bl.map(id => `<#${id}>`).join(', ') || 'None', inline: false }
        )
      ] });
    }
  }
];

module.exports = { category, commands };
