const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logging')
    .setDescription('Server logging configuration')
    .addSubcommand(s => s.setName('setlog').setDescription('Set the log channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('disable').setDescription('Disable logging'))
    .addSubcommand(s => s.setName('settings').setDescription('View logging settings'))
    .addSubcommand(s => s.setName('toggle').setDescription('Toggle a log event on/off').addStringOption(o => o.setName('event').setDescription('Event type').setRequired(true).addChoices(
      { name: 'Message Delete', value: 'msgdelete' },
      { name: 'Message Edit', value: 'msgedit' },
      { name: 'Member Join', value: 'memberjoin' },
      { name: 'Member Leave', value: 'memberleave' },
      { name: 'Bans', value: 'bans' },
      { name: 'Role Changes', value: 'roles' },
      { name: 'Channel Changes', value: 'channels' },
      { name: 'Voice Activity', value: 'voice' }
    )))
    .addSubcommand(s => s.setName('setmodlog').setDescription('Set separate mod log channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('setjoinlog').setDescription('Set join log channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('setleavelog').setDescription('Set leave log channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('setmsglog').setDescription('Set message log channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('test').setDescription('Send a test log message')),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'setlog') {
      const ch = interaction.options.getChannel('channel');
      await db.set(`log_channel_${guildId}`, ch.id);
      return interaction.reply({ embeds: [successEmbed('Log Channel', `Log channel set to ${ch}.`)] });
    }
    if (sub === 'disable') {
      await db.delete(`log_channel_${guildId}`);
      return interaction.reply({ embeds: [successEmbed('Logging Disabled', 'Logging has been disabled.')] });
    }
    if (sub === 'settings') {
      const ch = await db.get(`log_channel_${guildId}`);
      const events = (await db.get(`log_events_${guildId}`)) || {};
      const modLog = await db.get(`modlog_channel_${guildId}`);
      return interaction.reply({ embeds: [infoEmbed('📋 Logging Settings').addFields(
        { name: 'Log Channel', value: ch ? `<#${ch}>` : 'Not set', inline: true },
        { name: 'Mod Log', value: modLog ? `<#${modLog}>` : 'Not set', inline: true },
        { name: 'Msg Delete', value: events.msgdelete !== false ? '✅' : '❌', inline: true },
        { name: 'Msg Edit', value: events.msgedit !== false ? '✅' : '❌', inline: true },
        { name: 'Member Join', value: events.memberjoin !== false ? '✅' : '❌', inline: true },
        { name: 'Member Leave', value: events.memberleave !== false ? '✅' : '❌', inline: true },
        { name: 'Bans', value: events.bans !== false ? '✅' : '❌', inline: true },
        { name: 'Voice', value: events.voice !== false ? '✅' : '❌', inline: true }
      )] });
    }
    if (sub === 'toggle') {
      const event = interaction.options.getString('event');
      const events = (await db.get(`log_events_${guildId}`)) || {};
      events[event] = events[event] === false ? true : false;
      await db.set(`log_events_${guildId}`, events);
      return interaction.reply({ embeds: [successEmbed('Log Event', `**${event}** logging ${events[event] === false ? 'disabled' : 'enabled'}.`)] });
    }
    if (sub === 'setmodlog') {
      const ch = interaction.options.getChannel('channel');
      await db.set(`modlog_channel_${guildId}`, ch.id);
      return interaction.reply({ embeds: [successEmbed('Mod Log', `Mod log set to ${ch}.`)] });
    }
    if (sub === 'setjoinlog') {
      const ch = interaction.options.getChannel('channel');
      await db.set(`joinlog_channel_${guildId}`, ch.id);
      return interaction.reply({ embeds: [successEmbed('Join Log', `Join log set to ${ch}.`)] });
    }
    if (sub === 'setleavelog') {
      const ch = interaction.options.getChannel('channel');
      await db.set(`leavelog_channel_${guildId}`, ch.id);
      return interaction.reply({ embeds: [successEmbed('Leave Log', `Leave log set to ${ch}.`)] });
    }
    if (sub === 'setmsglog') {
      const ch = interaction.options.getChannel('channel');
      await db.set(`msglog_channel_${guildId}`, ch.id);
      return interaction.reply({ embeds: [successEmbed('Message Log', `Message log set to ${ch}.`)] });
    }
    if (sub === 'test') {
      const chId = await db.get(`log_channel_${guildId}`);
      if (!chId) return interaction.reply({ embeds: [errorEmbed('No log channel set. Use `/logging setlog` first.')], ephemeral: true });
      const ch = interaction.guild.channels.cache.get(chId);
      if (!ch) return interaction.reply({ embeds: [errorEmbed('Log channel not found.')], ephemeral: true });
      await ch.send({ embeds: [infoEmbed('🧪 Test Log', `Logging is working! Set up by ${interaction.user.tag}.`)] });
      return interaction.reply({ embeds: [successEmbed('Test Sent', `Test log sent to ${ch}.`)], ephemeral: true });
    }
  }
};
