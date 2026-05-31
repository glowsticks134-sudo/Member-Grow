const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { formatDuration } = require('../utils/helpers');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('utility')
    .setDescription('Utility commands')
    .addSubcommandGroup(g => g
      .setName('info')
      .setDescription('Information commands')
      .addSubcommand(s => s.setName('ping').setDescription('Check bot latency'))
      .addSubcommand(s => s.setName('uptime').setDescription('How long the bot has been online'))
      .addSubcommand(s => s.setName('botinfo').setDescription('Bot information'))
      .addSubcommand(s => s.setName('serverinfo').setDescription('Server information'))
      .addSubcommand(s => s.setName('userinfo').setDescription('User information').addUserOption(o => o.setName('user').setDescription('User (default: you)')))
      .addSubcommand(s => s.setName('avatar').setDescription("Get a user's avatar").addUserOption(o => o.setName('user').setDescription('User (default: you)')))
      .addSubcommand(s => s.setName('banner').setDescription("Get a user's banner").addUserOption(o => o.setName('user').setDescription('User (default: you)')))
      .addSubcommand(s => s.setName('servericon').setDescription('Get the server icon'))
      .addSubcommand(s => s.setName('roleinfo').setDescription('Role information').addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
      .addSubcommand(s => s.setName('channelinfo').setDescription('Channel information').addChannelOption(o => o.setName('channel').setDescription('Channel (default: current)')))
      .addSubcommand(s => s.setName('emojiinfo').setDescription('Emoji information').addStringOption(o => o.setName('emoji').setDescription('Custom emoji').setRequired(true)))
      .addSubcommand(s => s.setName('membercount').setDescription('Member count'))
      .addSubcommand(s => s.setName('boostcount').setDescription('Boost information'))
      .addSubcommand(s => s.setName('rolecount').setDescription('Number of roles'))
      .addSubcommand(s => s.setName('channelcount').setDescription('Number of channels'))
      .addSubcommand(s => s.setName('emojicount').setDescription('Number of emojis'))
      .addSubcommand(s => s.setName('id').setDescription('Get IDs').addStringOption(o => o.setName('mention').setDescription('Mention or leave blank for yours')))
      .addSubcommand(s => s.setName('timestamp').setDescription('Get Discord timestamp').addStringOption(o => o.setName('date').setDescription('Date string').setRequired(true)))
      .addSubcommand(s => s.setName('permissions').setDescription('Check member permissions').addUserOption(o => o.setName('user').setDescription('User (default: you)')))
      .addSubcommand(s => s.setName('stats').setDescription('Bot stats'))
      .addSubcommand(s => s.setName('invite').setDescription('Bot invite link'))
    )
    .addSubcommandGroup(g => g
      .setName('tools')
      .setDescription('Utility tools')
      .addSubcommand(s => s.setName('help').setDescription('Show all commands or info about a category').addStringOption(o => o.setName('category').setDescription('Category name')))
      .addSubcommand(s => s.setName('snipe').setDescription('Show last deleted message'))
      .addSubcommand(s => s.setName('editsnipe').setDescription('Show last edited message'))
      .addSubcommand(s => s.setName('calculate').setDescription('Evaluate a math expression').addStringOption(o => o.setName('expression').setDescription('Math expression').setRequired(true)))
      .addSubcommand(s => s.setName('base64encode').setDescription('Encode text to Base64').addStringOption(o => o.setName('text').setDescription('Text to encode').setRequired(true)))
      .addSubcommand(s => s.setName('base64decode').setDescription('Decode Base64 text').addStringOption(o => o.setName('text').setDescription('Base64 string').setRequired(true)))
      .addSubcommand(s => s.setName('color').setDescription('Get hex color info').addStringOption(o => o.setName('hex').setDescription('Hex color e.g. FF5733').setRequired(true)))
      .addSubcommand(s => s.setName('firstmessage').setDescription('Get first message in channel').addChannelOption(o => o.setName('channel').setDescription('Channel (default: current)')))
      .addSubcommand(s => s.setName('jumbo').setDescription('Enlarge a custom emoji').addStringOption(o => o.setName('emoji').setDescription('Custom emoji').setRequired(true)))
      .addSubcommand(s => s.setName('listbots').setDescription('List all bots in server'))
      .addSubcommand(s => s.setName('listadmins').setDescription('List all admins in server'))
      .addSubcommand(s => s.setName('embed').setDescription('Send a custom embed').addStringOption(o => o.setName('title').setDescription('Title').setRequired(true)).addStringOption(o => o.setName('description').setDescription('Description').setRequired(true)).addStringOption(o => o.setName('color').setDescription('Hex color')))
      .addSubcommand(s => s.setName('announce').setDescription('Send an announcement').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)).addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)))
      .addSubcommand(s => s.setName('dm').setDescription('DM a user').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)))
      .addSubcommand(s => s.setName('afk').setDescription('Set your AFK status').addStringOption(o => o.setName('reason').setDescription('AFK reason')))
      .addSubcommand(s => s.setName('setprefix').setDescription('Change the bot command prefix').addStringOption(o => o.setName('prefix').setDescription('New prefix').setRequired(true)))
      .addSubcommand(s => s.setName('resetprefix').setDescription('Reset prefix to default'))
      .addSubcommand(s => s.setName('poll').setDescription('Create a quick yes/no poll').addStringOption(o => o.setName('question').setDescription('Question').setRequired(true)))
      .addSubcommand(s => s.setName('suggest').setDescription('Submit a suggestion').addStringOption(o => o.setName('suggestion').setDescription('Your suggestion').setRequired(true)))
      .addSubcommand(s => s.setName('setsuggest').setDescription('Set suggestions channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
      .addSubcommand(s => s.setName('votechannel').setDescription('Set vote channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    ),

  async execute(interaction, client) {
    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand();

    if (group === 'info') {
      if (sub === 'ping') {
        await interaction.reply({ embeds: [infoEmbed('🏓 Pinging...')] });
        const latency = Date.now() - interaction.createdTimestamp;
        return interaction.editReply({ embeds: [infoEmbed('🏓 Pong!', `**Bot Latency:** ${latency}ms\n**API Latency:** ${Math.round(client.ws.ping)}ms`)] });
      }
      if (sub === 'uptime') {
        return interaction.reply({ embeds: [infoEmbed('⏱️ Uptime', `Online for **${formatDuration(client.uptime)}**.`)] });
      }
      if (sub === 'botinfo') {
        const embed = new EmbedBuilder()
          .setColor(BRAND_COLOR)
          .setTitle('🤖 Member Grow Bot')
          .setThumbnail(client.user.displayAvatarURL())
          .addFields(
            { name: 'Developer', value: 'Stichachu13', inline: true },
            { name: 'Servers', value: String(client.guilds.cache.size), inline: true },
            { name: 'Users', value: String(client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)), inline: true },
            { name: 'Commands', value: String(client.slashCommands.size) + ' modules', inline: true },
            { name: 'Uptime', value: formatDuration(client.uptime), inline: true },
            { name: 'Node.js', value: process.version, inline: true }
          ).setFooter({ text: CREDITS }).setTimestamp();
        return interaction.reply({ embeds: [embed] });
      }
      if (sub === 'serverinfo') {
        const g = interaction.guild;
        const owner = await g.fetchOwner();
        const embed = new EmbedBuilder()
          .setColor(BRAND_COLOR).setTitle(g.name).setThumbnail(g.iconURL())
          .addFields(
            { name: 'Owner', value: owner.user.tag, inline: true },
            { name: 'Members', value: String(g.memberCount), inline: true },
            { name: 'Channels', value: String(g.channels.cache.size), inline: true },
            { name: 'Roles', value: String(g.roles.cache.size), inline: true },
            { name: 'Boosts', value: String(g.premiumSubscriptionCount), inline: true },
            { name: 'Boost Level', value: String(g.premiumTier), inline: true },
            { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true },
            { name: 'Server ID', value: g.id, inline: true }
          ).setFooter({ text: CREDITS }).setTimestamp();
        return interaction.reply({ embeds: [embed] });
      }
      if (sub === 'userinfo') {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(() => null);
        const embed = new EmbedBuilder()
          .setColor(BRAND_COLOR).setTitle(user.tag).setThumbnail(user.displayAvatarURL())
          .addFields(
            { name: 'ID', value: user.id, inline: true },
            { name: 'Nickname', value: member?.nickname || 'None', inline: true },
            { name: 'Joined', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
            { name: 'Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: 'Roles', value: member?.roles.cache.filter(r => r.id !== interaction.guild.id).map(r => `${r}`).join(', ') || 'None' }
          ).setFooter({ text: CREDITS }).setTimestamp();
        return interaction.reply({ embeds: [embed] });
      }
      if (sub === 'avatar') {
        const user = interaction.options.getUser('user') || interaction.user;
        const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${user.tag}'s Avatar`).setImage(user.displayAvatarURL({ size: 4096 })).setFooter({ text: CREDITS });
        return interaction.reply({ embeds: [embed] });
      }
      if (sub === 'banner') {
        const user = await (interaction.options.getUser('user') || interaction.user).fetch(true);
        if (!user.banner) return interaction.reply({ embeds: [infoEmbed('No Banner', `${user.tag} has no banner.`)] });
        const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${user.tag}'s Banner`).setImage(user.bannerURL({ size: 4096 })).setFooter({ text: CREDITS });
        return interaction.reply({ embeds: [embed] });
      }
      if (sub === 'servericon') {
        if (!interaction.guild.iconURL()) return interaction.reply({ embeds: [infoEmbed('No Icon', 'This server has no icon.')] });
        const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`${interaction.guild.name}'s Icon`).setImage(interaction.guild.iconURL({ size: 4096 })).setFooter({ text: CREDITS });
        return interaction.reply({ embeds: [embed] });
      }
      if (sub === 'roleinfo') {
        const role = interaction.options.getRole('role');
        const embed = infoEmbed(`🎭 ${role.name}`)
          .addFields(
            { name: 'ID', value: role.id, inline: true },
            { name: 'Color', value: role.hexColor, inline: true },
            { name: 'Members', value: String(role.members.size), inline: true },
            { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
            { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
            { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true }
          );
        return interaction.reply({ embeds: [embed] });
      }
      if (sub === 'channelinfo') {
        const ch = interaction.options.getChannel('channel') || interaction.channel;
        const embed = infoEmbed(`#️⃣ ${ch.name}`)
          .addFields(
            { name: 'ID', value: ch.id, inline: true },
            { name: 'Type', value: String(ch.type), inline: true },
            { name: 'Category', value: ch.parent?.name || 'None', inline: true },
            { name: 'NSFW', value: ch.nsfw ? 'Yes' : 'No', inline: true },
            { name: 'Slowmode', value: `${ch.rateLimitPerUser || 0}s`, inline: true },
            { name: 'Created', value: `<t:${Math.floor(ch.createdTimestamp / 1000)}:R>`, inline: true }
          );
        return interaction.reply({ embeds: [embed] });
      }
      if (sub === 'emojiinfo') {
        const input = interaction.options.getString('emoji');
        const emojiId = input.match(/\d{15,}/)?.[0];
        const emoji = emojiId ? interaction.guild.emojis.cache.get(emojiId) : interaction.guild.emojis.cache.find(e => e.name === input);
        if (!emoji) return interaction.reply({ embeds: [errorEmbed('Could not find that emoji.')], ephemeral: true });
        return interaction.reply({ embeds: [infoEmbed(`😄 ${emoji.name}`).setThumbnail(emoji.url).addFields({ name: 'ID', value: emoji.id, inline: true }, { name: 'Animated', value: emoji.animated ? 'Yes' : 'No', inline: true }, { name: 'URL', value: emoji.url })] });
      }
      if (sub === 'membercount') {
        await interaction.guild.members.fetch();
        const bots = interaction.guild.members.cache.filter(m => m.user.bot).size;
        const humans = interaction.guild.memberCount - bots;
        return interaction.reply({ embeds: [infoEmbed('👥 Members', `**Total:** ${interaction.guild.memberCount}\n**Humans:** ${humans}\n**Bots:** ${bots}`)] });
      }
      if (sub === 'boostcount') {
        const g = interaction.guild;
        return interaction.reply({ embeds: [infoEmbed('💎 Boosts', `**Boosts:** ${g.premiumSubscriptionCount}\n**Level:** ${g.premiumTier}`)] });
      }
      if (sub === 'rolecount') {
        return interaction.reply({ embeds: [infoEmbed('🎭 Roles', `This server has **${interaction.guild.roles.cache.size}** roles.`)] });
      }
      if (sub === 'channelcount') {
        const g = interaction.guild;
        const text = g.channels.cache.filter(c => c.type === 0).size;
        const voice = g.channels.cache.filter(c => c.type === 2).size;
        const cats = g.channels.cache.filter(c => c.type === 4).size;
        return interaction.reply({ embeds: [infoEmbed('📂 Channels', `**Text:** ${text}\n**Voice:** ${voice}\n**Categories:** ${cats}\n**Total:** ${g.channels.cache.size}`)] });
      }
      if (sub === 'emojicount') {
        const g = interaction.guild;
        const animated = g.emojis.cache.filter(e => e.animated).size;
        const normal = g.emojis.cache.filter(e => !e.animated).size;
        return interaction.reply({ embeds: [infoEmbed('😄 Emojis', `**Normal:** ${normal}\n**Animated:** ${animated}\n**Total:** ${g.emojis.cache.size}`)] });
      }
      if (sub === 'id') {
        const mention = interaction.options.getString('mention');
        if (!mention) return interaction.reply({ embeds: [infoEmbed('IDs', `Your ID: \`${interaction.user.id}\`\nServer ID: \`${interaction.guild.id}\`\nChannel ID: \`${interaction.channel.id}\``)] });
        const id = mention.replace(/[<@!#&>]/g, '');
        return interaction.reply({ embeds: [infoEmbed('ID', `\`${id}\``)] });
      }
      if (sub === 'timestamp') {
        const date = new Date(interaction.options.getString('date'));
        if (isNaN(date)) return interaction.reply({ embeds: [errorEmbed('Invalid date.')], ephemeral: true });
        const unix = Math.floor(date.getTime() / 1000);
        return interaction.reply({ embeds: [infoEmbed('📅 Timestamp', `**Short:** <t:${unix}:f>\n**Long:** <t:${unix}:F>\n**Relative:** <t:${unix}:R>\n**Unix:** \`${unix}\``)] });
      }
      if (sub === 'permissions') {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);
        if (!member) return interaction.reply({ embeds: [errorEmbed('Could not find that member.')], ephemeral: true });
        const perms = member.permissions.toArray().map(p => `\`${p}\``).join(', ');
        return interaction.reply({ embeds: [infoEmbed(`🔑 Permissions — ${user.tag}`, perms || 'None')] });
      }
      if (sub === 'stats') {
        const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        return interaction.reply({ embeds: [infoEmbed('📊 Stats').addFields(
          { name: 'Servers', value: String(client.guilds.cache.size), inline: true },
          { name: 'Users', value: String(client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)), inline: true },
          { name: 'Memory', value: `${memUsage} MB`, inline: true },
          { name: 'Uptime', value: formatDuration(client.uptime), inline: true },
          { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true }
        )] });
      }
      if (sub === 'invite') {
        const link = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
        return interaction.reply({ embeds: [infoEmbed('📨 Invite', `[Click here to invite the bot](${link})`)] });
      }
    }

    if (group === 'tools') {
      if (sub === 'help') {
        const category = interaction.options.getString('category');
        const embed = new EmbedBuilder()
          .setColor(BRAND_COLOR)
          .setTitle('📚 Member Grow Bot — Slash Commands')
          .setDescription(category
            ? `Showing commands in **${category}** category.`
            : 'Use `/` and browse the command list!\n\nAll commands are slash commands — just type `/` to see them all.')
          .addFields(
            { name: 'Moderation', value: '`/mod action`, `/mod warn`, `/mod channel`, `/mod roles`, `/mod voice`', inline: false },
            { name: 'Utility', value: '`/utility info`, `/utility tools`', inline: false },
            { name: 'Fun', value: '`/fun random`, `/fun text`, `/fun meters`', inline: false },
            { name: 'Other', value: '`/social`, `/leveling`, `/games`, `/giveaway`, `/poll`, `/tickets`, `/automod`, `/logging`, `/starboard`, `/welcome`, `/rr`, `/tags`, `/reminder`, `/misc`, `/info`', inline: false }
          )
          .setFooter({ text: CREDITS });
        return interaction.reply({ embeds: [embed] });
      }
      if (sub === 'snipe') {
        const snipe = client.snipes?.get(interaction.channel.id);
        if (!snipe) return interaction.reply({ embeds: [infoEmbed('Snipe', 'No recently deleted messages.')] });
        const embed = infoEmbed('🎯 Sniped').setDescription(snipe.content || '*[No text]*').setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL() }).setTimestamp(snipe.createdAt);
        return interaction.reply({ embeds: [embed] });
      }
      if (sub === 'editsnipe') {
        const snipe = client.editSnipes?.get(interaction.channel.id);
        if (!snipe) return interaction.reply({ embeds: [infoEmbed('Edit Snipe', 'No recently edited messages.')] });
        const embed = infoEmbed('✏️ Edit Snipe').addFields({ name: 'Before', value: snipe.oldContent || '*[No text]*' }, { name: 'After', value: snipe.newContent || '*[No text]*' }).setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL() });
        return interaction.reply({ embeds: [embed] });
      }
      if (sub === 'calculate') {
        const expr = interaction.options.getString('expression').replace(/[^0-9+\-*/().\s^%]/g, '');
        try {
          const result = Function(`"use strict"; return (${expr})`)();
          return interaction.reply({ embeds: [infoEmbed('🔢 Calculator', `**Input:** \`${expr}\`\n**Result:** \`${result}\``)] });
        } catch {
          return interaction.reply({ embeds: [errorEmbed('Invalid expression.')], ephemeral: true });
        }
      }
      if (sub === 'base64encode') {
        const encoded = Buffer.from(interaction.options.getString('text')).toString('base64');
        return interaction.reply({ embeds: [infoEmbed('🔒 Base64 Encoded', `\`${encoded}\``)] });
      }
      if (sub === 'base64decode') {
        try {
          const decoded = Buffer.from(interaction.options.getString('text'), 'base64').toString('utf-8');
          return interaction.reply({ embeds: [infoEmbed('🔓 Base64 Decoded', decoded)] });
        } catch {
          return interaction.reply({ embeds: [errorEmbed('Invalid Base64 string.')], ephemeral: true });
        }
      }
      if (sub === 'color') {
        const hex = interaction.options.getString('hex').replace('#', '');
        if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return interaction.reply({ embeds: [errorEmbed('Invalid hex color.')], ephemeral: true });
        const r = parseInt(hex.slice(0, 2), 16), g2 = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
        return interaction.reply({ embeds: [new EmbedBuilder().setColor(parseInt(hex, 16)).setTitle(`🎨 #${hex.toUpperCase()}`).addFields({ name: 'HEX', value: `#${hex.toUpperCase()}`, inline: true }, { name: 'RGB', value: `rgb(${r}, ${g2}, ${b})`, inline: true }, { name: 'Decimal', value: String(parseInt(hex, 16)), inline: true }).setFooter({ text: CREDITS })] });
      }
      if (sub === 'firstmessage') {
        const ch = interaction.options.getChannel('channel') || interaction.channel;
        const msgs = await ch.messages.fetch({ limit: 1, after: '0' });
        const first = msgs.last();
        if (!first) return interaction.reply({ embeds: [errorEmbed('No message found.')], ephemeral: true });
        return interaction.reply({ embeds: [infoEmbed('📌 First Message', `[Click here](${first.url}) — by ${first.author.tag} on <t:${Math.floor(first.createdTimestamp / 1000)}:f>`)] });
      }
      if (sub === 'jumbo') {
        const input = interaction.options.getString('emoji');
        const emojiId = input.match(/\d{15,}/)?.[0];
        const animated = input.startsWith('<a:');
        if (!emojiId) return interaction.reply({ embeds: [errorEmbed('Please provide a custom emoji.')], ephemeral: true });
        const url = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}?size=4096`;
        return interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setImage(url).setFooter({ text: CREDITS })] });
      }
      if (sub === 'listbots') {
        await interaction.guild.members.fetch();
        const bots = interaction.guild.members.cache.filter(m => m.user.bot).map(m => `\`${m.user.tag}\``).join(', ');
        return interaction.reply({ embeds: [infoEmbed('🤖 Bots', bots || 'No bots found.')] });
      }
      if (sub === 'listadmins') {
        await interaction.guild.members.fetch();
        const admins = interaction.guild.members.cache.filter(m => m.permissions.has(PermissionFlagsBits.Administrator) && !m.user.bot).map(m => `\`${m.user.tag}\``).join(', ');
        return interaction.reply({ embeds: [infoEmbed('👑 Admins', admins || 'No admins found.')] });
      }
      if (sub === 'embed') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Messages permission.')], ephemeral: true });
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const color = interaction.options.getString('color');
        const embed = new EmbedBuilder().setTitle(title).setDescription(description).setFooter({ text: CREDITS }).setTimestamp();
        if (color) embed.setColor(parseInt(color.replace('#', ''), 16));
        await interaction.channel.send({ embeds: [embed] });
        return interaction.reply({ content: '✅ Embed sent!', ephemeral: true });
      }
      if (sub === 'announce') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Messages permission.')], ephemeral: true });
        const ch = interaction.options.getChannel('channel');
        const msg = interaction.options.getString('message');
        await ch.send({ embeds: [infoEmbed('📣 Announcement', msg)] });
        return interaction.reply({ content: `✅ Announced in ${ch}!`, ephemeral: true });
      }
      if (sub === 'dm') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Messages permission.')], ephemeral: true });
        const user = interaction.options.getUser('user');
        const msg = interaction.options.getString('message');
        await user.send({ embeds: [infoEmbed('📬 Message', msg)] }).catch(() => null);
        return interaction.reply({ content: `✅ DM sent to ${user.tag}!`, ephemeral: true });
      }
      if (sub === 'afk') {
        const reason = interaction.options.getString('reason') || 'AFK';
        await db.set(`afk_${interaction.guild.id}_${interaction.user.id}`, { reason, time: Date.now() });
        return interaction.reply({ embeds: [successEmbed('AFK Set', `You are now AFK: **${reason}**`)] });
      }
      if (sub === 'setprefix') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
          return interaction.reply({ embeds: [errorEmbed('You need Administrator permission.')], ephemeral: true });
        const prefix = interaction.options.getString('prefix');
        await db.set(`prefix_${interaction.guild.id}`, prefix);
        return interaction.reply({ embeds: [successEmbed('Prefix Changed', `Prefix set to \`${prefix}\`.`)] });
      }
      if (sub === 'resetprefix') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
          return interaction.reply({ embeds: [errorEmbed('You need Administrator permission.')], ephemeral: true });
        await db.delete(`prefix_${interaction.guild.id}`);
        return interaction.reply({ embeds: [successEmbed('Prefix Reset', 'Prefix reset to `!`.')] });
      }
      if (sub === 'poll') {
        const question = interaction.options.getString('question');
        const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`📊 ${question}`).setDescription('👍 Yes | 👎 No').setFooter({ text: `Poll by ${interaction.user.tag} | ${CREDITS}` }).setTimestamp();
        const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
        await msg.react('👍');
        await msg.react('👎');
        return;
      }
      if (sub === 'suggest') {
        const suggestion = interaction.options.getString('suggestion');
        const chId = await db.get(`suggest_channel_${interaction.guild.id}`);
        const ch = chId ? interaction.guild.channels.cache.get(chId) : interaction.channel;
        const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle('💡 Suggestion').setDescription(suggestion).setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() }).setFooter({ text: CREDITS }).setTimestamp();
        const msg = await ch.send({ embeds: [embed] });
        await msg.react('👍');
        await msg.react('👎');
        return interaction.reply({ content: '✅ Suggestion submitted!', ephemeral: true });
      }
      if (sub === 'setsuggest') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
          return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
        const ch = interaction.options.getChannel('channel');
        await db.set(`suggest_channel_${interaction.guild.id}`, ch.id);
        return interaction.reply({ embeds: [successEmbed('Suggestions Channel', `Suggestions will go to ${ch}.`)] });
      }
      if (sub === 'votechannel') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
          return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
        const ch = interaction.options.getChannel('channel');
        await db.set(`vote_channel_${interaction.guild.id}`, ch.id);
        return interaction.reply({ embeds: [successEmbed('Vote Channel Set', `Vote channel set to ${ch}.`)] });
      }
    }
  }
};
