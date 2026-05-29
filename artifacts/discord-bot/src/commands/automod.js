const { successEmbed, errorEmbed, infoEmbed } = require('../utils/embed');
const { resolveChannel } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'AutoMod';

const commands = [
  {
    name: 'automod',
    description: 'View automod settings',
    usage: '!automod',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const settings = (await db.get(`automod_${message.guild.id}`)) || {};
      const embed = infoEmbed('🛡️ AutoMod Settings')
        .addFields(
          { name: 'Anti-Link', value: settings.antilink ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Anti-Spam', value: settings.antispam ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Anti-Caps', value: settings.anticaps ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Anti-Emoji Spam', value: settings.antiemoji ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Anti-Mention Spam', value: settings.antimentions ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Bad Words Filter', value: settings.badwords ? '✅ Enabled' : '❌ Disabled', inline: true }
        );
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'antilink',
    description: 'Toggle anti-link filter',
    usage: '!antilink',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const key = `automod_${message.guild.id}`;
      const settings = (await db.get(key)) || {};
      settings.antilink = !settings.antilink;
      await db.set(key, settings);
      message.reply({ embeds: [successEmbed('Anti-Link', `Anti-link filter ${settings.antilink ? 'enabled' : 'disabled'}.`)] });
    }
  },
  {
    name: 'antispam',
    description: 'Toggle anti-spam filter',
    usage: '!antispam',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const key = `automod_${message.guild.id}`;
      const settings = (await db.get(key)) || {};
      settings.antispam = !settings.antispam;
      await db.set(key, settings);
      message.reply({ embeds: [successEmbed('Anti-Spam', `Anti-spam filter ${settings.antispam ? 'enabled' : 'disabled'}.`)] });
    }
  },
  {
    name: 'anticaps',
    description: 'Toggle anti-caps filter',
    usage: '!anticaps',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const key = `automod_${message.guild.id}`;
      const settings = (await db.get(key)) || {};
      settings.anticaps = !settings.anticaps;
      await db.set(key, settings);
      message.reply({ embeds: [successEmbed('Anti-Caps', `Anti-caps filter ${settings.anticaps ? 'enabled' : 'disabled'}.`)] });
    }
  },
  {
    name: 'antiemoji',
    description: 'Toggle anti-emoji spam filter',
    usage: '!antiemoji',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const key = `automod_${message.guild.id}`;
      const settings = (await db.get(key)) || {};
      settings.antiemoji = !settings.antiemoji;
      await db.set(key, settings);
      message.reply({ embeds: [successEmbed('Anti-Emoji', `Anti-emoji spam ${settings.antiemoji ? 'enabled' : 'disabled'}.`)] });
    }
  },
  {
    name: 'antimentions',
    description: 'Toggle anti-mention spam',
    usage: '!antimentions',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const key = `automod_${message.guild.id}`;
      const settings = (await db.get(key)) || {};
      settings.antimentions = !settings.antimentions;
      await db.set(key, settings);
      message.reply({ embeds: [successEmbed('Anti-Mentions', `Anti-mention spam ${settings.antimentions ? 'enabled' : 'disabled'}.`)] });
    }
  },
  {
    name: 'addbadword',
    description: 'Add a word to the bad words filter',
    usage: '!addbadword <word>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const word = args[0]?.toLowerCase();
      if (!word) return message.reply({ embeds: [errorEmbed('Please provide a word.')] });
      const list = (await db.get(`badwords_${message.guild.id}`)) || [];
      if (list.includes(word)) return message.reply({ embeds: [infoEmbed('Bad Words', `\`${word}\` is already in the filter.`)] });
      list.push(word);
      await db.set(`badwords_${message.guild.id}`, list);
      const key = `automod_${message.guild.id}`;
      const settings = (await db.get(key)) || {};
      settings.badwords = true;
      await db.set(key, settings);
      message.reply({ embeds: [successEmbed('Bad Word Added', `\`${word}\` added to filter.`)] });
    }
  },
  {
    name: 'removebadword',
    description: 'Remove a word from the bad words filter',
    usage: '!removebadword <word>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const word = args[0]?.toLowerCase();
      if (!word) return message.reply({ embeds: [errorEmbed('Please provide a word.')] });
      let list = (await db.get(`badwords_${message.guild.id}`)) || [];
      list = list.filter(w => w !== word);
      await db.set(`badwords_${message.guild.id}`, list);
      message.reply({ embeds: [successEmbed('Bad Word Removed', `\`${word}\` removed from filter.`)] });
    }
  },
  {
    name: 'badwords',
    description: 'View bad words list',
    usage: '!badwords',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const list = (await db.get(`badwords_${message.guild.id}`)) || [];
      if (!list.length) return message.reply({ embeds: [infoEmbed('Bad Words', 'No words in filter.')] });
      message.reply({ embeds: [infoEmbed(`🚫 Bad Words Filter (${list.length})`, list.map(w => `\`${w}\``).join(', '))] });
    }
  },
  {
    name: 'clearwords',
    description: 'Clear all bad words',
    usage: '!clearwords',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      await db.delete(`badwords_${message.guild.id}`);
      message.reply({ embeds: [successEmbed('Words Cleared', 'All bad words have been removed from the filter.')] });
    }
  },
  {
    name: 'setautomodlog',
    description: 'Set the automod log channel',
    usage: '!setautomodlog <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`automodlog_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('AutoMod Log', `AutoMod actions logged in ${ch}.`)] });
    }
  },
  {
    name: 'antiraid',
    description: 'Toggle anti-raid mode',
    usage: '!antiraid',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const key = `automod_${message.guild.id}`;
      const settings = (await db.get(key)) || {};
      settings.antiraid = !settings.antiraid;
      await db.set(key, settings);
      message.reply({ embeds: [successEmbed('Anti-Raid', `Anti-raid mode ${settings.antiraid ? 'enabled' : 'disabled'}.`)] });
    }
  },
  {
    name: 'automodexempt',
    description: 'Exempt a role from automod',
    usage: '!automodexempt <role>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const { resolveRole } = require('../utils/helpers');
      const role = await resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      const exempt = (await db.get(`automod_exempt_${message.guild.id}`)) || [];
      if (!exempt.includes(role.id)) exempt.push(role.id);
      await db.set(`automod_exempt_${message.guild.id}`, exempt);
      message.reply({ embeds: [successEmbed('AutoMod Exempt', `${role} is now exempt from AutoMod.`)] });
    }
  },
  {
    name: 'automodunexempt',
    description: 'Remove exemption from automod for a role',
    usage: '!automodunexempt <role>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const { resolveRole } = require('../utils/helpers');
      const role = await resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      let exempt = (await db.get(`automod_exempt_${message.guild.id}`)) || [];
      exempt = exempt.filter(id => id !== role.id);
      await db.set(`automod_exempt_${message.guild.id}`, exempt);
      message.reply({ embeds: [successEmbed('AutoMod Exemption Removed', `${role} is no longer exempt.`)] });
    }
  },
  {
    name: 'resetautomod',
    description: 'Reset all automod settings',
    usage: '!resetautomod',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      await db.delete(`automod_${message.guild.id}`);
      await db.delete(`badwords_${message.guild.id}`);
      await db.delete(`automod_exempt_${message.guild.id}`);
      message.reply({ embeds: [successEmbed('AutoMod Reset', 'All AutoMod settings have been reset.')] });
    }
  },
  {
    name: 'automodstats',
    description: 'View automod action statistics',
    usage: '!automodstats',
    async execute(message, args) {
      const stats = (await db.get(`automod_stats_${message.guild.id}`)) || { deleted: 0, warned: 0, muted: 0 };
      message.reply({ embeds: [infoEmbed('📊 AutoMod Stats')
        .addFields(
          { name: 'Messages Deleted', value: String(stats.deleted), inline: true },
          { name: 'Auto-Warns', value: String(stats.warned), inline: true },
          { name: 'Auto-Mutes', value: String(stats.muted), inline: true }
        )
      ] });
    }
  }
];

module.exports = { category, commands };
