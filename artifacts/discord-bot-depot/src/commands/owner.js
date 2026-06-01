const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActivityType } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { isOwner } = require('../config');

module.exports = {
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('depot')
    .setDescription('Co-owner controls')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(s => s
      .setName('status')
      .setDescription('Full bot stats'))
    .addSubcommand(s => s
      .setName('servers')
      .setDescription('List all servers the bot is in'))
    .addSubcommand(s => s
      .setName('broadcast')
      .setDescription('Send a message to a channel in any server')
      .addStringOption(o => o.setName('channel_id').setDescription('Channel ID').setRequired(true))
      .addStringOption(o => o.setName('message').setDescription('Message to send').setRequired(true)))
    .addSubcommand(s => s
      .setName('dm')
      .setDescription('DM any user by their ID')
      .addStringOption(o => o.setName('user_id').setDescription('User ID').setRequired(true))
      .addStringOption(o => o.setName('message').setDescription('Message to send').setRequired(true)))
    .addSubcommand(s => s
      .setName('leave')
      .setDescription('Force the bot to leave a server')
      .addStringOption(o => o.setName('server_id').setDescription('Server ID').setRequired(true)))
    .addSubcommand(s => s
      .setName('setname')
      .setDescription("Change the bot's username")
      .addStringOption(o => o.setName('name').setDescription('New username').setRequired(true)))
    .addSubcommand(s => s
      .setName('setstatus')
      .setDescription("Change the bot's status message")
      .addStringOption(o => o.setName('text').setDescription('Status text').setRequired(true))
      .addStringOption(o => o.setName('type').setDescription('Activity type').addChoices(
        { name: 'Watching', value: 'watching' },
        { name: 'Playing', value: 'playing' },
        { name: 'Listening', value: 'listening' },
        { name: 'Competing', value: 'competing' }
      )))
    .addSubcommand(s => s
      .setName('eval')
      .setDescription('Run JavaScript code')
      .addStringOption(o => o.setName('code').setDescription('Code to evaluate').setRequired(true))),

  async execute(interaction, client) {
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to use this command.')], ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    if (sub === 'status') {
      await interaction.deferReply({ ephemeral: true });
      const totalMembers = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
      const mem = process.memoryUsage();
      const uptimeSec = Math.floor(process.uptime());
      const h = Math.floor(uptimeSec / 3600);
      const m = Math.floor((uptimeSec % 3600) / 60);
      const s = uptimeSec % 60;
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('🔧 Bot Status')
        .addFields(
          { name: 'Servers', value: String(client.guilds.cache.size), inline: true },
          { name: 'Total Members', value: String(totalMembers), inline: true },
          { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
          { name: 'Uptime', value: `${h}h ${m}m ${s}s`, inline: true },
          { name: 'Memory', value: `${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`, inline: true },
          { name: 'Node.js', value: process.version, inline: true }
        )
        .setFooter({ text: CREDITS })
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'servers') {
      await interaction.deferReply({ ephemeral: true });
      const list = client.guilds.cache.map(g => `**${g.name}** (${g.id}) — ${g.memberCount} members`).join('\n') || 'No servers.';
      const chunks = list.match(/[\s\S]{1,4000}/g) || [list];
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`📋 Servers (${client.guilds.cache.size})`)
        .setDescription(chunks[0])
        .setFooter({ text: CREDITS })
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    if (sub === 'broadcast') {
      await interaction.deferReply({ ephemeral: true });
      const channelId = interaction.options.getString('channel_id');
      const message = interaction.options.getString('message');
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.editReply({ embeds: [errorEmbed('Channel not found.')] });
      await channel.send(message).catch(() => null);
      return interaction.editReply({ embeds: [successEmbed('Sent', `Message delivered to <#${channelId}>`)] });
    }

    if (sub === 'dm') {
      await interaction.deferReply({ ephemeral: true });
      const userId = interaction.options.getString('user_id');
      const message = interaction.options.getString('message');
      const user = await client.users.fetch(userId).catch(() => null);
      if (!user) return interaction.editReply({ embeds: [errorEmbed('User not found.')] });
      await user.send(message).catch(() => null);
      return interaction.editReply({ embeds: [successEmbed('Sent', `DM delivered to **${user.tag}**`)] });
    }

    if (sub === 'leave') {
      await interaction.deferReply({ ephemeral: true });
      const serverId = interaction.options.getString('server_id');
      const guild = client.guilds.cache.get(serverId);
      if (!guild) return interaction.editReply({ embeds: [errorEmbed('Server not found or bot is not in it.')] });
      const name = guild.name;
      await guild.leave();
      return interaction.editReply({ embeds: [successEmbed('Left Server', `Left **${name}**`)] });
    }

    if (sub === 'setname') {
      await interaction.deferReply({ ephemeral: true });
      const name = interaction.options.getString('name');
      await client.user.setUsername(name).catch(() => null);
      return interaction.editReply({ embeds: [successEmbed('Username Updated', `Bot username set to **${name}**`)] });
    }

    if (sub === 'setstatus') {
      const text = interaction.options.getString('text');
      const type = interaction.options.getString('type') || 'watching';
      const typeMap = {
        watching: ActivityType.Watching,
        playing: ActivityType.Playing,
        listening: ActivityType.Listening,
        competing: ActivityType.Competing
      };
      client.user.setActivity(text, { type: typeMap[type] });
      return interaction.reply({ embeds: [successEmbed('Status Updated', `Now set to **${type} ${text}**`)], ephemeral: true });
    }

    if (sub === 'eval') {
      await interaction.deferReply({ ephemeral: true });
      const code = interaction.options.getString('code');
      try {
        let result = eval(code);
        if (result instanceof Promise) result = await result;
        const output = String(result).slice(0, 1900);
        const embed = new EmbedBuilder()
          .setColor(0x57F287)
          .setTitle('✅ Eval Result')
          .addFields(
            { name: 'Input', value: `\`\`\`js\n${code.slice(0, 900)}\n\`\`\`` },
            { name: 'Output', value: `\`\`\`js\n${output}\n\`\`\`` }
          )
          .setFooter({ text: CREDITS })
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      } catch (err) {
        return interaction.editReply({ embeds: [errorEmbed(`\`\`\`${err.message}\`\`\``)] });
      }
    }
  }
};
