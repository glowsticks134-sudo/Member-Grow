const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { resolveUser, resolveRole, resolveChannel } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Tickets';

const commands = [
  {
    name: 'ticketsetup',
    description: 'Set up the ticket system with a panel button',
    usage: '!ticketsetup [channel]',
    aliases: ['setupticket', 'setuppanel'],
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
        return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = args[0] ? await resolveChannel(message.guild, args[0]) : message.channel;
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('🎫 Support Tickets')
        .setDescription('Click the button below to open a support ticket.\n\nOur staff will assist you as soon as possible.')
        .setFooter({ text: CREDITS });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ticket_create').setLabel('📩 Open Ticket').setStyle(ButtonStyle.Primary)
      );
      await ch.send({ embeds: [embed], components: [row] });
      await db.set(`ticket_category_${message.guild.id}`, null);
      message.reply({ embeds: [successEmbed('Ticket Panel Created', `Panel sent to ${ch}.`)] });
    }
  },
  {
    name: 'ticketcategory',
    description: 'Set the category where tickets are created',
    usage: '!ticketcategory <category>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
        return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const cat = message.guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes(args.join(' ').toLowerCase()));
      if (!cat) return message.reply({ embeds: [errorEmbed('Could not find that category.')] });
      await db.set(`ticket_category_${message.guild.id}`, cat.id);
      message.reply({ embeds: [successEmbed('Ticket Category', `Tickets will be created under **${cat.name}**.`)] });
    }
  },
  {
    name: 'ticketrole',
    description: 'Set the support role that can see tickets',
    usage: '!ticketrole <role>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
        return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const role = await resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      await db.set(`ticket_role_${message.guild.id}`, role.id);
      message.reply({ embeds: [successEmbed('Ticket Role', `Support role set to ${role}.`)] });
    }
  },
  {
    name: 'closeticket',
    description: 'Close a ticket',
    usage: '!closeticket',
    aliases: ['close', 'tc'],
    async execute(message, args) {
      const isTicket = await db.get(`ticket_${message.guild.id}_${message.channel.id}`);
      if (!isTicket) return message.reply({ embeds: [errorEmbed('This is not a ticket channel.')] });
      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('🔒 Ticket Closing')
        .setDescription('This ticket will be deleted in 5 seconds.')
        .setFooter({ text: CREDITS });
      await message.channel.send({ embeds: [embed] });
      setTimeout(async () => {
        await message.channel.delete().catch(() => null);
        await db.delete(`ticket_${message.guild.id}_${message.channel.id}`);
      }, 5000);
    }
  },
  {
    name: 'adduser',
    description: 'Add a user to the current ticket',
    usage: '!adduser <user>',
    async execute(message, args) {
      const isTicket = await db.get(`ticket_${message.guild.id}_${message.channel.id}`);
      if (!isTicket) return message.reply({ embeds: [errorEmbed('This is not a ticket channel.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      await message.channel.permissionOverwrites.edit(target, { ViewChannel: true, SendMessages: true });
      message.reply({ embeds: [successEmbed('User Added', `${target.user.tag} has been added to the ticket.`)] });
    }
  },
  {
    name: 'removeuser',
    description: 'Remove a user from the current ticket',
    usage: '!removeuser <user>',
    async execute(message, args) {
      const isTicket = await db.get(`ticket_${message.guild.id}_${message.channel.id}`);
      if (!isTicket) return message.reply({ embeds: [errorEmbed('This is not a ticket channel.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      await message.channel.permissionOverwrites.edit(target, { ViewChannel: false });
      message.reply({ embeds: [successEmbed('User Removed', `${target.user.tag} has been removed from the ticket.`)] });
    }
  },
  {
    name: 'renameticket',
    description: 'Rename the current ticket channel',
    usage: '!renameticket <name>',
    async execute(message, args) {
      const isTicket = await db.get(`ticket_${message.guild.id}_${message.channel.id}`);
      if (!isTicket) return message.reply({ embeds: [errorEmbed('This is not a ticket channel.')] });
      const name = args.join('-');
      if (!name) return message.reply({ embeds: [errorEmbed('Please provide a name.')] });
      await message.channel.setName(`ticket-${name}`);
      message.reply({ embeds: [successEmbed('Ticket Renamed', `Ticket renamed to \`ticket-${name}\`.`)] });
    }
  },
  {
    name: 'claimticket',
    description: 'Claim a ticket as your own',
    usage: '!claimticket',
    aliases: ['claim'],
    async execute(message, args) {
      const isTicket = await db.get(`ticket_${message.guild.id}_${message.channel.id}`);
      if (!isTicket) return message.reply({ embeds: [errorEmbed('This is not a ticket channel.')] });
      await db.set(`ticket_claim_${message.guild.id}_${message.channel.id}`, message.author.id);
      message.reply({ embeds: [successEmbed('Ticket Claimed', `${message.author.tag} has claimed this ticket.`)] });
    }
  },
  {
    name: 'unclaimticket',
    description: 'Unclaim a ticket',
    usage: '!unclaimticket',
    aliases: ['unclaim'],
    async execute(message, args) {
      await db.delete(`ticket_claim_${message.guild.id}_${message.channel.id}`);
      message.reply({ embeds: [successEmbed('Ticket Unclaimed', 'This ticket has been unclaimed.')] });
    }
  },
  {
    name: 'ticketlog',
    description: 'Set the ticket log channel',
    usage: '!ticketlog <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
        return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`ticket_log_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('Ticket Log', `Ticket logs set to ${ch}.`)] });
    }
  },
  {
    name: 'ticketmessage',
    description: 'Set the message shown inside a new ticket',
    usage: '!ticketmessage <message>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
        return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const msg = args.join(' ');
      if (!msg) return message.reply({ embeds: [errorEmbed('Please provide a message.')] });
      await db.set(`ticket_message_${message.guild.id}`, msg);
      message.reply({ embeds: [successEmbed('Ticket Message', `Message set to: ${msg}`)] });
    }
  },
  {
    name: 'ticketcount',
    description: 'View total tickets created',
    usage: '!ticketcount',
    async execute(message, args) {
      const count = (await db.get(`ticket_count_${message.guild.id}`)) || 0;
      message.reply({ embeds: [infoEmbed('🎫 Ticket Count', `**${count}** tickets have been created in this server.`)] });
    }
  },
  {
    name: 'maxtickets',
    description: 'Set max open tickets per user',
    usage: '!maxtickets <number>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
        return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const max = parseInt(args[0]);
      if (isNaN(max) || max < 1) return message.reply({ embeds: [errorEmbed('Please provide a valid number.')] });
      await db.set(`ticket_max_${message.guild.id}`, max);
      message.reply({ embeds: [successEmbed('Max Tickets', `Users can now have up to **${max}** open tickets.`)] });
    }
  },
  {
    name: 'ticketsettings',
    description: 'View all ticket settings',
    usage: '!ticketsettings',
    async execute(message, args) {
      const catId = await db.get(`ticket_category_${message.guild.id}`);
      const roleId = await db.get(`ticket_role_${message.guild.id}`);
      const logId = await db.get(`ticket_log_${message.guild.id}`);
      const max = (await db.get(`ticket_max_${message.guild.id}`)) || 1;
      const count = (await db.get(`ticket_count_${message.guild.id}`)) || 0;
      const embed = infoEmbed('🎫 Ticket Settings')
        .addFields(
          { name: 'Category', value: catId ? `<#${catId}>` : 'Not set', inline: true },
          { name: 'Support Role', value: roleId ? `<@&${roleId}>` : 'Not set', inline: true },
          { name: 'Log Channel', value: logId ? `<#${logId}>` : 'Not set', inline: true },
          { name: 'Max per User', value: String(max), inline: true },
          { name: 'Total Tickets', value: String(count), inline: true }
        );
      message.reply({ embeds: [embed] });
    }
  }
];

module.exports = { category, commands };
