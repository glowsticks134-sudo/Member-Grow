const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const db = require('../utils/database');

function xpForLevel(level) { return Math.floor(100 * Math.pow(1.5, level)); }
async function getLevelData(userId, guildId) { return (await db.get(`level_${guildId}_${userId}`)) || { xp: 0, level: 0, totalXp: 0 }; }

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leveling')
    .setDescription('XP and leveling commands')
    .addSubcommand(s => s.setName('rank').setDescription('Check rank').addUserOption(o => o.setName('user').setDescription('User (default: you)')))
    .addSubcommand(s => s.setName('leaderboard').setDescription('Server XP leaderboard'))
    .addSubcommand(s => s.setName('setlevel').setDescription('Set a member\'s level').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addIntegerOption(o => o.setName('level').setDescription('Level').setRequired(true).setMinValue(0)))
    .addSubcommand(s => s.setName('setxp').setDescription('Set a member\'s XP').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addIntegerOption(o => o.setName('xp').setDescription('XP amount').setRequired(true).setMinValue(0)))
    .addSubcommand(s => s.setName('addxp').setDescription('Add XP to a member').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addIntegerOption(o => o.setName('xp').setDescription('XP to add').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('removexp').setDescription('Remove XP from a member').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)).addIntegerOption(o => o.setName('xp').setDescription('XP to remove').setRequired(true).setMinValue(1)))
    .addSubcommand(s => s.setName('resetxp').setDescription('Reset XP for a member').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)))
    .addSubcommand(s => s.setName('resetallxp').setDescription('Reset ALL server XP (admin only)'))
    .addSubcommand(s => s.setName('xpmultiplier').setDescription('Set XP multiplier').addNumberOption(o => o.setName('multiplier').setDescription('Multiplier (e.g. 2.0)').setRequired(true).setMinValue(0.1).setMaxValue(10)))
    .addSubcommand(s => s.setName('levelchannel').setDescription('Set level-up announcement channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('noxpchannel').setDescription('Toggle XP off for a channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('noxprole').setDescription('Set role that earns no XP').addRoleOption(o => o.setName('role').setDescription('Role').setRequired(true)))
    .addSubcommand(s => s.setName('levelrole').setDescription('Set role reward for reaching a level').addIntegerOption(o => o.setName('level').setDescription('Level').setRequired(true).setMinValue(1)).addRoleOption(o => o.setName('role').setDescription('Role reward').setRequired(true)))
    .addSubcommand(s => s.setName('listlevelroles').setDescription('List all level role rewards'))
    .addSubcommand(s => s.setName('leveltogglemsg').setDescription('Toggle level-up messages on/off'))
    .addSubcommand(s => s.setName('xpsettings').setDescription('View XP settings'))
    .addSubcommand(s => s.setName('xptop').setDescription('Top XP earners this week'))
    .addSubcommand(s => s.setName('lvlcard').setDescription('View your level card').addUserOption(o => o.setName('user').setDescription('User (default: you)'))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'rank') {
      const user = interaction.options.getUser('user') || interaction.user;
      const member = interaction.guild.members.cache.get(user.id);
      const data = await getLevelData(user.id, guildId);
      const xpNeeded = xpForLevel(data.level + 1);
      const percent = Math.min(100, Math.floor((data.xp / xpNeeded) * 100));
      const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
      const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`📊 ${user.tag}'s Rank`).setThumbnail(user.displayAvatarURL())
        .addFields({ name: 'Level', value: String(data.level), inline: true }, { name: 'XP', value: `${data.xp} / ${xpNeeded}`, inline: true }, { name: 'Total XP', value: String(data.totalXp || 0), inline: true }, { name: 'Progress', value: `[${bar}] ${percent}%` })
        .setFooter({ text: CREDITS }).setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }
    if (sub === 'leaderboard') {
      await interaction.deferReply();
      await interaction.guild.members.fetch();
      const members = interaction.guild.members.cache.filter(m => !m.user.bot);
      const entries = [];
      for (const [id] of members) {
        const data = await getLevelData(id, guildId);
        if (data.totalXp > 0) entries.push({ id, ...data });
      }
      entries.sort((a, b) => b.totalXp - a.totalXp);
      const top = entries.slice(0, 10).map((e, i) => `**${i + 1}.** <@${e.id}> — Level **${e.level}** (${e.totalXp} XP)`).join('\n');
      return interaction.editReply({ embeds: [infoEmbed('🏆 XP Leaderboard', top || 'No data yet.')] });
    }
    if (sub === 'setlevel') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const user = interaction.options.getUser('user');
      const level = interaction.options.getInteger('level');
      const data = await getLevelData(user.id, guildId);
      data.level = level;
      data.xp = 0;
      await db.set(`level_${guildId}_${user.id}`, data);
      return interaction.reply({ embeds: [successEmbed('Level Set', `${user.tag}'s level set to **${level}**.`)] });
    }
    if (sub === 'setxp') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const user = interaction.options.getUser('user');
      const xp = interaction.options.getInteger('xp');
      const data = await getLevelData(user.id, guildId);
      data.xp = xp;
      data.totalXp = xp;
      await db.set(`level_${guildId}_${user.id}`, data);
      return interaction.reply({ embeds: [successEmbed('XP Set', `${user.tag}'s XP set to **${xp}**.`)] });
    }
    if (sub === 'addxp') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const user = interaction.options.getUser('user');
      const xp = interaction.options.getInteger('xp');
      const data = await getLevelData(user.id, guildId);
      data.xp += xp;
      data.totalXp = (data.totalXp || 0) + xp;
      await db.set(`level_${guildId}_${user.id}`, data);
      return interaction.reply({ embeds: [successEmbed('XP Added', `Added **${xp}** XP to ${user.tag}.`)] });
    }
    if (sub === 'removexp') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const user = interaction.options.getUser('user');
      const xp = interaction.options.getInteger('xp');
      const data = await getLevelData(user.id, guildId);
      data.xp = Math.max(0, data.xp - xp);
      data.totalXp = Math.max(0, (data.totalXp || 0) - xp);
      await db.set(`level_${guildId}_${user.id}`, data);
      return interaction.reply({ embeds: [successEmbed('XP Removed', `Removed **${xp}** XP from ${user.tag}.`)] });
    }
    if (sub === 'resetxp') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const user = interaction.options.getUser('user');
      await db.set(`level_${guildId}_${user.id}`, { xp: 0, level: 0, totalXp: 0 });
      return interaction.reply({ embeds: [successEmbed('XP Reset', `${user.tag}'s XP has been reset.`)] });
    }
    if (sub === 'resetallxp') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      await interaction.deferReply();
      await interaction.guild.members.fetch();
      for (const [id] of interaction.guild.members.cache) await db.delete(`level_${guildId}_${id}`);
      return interaction.editReply({ embeds: [successEmbed('XP Reset', 'All server XP has been reset.')] });
    }
    if (sub === 'xpmultiplier') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const mult = interaction.options.getNumber('multiplier');
      await db.set(`xpmult_${guildId}`, mult);
      return interaction.reply({ embeds: [successEmbed('XP Multiplier', `XP multiplier set to **${mult}x**.`)] });
    }
    if (sub === 'levelchannel') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const ch = interaction.options.getChannel('channel');
      await db.set(`levelup_channel_${guildId}`, ch.id);
      return interaction.reply({ embeds: [successEmbed('Level Channel', `Level-up messages will go to ${ch}.`)] });
    }
    if (sub === 'noxpchannel') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const ch = interaction.options.getChannel('channel');
      const list = (await db.get(`noxp_channels_${guildId}`)) || [];
      const idx = list.indexOf(ch.id);
      if (idx !== -1) { list.splice(idx, 1); await db.set(`noxp_channels_${guildId}`, list); return interaction.reply({ embeds: [successEmbed('XP Re-enabled', `XP re-enabled in ${ch}.`)] }); }
      list.push(ch.id);
      await db.set(`noxp_channels_${guildId}`, list);
      return interaction.reply({ embeds: [successEmbed('No-XP Channel', `${ch} added to no-XP list.`)] });
    }
    if (sub === 'noxprole') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const role = interaction.options.getRole('role');
      await db.set(`noxprole_${guildId}`, role.id);
      return interaction.reply({ embeds: [successEmbed('No-XP Role', `Members with ${role} won't earn XP.`)] });
    }
    if (sub === 'levelrole') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const level = interaction.options.getInteger('level');
      const role = interaction.options.getRole('role');
      const rewards = (await db.get(`levelroles_${guildId}`)) || {};
      rewards[level] = role.id;
      await db.set(`levelroles_${guildId}`, rewards);
      return interaction.reply({ embeds: [successEmbed('Level Role', `${role} will be given at level **${level}**.`)] });
    }
    if (sub === 'listlevelroles') {
      const rewards = (await db.get(`levelroles_${guildId}`)) || {};
      const list = Object.entries(rewards).sort((a, b) => a[0] - b[0]).map(([l, r]) => `Level **${l}** → <@&${r}>`).join('\n');
      return interaction.reply({ embeds: [infoEmbed('🎖️ Level Roles', list || 'No level roles set.')] });
    }
    if (sub === 'leveltogglemsg') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const current = await db.get(`levelup_msg_${guildId}`);
      await db.set(`levelup_msg_${guildId}`, !current);
      return interaction.reply({ embeds: [successEmbed('Level Messages', `Level-up messages ${!current ? 'enabled' : 'disabled'}.`)] });
    }
    if (sub === 'xpsettings') {
      const mult = (await db.get(`xpmult_${guildId}`)) || 1;
      const ch = await db.get(`levelup_channel_${guildId}`);
      const msgs = await db.get(`levelup_msg_${guildId}`);
      return interaction.reply({ embeds: [infoEmbed('⚙️ XP Settings').addFields({ name: 'Multiplier', value: `${mult}x`, inline: true }, { name: 'Level Channel', value: ch ? `<#${ch}>` : 'Not set', inline: true }, { name: 'Level Messages', value: msgs === false ? 'Off' : 'On', inline: true })] });
    }
    if (sub === 'xptop' || sub === 'lvlcard') {
      return interaction.reply({ embeds: [infoEmbed('📊 Leveling', 'Use `/leveling leaderboard` for the full XP leaderboard!')] });
    }
  }
};
