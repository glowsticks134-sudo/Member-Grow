const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { resolveChannel, resolveRole } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Welcome';

const commands = [
  {
    name: 'setwelcome',
    description: 'Set the welcome channel',
    usage: '!setwelcome <channel>',
    aliases: ['welcomechannel'],
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`welcome_channel_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('Welcome Channel Set', `Welcome messages will be sent to ${ch}.`)] });
    }
  },
  {
    name: 'setwelcomemsg',
    description: 'Set the welcome message (use {user}, {server}, {count})',
    usage: '!setwelcomemsg <message>',
    aliases: ['welcomemessage'],
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const msg = args.join(' ');
      if (!msg) return message.reply({ embeds: [errorEmbed('Please provide a message.')] });
      await db.set(`welcome_msg_${message.guild.id}`, msg);
      message.reply({ embeds: [successEmbed('Welcome Message Set', `Welcome message: ${msg}`)] });
    }
  },
  {
    name: 'testwelcome',
    description: 'Test the welcome message',
    usage: '!testwelcome',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const chId = await db.get(`welcome_channel_${message.guild.id}`);
      if (!chId) return message.reply({ embeds: [errorEmbed('No welcome channel set. Use `!setwelcome`.')] });
      const ch = message.guild.channels.cache.get(chId);
      if (!ch) return message.reply({ embeds: [errorEmbed('Welcome channel not found.')] });
      const msg = (await db.get(`welcome_msg_${message.guild.id}`)) || '👋 Welcome to **{server}**, {user}! You are member #{count}.';
      const formatted = msg
        .replace('{user}', message.member.toString())
        .replace('{server}', message.guild.name)
        .replace('{count}', message.guild.memberCount)
        .replace('{username}', message.author.username);
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('👋 Welcome!')
        .setDescription(formatted)
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter({ text: CREDITS })
        .setTimestamp();
      ch.send({ embeds: [embed] });
      message.reply({ embeds: [successEmbed('Test Sent', `Test welcome sent to ${ch}.`)] });
    }
  },
  {
    name: 'setfarewell',
    description: 'Set the farewell channel',
    usage: '!setfarewell <channel>',
    aliases: ['farewellchannel'],
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`farewell_channel_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('Farewell Channel Set', `Farewell messages will be sent to ${ch}.`)] });
    }
  },
  {
    name: 'setfarewellmsg',
    description: 'Set the farewell message (use {user}, {server})',
    usage: '!setfarewellmsg <message>',
    aliases: ['farewellmessage'],
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const msg = args.join(' ');
      if (!msg) return message.reply({ embeds: [errorEmbed('Please provide a message.')] });
      await db.set(`farewell_msg_${message.guild.id}`, msg);
      message.reply({ embeds: [successEmbed('Farewell Message Set', `Farewell message: ${msg}`)] });
    }
  },
  {
    name: 'testfarewell',
    description: 'Test the farewell message',
    usage: '!testfarewell',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const chId = await db.get(`farewell_channel_${message.guild.id}`);
      if (!chId) return message.reply({ embeds: [errorEmbed('No farewell channel set.')] });
      const ch = message.guild.channels.cache.get(chId);
      if (!ch) return message.reply({ embeds: [errorEmbed('Farewell channel not found.')] });
      const msg = (await db.get(`farewell_msg_${message.guild.id}`)) || '👋 **{username}** has left the server.';
      const formatted = msg
        .replace('{user}', message.member.toString())
        .replace('{username}', message.author.username)
        .replace('{server}', message.guild.name);
      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle('👋 Goodbye!')
        .setDescription(formatted)
        .setFooter({ text: CREDITS })
        .setTimestamp();
      ch.send({ embeds: [embed] });
      message.reply({ embeds: [successEmbed('Test Sent', `Test farewell sent to ${ch}.`)] });
    }
  },
  {
    name: 'setautorole',
    description: 'Set a role given to new members automatically',
    usage: '!setautorole <role>',
    aliases: ['autorole'],
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const role = await resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      await db.set(`autorole_${message.guild.id}`, role.id);
      message.reply({ embeds: [successEmbed('Auto Role Set', `New members will receive ${role}.`)] });
    }
  },
  {
    name: 'removeautorole',
    description: 'Remove the auto role',
    usage: '!removeautorole',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      await db.delete(`autorole_${message.guild.id}`);
      message.reply({ embeds: [successEmbed('Auto Role Removed', 'Auto role has been removed.')] });
    }
  },
  {
    name: 'viewautorole',
    description: 'View the current auto role',
    usage: '!viewautorole',
    async execute(message, args) {
      const roleId = await db.get(`autorole_${message.guild.id}`);
      if (!roleId) return message.reply({ embeds: [infoEmbed('Auto Role', 'No auto role set.')] });
      message.reply({ embeds: [infoEmbed('Auto Role', `Current auto role: <@&${roleId}>`)] });
    }
  },
  {
    name: 'setbotjoinchannel',
    description: 'Set a channel where bot joins are announced',
    usage: '!setbotjoinchannel <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`botjoin_channel_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('Bot Join Channel', `Bot join notifications set to ${ch}.`)] });
    }
  },
  {
    name: 'welcomesettings',
    description: 'View all welcome settings',
    usage: '!welcomesettings',
    async execute(message, args) {
      const wChId = await db.get(`welcome_channel_${message.guild.id}`);
      const fChId = await db.get(`farewell_channel_${message.guild.id}`);
      const wMsg = await db.get(`welcome_msg_${message.guild.id}`);
      const fMsg = await db.get(`farewell_msg_${message.guild.id}`);
      const arId = await db.get(`autorole_${message.guild.id}`);
      const embed = infoEmbed('⚙️ Welcome Settings')
        .addFields(
          { name: 'Welcome Channel', value: wChId ? `<#${wChId}>` : 'Not set', inline: true },
          { name: 'Farewell Channel', value: fChId ? `<#${fChId}>` : 'Not set', inline: true },
          { name: 'Auto Role', value: arId ? `<@&${arId}>` : 'Not set', inline: true },
          { name: 'Welcome Message', value: wMsg || 'Default', inline: false },
          { name: 'Farewell Message', value: fMsg || 'Default', inline: false }
        );
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'setwelcomecolor',
    description: 'Set the welcome embed color',
    usage: '!setwelcomecolor <hex>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const hex = args[0]?.replace('#', '');
      if (!hex || !/^[0-9A-Fa-f]{6}$/.test(hex)) return message.reply({ embeds: [errorEmbed('Invalid hex color.')] });
      await db.set(`welcome_color_${message.guild.id}`, parseInt(hex, 16));
      message.reply({ embeds: [successEmbed('Welcome Color', `Color set to #${hex.toUpperCase()}.`)] });
    }
  },
  {
    name: 'togglewelcome',
    description: 'Enable or disable welcome messages',
    usage: '!togglewelcome',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const key = `welcome_enabled_${message.guild.id}`;
      const current = (await db.get(key)) !== false;
      await db.set(key, !current);
      message.reply({ embeds: [successEmbed('Welcome Messages', `Welcome messages ${!current ? 'enabled' : 'disabled'}.`)] });
    }
  },
  {
    name: 'togglefarewell',
    description: 'Enable or disable farewell messages',
    usage: '!togglefarewell',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const key = `farewell_enabled_${message.guild.id}`;
      const current = (await db.get(key)) !== false;
      await db.set(key, !current);
      message.reply({ embeds: [successEmbed('Farewell Messages', `Farewell messages ${!current ? 'enabled' : 'disabled'}.`)] });
    }
  }
];

module.exports = { category, commands };
