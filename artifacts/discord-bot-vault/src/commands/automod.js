const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('automod')
    .setDescription('AutoMod configuration')
    .addSubcommand(s => s.setName('settings').setDescription('View automod settings'))
    .addSubcommand(s => s.setName('antilink').setDescription('Toggle anti-link filter'))
    .addSubcommand(s => s.setName('antispam').setDescription('Toggle anti-spam filter'))
    .addSubcommand(s => s.setName('anticaps').setDescription('Toggle anti-caps filter'))
    .addSubcommand(s => s.setName('antiemoji').setDescription('Toggle anti-emoji spam filter'))
    .addSubcommand(s => s.setName('antimentions').setDescription('Toggle anti-mention spam filter'))
    .addSubcommand(s => s.setName('badwords').setDescription('Toggle bad words filter'))
    .addSubcommand(s => s.setName('addbadword').setDescription('Add a word to the filter').addStringOption(o => o.setName('word').setDescription('Word to filter').setRequired(true)))
    .addSubcommand(s => s.setName('removebadword').setDescription('Remove a word from the filter').addStringOption(o => o.setName('word').setDescription('Word to remove').setRequired(true)))
    .addSubcommand(s => s.setName('listbadwords').setDescription('List all filtered words'))
    .addSubcommand(s => s.setName('whitelist').setDescription('Whitelist a channel from automod').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('whitelistrole').setDescription('Whitelist a role from automod').addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
    .addSubcommand(s => s.setName('setspamthreshold').setDescription('Set spam message threshold').addIntegerOption(o => o.setName('count').setDescription('Messages before trigger').setRequired(true).setMinValue(2).setMaxValue(20)))
    .addSubcommand(s => s.setName('setcapsthreshold').setDescription('Set caps percentage threshold').addIntegerOption(o => o.setName('percent').setDescription('Percent (1-100)').setRequired(true).setMinValue(1).setMaxValue(100)))
    .addSubcommand(s => s.setName('setaction').setDescription('Set automod action').addStringOption(o => o.setName('action').setDescription('Action').setRequired(true).addChoices({ name: 'Delete', value: 'delete' }, { name: 'Warn', value: 'warn' }, { name: 'Mute (1 min)', value: 'mute' })))
    .addSubcommand(s => s.setName('reset').setDescription('Reset all automod settings')),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const key = `automod_${guildId}`;

    if (sub === 'settings') {
      const s = (await db.get(key)) || {};
      return interaction.reply({ embeds: [infoEmbed('🛡️ AutoMod Settings').addFields(
        { name: 'Anti-Link', value: s.antilink ? '✅' : '❌', inline: true },
        { name: 'Anti-Spam', value: s.antispam ? '✅' : '❌', inline: true },
        { name: 'Anti-Caps', value: s.anticaps ? '✅' : '❌', inline: true },
        { name: 'Anti-Emoji', value: s.antiemoji ? '✅' : '❌', inline: true },
        { name: 'Anti-Mentions', value: s.antimentions ? '✅' : '❌', inline: true },
        { name: 'Bad Words', value: s.badwords ? '✅' : '❌', inline: true },
        { name: 'Action', value: s.action || 'delete', inline: true },
        { name: 'Spam Threshold', value: String(s.spamThreshold || 5), inline: true },
        { name: 'Caps Threshold', value: `${s.capsThreshold || 70}%`, inline: true }
      )] });
    }

    const toggleMap = { antilink: 'Anti-Link', antispam: 'Anti-Spam', anticaps: 'Anti-Caps', antiemoji: 'Anti-Emoji Spam', antimentions: 'Anti-Mention Spam', badwords: 'Bad Words Filter' };
    if (toggleMap[sub]) {
      const settings = (await db.get(key)) || {};
      settings[sub] = !settings[sub];
      await db.set(key, settings);
      return interaction.reply({ embeds: [successEmbed(toggleMap[sub], `${toggleMap[sub]} ${settings[sub] ? 'enabled' : 'disabled'}.`)] });
    }

    if (sub === 'addbadword') {
      const word = interaction.options.getString('word').toLowerCase();
      const list = (await db.get(`badwords_${guildId}`)) || [];
      if (list.includes(word)) return interaction.reply({ embeds: [errorEmbed('That word is already filtered.')], ephemeral: true });
      list.push(word);
      await db.set(`badwords_${guildId}`, list);
      return interaction.reply({ embeds: [successEmbed('Word Added', `\`${word}\` added to the filter.`)], ephemeral: true });
    }

    if (sub === 'removebadword') {
      const word = interaction.options.getString('word').toLowerCase();
      const list = (await db.get(`badwords_${guildId}`)) || [];
      const idx = list.indexOf(word);
      if (idx === -1) return interaction.reply({ embeds: [errorEmbed('That word is not in the filter.')], ephemeral: true });
      list.splice(idx, 1);
      await db.set(`badwords_${guildId}`, list);
      return interaction.reply({ embeds: [successEmbed('Word Removed', `\`${word}\` removed from filter.`)] });
    }

    if (sub === 'listbadwords') {
      const list = (await db.get(`badwords_${guildId}`)) || [];
      return interaction.reply({ embeds: [infoEmbed('🚫 Filtered Words', list.length ? list.map(w => `\`${w}\``).join(', ') : 'No words filtered.')], ephemeral: true });
    }

    if (sub === 'whitelist') {
      const ch = interaction.options.getChannel('channel');
      const list = (await db.get(`automod_whitelist_${guildId}`)) || [];
      const idx = list.indexOf(ch.id);
      if (idx !== -1) { list.splice(idx, 1); await db.set(`automod_whitelist_${guildId}`, list); return interaction.reply({ embeds: [successEmbed('Whitelist', `${ch} removed from whitelist.`)] }); }
      list.push(ch.id);
      await db.set(`automod_whitelist_${guildId}`, list);
      return interaction.reply({ embeds: [successEmbed('Whitelisted', `${ch} added to automod whitelist.`)] });
    }

    if (sub === 'whitelistrole') {
      const role = interaction.options.getRole('role');
      const list = (await db.get(`automod_whitelist_roles_${guildId}`)) || [];
      const idx = list.indexOf(role.id);
      if (idx !== -1) { list.splice(idx, 1); await db.set(`automod_whitelist_roles_${guildId}`, list); return interaction.reply({ embeds: [successEmbed('Whitelist', `${role} removed from whitelist.`)] }); }
      list.push(role.id);
      await db.set(`automod_whitelist_roles_${guildId}`, list);
      return interaction.reply({ embeds: [successEmbed('Role Whitelisted', `${role} is now exempt from automod.`)] });
    }

    if (sub === 'setspamthreshold') {
      const count = interaction.options.getInteger('count');
      const settings = (await db.get(key)) || {};
      settings.spamThreshold = count;
      await db.set(key, settings);
      return interaction.reply({ embeds: [successEmbed('Spam Threshold', `Spam threshold set to **${count}** messages.`)] });
    }

    if (sub === 'setcapsthreshold') {
      const pct = interaction.options.getInteger('percent');
      const settings = (await db.get(key)) || {};
      settings.capsThreshold = pct;
      await db.set(key, settings);
      return interaction.reply({ embeds: [successEmbed('Caps Threshold', `Caps threshold set to **${pct}%**.`)] });
    }

    if (sub === 'setaction') {
      const action = interaction.options.getString('action');
      const settings = (await db.get(key)) || {};
      settings.action = action;
      await db.set(key, settings);
      return interaction.reply({ embeds: [successEmbed('AutoMod Action', `Action set to **${action}**.`)] });
    }

    if (sub === 'reset') {
      await db.delete(key);
      await db.delete(`badwords_${guildId}`);
      await db.delete(`automod_whitelist_${guildId}`);
      await db.delete(`automod_whitelist_roles_${guildId}`);
      return interaction.reply({ embeds: [successEmbed('AutoMod Reset', 'All automod settings have been reset.')] });
    }
  }
};
