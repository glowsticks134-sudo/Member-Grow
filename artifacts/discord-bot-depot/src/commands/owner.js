const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActivityType } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { isOwner } = require('../config');
const db = require('../utils/database');

module.exports = {
  ownerOnly: true,
  data: new SlashCommandBuilder()
    .setName('depot')
    .setDescription('Co-owner controls')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

    // ── existing ──────────────────────────────────────────────
    .addSubcommand(s => s
      .setName('status')
      .setDescription('Full bot stats'))
    .addSubcommand(s => s
      .setName('servers')
      .setDescription('List all servers the bot is in'))
    .addSubcommand(s => s
      .setName('broadcast')
      .setDescription('Send a plain message to any channel')
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
      .addStringOption(o => o.setName('code').setDescription('Code to evaluate').setRequired(true)))

    // ── new ───────────────────────────────────────────────────
    .addSubcommand(s => s
      .setName('setavatar')
      .setDescription("Change the bot's avatar via image URL")
      .addStringOption(o => o.setName('url').setDescription('Direct image URL').setRequired(true)))
    .addSubcommand(s => s
      .setName('announce')
      .setDescription('Send a rich embed announcement to any channel')
      .addStringOption(o => o.setName('channel_id').setDescription('Channel ID').setRequired(true))
      .addStringOption(o => o.setName('title').setDescription('Embed title').setRequired(true))
      .addStringOption(o => o.setName('message').setDescription('Embed description').setRequired(true))
      .addStringOption(o => o.setName('color').setDescription('Hex color e.g. FF5733 (default: brand color)')))
    .addSubcommand(s => s
      .setName('serverinfo')
      .setDescription('Get detailed info about any server by ID')
      .addStringOption(o => o.setName('server_id').setDescription('Server ID').setRequired(true)))
    .addSubcommand(s => s
      .setName('userinfo')
      .setDescription('Look up any user by their ID')
      .addStringOption(o => o.setName('user_id').setDescription('User ID').setRequired(true)))
    .addSubcommand(s => s
      .setName('botban')
      .setDescription('Globally ban a user from using the bot')
      .addStringOption(o => o.setName('user_id').setDescription('User ID').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Reason')))
    .addSubcommand(s => s
      .setName('botunban')
      .setDescription('Remove a global bot ban')
      .addStringOption(o => o.setName('user_id').setDescription('User ID').setRequired(true)))
    .addSubcommand(s => s
      .setName('botbans')
      .setDescription('List all globally banned users'))
    .addSubcommand(s => s
      .setName('spy')
      .setDescription('See the last messages in any channel')
      .addStringOption(o => o.setName('channel_id').setDescription('Channel ID').setRequired(true))
      .addIntegerOption(o => o.setName('amount').setDescription('Number of messages (default 10, max 25)')))
    .addSubcommand(s => s
      .setName('warn')
      .setDescription('Secretly warn a user via DM')
      .addStringOption(o => o.setName('user_id').setDescription('User ID').setRequired(true))
      .addStringOption(o => o.setName('reason').setDescription('Warning reason').setRequired(true)))
    .addSubcommand(s => s
      .setName('shutdown')
      .setDescription('Gracefully shut down the bot')),

  async execute(interaction, client) {
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({ embeds: [errorEmbed('You do not have permission to use this command.')], ephemeral: true });
    }

    const sub = interaction.options.getSubcommand();

    // ── status ────────────────────────────────────────────────
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

    // ── servers ───────────────────────────────────────────────
    if (sub === 'servers') {
      await interaction.deferReply({ ephemeral: true });
      const list = client.guilds.cache.map(g => `**${g.name}** (${g.id}) — ${g.memberCount} members`).join('\n') || 'No servers.';
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`📋 Servers (${client.guilds.cache.size})`)
        .setDescription(list.slice(0, 4000))
        .setFooter({ text: CREDITS })
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    // ── broadcast ─────────────────────────────────────────────
    if (sub === 'broadcast') {
      await interaction.deferReply({ ephemeral: true });
      const channelId = interaction.options.getString('channel_id');
      const message = interaction.options.getString('message');
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.editReply({ embeds: [errorEmbed('Channel not found.')] });
      await channel.send(message).catch(() => null);
      return interaction.editReply({ embeds: [successEmbed('Sent', `Message delivered to <#${channelId}>`)] });
    }

    // ── dm ────────────────────────────────────────────────────
    if (sub === 'dm') {
      await interaction.deferReply({ ephemeral: true });
      const userId = interaction.options.getString('user_id');
      const message = interaction.options.getString('message');
      const user = await client.users.fetch(userId).catch(() => null);
      if (!user) return interaction.editReply({ embeds: [errorEmbed('User not found.')] });
      await user.send(message).catch(() => null);
      return interaction.editReply({ embeds: [successEmbed('Sent', `DM delivered to **${user.tag}**`)] });
    }

    // ── leave ─────────────────────────────────────────────────
    if (sub === 'leave') {
      await interaction.deferReply({ ephemeral: true });
      const serverId = interaction.options.getString('server_id');
      const guild = client.guilds.cache.get(serverId);
      if (!guild) return interaction.editReply({ embeds: [errorEmbed('Server not found or bot is not in it.')] });
      const name = guild.name;
      await guild.leave();
      return interaction.editReply({ embeds: [successEmbed('Left Server', `Left **${name}**`)] });
    }

    // ── setname ───────────────────────────────────────────────
    if (sub === 'setname') {
      await interaction.deferReply({ ephemeral: true });
      const name = interaction.options.getString('name');
      await client.user.setUsername(name).catch(() => null);
      return interaction.editReply({ embeds: [successEmbed('Username Updated', `Bot username set to **${name}**`)] });
    }

    // ── setstatus ─────────────────────────────────────────────
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

    // ── eval ──────────────────────────────────────────────────
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

    // ── setavatar ─────────────────────────────────────────────
    if (sub === 'setavatar') {
      await interaction.deferReply({ ephemeral: true });
      const url = interaction.options.getString('url');
      try {
        await client.user.setAvatar(url);
        return interaction.editReply({ embeds: [successEmbed('Avatar Updated', `Bot avatar has been changed.`)] });
      } catch (err) {
        return interaction.editReply({ embeds: [errorEmbed(`Failed: ${err.message}`)] });
      }
    }

    // ── announce ──────────────────────────────────────────────
    if (sub === 'announce') {
      await interaction.deferReply({ ephemeral: true });
      const channelId = interaction.options.getString('channel_id');
      const title = interaction.options.getString('title');
      const message = interaction.options.getString('message');
      const colorInput = interaction.options.getString('color');
      const color = colorInput ? parseInt(colorInput.replace('#', ''), 16) : BRAND_COLOR;
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.editReply({ embeds: [errorEmbed('Channel not found.')] });
      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(title)
        .setDescription(message)
        .setTimestamp();
      await channel.send({ embeds: [embed] });
      return interaction.editReply({ embeds: [successEmbed('Announced', `Embed sent to <#${channelId}>`)] });
    }

    // ── serverinfo ────────────────────────────────────────────
    if (sub === 'serverinfo') {
      await interaction.deferReply({ ephemeral: true });
      const serverId = interaction.options.getString('server_id');
      const guild = client.guilds.cache.get(serverId);
      if (!guild) return interaction.editReply({ embeds: [errorEmbed('Server not found or bot is not in it.')] });
      const owner = await guild.fetchOwner().catch(() => null);
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`📊 ${guild.name}`)
        .setThumbnail(guild.iconURL())
        .addFields(
          { name: 'ID', value: guild.id, inline: true },
          { name: 'Owner', value: owner ? `${owner.user.tag}` : 'Unknown', inline: true },
          { name: 'Members', value: String(guild.memberCount), inline: true },
          { name: 'Channels', value: String(guild.channels.cache.size), inline: true },
          { name: 'Roles', value: String(guild.roles.cache.size), inline: true },
          { name: 'Boosts', value: String(guild.premiumSubscriptionCount || 0), inline: true },
          { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setFooter({ text: CREDITS })
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    // ── userinfo ──────────────────────────────────────────────
    if (sub === 'userinfo') {
      await interaction.deferReply({ ephemeral: true });
      const userId = interaction.options.getString('user_id');
      const user = await client.users.fetch(userId, { force: true }).catch(() => null);
      if (!user) return interaction.editReply({ embeds: [errorEmbed('User not found.')] });
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`👤 ${user.tag}`)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: 'ID', value: user.id, inline: true },
          { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
          { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setFooter({ text: CREDITS })
        .setTimestamp();
      if (user.banner) embed.setImage(user.bannerURL({ size: 1024 }));
      return interaction.editReply({ embeds: [embed] });
    }

    // ── botban ────────────────────────────────────────────────
    if (sub === 'botban') {
      await interaction.deferReply({ ephemeral: true });
      const userId = interaction.options.getString('user_id');
      const reason = interaction.options.getString('reason') || 'No reason provided';
      if (isOwner(userId)) return interaction.editReply({ embeds: [errorEmbed('You cannot ban yourself from the bot.')] });
      await db.set(`botban_${userId}`, { reason, bannedAt: Date.now() });
      const user = await client.users.fetch(userId).catch(() => null);
      return interaction.editReply({ embeds: [successEmbed('Bot Banned', `**${user ? user.tag : userId}** has been banned from using the bot.\nReason: ${reason}`)] });
    }

    // ── botunban ──────────────────────────────────────────────
    if (sub === 'botunban') {
      await interaction.deferReply({ ephemeral: true });
      const userId = interaction.options.getString('user_id');
      const exists = await db.get(`botban_${userId}`);
      if (!exists) return interaction.editReply({ embeds: [errorEmbed('That user is not bot-banned.')] });
      await db.delete(`botban_${userId}`);
      const user = await client.users.fetch(userId).catch(() => null);
      return interaction.editReply({ embeds: [successEmbed('Bot Unbanned', `**${user ? user.tag : userId}** can now use the bot again.`)] });
    }

    // ── botbans ───────────────────────────────────────────────
    if (sub === 'botbans') {
      await interaction.deferReply({ ephemeral: true });
      const all = await db.all();
      const bans = all.filter(e => e.id.startsWith('botban_'));
      if (!bans.length) return interaction.editReply({ embeds: [infoEmbed('Bot Bans', 'No users are currently bot-banned.')] });
      const list = await Promise.all(bans.map(async e => {
        const userId = e.id.replace('botban_', '');
        const user = await client.users.fetch(userId).catch(() => null);
        return `**${user ? user.tag : userId}** — ${e.value.reason}`;
      }));
      const embed = new EmbedBuilder()
        .setColor(0xED4245)
        .setTitle(`🚫 Bot Bans (${bans.length})`)
        .setDescription(list.join('\n').slice(0, 4000))
        .setFooter({ text: CREDITS })
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    // ── spy ───────────────────────────────────────────────────
    if (sub === 'spy') {
      await interaction.deferReply({ ephemeral: true });
      const channelId = interaction.options.getString('channel_id');
      const amount = Math.min(interaction.options.getInteger('amount') || 10, 25);
      const channel = await client.channels.fetch(channelId).catch(() => null);
      if (!channel) return interaction.editReply({ embeds: [errorEmbed('Channel not found.')] });
      const messages = await channel.messages.fetch({ limit: amount }).catch(() => null);
      if (!messages || !messages.size) return interaction.editReply({ embeds: [errorEmbed('Could not fetch messages.')] });
      const log = messages.reverse().map(m => `**${m.author.tag}**: ${m.content || '[embed/attachment]'}`).join('\n');
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`🔍 Last ${messages.size} messages in #${channel.name}`)
        .setDescription(log.slice(0, 4000))
        .setFooter({ text: CREDITS })
        .setTimestamp();
      return interaction.editReply({ embeds: [embed] });
    }

    // ── warn ──────────────────────────────────────────────────
    if (sub === 'warn') {
      await interaction.deferReply({ ephemeral: true });
      const userId = interaction.options.getString('user_id');
      const reason = interaction.options.getString('reason');
      const user = await client.users.fetch(userId).catch(() => null);
      if (!user) return interaction.editReply({ embeds: [errorEmbed('User not found.')] });
      const warnEmbed = new EmbedBuilder()
        .setColor(0xFEE75C)
        .setTitle('⚠️ You have been warned')
        .setDescription(`You have received a warning in **Member Depot**.\n\n**Reason:** ${reason}`)
        .setFooter({ text: CREDITS })
        .setTimestamp();
      const sent = await user.send({ embeds: [warnEmbed] }).catch(() => null);
      if (!sent) return interaction.editReply({ embeds: [errorEmbed(`Could not DM **${user.tag}** — they may have DMs disabled.`)] });
      return interaction.editReply({ embeds: [successEmbed('Warning Sent', `**${user.tag}** has been warned via DM.\nReason: ${reason}`)] });
    }

    // ── shutdown ──────────────────────────────────────────────
    if (sub === 'shutdown') {
      await interaction.reply({ embeds: [successEmbed('Shutting Down', 'Bot is going offline now...')], ephemeral: true });
      console.log(`[OWNER] Shutdown requested by ${interaction.user.tag}`);
      setTimeout(() => process.exit(0), 2000);
    }
  }
};
