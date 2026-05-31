const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('starboard')
    .setDescription('Starboard configuration')
    .addSubcommand(s => s.setName('setup').setDescription('Set up the starboard').addChannelOption(o => o.setName('channel').setDescription('Starboard channel').setRequired(true)).addIntegerOption(o => o.setName('threshold').setDescription('Stars needed (default: 3)').setMinValue(1)))
    .addSubcommand(s => s.setName('disable').setDescription('Disable the starboard'))
    .addSubcommand(s => s.setName('settings').setDescription('View starboard settings'))
    .addSubcommand(s => s.setName('setthreshold').setDescription('Change star threshold').addIntegerOption(o => o.setName('amount').setDescription('Stars needed').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('setemoji').setDescription('Change the star emoji').addStringOption(o => o.setName('emoji').setDescription('Emoji').setRequired(true)))
    .addSubcommand(s => s.setName('ignore').setDescription('Toggle ignore a channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('top').setDescription('Top starred messages'))
    .addSubcommand(s => s.setName('self').setDescription('Toggle allowing self-starring')),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'setup') {
      const ch = interaction.options.getChannel('channel');
      const threshold = interaction.options.getInteger('threshold') || 3;
      await db.set(`starboard_channel_${guildId}`, ch.id);
      await db.set(`starboard_threshold_${guildId}`, threshold);
      return interaction.reply({ embeds: [successEmbed('⭐ Starboard Setup', `Starboard set to ${ch} with **${threshold}** ⭐ threshold.`)] });
    }
    if (sub === 'disable') {
      await db.delete(`starboard_channel_${guildId}`);
      return interaction.reply({ embeds: [successEmbed('Starboard Disabled', 'Starboard has been disabled.')] });
    }
    if (sub === 'settings') {
      const ch = await db.get(`starboard_channel_${guildId}`);
      const threshold = (await db.get(`starboard_threshold_${guildId}`)) || 3;
      const emoji = (await db.get(`starboard_emoji_${guildId}`)) || '⭐';
      const selfStar = (await db.get(`starboard_self_${guildId}`)) || false;
      return interaction.reply({ embeds: [infoEmbed('⭐ Starboard Settings').addFields(
        { name: 'Channel', value: ch ? `<#${ch}>` : 'Not set', inline: true },
        { name: 'Threshold', value: String(threshold), inline: true },
        { name: 'Emoji', value: emoji, inline: true },
        { name: 'Self-Star', value: selfStar ? 'Allowed' : 'Disabled', inline: true }
      )] });
    }
    if (sub === 'setthreshold') {
      const amount = interaction.options.getInteger('amount');
      await db.set(`starboard_threshold_${guildId}`, amount);
      return interaction.reply({ embeds: [successEmbed('Threshold Updated', `Starboard threshold set to **${amount}** ⭐.`)] });
    }
    if (sub === 'setemoji') {
      const emoji = interaction.options.getString('emoji');
      await db.set(`starboard_emoji_${guildId}`, emoji);
      return interaction.reply({ embeds: [successEmbed('Emoji Updated', `Starboard emoji set to ${emoji}.`)] });
    }
    if (sub === 'ignore') {
      const ch = interaction.options.getChannel('channel');
      const list = (await db.get(`starboard_ignore_${guildId}`)) || [];
      const idx = list.indexOf(ch.id);
      if (idx !== -1) { list.splice(idx, 1); await db.set(`starboard_ignore_${guildId}`, list); return interaction.reply({ embeds: [successEmbed('Unignored', `${ch} is no longer ignored.`)] }); }
      list.push(ch.id);
      await db.set(`starboard_ignore_${guildId}`, list);
      return interaction.reply({ embeds: [successEmbed('Ignored', `${ch} added to starboard ignore list.`)] });
    }
    if (sub === 'top') {
      const allKeys = await db.all();
      const stars = allKeys.filter(k => k.id.startsWith(`starboard_msg_${guildId}_`)).sort((a, b) => b.value.stars - a.value.stars).slice(0, 5);
      if (!stars.length) return interaction.reply({ embeds: [infoEmbed('⭐ Top Stars', 'No starred messages yet.')] });
      const list = stars.map((k, i) => `**${i + 1}.** ⭐ ${k.value.stars} — [Jump](${k.value.url || '#'})`).join('\n');
      return interaction.reply({ embeds: [infoEmbed('⭐ Top Starred Messages', list)] });
    }
    if (sub === 'self') {
      const current = (await db.get(`starboard_self_${guildId}`)) || false;
      await db.set(`starboard_self_${guildId}`, !current);
      return interaction.reply({ embeds: [successEmbed('Self-Star', `Self-starring ${!current ? 'allowed' : 'disabled'}.`)] });
    }
  }
};
