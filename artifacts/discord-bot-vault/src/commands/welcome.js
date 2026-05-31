const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Welcome/leave system configuration')
    .addSubcommand(s => s.setName('setchannel').setDescription('Set the welcome channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('setmessage').setDescription('Set welcome message. Use {user}, {server}, {count}').addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)))
    .addSubcommand(s => s.setName('test').setDescription('Test the welcome message'))
    .addSubcommand(s => s.setName('disable').setDescription('Disable welcome messages'))
    .addSubcommand(s => s.setName('setleavechannel').setDescription('Set the leave channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('setleavemsg').setDescription('Set the leave message').addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)))
    .addSubcommand(s => s.setName('autorole').setDescription('Set auto-role for new members').addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true)))
    .addSubcommand(s => s.setName('removeautorole').setDescription('Remove auto-role'))
    .addSubcommand(s => s.setName('setembed').setDescription('Toggle embed welcome messages'))
    .addSubcommand(s => s.setName('setcolor').setDescription('Set welcome embed color').addStringOption(o => o.setName('color').setDescription('Hex color e.g. #FF5733').setRequired(true)))
    .addSubcommand(s => s.setName('setimage').setDescription('Set welcome banner image URL').addStringOption(o => o.setName('url').setDescription('Image URL').setRequired(true)))
    .addSubcommand(s => s.setName('settings').setDescription('View welcome settings'))
    .addSubcommand(s => s.setName('reset').setDescription('Reset all welcome settings')),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
      return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'setchannel') {
      const ch = interaction.options.getChannel('channel');
      await db.set(`welcome_channel_${guildId}`, ch.id);
      return interaction.reply({ embeds: [successEmbed('Welcome Channel', `Welcome messages will be sent to ${ch}.`)] });
    }
    if (sub === 'setmessage') {
      const msg = interaction.options.getString('message');
      await db.set(`welcome_msg_${guildId}`, msg);
      return interaction.reply({ embeds: [successEmbed('Welcome Message', `Message set to: ${msg}`)] });
    }
    if (sub === 'test') {
      const chId = await db.get(`welcome_channel_${guildId}`);
      if (!chId) return interaction.reply({ embeds: [errorEmbed('No welcome channel set.')], ephemeral: true });
      const ch = interaction.guild.channels.cache.get(chId);
      const msg = (await db.get(`welcome_msg_${guildId}`)) || 'Welcome to **{server}**, {user}!';
      const useEmbed = await db.get(`welcome_embed_${guildId}`);
      const color = (await db.get(`welcome_color_${guildId}`)) || BRAND_COLOR;
      const image = await db.get(`welcome_image_${guildId}`);
      const text = msg.replace('{user}', interaction.user.toString()).replace('{server}', interaction.guild.name).replace('{count}', interaction.guild.memberCount);
      if (useEmbed) {
        const embed = new EmbedBuilder().setColor(color).setDescription(text).setThumbnail(interaction.user.displayAvatarURL()).setFooter({ text: CREDITS }).setTimestamp();
        if (image) embed.setImage(image);
        await ch.send({ embeds: [embed] });
      } else {
        await ch.send(text);
      }
      return interaction.reply({ embeds: [successEmbed('Test Sent', `Test welcome sent to ${ch}.`)], ephemeral: true });
    }
    if (sub === 'disable') {
      await db.delete(`welcome_channel_${guildId}`);
      return interaction.reply({ embeds: [successEmbed('Welcome Disabled', 'Welcome messages disabled.')] });
    }
    if (sub === 'setleavechannel') {
      const ch = interaction.options.getChannel('channel');
      await db.set(`leave_channel_${guildId}`, ch.id);
      return interaction.reply({ embeds: [successEmbed('Leave Channel', `Leave messages will be sent to ${ch}.`)] });
    }
    if (sub === 'setleavemsg') {
      const msg = interaction.options.getString('message');
      await db.set(`leave_msg_${guildId}`, msg);
      return interaction.reply({ embeds: [successEmbed('Leave Message', `Leave message set to: ${msg}`)] });
    }
    if (sub === 'autorole') {
      const role = interaction.options.getRole('role');
      await db.set(`autorole_${guildId}`, role.id);
      return interaction.reply({ embeds: [successEmbed('Auto Role', `${role} will be assigned to new members.`)] });
    }
    if (sub === 'removeautorole') {
      await db.delete(`autorole_${guildId}`);
      return interaction.reply({ embeds: [successEmbed('Auto Role Removed', 'Auto-role has been disabled.')] });
    }
    if (sub === 'setembed') {
      const current = await db.get(`welcome_embed_${guildId}`);
      await db.set(`welcome_embed_${guildId}`, !current);
      return interaction.reply({ embeds: [successEmbed('Welcome Embed', `Embed welcome messages ${!current ? 'enabled' : 'disabled'}.`)] });
    }
    if (sub === 'setcolor') {
      const color = interaction.options.getString('color');
      await db.set(`welcome_color_${guildId}`, color);
      return interaction.reply({ embeds: [successEmbed('Welcome Color', `Welcome color set to \`${color}\`.`)] });
    }
    if (sub === 'setimage') {
      const url = interaction.options.getString('url');
      await db.set(`welcome_image_${guildId}`, url);
      return interaction.reply({ embeds: [successEmbed('Welcome Image', 'Welcome banner image set.')] });
    }
    if (sub === 'settings') {
      const ch = await db.get(`welcome_channel_${guildId}`);
      const msg = await db.get(`welcome_msg_${guildId}`);
      const autorole = await db.get(`autorole_${guildId}`);
      const leaveCh = await db.get(`leave_channel_${guildId}`);
      const useEmbed = await db.get(`welcome_embed_${guildId}`);
      return interaction.reply({ embeds: [infoEmbed('👋 Welcome Settings').addFields(
        { name: 'Welcome Channel', value: ch ? `<#${ch}>` : 'Not set', inline: true },
        { name: 'Leave Channel', value: leaveCh ? `<#${leaveCh}>` : 'Not set', inline: true },
        { name: 'Auto Role', value: autorole ? `<@&${autorole}>` : 'Not set', inline: true },
        { name: 'Embed Mode', value: useEmbed ? 'On' : 'Off', inline: true },
        { name: 'Message', value: msg || 'Default', inline: false }
      )] });
    }
    if (sub === 'reset') {
      for (const key of [`welcome_channel_${guildId}`, `welcome_msg_${guildId}`, `leave_channel_${guildId}`, `leave_msg_${guildId}`, `autorole_${guildId}`, `welcome_embed_${guildId}`, `welcome_color_${guildId}`, `welcome_image_${guildId}`]) {
        await db.delete(key);
      }
      return interaction.reply({ embeds: [successEmbed('Welcome Reset', 'All welcome settings have been reset.')] });
    }
  }
};
