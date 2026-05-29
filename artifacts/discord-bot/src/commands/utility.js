const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { resolveUser, resolveRole, resolveChannel } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Utility';

const commands = [
  {
    name: 'help',
    description: 'Show all commands or info about a specific command',
    usage: '!help [command/category]',
    aliases: ['h', 'commands'],
    async execute(message, args, client) {
      if (args[0]) {
        const cmd = client.commands.get(args[0]) || client.commands.get(client.aliases.get(args[0]));
        const cat = client.categories.get(args[0]);
        if (cmd) {
          const embed = infoEmbed(`📖 ${cmd.name}`, cmd.description)
            .addFields(
              { name: 'Usage', value: `\`${cmd.usage || `!${cmd.name}`}\``, inline: true },
              { name: 'Category', value: cmd.category, inline: true },
              { name: 'Aliases', value: cmd.aliases?.join(', ') || 'None', inline: true }
            );
          return message.reply({ embeds: [embed] });
        }
        if (cat) {
          const list = cat.map(c => `\`${c.name}\` — ${c.description}`).join('\n');
          return message.reply({ embeds: [infoEmbed(`📚 ${args[0]} Commands`, list)] });
        }
        return message.reply({ embeds: [errorEmbed(`No command or category found for \`${args[0]}\`.`)] });
      }
      const categories = [...client.categories.entries()];
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('📚 Member Grow Bot Commands')
        .setDescription(`Use \`!help <category>\` or \`!help <command>\` for more info.\nTotal Commands: **${client.commands.size}**`)
        .addFields(categories.map(([name, cmds]) => ({ name: `${name} (${cmds.length})`, value: cmds.slice(0, 5).map(c => `\`${c.name}\``).join(', ') + (cmds.length > 5 ? ` +${cmds.length - 5} more` : ''), inline: true })))
        .setFooter({ text: CREDITS })
        .setTimestamp();
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'ping',
    description: 'Check bot latency',
    usage: '!ping',
    async execute(message, args, client) {
      const sent = await message.reply({ embeds: [infoEmbed('🏓 Pinging...')] });
      const latency = sent.createdTimestamp - message.createdTimestamp;
      sent.edit({ embeds: [infoEmbed('🏓 Pong!', `**Bot Latency:** ${latency}ms\n**API Latency:** ${Math.round(client.ws.ping)}ms`)] });
    }
  },
  {
    name: 'uptime',
    description: 'Check how long the bot has been online',
    usage: '!uptime',
    async execute(message, args, client) {
      const { formatDuration } = require('../utils/helpers');
      const uptime = formatDuration(client.uptime);
      message.reply({ embeds: [infoEmbed('⏱️ Uptime', `The bot has been online for **${uptime}**.`)] });
    }
  },
  {
    name: 'botinfo',
    description: 'Show bot information',
    usage: '!botinfo',
    aliases: ['about', 'info'],
    async execute(message, args, client) {
      const { formatDuration } = require('../utils/helpers');
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('🤖 Member Grow Bot')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: 'Developer', value: 'Stichachu13', inline: true },
          { name: 'Servers', value: String(client.guilds.cache.size), inline: true },
          { name: 'Users', value: String(client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)), inline: true },
          { name: 'Commands', value: String(client.commands.size), inline: true },
          { name: 'Uptime', value: formatDuration(client.uptime), inline: true },
          { name: 'Node.js', value: process.version, inline: true },
          { name: 'discord.js', value: require('discord.js').version, inline: true }
        )
        .setFooter({ text: CREDITS })
        .setTimestamp();
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'serverinfo',
    description: 'Show server information',
    usage: '!serverinfo',
    aliases: ['guildinfo', 'si'],
    async execute(message, args) {
      const g = message.guild;
      const owner = await g.fetchOwner();
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(g.name)
        .setThumbnail(g.iconURL())
        .addFields(
          { name: 'Owner', value: owner.user.tag, inline: true },
          { name: 'Members', value: String(g.memberCount), inline: true },
          { name: 'Channels', value: String(g.channels.cache.size), inline: true },
          { name: 'Roles', value: String(g.roles.cache.size), inline: true },
          { name: 'Emojis', value: String(g.emojis.cache.size), inline: true },
          { name: 'Boosts', value: String(g.premiumSubscriptionCount), inline: true },
          { name: 'Boost Level', value: String(g.premiumTier), inline: true },
          { name: 'Verification', value: g.verificationLevel.toString(), inline: true },
          { name: 'Created', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`, inline: true },
          { name: 'Server ID', value: g.id, inline: true }
        )
        .setFooter({ text: CREDITS })
        .setTimestamp();
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'userinfo',
    description: 'Show information about a user',
    usage: '!userinfo [user]',
    aliases: ['whois', 'ui'],
    async execute(message, args) {
      const target = args[0] ? await resolveUser(message.guild, args[0]) : message.member;
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(target.user.tag)
        .setThumbnail(target.user.displayAvatarURL())
        .addFields(
          { name: 'ID', value: target.id, inline: true },
          { name: 'Nickname', value: target.nickname || 'None', inline: true },
          { name: 'Joined Server', value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:R>`, inline: true },
          { name: 'Account Created', value: `<t:${Math.floor(target.user.createdTimestamp / 1000)}:R>`, inline: true },
          { name: 'Roles', value: target.roles.cache.filter(r => r.id !== message.guild.id).map(r => `${r}`).join(', ') || 'None', inline: false },
          { name: 'Bot?', value: target.user.bot ? 'Yes' : 'No', inline: true }
        )
        .setFooter({ text: CREDITS })
        .setTimestamp();
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'avatar',
    description: 'Get a user\'s avatar',
    usage: '!avatar [user]',
    aliases: ['av', 'pfp'],
    async execute(message, args) {
      const target = args[0] ? await resolveUser(message.guild, args[0]) : message.member;
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`${target.user.tag}'s Avatar`)
        .setImage(target.user.displayAvatarURL({ size: 4096 }))
        .setFooter({ text: CREDITS });
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'banner',
    description: 'Get a user\'s profile banner',
    usage: '!banner [user]',
    async execute(message, args) {
      const target = args[0] ? await resolveUser(message.guild, args[0]) : message.member;
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const user = await target.user.fetch(true);
      if (!user.banner) return message.reply({ embeds: [infoEmbed('No Banner', `${user.tag} has no banner.`)] });
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`${user.tag}'s Banner`)
        .setImage(user.bannerURL({ size: 4096 }))
        .setFooter({ text: CREDITS });
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'servericon',
    description: 'Get the server icon',
    usage: '!servericon',
    aliases: ['icon'],
    async execute(message, args) {
      if (!message.guild.iconURL()) return message.reply({ embeds: [infoEmbed('No Icon', 'This server has no icon.')] });
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`${message.guild.name}'s Icon`)
        .setImage(message.guild.iconURL({ size: 4096 }))
        .setFooter({ text: CREDITS });
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'roleinfo',
    description: 'Show information about a role',
    usage: '!roleinfo <role>',
    aliases: ['ri'],
    async execute(message, args) {
      const role = await resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      const embed = infoEmbed(`🎭 ${role.name}`)
        .addFields(
          { name: 'ID', value: role.id, inline: true },
          { name: 'Color', value: role.hexColor, inline: true },
          { name: 'Members', value: String(role.members.size), inline: true },
          { name: 'Position', value: String(role.position), inline: true },
          { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
          { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
          { name: 'Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true }
        );
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'channelinfo',
    description: 'Show information about a channel',
    usage: '!channelinfo [channel]',
    aliases: ['ci'],
    async execute(message, args) {
      const ch = args[0] ? await resolveChannel(message.guild, args[0]) : message.channel;
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      const embed = infoEmbed(`#️⃣ ${ch.name}`)
        .addFields(
          { name: 'ID', value: ch.id, inline: true },
          { name: 'Type', value: String(ch.type), inline: true },
          { name: 'Category', value: ch.parent?.name || 'None', inline: true },
          { name: 'Topic', value: ch.topic || 'No topic', inline: false },
          { name: 'NSFW', value: ch.nsfw ? 'Yes' : 'No', inline: true },
          { name: 'Slowmode', value: `${ch.rateLimitPerUser}s`, inline: true },
          { name: 'Created', value: `<t:${Math.floor(ch.createdTimestamp / 1000)}:R>`, inline: true }
        );
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'emojiinfo',
    description: 'Get information about an emoji',
    usage: '!emojiinfo <emoji>',
    async execute(message, args) {
      const emojiId = args[0]?.match(/\d{15,}/)?.[0];
      const emoji = emojiId ? message.guild.emojis.cache.get(emojiId) : message.guild.emojis.cache.find(e => e.name === args[0]);
      if (!emoji) return message.reply({ embeds: [errorEmbed('Could not find that emoji.')] });
      const embed = infoEmbed(`😄 ${emoji.name}`)
        .setThumbnail(emoji.url)
        .addFields(
          { name: 'ID', value: emoji.id, inline: true },
          { name: 'Animated', value: emoji.animated ? 'Yes' : 'No', inline: true },
          { name: 'Created', value: `<t:${Math.floor(emoji.createdTimestamp / 1000)}:R>`, inline: true },
          { name: 'URL', value: emoji.url, inline: false }
        );
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'membercount',
    description: 'Show the member count',
    usage: '!membercount',
    aliases: ['mc', 'members'],
    async execute(message, args) {
      const g = message.guild;
      await g.members.fetch();
      const bots = g.members.cache.filter(m => m.user.bot).size;
      const humans = g.memberCount - bots;
      message.reply({ embeds: [infoEmbed('👥 Member Count', `**Total:** ${g.memberCount}\n**Humans:** ${humans}\n**Bots:** ${bots}`)] });
    }
  },
  {
    name: 'boostcount',
    description: 'Show boost information',
    usage: '!boostcount',
    aliases: ['boosts'],
    async execute(message, args) {
      const g = message.guild;
      message.reply({ embeds: [infoEmbed('💎 Boost Info', `**Boosts:** ${g.premiumSubscriptionCount}\n**Boost Level:** ${g.premiumTier}\n**Boosters:** ${g.members.cache.filter(m => m.premiumSince).size}`)] });
    }
  },
  {
    name: 'rolecount',
    description: 'Show number of roles',
    usage: '!rolecount',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('🎭 Roles', `This server has **${message.guild.roles.cache.size}** roles.`)] });
    }
  },
  {
    name: 'channelcount',
    description: 'Show number of channels',
    usage: '!channelcount',
    async execute(message, args) {
      const g = message.guild;
      const text = g.channels.cache.filter(c => c.type === 0).size;
      const voice = g.channels.cache.filter(c => c.type === 2).size;
      const cats = g.channels.cache.filter(c => c.type === 4).size;
      message.reply({ embeds: [infoEmbed('📂 Channel Count', `**Text:** ${text}\n**Voice:** ${voice}\n**Categories:** ${cats}\n**Total:** ${g.channels.cache.size}`)] });
    }
  },
  {
    name: 'emojicount',
    description: 'Show number of emojis',
    usage: '!emojicount',
    async execute(message, args) {
      const g = message.guild;
      const animated = g.emojis.cache.filter(e => e.animated).size;
      const normal = g.emojis.cache.filter(e => !e.animated).size;
      message.reply({ embeds: [infoEmbed('😄 Emoji Count', `**Normal:** ${normal}\n**Animated:** ${animated}\n**Total:** ${g.emojis.cache.size}`)] });
    }
  },
  {
    name: 'id',
    description: 'Get IDs of users, roles, or channels',
    usage: '!id [user/role/channel]',
    async execute(message, args) {
      if (!args[0]) return message.reply({ embeds: [infoEmbed('IDs', `Your ID: \`${message.author.id}\`\nServer ID: \`${message.guild.id}\`\nChannel ID: \`${message.channel.id}\``)] });
      const mention = args[0];
      const id = mention.replace(/[<@!#&>]/g, '');
      message.reply({ embeds: [infoEmbed('ID', `\`${id}\``)] });
    }
  },
  {
    name: 'timestamp',
    description: 'Get a Discord timestamp for a date',
    usage: '!timestamp <date>',
    async execute(message, args) {
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide a date.')] });
      const date = new Date(args.join(' '));
      if (isNaN(date)) return message.reply({ embeds: [errorEmbed('Invalid date.')] });
      const unix = Math.floor(date.getTime() / 1000);
      message.reply({ embeds: [infoEmbed('📅 Timestamp', `**Date:** ${date.toUTCString()}\n**Unix:** \`${unix}\`\n**Short:** <t:${unix}:f>\n**Long:** <t:${unix}:F>\n**Relative:** <t:${unix}:R>`)] });
    }
  },
  {
    name: 'permissions',
    description: 'Check a member\'s permissions',
    usage: '!permissions [user]',
    aliases: ['perms'],
    async execute(message, args) {
      const target = args[0] ? await resolveUser(message.guild, args[0]) : message.member;
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const perms = target.permissions.toArray().map(p => `\`${p}\``).join(', ');
      message.reply({ embeds: [infoEmbed(`🔑 Permissions — ${target.user.tag}`, perms || 'None')] });
    }
  },
  {
    name: 'setprefix',
    description: 'Change the bot command prefix',
    usage: '!setprefix <prefix>',
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
        return message.reply({ embeds: [errorEmbed('You need Administrator permission.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide a prefix.')] });
      await db.set(`prefix_${message.guild.id}`, args[0]);
      client.prefixCache?.set(message.guild.id, args[0]);
      message.reply({ embeds: [successEmbed('Prefix Changed', `Prefix set to \`${args[0]}\`.`)] });
    }
  },
  {
    name: 'resetprefix',
    description: 'Reset prefix to default (!)',
    usage: '!resetprefix',
    async execute(message, args, client) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
        return message.reply({ embeds: [errorEmbed('You need Administrator permission.')] });
      await db.delete(`prefix_${message.guild.id}`);
      client.prefixCache?.delete(message.guild.id);
      message.reply({ embeds: [successEmbed('Prefix Reset', 'Prefix reset to `!`.')] });
    }
  },
  {
    name: 'invite',
    description: 'Get the bot invite link',
    usage: '!invite',
    async execute(message, args, client) {
      const link = `https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot`;
      message.reply({ embeds: [infoEmbed('📨 Invite', `[Click here to invite the bot](${link})`)] });
    }
  },
  {
    name: 'stats',
    description: 'Show bot stats',
    usage: '!stats',
    async execute(message, args, client) {
      const { formatDuration } = require('../utils/helpers');
      const memUsage = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
      const embed = infoEmbed('📊 Bot Stats')
        .addFields(
          { name: 'Servers', value: String(client.guilds.cache.size), inline: true },
          { name: 'Users', value: String(client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)), inline: true },
          { name: 'Commands', value: String(client.commands.size), inline: true },
          { name: 'Uptime', value: formatDuration(client.uptime), inline: true },
          { name: 'Memory', value: `${memUsage} MB`, inline: true },
          { name: 'Ping', value: `${Math.round(client.ws.ping)}ms`, inline: true }
        );
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'calculate',
    description: 'Evaluate a math expression',
    usage: '!calculate <expression>',
    aliases: ['calc', 'math'],
    async execute(message, args) {
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide an expression.')] });
      const expr = args.join(' ').replace(/[^0-9+\-*/().\s^%]/g, '');
      try {
        const result = Function(`"use strict"; return (${expr})`)();
        message.reply({ embeds: [infoEmbed('🔢 Calculator', `**Input:** \`${expr}\`\n**Result:** \`${result}\``)] });
      } catch {
        message.reply({ embeds: [errorEmbed('Invalid expression.')] });
      }
    }
  },
  {
    name: 'base64encode',
    description: 'Encode text to Base64',
    usage: '!base64encode <text>',
    aliases: ['b64e', 'encode'],
    async execute(message, args) {
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      const encoded = Buffer.from(args.join(' ')).toString('base64');
      message.reply({ embeds: [infoEmbed('🔒 Base64 Encoded', `\`${encoded}\``)] });
    }
  },
  {
    name: 'base64decode',
    description: 'Decode Base64 text',
    usage: '!base64decode <text>',
    aliases: ['b64d', 'decode'],
    async execute(message, args) {
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide Base64 text.')] });
      try {
        const decoded = Buffer.from(args[0], 'base64').toString('utf-8');
        message.reply({ embeds: [infoEmbed('🔓 Base64 Decoded', decoded)] });
      } catch {
        message.reply({ embeds: [errorEmbed('Invalid Base64 string.')] });
      }
    }
  },
  {
    name: 'color',
    description: 'Get info about a hex color',
    usage: '!color <hex>',
    aliases: ['colour'],
    async execute(message, args) {
      const hex = args[0]?.replace('#', '');
      if (!hex || !/^[0-9A-Fa-f]{6}$/.test(hex))
        return message.reply({ embeds: [errorEmbed('Please provide a valid hex color (e.g. `#FF5733`).')] });
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const embed = new EmbedBuilder()
        .setColor(parseInt(hex, 16))
        .setTitle(`🎨 Color #${hex.toUpperCase()}`)
        .addFields(
          { name: 'HEX', value: `#${hex.toUpperCase()}`, inline: true },
          { name: 'RGB', value: `rgb(${r}, ${g}, ${b})`, inline: true },
          { name: 'Decimal', value: String(parseInt(hex, 16)), inline: true }
        )
        .setFooter({ text: CREDITS });
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'firstmessage',
    description: 'Get a link to the first message in a channel',
    usage: '!firstmessage [channel]',
    async execute(message, args) {
      const ch = args[0] ? await resolveChannel(message.guild, args[0]) : message.channel;
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      const msgs = await ch.messages.fetch({ limit: 1, after: '0' });
      const first = msgs.last();
      if (!first) return message.reply({ embeds: [errorEmbed('Could not find the first message.')] });
      message.reply({ embeds: [infoEmbed('📌 First Message', `[Click here](${first.url}) — sent by ${first.author.tag} on <t:${Math.floor(first.createdTimestamp / 1000)}:f>`)] });
    }
  },
  {
    name: 'snipe',
    description: 'Show the last deleted message',
    usage: '!snipe',
    async execute(message, args, client) {
      const snipe = client.snipes?.get(message.channel.id);
      if (!snipe) return message.reply({ embeds: [infoEmbed('Snipe', 'No recently deleted messages.')] });
      const embed = infoEmbed('🎯 Sniped Message')
        .setDescription(snipe.content || '*[No text content]*')
        .setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL() })
        .setTimestamp(snipe.createdAt);
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'editsnipe',
    description: 'Show the last edited message',
    usage: '!editsnipe',
    aliases: ['esnipe'],
    async execute(message, args, client) {
      const snipe = client.editSnipes?.get(message.channel.id);
      if (!snipe) return message.reply({ embeds: [infoEmbed('Edit Snipe', 'No recently edited messages.')] });
      const embed = infoEmbed('✏️ Edit Sniped Message')
        .addFields(
          { name: 'Before', value: snipe.oldContent || '*[No text]*', inline: false },
          { name: 'After', value: snipe.newContent || '*[No text]*', inline: false }
        )
        .setAuthor({ name: snipe.author.tag, iconURL: snipe.author.displayAvatarURL() })
        .setTimestamp(snipe.editedAt);
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'jumbo',
    description: 'Enlarge a custom emoji',
    usage: '!jumbo <emoji>',
    async execute(message, args) {
      const emojiId = args[0]?.match(/\d{15,}/)?.[0];
      const animated = args[0]?.startsWith('<a:');
      if (!emojiId) return message.reply({ embeds: [errorEmbed('Please provide a custom emoji.')] });
      const ext = animated ? 'gif' : 'png';
      const url = `https://cdn.discordapp.com/emojis/${emojiId}.${ext}?size=4096`;
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setImage(url)
        .setFooter({ text: CREDITS });
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'listbots',
    description: 'List all bots in the server',
    usage: '!listbots',
    async execute(message, args) {
      await message.guild.members.fetch();
      const bots = message.guild.members.cache.filter(m => m.user.bot);
      message.reply({ embeds: [infoEmbed(`🤖 Bots (${bots.size})`, bots.map(b => `${b.user.tag}`).join('\n') || 'None')] });
    }
  },
  {
    name: 'listemojis',
    description: 'List all server emojis',
    usage: '!listemojis',
    async execute(message, args) {
      const emojis = message.guild.emojis.cache;
      if (!emojis.size) return message.reply({ embeds: [infoEmbed('Emojis', 'No emojis found.')] });
      const list = emojis.map(e => `${e} \`${e.name}\``).slice(0, 30).join('\n');
      message.reply({ embeds: [infoEmbed(`😄 Server Emojis (${emojis.size})`, list + (emojis.size > 30 ? `\n...and ${emojis.size - 30} more` : ''))] });
    }
  },
  {
    name: 'listroles',
    description: 'List all server roles',
    usage: '!listroles',
    async execute(message, args) {
      const roles = message.guild.roles.cache.sort((a, b) => b.position - a.position);
      const list = [...roles.values()].slice(0, 30).map(r => `${r} — ${r.members.size} members`).join('\n');
      message.reply({ embeds: [infoEmbed(`🎭 Roles (${roles.size})`, list + (roles.size > 30 ? `\n...and ${roles.size - 30} more` : ''))] });
    }
  },
  {
    name: 'say',
    description: 'Make the bot say something',
    usage: '!say <text>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages))
        return message.reply({ embeds: [errorEmbed('You need Manage Messages permission.')] });
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      await message.delete().catch(() => null);
      message.channel.send(args.join(' '));
    }
  },
  {
    name: 'embed',
    description: 'Send a custom embed',
    usage: '!embed <title> | <description>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages))
        return message.reply({ embeds: [errorEmbed('You need Manage Messages permission.')] });
      const full = args.join(' ');
      const [title, ...desc] = full.split('|');
      if (!title) return message.reply({ embeds: [errorEmbed('Usage: !embed <title> | <description>')] });
      await message.delete().catch(() => null);
      message.channel.send({ embeds: [infoEmbed(title.trim(), desc.join('|').trim())] });
    }
  },
  {
    name: 'whopinged',
    description: 'Who pinged? Shows last role pinged',
    usage: '!whopinged',
    async execute(message, args) {
      const msgs = await message.channel.messages.fetch({ limit: 20 });
      const pings = msgs.filter(m => m.mentions.roles.size > 0 || m.mentions.everyone);
      const last = pings.first();
      if (!last) return message.reply({ embeds: [infoEmbed('Who Pinged?', 'No recent pings found.')] });
      message.reply({ embeds: [infoEmbed('🔔 Last Ping', `**By:** ${last.author.tag}\n**Roles:** ${last.mentions.roles.map(r => r.name).join(', ') || '@everyone'}\n[Jump to message](${last.url})`)] });
    }
  },
  {
    name: 'afk',
    description: 'Set your AFK status',
    usage: '!afk [reason]',
    async execute(message, args) {
      const reason = args.join(' ') || 'AFK';
      await db.set(`afk_${message.guild.id}_${message.author.id}`, { reason, time: Date.now() });
      message.reply({ embeds: [successEmbed('💤 AFK Set', `You are now AFK: **${reason}**`)] });
    }
  },
  {
    name: 'checkafk',
    description: 'Check if a user is AFK',
    usage: '!checkafk <user>',
    async execute(message, args) {
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const afk = await db.get(`afk_${message.guild.id}_${target.id}`);
      if (!afk) return message.reply({ embeds: [infoEmbed('Not AFK', `${target.user.tag} is not AFK.`)] });
      message.reply({ embeds: [infoEmbed(`💤 ${target.user.tag} is AFK`, `**Reason:** ${afk.reason}\n**Since:** <t:${Math.floor(afk.time / 1000)}:R>`)] });
    }
  },
  {
    name: 'vote',
    description: 'Add reaction voting to a message',
    usage: '!vote <text>',
    async execute(message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [errorEmbed('Please provide text for the vote.')] });
      await message.delete().catch(() => null);
      const msg = await message.channel.send({ embeds: [infoEmbed('📊 Vote', text)] });
      await msg.react('✅');
      await msg.react('❌');
    }
  },
  {
    name: 'uuid',
    description: 'Generate a random UUID',
    usage: '!uuid',
    async execute(message, args) {
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      message.reply({ embeds: [infoEmbed('🔑 UUID', `\`${uuid}\``)] });
    }
  }
];

module.exports = { category, commands };
