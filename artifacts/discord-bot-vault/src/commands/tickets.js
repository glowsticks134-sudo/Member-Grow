const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tickets')
    .setDescription('Ticket system commands')
    .addSubcommand(s => s.setName('setup').setDescription('Set up the ticket panel').addChannelOption(o => o.setName('channel').setDescription('Channel for panel (default: current)')))
    .addSubcommand(s => s.setName('close').setDescription('Close the current ticket'))
    .addSubcommand(s => s.setName('closeall').setDescription('Close all open tickets'))
    .addSubcommand(s => s.setName('add').setDescription('Add a user to a ticket').addUserOption(o => o.setName('user').setDescription('User to add').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove a user from a ticket').addUserOption(o => o.setName('user').setDescription('User to remove').setRequired(true)))
    .addSubcommand(s => s.setName('rename').setDescription('Rename ticket channel').addStringOption(o => o.setName('name').setDescription('New name').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List all open tickets'))
    .addSubcommand(s => s.setName('setrole').setDescription('Set the support role').addRoleOption(o => o.setName('role').setDescription('Support role').setRequired(true)))
    .addSubcommand(s => s.setName('setcategory').setDescription('Set ticket category').addStringOption(o => o.setName('name').setDescription('Category name').setRequired(true)))
    .addSubcommand(s => s.setName('setmax').setDescription('Set max tickets per user').addIntegerOption(o => o.setName('max').setDescription('Max tickets').setRequired(true).setMinValue(1).setMaxValue(5)))
    .addSubcommand(s => s.setName('setmessage').setDescription('Set ticket opening message').addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)))
    .addSubcommand(s => s.setName('setlog').setDescription('Set ticket log channel').addChannelOption(o => o.setName('channel').setDescription('Log channel').setRequired(true)))
    .addSubcommand(s => s.setName('settings').setDescription('View ticket settings'))
    .addSubcommand(s => s.setName('claim').setDescription('Claim a ticket as your own')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'setup') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const ch = interaction.options.getChannel('channel') || interaction.channel;
      const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle('🎫 Support Tickets').setDescription('Click the button below to open a support ticket.\n\nOur staff will assist you as soon as possible.').setFooter({ text: CREDITS });
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_create').setLabel('📩 Open Ticket').setStyle(ButtonStyle.Primary));
      await ch.send({ embeds: [embed], components: [row] });
      return interaction.reply({ embeds: [successEmbed('Ticket Panel', `Panel sent to ${ch}.`)], ephemeral: true });
    }

    if (sub === 'close') {
      const ticket = await db.get(`ticket_${guildId}_${interaction.channel.id}`);
      if (!ticket) return interaction.reply({ embeds: [errorEmbed('This is not a ticket channel.')], ephemeral: true });
      await interaction.reply({ embeds: [infoEmbed('🎫 Closing Ticket', 'This ticket will be deleted in 5 seconds...')] });
      await db.delete(`ticket_${guildId}_${interaction.channel.id}`);
      const logChId = await db.get(`ticket_log_${guildId}`);
      if (logChId) {
        const logCh = interaction.guild.channels.cache.get(logChId);
        if (logCh) logCh.send({ embeds: [infoEmbed('🎫 Ticket Closed', `Ticket closed by ${interaction.user.tag}.`)] });
      }
      setTimeout(() => interaction.channel.delete().catch(() => null), 5000);
    }

    if (sub === 'closeall') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      await interaction.deferReply();
      const tickets = interaction.guild.channels.cache.filter(c => c.name.startsWith('ticket-'));
      let count = 0;
      for (const [, ch] of tickets) {
        await db.delete(`ticket_${guildId}_${ch.id}`);
        await ch.delete().catch(() => null);
        count++;
      }
      return interaction.editReply({ embeds: [successEmbed('Tickets Closed', `Closed **${count}** tickets.`)] });
    }

    if (sub === 'add') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true, SendMessages: true });
      return interaction.reply({ embeds: [successEmbed('User Added', `${user.tag} added to this ticket.`)] });
    }

    if (sub === 'remove') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
      const user = interaction.options.getUser('user');
      await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: false });
      return interaction.reply({ embeds: [successEmbed('User Removed', `${user.tag} removed from this ticket.`)] });
    }

    if (sub === 'rename') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
      const name = interaction.options.getString('name');
      await interaction.channel.setName(name);
      return interaction.reply({ embeds: [successEmbed('Ticket Renamed', `Channel renamed to **${name}**.`)] });
    }

    if (sub === 'list') {
      const tickets = interaction.guild.channels.cache.filter(c => c.name.startsWith('ticket-'));
      if (!tickets.size) return interaction.reply({ embeds: [infoEmbed('Tickets', 'No open tickets.')] });
      const list = tickets.map(c => `${c} — created <t:${Math.floor(c.createdTimestamp / 1000)}:R>`).join('\n');
      return interaction.reply({ embeds: [infoEmbed(`🎫 Open Tickets (${tickets.size})`, list)] });
    }

    if (sub === 'setrole') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const role = interaction.options.getRole('role');
      await db.set(`ticket_role_${guildId}`, role.id);
      return interaction.reply({ embeds: [successEmbed('Support Role', `${role} will be notified for new tickets.`)] });
    }

    if (sub === 'setcategory') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const name = interaction.options.getString('name');
      const cat = interaction.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes(name.toLowerCase()));
      if (!cat) return interaction.reply({ embeds: [errorEmbed('Category not found.')], ephemeral: true });
      await db.set(`ticket_category_${guildId}`, cat.id);
      return interaction.reply({ embeds: [successEmbed('Ticket Category', `Tickets will open under **${cat.name}**.`)] });
    }

    if (sub === 'setmax') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const max = interaction.options.getInteger('max');
      await db.set(`ticket_max_${guildId}`, max);
      return interaction.reply({ embeds: [successEmbed('Max Tickets', `Max tickets per user set to **${max}**.`)] });
    }

    if (sub === 'setmessage') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const msg = interaction.options.getString('message');
      await db.set(`ticket_message_${guildId}`, msg);
      return interaction.reply({ embeds: [successEmbed('Ticket Message', `Ticket message set to: ${msg}`)] });
    }

    if (sub === 'setlog') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const ch = interaction.options.getChannel('channel');
      await db.set(`ticket_log_${guildId}`, ch.id);
      return interaction.reply({ embeds: [successEmbed('Ticket Log', `Ticket logs will go to ${ch}.`)] });
    }

    if (sub === 'settings') {
      const role = await db.get(`ticket_role_${guildId}`);
      const max = (await db.get(`ticket_max_${guildId}`)) || 1;
      const logCh = await db.get(`ticket_log_${guildId}`);
      return interaction.reply({ embeds: [infoEmbed('🎫 Ticket Settings').addFields(
        { name: 'Support Role', value: role ? `<@&${role}>` : 'Not set', inline: true },
        { name: 'Max Tickets', value: String(max), inline: true },
        { name: 'Log Channel', value: logCh ? `<#${logCh}>` : 'Not set', inline: true }
      )] });
    }

    if (sub === 'claim') {
      const ticket = await db.get(`ticket_${guildId}_${interaction.channel.id}`);
      if (!ticket) return interaction.reply({ embeds: [errorEmbed('This is not a ticket channel.')], ephemeral: true });
      await db.set(`ticket_claimed_${guildId}_${interaction.channel.id}`, interaction.user.id);
      return interaction.reply({ embeds: [successEmbed('Ticket Claimed', `${interaction.user.tag} has claimed this ticket.`)] });
    }
  }
};
