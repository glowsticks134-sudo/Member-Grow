const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, modEmbed, infoEmbed, CREDITS } = require('../utils/embed');
const { parseDuration, formatDuration } = require('../utils/helpers');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mod')
    .setDescription('Moderation commands')
    .addSubcommandGroup(group => group
      .setName('action')
      .setDescription('Punish members')
      .addSubcommand(s => s.setName('ban').setDescription('Ban a member').addUserOption(o => o.setName('user').setDescription('User to ban').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')))
      .addSubcommand(s => s.setName('unban').setDescription('Unban a user by ID').addStringOption(o => o.setName('userid').setDescription('User ID').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')))
      .addSubcommand(s => s.setName('kick').setDescription('Kick a member').addUserOption(o => o.setName('user').setDescription('User to kick').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')))
      .addSubcommand(s => s.setName('mute').setDescription('Timeout a member').addUserOption(o => o.setName('user').setDescription('User to mute').setRequired(true)).addStringOption(o => o.setName('duration').setDescription('Duration e.g. 10m, 1h').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')))
      .addSubcommand(s => s.setName('unmute').setDescription('Remove timeout').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)))
      .addSubcommand(s => s.setName('softban').setDescription('Ban + unban to delete messages').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')))
      .addSubcommand(s => s.setName('hackban').setDescription('Ban a user not in the server').addStringOption(o => o.setName('userid').setDescription('User ID').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason')))
      .addSubcommand(s => s.setName('massban').setDescription('Ban multiple users by ID').addStringOption(o => o.setName('ids').setDescription('Space-separated user IDs').setRequired(true)))
    )
    .addSubcommandGroup(group => group
      .setName('warn')
      .setDescription('Warning management')
      .addSubcommand(s => s.setName('add').setDescription('Warn a member').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(true)))
      .addSubcommand(s => s.setName('list').setDescription('View warnings').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)))
      .addSubcommand(s => s.setName('clear').setDescription('Clear all warnings').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)))
      .addSubcommand(s => s.setName('remove').setDescription('Remove a specific warning').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addIntegerOption(o => o.setName('index').setDescription('Warning number').setRequired(true)))
      .addSubcommand(s => s.setName('logs').setDescription('View mod logs').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)))
      .addSubcommand(s => s.setName('banlist').setDescription('View the ban list'))
    )
    .addSubcommandGroup(group => group
      .setName('channel')
      .setDescription('Channel management')
      .addSubcommand(s => s.setName('purge').setDescription('Delete messages').addIntegerOption(o => o.setName('amount').setDescription('1-100').setRequired(true).setMinValue(1).setMaxValue(100)).addUserOption(o => o.setName('user').setDescription('Only purge from this user')))
      .addSubcommand(s => s.setName('lock').setDescription('Lock a channel').addChannelOption(o => o.setName('channel').setDescription('Channel (default: current)')))
      .addSubcommand(s => s.setName('unlock').setDescription('Unlock a channel').addChannelOption(o => o.setName('channel').setDescription('Channel (default: current)')))
      .addSubcommand(s => s.setName('lockall').setDescription('Lock all text channels'))
      .addSubcommand(s => s.setName('unlockall').setDescription('Unlock all text channels'))
      .addSubcommand(s => s.setName('slowmode').setDescription('Set channel slowmode').addIntegerOption(o => o.setName('seconds').setDescription('0-21600').setRequired(true).setMinValue(0).setMaxValue(21600)))
      .addSubcommand(s => s.setName('nuke').setDescription('Clone and delete channel'))
      .addSubcommand(s => s.setName('create').setDescription('Create a text channel').addStringOption(o => o.setName('name').setDescription('Channel name').setRequired(true)))
      .addSubcommand(s => s.setName('delete').setDescription('Delete a channel').addChannelOption(o => o.setName('channel').setDescription('Channel to delete')))
      .addSubcommand(s => s.setName('topic').setDescription('Set channel topic').addStringOption(o => o.setName('topic').setDescription('New topic')))
      .addSubcommand(s => s.setName('rename').setDescription('Rename current channel').addStringOption(o => o.setName('name').setDescription('New name').setRequired(true)))
      .addSubcommand(s => s.setName('setslowmode').setDescription('Set slowmode for a specific channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)).addIntegerOption(o => o.setName('seconds').setDescription('Seconds').setRequired(true).setMinValue(0).setMaxValue(21600)))
    )
    .addSubcommandGroup(group => group
      .setName('roles')
      .setDescription('Role management')
      .addSubcommand(s => s.setName('add').setDescription('Add role to member').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
      .addSubcommand(s => s.setName('remove').setDescription('Remove role from member').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
      .addSubcommand(s => s.setName('nick').setDescription("Change member's nickname").addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addStringOption(o => o.setName('nickname').setDescription('New nickname (leave blank to reset)')))
      .addSubcommand(s => s.setName('setmuterole').setDescription('Set the mute role').addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
      .addSubcommand(s => s.setName('create').setDescription('Create a role').addStringOption(o => o.setName('name').setDescription('Role name').setRequired(true)).addStringOption(o => o.setName('color').setDescription('Hex color e.g. #FF5733')))
      .addSubcommand(s => s.setName('delete').setDescription('Delete a role').addRoleOption(o => o.setName('role').setDescription('Role to delete').setRequired(true)))
    )
    .addSubcommandGroup(group => group
      .setName('voice')
      .setDescription('Voice channel controls')
      .addSubcommand(s => s.setName('deafen').setDescription('Server deafen a member').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)))
      .addSubcommand(s => s.setName('undeafen').setDescription('Remove server deafen').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)))
      .addSubcommand(s => s.setName('vmute').setDescription('Voice mute a member').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)))
      .addSubcommand(s => s.setName('vunmute').setDescription('Remove voice mute').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)))
      .addSubcommand(s => s.setName('move').setDescription('Move member to voice channel').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addChannelOption(o => o.setName('channel').setDescription('Voice channel').setRequired(true)))
      .addSubcommand(s => s.setName('kick').setDescription('Kick member from voice').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)))
    ),

  async execute(interaction) {
    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand();

    if (group === 'action') {
      if (sub === 'ban') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Ban Members permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        const reason = interaction.options.getString('reason') || 'No reason provided';
        await target.ban({ reason, deleteMessageSeconds: 0 });
        return interaction.reply({ embeds: [modEmbed('Ban', target.user, interaction.user, reason)] });
      }
      if (sub === 'unban') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Ban Members permission.')], ephemeral: true });
        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        await interaction.guild.members.unban(userId, reason).catch(() => null);
        return interaction.reply({ embeds: [successEmbed('Unbanned', `User <@${userId}> has been unbanned.\n**Reason:** ${reason}`)] });
      }
      if (sub === 'kick') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Kick Members permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        const reason = interaction.options.getString('reason') || 'No reason provided';
        await target.kick(reason);
        return interaction.reply({ embeds: [modEmbed('Kick', target.user, interaction.user, reason)] });
      }
      if (sub === 'mute') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Moderate Members permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        const duration = parseDuration(interaction.options.getString('duration'));
        if (!duration) return interaction.reply({ embeds: [errorEmbed('Invalid duration. Example: `10m`, `1h`, `1d`')], ephemeral: true });
        const reason = interaction.options.getString('reason') || 'No reason provided';
        await target.timeout(duration, reason);
        return interaction.reply({ embeds: [modEmbed('Mute', target.user, interaction.user, reason, { Duration: formatDuration(duration) })] });
      }
      if (sub === 'unmute') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Moderate Members permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        await target.timeout(null);
        return interaction.reply({ embeds: [successEmbed('Unmuted', `${target.user.tag} has been unmuted.`)] });
      }
      if (sub === 'softban') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Ban Members permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        const reason = interaction.options.getString('reason') || 'No reason provided';
        await target.ban({ reason, deleteMessageSeconds: 604800 });
        await interaction.guild.members.unban(target.id, 'Softban');
        return interaction.reply({ embeds: [modEmbed('Softban', target.user, interaction.user, reason)] });
      }
      if (sub === 'hackban') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Ban Members permission.')], ephemeral: true });
        const userId = interaction.options.getString('userid');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        await interaction.guild.members.ban(userId, { reason });
        return interaction.reply({ embeds: [successEmbed('Hackban', `User <@${userId}> has been banned.\n**Reason:** ${reason}`)] });
      }
      if (sub === 'massban') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Ban Members permission.')], ephemeral: true });
        const ids = interaction.options.getString('ids').split(/\s+/).filter(a => /^\d+$/.test(a));
        if (!ids.length) return interaction.reply({ embeds: [errorEmbed('No valid user IDs provided.')], ephemeral: true });
        await interaction.deferReply();
        let success = 0;
        for (const id of ids) {
          await interaction.guild.members.ban(id, { reason: 'Massban' }).then(() => success++).catch(() => null);
        }
        return interaction.editReply({ embeds: [successEmbed('Massban', `Banned **${success}/${ids.length}** users.`)] });
      }
    }

    if (group === 'warn') {
      if (sub === 'add') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Moderate Members permission.')], ephemeral: true });
        const target = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const key = `warnings_${interaction.guild.id}_${target.id}`;
        const warns = (await db.get(key)) || [];
        warns.push({ reason, mod: interaction.user.id, date: Date.now() });
        await db.set(key, warns);
        return interaction.reply({ embeds: [modEmbed('Warn', target, interaction.user, reason, { 'Total Warnings': warns.length })] });
      }
      if (sub === 'list') {
        const target = interaction.options.getUser('user');
        const warns = (await db.get(`warnings_${interaction.guild.id}_${target.id}`)) || [];
        return interaction.reply({ embeds: [infoEmbed(`⚠️ Warnings for ${target.tag}`, warns.length === 0 ? 'No warnings.' : warns.map((w, i) => `**${i + 1}.** ${w.reason} — <@${w.mod}>`).join('\n'))] });
      }
      if (sub === 'clear') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Moderate Members permission.')], ephemeral: true });
        const target = interaction.options.getUser('user');
        await db.delete(`warnings_${interaction.guild.id}_${target.id}`);
        return interaction.reply({ embeds: [successEmbed('Warnings Cleared', `All warnings for ${target.tag} cleared.`)] });
      }
      if (sub === 'remove') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ModerateMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Moderate Members permission.')], ephemeral: true });
        const target = interaction.options.getUser('user');
        const idx = interaction.options.getInteger('index') - 1;
        const key = `warnings_${interaction.guild.id}_${target.id}`;
        const warns = (await db.get(key)) || [];
        if (idx < 0 || idx >= warns.length) return interaction.reply({ embeds: [errorEmbed('Invalid warning index.')], ephemeral: true });
        warns.splice(idx, 1);
        await db.set(key, warns);
        return interaction.reply({ embeds: [successEmbed('Warning Removed', `Warning #${idx + 1} removed from ${target.tag}.`)] });
      }
      if (sub === 'logs') {
        const target = interaction.options.getUser('user');
        const warns = (await db.get(`warnings_${interaction.guild.id}_${target.id}`)) || [];
        return interaction.reply({ embeds: [infoEmbed(`📋 Mod Logs — ${target.tag}`, warns.length === 0 ? 'No logs.' : warns.map((w, i) => `**${i + 1}.** ${w.reason} — <@${w.mod}> — <t:${Math.floor(w.date / 1000)}:R>`).join('\n'))] });
      }
      if (sub === 'banlist') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Ban Members permission.')], ephemeral: true });
        const bans = await interaction.guild.bans.fetch();
        if (!bans.size) return interaction.reply({ embeds: [infoEmbed('Ban List', 'No bans found.')] });
        const list = bans.first(20).map(b => `${b.user.tag} — ${b.reason || 'No reason'}`).join('\n');
        return interaction.reply({ embeds: [infoEmbed(`Ban List (${bans.size})`, list)] });
      }
    }

    if (group === 'channel') {
      if (sub === 'purge') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Messages permission.')], ephemeral: true });
        const amount = interaction.options.getInteger('amount');
        const targetUser = interaction.options.getUser('user');
        await interaction.deferReply({ ephemeral: true });
        let messages = await interaction.channel.messages.fetch({ limit: 100 });
        if (targetUser) messages = messages.filter(m => m.author.id === targetUser.id);
        const toDelete = [...messages.values()].slice(0, amount);
        const deleted = await interaction.channel.bulkDelete(toDelete, true);
        return interaction.editReply({ embeds: [successEmbed('Purge', `Deleted **${deleted.size}** messages.`)] });
      }
      if (sub === 'lock') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
        const ch = interaction.options.getChannel('channel') || interaction.channel;
        await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
        return interaction.reply({ embeds: [successEmbed('🔒 Locked', `${ch} has been locked.`)] });
      }
      if (sub === 'unlock') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
        const ch = interaction.options.getChannel('channel') || interaction.channel;
        await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
        return interaction.reply({ embeds: [successEmbed('🔓 Unlocked', `${ch} has been unlocked.`)] });
      }
      if (sub === 'lockall') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
          return interaction.reply({ embeds: [errorEmbed('You need Administrator permission.')], ephemeral: true });
        await interaction.deferReply();
        const channels = interaction.guild.channels.cache.filter(c => c.type === 0);
        for (const [, ch] of channels) await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }).catch(() => null);
        return interaction.editReply({ embeds: [successEmbed('🔒 Server Locked', `Locked **${channels.size}** channels.`)] });
      }
      if (sub === 'unlockall') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
          return interaction.reply({ embeds: [errorEmbed('You need Administrator permission.')], ephemeral: true });
        await interaction.deferReply();
        const channels = interaction.guild.channels.cache.filter(c => c.type === 0);
        for (const [, ch] of channels) await ch.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null }).catch(() => null);
        return interaction.editReply({ embeds: [successEmbed('🔓 Server Unlocked', `Unlocked **${channels.size}** channels.`)] });
      }
      if (sub === 'slowmode') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
        const secs = interaction.options.getInteger('seconds');
        await interaction.channel.setRateLimitPerUser(secs);
        return interaction.reply({ embeds: [successEmbed('Slowmode', secs === 0 ? 'Slowmode disabled.' : `Slowmode set to **${secs}s**.`)] });
      }
      if (sub === 'nuke') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
        const newCh = await interaction.channel.clone();
        await interaction.channel.delete();
        newCh.send({ embeds: [successEmbed('💥 Nuked', 'Channel has been nuked and recreated.')] });
        return;
      }
      if (sub === 'create') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
        const name = interaction.options.getString('name').toLowerCase().replace(/\s+/g, '-');
        const ch = await interaction.guild.channels.create({ name, type: 0 });
        return interaction.reply({ embeds: [successEmbed('Channel Created', `Created ${ch}.`)] });
      }
      if (sub === 'delete') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
        const ch = interaction.options.getChannel('channel') || interaction.channel;
        await interaction.reply({ embeds: [successEmbed('Channel Deleted', `Deleting ${ch.name}...`)], ephemeral: true });
        await ch.delete().catch(() => null);
        return;
      }
      if (sub === 'topic') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
        const topic = interaction.options.getString('topic') || null;
        await interaction.channel.setTopic(topic);
        return interaction.reply({ embeds: [successEmbed('Topic Set', topic ? `Topic: ${topic}` : 'Topic cleared.')] });
      }
      if (sub === 'rename') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
        const name = interaction.options.getString('name');
        await interaction.channel.setName(name);
        return interaction.reply({ embeds: [successEmbed('Renamed', `Channel renamed to **${name}**.`)] });
      }
      if (sub === 'setslowmode') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Channels permission.')], ephemeral: true });
        const ch = interaction.options.getChannel('channel');
        const secs = interaction.options.getInteger('seconds');
        await ch.setRateLimitPerUser(secs);
        return interaction.reply({ embeds: [successEmbed('Slowmode Set', `${ch} slowmode set to **${secs}s**.`)] });
      }
    }

    if (group === 'roles') {
      if (sub === 'add') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Roles permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        const role = interaction.options.getRole('role');
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        await target.roles.add(role);
        return interaction.reply({ embeds: [successEmbed('Role Added', `${role} added to ${target.user.tag}.`)] });
      }
      if (sub === 'remove') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Roles permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        const role = interaction.options.getRole('role');
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        await target.roles.remove(role);
        return interaction.reply({ embeds: [successEmbed('Role Removed', `${role} removed from ${target.user.tag}.`)] });
      }
      if (sub === 'nick') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Nicknames permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        const nick = interaction.options.getString('nickname') || null;
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        await target.setNickname(nick);
        return interaction.reply({ embeds: [successEmbed('Nickname Changed', nick ? `${target.user.tag}'s nickname set to **${nick}**.` : `${target.user.tag}'s nickname reset.`)] });
      }
      if (sub === 'setmuterole') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
          return interaction.reply({ embeds: [errorEmbed('You need Administrator permission.')], ephemeral: true });
        const role = interaction.options.getRole('role');
        await db.set(`muterole_${interaction.guild.id}`, role.id);
        return interaction.reply({ embeds: [successEmbed('Mute Role Set', `Mute role set to ${role}.`)] });
      }
      if (sub === 'create') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Roles permission.')], ephemeral: true });
        const name = interaction.options.getString('name');
        const color = interaction.options.getString('color');
        const role = await interaction.guild.roles.create({ name, color: color?.startsWith('#') ? color : null });
        return interaction.reply({ embeds: [successEmbed('Role Created', `Created role ${role}.`)] });
      }
      if (sub === 'delete') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
          return interaction.reply({ embeds: [errorEmbed('You need Manage Roles permission.')], ephemeral: true });
        const role = interaction.options.getRole('role');
        const name = role.name;
        await role.delete();
        return interaction.reply({ embeds: [successEmbed('Role Deleted', `Role **${name}** deleted.`)] });
      }
    }

    if (group === 'voice') {
      if (sub === 'deafen') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.DeafenMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Deafen Members permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        await target.voice.setDeaf(true).catch(() => null);
        return interaction.reply({ embeds: [successEmbed('Deafened', `${target.user.tag} server deafened.`)] });
      }
      if (sub === 'undeafen') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.DeafenMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Deafen Members permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        await target.voice.setDeaf(false).catch(() => null);
        return interaction.reply({ embeds: [successEmbed('Undeafened', `${target.user.tag} undeafened.`)] });
      }
      if (sub === 'vmute') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Mute Members permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        await target.voice.setMute(true).catch(() => null);
        return interaction.reply({ embeds: [successEmbed('Voice Muted', `${target.user.tag} voice muted.`)] });
      }
      if (sub === 'vunmute') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Mute Members permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        await target.voice.setMute(false).catch(() => null);
        return interaction.reply({ embeds: [successEmbed('Voice Unmuted', `${target.user.tag} voice unmuted.`)] });
      }
      if (sub === 'move') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Move Members permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        const ch = interaction.options.getChannel('channel');
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        await target.voice.setChannel(ch).catch(() => null);
        return interaction.reply({ embeds: [successEmbed('Moved', `${target.user.tag} moved to ${ch}.`)] });
      }
      if (sub === 'kick') {
        if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers))
          return interaction.reply({ embeds: [errorEmbed('You need Move Members permission.')], ephemeral: true });
        const target = interaction.guild.members.cache.get(interaction.options.getUser('user').id);
        if (!target) return interaction.reply({ embeds: [errorEmbed('Could not find that user.')], ephemeral: true });
        await target.voice.setChannel(null).catch(() => null);
        return interaction.reply({ embeds: [successEmbed('Voice Kicked', `${target.user.tag} removed from voice.`)] });
      }
    }
  }
};
