const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { parseDuration, formatDuration } = require('../utils/helpers');
const db = require('../utils/database');

async function endGiveaway(client, giveaway) {
  const guild = client.guilds.cache.get(giveaway.guildId);
  if (!guild) return;
  const ch = guild.channels.cache.get(giveaway.channelId);
  if (!ch) return;
  const msg = await ch.messages.fetch(giveaway.messageId).catch(() => null);
  if (!msg) return;
  const entries = giveaway.entries || [];
  if (!entries.length) {
    const embed = new EmbedBuilder().setColor(0xED4245).setTitle('🎉 Giveaway Ended').setDescription(`**${giveaway.prize}**\nNo valid entries. No winner.`).setFooter({ text: CREDITS });
    return msg.edit({ embeds: [embed], components: [] });
  }
  const winners = [];
  const pool = [...entries];
  for (let i = 0; i < Math.min(giveaway.winners, pool.length); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(idx, 1)[0]);
  }
  const embed = new EmbedBuilder().setColor(0xFEE75C).setTitle('🎉 Giveaway Ended!').setDescription(`**Prize:** ${giveaway.prize}\n**Winner(s):** ${winners.map(id => `<@${id}>`).join(', ')}\n**Entries:** ${entries.length}`).setFooter({ text: CREDITS }).setTimestamp();
  msg.edit({ embeds: [embed], components: [] });
  ch.send({ content: `🎉 Congratulations ${winners.map(id => `<@${id}>`).join(', ')}! You won **${giveaway.prize}**!` });
  giveaway.ended = true;
  giveaway.winnerIds = winners;
  await db.set(`giveaway_${giveaway.id}`, giveaway);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Giveaway commands')
    .addSubcommand(s => s.setName('create').setDescription('Create a giveaway').addStringOption(o => o.setName('duration').setDescription('Duration e.g. 1h, 30m').setRequired(true)).addIntegerOption(o => o.setName('winners').setDescription('Number of winners').setRequired(true).setMinValue(1).setMaxValue(20)).addStringOption(o => o.setName('prize').setDescription('Prize').setRequired(true)).addChannelOption(o => o.setName('channel').setDescription('Channel (default: current)')))
    .addSubcommand(s => s.setName('end').setDescription('End a giveaway early').addStringOption(o => o.setName('messageid').setDescription('Giveaway message ID').setRequired(true)))
    .addSubcommand(s => s.setName('reroll').setDescription('Reroll giveaway winners').addStringOption(o => o.setName('messageid').setDescription('Giveaway message ID').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List active giveaways'))
    .addSubcommand(s => s.setName('pause').setDescription('Pause a giveaway').addStringOption(o => o.setName('messageid').setDescription('Giveaway message ID').setRequired(true)))
    .addSubcommand(s => s.setName('resume').setDescription('Resume a paused giveaway').addStringOption(o => o.setName('messageid').setDescription('Giveaway message ID').setRequired(true)))
    .addSubcommand(s => s.setName('delete').setDescription('Delete a giveaway').addStringOption(o => o.setName('messageid').setDescription('Giveaway message ID').setRequired(true)))
    .addSubcommand(s => s.setName('blacklist').setDescription('Blacklist a user from giveaways').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)))
    .addSubcommand(s => s.setName('requirerole').setDescription('Require a role to enter giveaways').addRoleOption(o => o.setName('role').setDescription('Required role').setRequired(true)))
    .addSubcommand(s => s.setName('clearrequirement').setDescription('Clear giveaway role requirement')),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'create') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Server permission.')], ephemeral: true });
      const durationStr = interaction.options.getString('duration');
      const winners = interaction.options.getInteger('winners');
      const prize = interaction.options.getString('prize');
      const ch = interaction.options.getChannel('channel') || interaction.channel;
      const duration = parseDuration(durationStr);
      if (!duration) return interaction.reply({ embeds: [errorEmbed('Invalid duration. Use e.g. `1h`, `30m`, `2d`.')], ephemeral: true });
      const endTime = Date.now() + duration;
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR).setTitle('🎉 Giveaway!').setDescription(`**${prize}**\n\nClick the button to enter!\n\nWinners: **${winners}**\nEnds: <t:${Math.floor(endTime / 1000)}:R>`)
        .addFields({ name: 'Entries', value: '0', inline: true }, { name: 'Hosted by', value: interaction.user.tag, inline: true })
        .setFooter({ text: CREDITS }).setTimestamp(endTime);
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('giveaway_enter').setLabel('🎉 Enter').setStyle(ButtonStyle.Success));
      const msg = await ch.send({ embeds: [embed], components: [row] });
      const id = `${guildId}_${msg.id}`;
      const giveawayData = { id, guildId, channelId: ch.id, messageId: msg.id, prize, winners, entries: [], endTime, ended: false, hostedBy: interaction.user.id };
      await db.set(`giveaway_${id}`, giveawayData);
      setTimeout(() => endGiveaway(client, giveawayData), duration);
      return interaction.reply({ embeds: [successEmbed('Giveaway Created', `Giveaway for **${prize}** started in ${ch}!`)], ephemeral: true });
    }

    if (sub === 'end') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Server permission.')], ephemeral: true });
      const msgId = interaction.options.getString('messageid');
      const id = `${guildId}_${msgId}`;
      const giveaway = await db.get(`giveaway_${id}`);
      if (!giveaway) return interaction.reply({ embeds: [errorEmbed('Giveaway not found.')], ephemeral: true });
      await endGiveaway(client, giveaway);
      return interaction.reply({ embeds: [successEmbed('Giveaway Ended', 'The giveaway has been ended early.')], ephemeral: true });
    }

    if (sub === 'reroll') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Server permission.')], ephemeral: true });
      const msgId = interaction.options.getString('messageid');
      const id = `${guildId}_${msgId}`;
      const giveaway = await db.get(`giveaway_${id}`);
      if (!giveaway || !giveaway.entries?.length) return interaction.reply({ embeds: [errorEmbed('Giveaway not found or no entries.')], ephemeral: true });
      const winner = giveaway.entries[Math.floor(Math.random() * giveaway.entries.length)];
      await interaction.channel.send({ content: `🎉 Reroll winner: <@${winner}>! Congrats on winning **${giveaway.prize}**!` });
      return interaction.reply({ embeds: [successEmbed('Rerolled', `New winner: <@${winner}>`)], ephemeral: true });
    }

    if (sub === 'list') {
      const allKeys = await db.all();
      const active = allKeys.filter(k => k.id.startsWith(`giveaway_${guildId}_`) && !k.value.ended);
      if (!active.length) return interaction.reply({ embeds: [infoEmbed('Giveaways', 'No active giveaways.')] });
      const list = active.slice(0, 10).map(k => `**${k.value.prize}** — ends <t:${Math.floor(k.value.endTime / 1000)}:R> — ${k.value.entries.length} entries`).join('\n');
      return interaction.reply({ embeds: [infoEmbed('🎉 Active Giveaways', list)] });
    }

    if (sub === 'pause') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Server permission.')], ephemeral: true });
      const msgId = interaction.options.getString('messageid');
      const id = `${guildId}_${msgId}`;
      const giveaway = await db.get(`giveaway_${id}`);
      if (!giveaway) return interaction.reply({ embeds: [errorEmbed('Giveaway not found.')], ephemeral: true });
      giveaway.paused = true;
      await db.set(`giveaway_${id}`, giveaway);
      return interaction.reply({ embeds: [successEmbed('Giveaway Paused', 'The giveaway has been paused.')] });
    }

    if (sub === 'resume') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Server permission.')], ephemeral: true });
      const msgId = interaction.options.getString('messageid');
      const id = `${guildId}_${msgId}`;
      const giveaway = await db.get(`giveaway_${id}`);
      if (!giveaway) return interaction.reply({ embeds: [errorEmbed('Giveaway not found.')], ephemeral: true });
      giveaway.paused = false;
      await db.set(`giveaway_${id}`, giveaway);
      return interaction.reply({ embeds: [successEmbed('Giveaway Resumed', 'The giveaway has been resumed.')] });
    }

    if (sub === 'delete') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Server permission.')], ephemeral: true });
      const msgId = interaction.options.getString('messageid');
      const id = `${guildId}_${msgId}`;
      await db.delete(`giveaway_${id}`);
      return interaction.reply({ embeds: [successEmbed('Giveaway Deleted', 'Giveaway data deleted.')] });
    }

    if (sub === 'blacklist') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Server permission.')], ephemeral: true });
      const user = interaction.options.getUser('user');
      const list = (await db.get(`gblacklist_${guildId}`)) || [];
      if (list.includes(user.id)) {
        list.splice(list.indexOf(user.id), 1);
        await db.set(`gblacklist_${guildId}`, list);
        return interaction.reply({ embeds: [successEmbed('Blacklist Removed', `${user.tag} removed from giveaway blacklist.`)] });
      }
      list.push(user.id);
      await db.set(`gblacklist_${guildId}`, list);
      return interaction.reply({ embeds: [successEmbed('Blacklisted', `${user.tag} added to giveaway blacklist.`)] });
    }

    if (sub === 'requirerole') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Server permission.')], ephemeral: true });
      const role = interaction.options.getRole('role');
      await db.set(`giveaway_req_${guildId}`, role.id);
      return interaction.reply({ embeds: [successEmbed('Role Requirement', `${role} is now required to enter giveaways.`)] });
    }

    if (sub === 'clearrequirement') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Server permission.')], ephemeral: true });
      await db.delete(`giveaway_req_${guildId}`);
      return interaction.reply({ embeds: [successEmbed('Requirement Cleared', 'Giveaway role requirement removed.')] });
    }
  }
};
