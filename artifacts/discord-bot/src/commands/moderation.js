const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed, infoEmbed, CREDITS } = require('../utils/embed');
const { parseDuration, formatDuration, resolveUser, resolveRole } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Moderation';

const commands = [
  {
    name: 'ban',
    description: 'Ban a member from the server',
    usage: '!ban <user> [reason]',
    aliases: ['banuser'],
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
        return message.reply({ embeds: [errorEmbed('You need Ban Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const reason = args.slice(1).join(' ') || 'No reason provided';
      await target.ban({ reason, deleteMessageSeconds: 0 });
      message.reply({ embeds: [modEmbed('Ban', target.user, message.author, reason)] });
    }
  },
  {
    name: 'unban',
    description: 'Unban a user by ID',
    usage: '!unban <userID> [reason]',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
        return message.reply({ embeds: [errorEmbed('You need Ban Members permission.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide a user ID.')] });
      const reason = args.slice(1).join(' ') || 'No reason provided';
      await message.guild.members.unban(args[0], reason).catch(() => null);
      message.reply({ embeds: [successEmbed('Unbanned', `User <@${args[0]}> has been unbanned.\n**Reason:** ${reason}`)] });
    }
  },
  {
    name: 'kick',
    description: 'Kick a member from the server',
    usage: '!kick <user> [reason]',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.KickMembers))
        return message.reply({ embeds: [errorEmbed('You need Kick Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const reason = args.slice(1).join(' ') || 'No reason provided';
      await target.kick(reason);
      message.reply({ embeds: [modEmbed('Kick', target.user, message.author, reason)] });
    }
  },
  {
    name: 'mute',
    description: 'Timeout (mute) a member',
    usage: '!mute <user> <duration> [reason]',
    aliases: ['timeout'],
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
        return message.reply({ embeds: [errorEmbed('You need Moderate Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const duration = parseDuration(args[1]);
      if (!duration) return message.reply({ embeds: [errorEmbed('Invalid duration. Example: `10m`, `1h`, `1d`')] });
      const reason = args.slice(2).join(' ') || 'No reason provided';
      await target.timeout(duration, reason);
      message.reply({ embeds: [modEmbed('Mute', target.user, message.author, reason, { Duration: formatDuration(duration) })] });
    }
  },
  {
    name: 'unmute',
    description: 'Remove timeout from a member',
    usage: '!unmute <user> [reason]',
    aliases: ['untimeout'],
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
        return message.reply({ embeds: [errorEmbed('You need Moderate Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      await target.timeout(null);
      message.reply({ embeds: [successEmbed('Unmuted', `${target.user.tag} has been unmuted.`)] });
    }
  },
  {
    name: 'warn',
    description: 'Warn a member',
    usage: '!warn <user> <reason>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
        return message.reply({ embeds: [errorEmbed('You need Moderate Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const reason = args.slice(1).join(' ') || 'No reason provided';
      const key = `warnings_${message.guild.id}_${target.id}`;
      const warns = (await db.get(key)) || [];
      warns.push({ reason, mod: message.author.id, date: Date.now() });
      await db.set(key, warns);
      message.reply({ embeds: [modEmbed('Warn', target.user, message.author, reason, { 'Total Warnings': warns.length })] });
    }
  },
  {
    name: 'warnings',
    description: 'View warnings for a member',
    usage: '!warnings <user>',
    aliases: ['warns'],
    async execute(message, args) {
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const key = `warnings_${message.guild.id}_${target.id}`;
      const warns = (await db.get(key)) || [];
      const embed = infoEmbed(`⚠️ Warnings for ${target.user.tag}`, warns.length === 0
        ? 'No warnings found.'
        : warns.map((w, i) => `**${i + 1}.** ${w.reason} — <@${w.mod}>`).join('\n'));
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'clearwarnings',
    description: 'Clear all warnings for a member',
    usage: '!clearwarnings <user>',
    aliases: ['clearwarns', 'delwarns'],
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
        return message.reply({ embeds: [errorEmbed('You need Moderate Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      await db.delete(`warnings_${message.guild.id}_${target.id}`);
      message.reply({ embeds: [successEmbed('Warnings Cleared', `All warnings for ${target.user.tag} have been cleared.`)] });
    }
  },
  {
    name: 'delwarn',
    description: 'Delete a specific warning',
    usage: '!delwarn <user> <index>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers))
        return message.reply({ embeds: [errorEmbed('You need Moderate Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const idx = parseInt(args[1]) - 1;
      const key = `warnings_${message.guild.id}_${target.id}`;
      const warns = (await db.get(key)) || [];
      if (isNaN(idx) || idx < 0 || idx >= warns.length)
        return message.reply({ embeds: [errorEmbed('Invalid warning index.')] });
      warns.splice(idx, 1);
      await db.set(key, warns);
      message.reply({ embeds: [successEmbed('Warning Deleted', `Warning #${idx + 1} removed from ${target.user.tag}.`)] });
    }
  },
  {
    name: 'purge',
    description: 'Delete a number of messages',
    usage: '!purge <amount> [user]',
    aliases: ['clear', 'prune'],
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages))
        return message.reply({ embeds: [errorEmbed('You need Manage Messages permission.')] });
      const amount = parseInt(args[0]);
      if (isNaN(amount) || amount < 1 || amount > 100)
        return message.reply({ embeds: [errorEmbed('Please provide a number between 1 and 100.')] });
      await message.delete().catch(() => null);
      let messages = await message.channel.messages.fetch({ limit: 100 });
      messages = messages.first(amount);
      if (args[1]) {
        const target = await resolveUser(message.guild, args[1]);
        if (target) messages = messages.filter(m => m.author.id === target.id).slice(0, amount);
      }
      const deleted = await message.channel.bulkDelete(messages, true);
      const reply = await message.channel.send({ embeds: [successEmbed('Purge', `Deleted **${deleted.size}** messages.`)] });
      setTimeout(() => reply.delete().catch(() => null), 4000);
    }
  },
  {
    name: 'lock',
    description: 'Lock a channel',
    usage: '!lock [channel] [reason]',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return message.reply({ embeds: [errorEmbed('You need Manage Channels permission.')] });
      const channel = message.mentions.channels.first() || message.channel;
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
      message.reply({ embeds: [successEmbed('🔒 Channel Locked', `${channel} has been locked.`)] });
    }
  },
  {
    name: 'unlock',
    description: 'Unlock a channel',
    usage: '!unlock [channel]',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return message.reply({ embeds: [errorEmbed('You need Manage Channels permission.')] });
      const channel = message.mentions.channels.first() || message.channel;
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null });
      message.reply({ embeds: [successEmbed('🔓 Channel Unlocked', `${channel} has been unlocked.`)] });
    }
  },
  {
    name: 'lockall',
    description: 'Lock all text channels',
    usage: '!lockall',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
        return message.reply({ embeds: [errorEmbed('You need Administrator permission.')] });
      const channels = message.guild.channels.cache.filter(c => c.type === 0);
      let count = 0;
      for (const [, ch] of channels) {
        await ch.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false }).catch(() => null);
        count++;
      }
      message.reply({ embeds: [successEmbed('🔒 Server Locked', `Locked **${count}** channels.`)] });
    }
  },
  {
    name: 'unlockall',
    description: 'Unlock all text channels',
    usage: '!unlockall',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
        return message.reply({ embeds: [errorEmbed('You need Administrator permission.')] });
      const channels = message.guild.channels.cache.filter(c => c.type === 0);
      let count = 0;
      for (const [, ch] of channels) {
        await ch.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null }).catch(() => null);
        count++;
      }
      message.reply({ embeds: [successEmbed('🔓 Server Unlocked', `Unlocked **${count}** channels.`)] });
    }
  },
  {
    name: 'slowmode',
    description: 'Set slowmode for a channel',
    usage: '!slowmode <seconds>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return message.reply({ embeds: [errorEmbed('You need Manage Channels permission.')] });
      const secs = parseInt(args[0]);
      if (isNaN(secs) || secs < 0 || secs > 21600)
        return message.reply({ embeds: [errorEmbed('Please provide a value between 0 and 21600.')] });
      await message.channel.setRateLimitPerUser(secs);
      message.reply({ embeds: [successEmbed('Slowmode', secs === 0 ? 'Slowmode disabled.' : `Slowmode set to **${secs}s**.`)] });
    }
  },
  {
    name: 'nuke',
    description: 'Clone and delete a channel to remove all messages',
    usage: '!nuke',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return message.reply({ embeds: [errorEmbed('You need Manage Channels permission.')] });
      const ch = message.channel;
      const newCh = await ch.clone();
      await ch.delete();
      newCh.send({ embeds: [successEmbed('💥 Channel Nuked', 'Channel has been nuked and recreated.')] });
    }
  },
  {
    name: 'addrole',
    description: 'Add a role to a member',
    usage: '!addrole <user> <role>',
    aliases: ['giverole'],
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles))
        return message.reply({ embeds: [errorEmbed('You need Manage Roles permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const { resolveRole: rr } = require('../utils/helpers');
      const role = await rr(message.guild, args[1]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      await target.roles.add(role);
      message.reply({ embeds: [successEmbed('Role Added', `${role} added to ${target.user.tag}.`)] });
    }
  },
  {
    name: 'removerole',
    description: 'Remove a role from a member',
    usage: '!removerole <user> <role>',
    aliases: ['takerole'],
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles))
        return message.reply({ embeds: [errorEmbed('You need Manage Roles permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const { resolveRole: rr } = require('../utils/helpers');
      const role = await rr(message.guild, args[1]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      await target.roles.remove(role);
      message.reply({ embeds: [successEmbed('Role Removed', `${role} removed from ${target.user.tag}.`)] });
    }
  },
  {
    name: 'nick',
    description: 'Change a member\'s nickname',
    usage: '!nick <user> [nickname]',
    aliases: ['nickname', 'setnick'],
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageNicknames))
        return message.reply({ embeds: [errorEmbed('You need Manage Nicknames permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const nick = args.slice(1).join(' ') || null;
      await target.setNickname(nick);
      message.reply({ embeds: [successEmbed('Nickname Changed', nick ? `${target.user.tag}'s nickname set to **${nick}**.` : `${target.user.tag}'s nickname has been reset.`)] });
    }
  },
  {
    name: 'deafen',
    description: 'Server deafen a member',
    usage: '!deafen <user>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.DeafenMembers))
        return message.reply({ embeds: [errorEmbed('You need Deafen Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      await target.voice.setDeaf(true).catch(() => null);
      message.reply({ embeds: [successEmbed('Deafened', `${target.user.tag} has been server deafened.`)] });
    }
  },
  {
    name: 'undeafen',
    description: 'Remove server deafen from a member',
    usage: '!undeafen <user>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.DeafenMembers))
        return message.reply({ embeds: [errorEmbed('You need Deafen Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      await target.voice.setDeaf(false).catch(() => null);
      message.reply({ embeds: [successEmbed('Undeafened', `${target.user.tag} has been server undeafened.`)] });
    }
  },
  {
    name: 'vmute',
    description: 'Server mute a member in voice',
    usage: '!vmute <user>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers))
        return message.reply({ embeds: [errorEmbed('You need Mute Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      await target.voice.setMute(true).catch(() => null);
      message.reply({ embeds: [successEmbed('Voice Muted', `${target.user.tag} has been voice muted.`)] });
    }
  },
  {
    name: 'vunmute',
    description: 'Remove voice mute from a member',
    usage: '!vunmute <user>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.MuteMembers))
        return message.reply({ embeds: [errorEmbed('You need Mute Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      await target.voice.setMute(false).catch(() => null);
      message.reply({ embeds: [successEmbed('Voice Unmuted', `${target.user.tag} has been voice unmuted.`)] });
    }
  },
  {
    name: 'move',
    description: 'Move a member to a voice channel',
    usage: '!move <user> <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.MoveMembers))
        return message.reply({ embeds: [errorEmbed('You need Move Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const { resolveChannel: rc } = require('../utils/helpers');
      const ch = await rc(message.guild, args[1]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await target.voice.setChannel(ch).catch(() => null);
      message.reply({ embeds: [successEmbed('Moved', `${target.user.tag} moved to ${ch}.`)] });
    }
  },
  {
    name: 'voicekick',
    description: 'Kick a member from voice chat',
    usage: '!voicekick <user>',
    aliases: ['vkick'],
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.MoveMembers))
        return message.reply({ embeds: [errorEmbed('You need Move Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      await target.voice.setChannel(null).catch(() => null);
      message.reply({ embeds: [successEmbed('Voice Kicked', `${target.user.tag} has been removed from voice.`)] });
    }
  },
  {
    name: 'softban',
    description: 'Ban and immediately unban to delete messages',
    usage: '!softban <user> [reason]',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
        return message.reply({ embeds: [errorEmbed('You need Ban Members permission.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const reason = args.slice(1).join(' ') || 'No reason provided';
      await target.ban({ reason, deleteMessageSeconds: 604800 });
      await message.guild.members.unban(target.id, 'Softban');
      message.reply({ embeds: [modEmbed('Softban', target.user, message.author, reason)] });
    }
  },
  {
    name: 'hackban',
    description: 'Ban a user who is not in the server',
    usage: '!hackban <userID> [reason]',
    aliases: ['forceban'],
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
        return message.reply({ embeds: [errorEmbed('You need Ban Members permission.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide a user ID.')] });
      const reason = args.slice(1).join(' ') || 'No reason provided';
      await message.guild.members.ban(args[0], { reason });
      message.reply({ embeds: [successEmbed('Hackban', `User <@${args[0]}> has been banned.\n**Reason:** ${reason}`)] });
    }
  },
  {
    name: 'massban',
    description: 'Ban multiple users by ID',
    usage: '!massban <id1> <id2> ... [reason]',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
        return message.reply({ embeds: [errorEmbed('You need Ban Members permission.')] });
      const ids = args.filter(a => /^\d+$/.test(a));
      if (!ids.length) return message.reply({ embeds: [errorEmbed('No valid user IDs provided.')] });
      let success = 0;
      for (const id of ids) {
        await message.guild.members.ban(id, { reason: 'Massban' }).then(() => success++).catch(() => null);
      }
      message.reply({ embeds: [successEmbed('Massban', `Banned **${success}/${ids.length}** users.`)] });
    }
  },
  {
    name: 'banlist',
    description: 'View the server ban list',
    usage: '!banlist',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers))
        return message.reply({ embeds: [errorEmbed('You need Ban Members permission.')] });
      const bans = await message.guild.bans.fetch();
      if (!bans.size) return message.reply({ embeds: [infoEmbed('Ban List', 'No bans found.')] });
      const list = bans.first(20).map(b => `${b.user.tag} — ${b.reason || 'No reason'}`).join('\n');
      message.reply({ embeds: [infoEmbed(`Ban List (${bans.size})`, list)] });
    }
  },
  {
    name: 'modlogs',
    description: 'View mod logs for a user',
    usage: '!modlogs <user>',
    async execute(message, args) {
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const warns = (await db.get(`warnings_${message.guild.id}_${target.id}`)) || [];
      const embed = infoEmbed(`📋 Mod Logs — ${target.user.tag}`, warns.length === 0
        ? 'No mod logs found.'
        : warns.map((w, i) => `**${i + 1}.** ${w.reason} — <@${w.mod}> — <t:${Math.floor(w.date / 1000)}:R>`).join('\n'));
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'setmuterole',
    description: 'Set the mute role for the server',
    usage: '!setmuterole <role>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.Administrator))
        return message.reply({ embeds: [errorEmbed('You need Administrator permission.')] });
      const { resolveRole: rr } = require('../utils/helpers');
      const role = await rr(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      await db.set(`muterole_${message.guild.id}`, role.id);
      message.reply({ embeds: [successEmbed('Mute Role Set', `Mute role set to ${role}.`)] });
    }
  },
  {
    name: 'createrole',
    description: 'Create a new role',
    usage: '!createrole <name> [color]',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles))
        return message.reply({ embeds: [errorEmbed('You need Manage Roles permission.')] });
      const name = args[0];
      if (!name) return message.reply({ embeds: [errorEmbed('Please provide a role name.')] });
      const color = args[1] || null;
      const role = await message.guild.roles.create({ name, color: color?.startsWith('#') ? color : null });
      message.reply({ embeds: [successEmbed('Role Created', `Created role ${role}.`)] });
    }
  },
  {
    name: 'delrole',
    description: 'Delete a role',
    usage: '!delrole <role>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageRoles))
        return message.reply({ embeds: [errorEmbed('You need Manage Roles permission.')] });
      const { resolveRole: rr } = require('../utils/helpers');
      const role = await rr(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      await role.delete();
      message.reply({ embeds: [successEmbed('Role Deleted', `Role **${role.name}** has been deleted.`)] });
    }
  },
  {
    name: 'createchannel',
    description: 'Create a text channel',
    usage: '!createchannel <name>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return message.reply({ embeds: [errorEmbed('You need Manage Channels permission.')] });
      const name = args.join('-').toLowerCase();
      if (!name) return message.reply({ embeds: [errorEmbed('Please provide a channel name.')] });
      const ch = await message.guild.channels.create({ name, type: 0 });
      message.reply({ embeds: [successEmbed('Channel Created', `Created ${ch}.`)] });
    }
  },
  {
    name: 'deletechannel',
    description: 'Delete a channel',
    usage: '!deletechannel [channel]',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return message.reply({ embeds: [errorEmbed('You need Manage Channels permission.')] });
      const { resolveChannel: rc } = require('../utils/helpers');
      const ch = (args[0] ? await rc(message.guild, args[0]) : null) || message.channel;
      await ch.delete();
    }
  },
  {
    name: 'setslowmode',
    description: 'Set slowmode for a specific channel',
    usage: '!setslowmode <channel> <seconds>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return message.reply({ embeds: [errorEmbed('You need Manage Channels permission.')] });
      const { resolveChannel: rc } = require('../utils/helpers');
      const ch = await rc(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      const secs = parseInt(args[1]);
      if (isNaN(secs)) return message.reply({ embeds: [errorEmbed('Invalid seconds value.')] });
      await ch.setRateLimitPerUser(secs);
      message.reply({ embeds: [successEmbed('Slowmode Set', `${ch} slowmode set to **${secs}s**.`)] });
    }
  },
  {
    name: 'channeltopic',
    description: 'Set a channel topic',
    usage: '!channeltopic [topic]',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return message.reply({ embeds: [errorEmbed('You need Manage Channels permission.')] });
      const topic = args.join(' ') || null;
      await message.channel.setTopic(topic);
      message.reply({ embeds: [successEmbed('Topic Set', topic ? `Topic set to: ${topic}` : 'Topic cleared.')] });
    }
  },
  {
    name: 'channelname',
    description: 'Rename a channel',
    usage: '!channelname <name>',
    async execute(message, args) {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels))
        return message.reply({ embeds: [errorEmbed('You need Manage Channels permission.')] });
      const name = args.join('-');
      if (!name) return message.reply({ embeds: [errorEmbed('Please provide a name.')] });
      await message.channel.setName(name);
      message.reply({ embeds: [successEmbed('Channel Renamed', `Channel renamed to **${name}**.`)] });
    }
  }
];

module.exports = { category, commands };
