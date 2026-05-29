const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, warnEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { resolveUser, abbreviate } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Leveling';

function xpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level));
}

async function getLevelData(userId, guildId) {
  return (await db.get(`level_${guildId}_${userId}`)) || { xp: 0, level: 0, totalXp: 0 };
}

async function setLevelData(userId, guildId, data) {
  await db.set(`level_${guildId}_${userId}`, data);
}

const commands = [
  {
    name: 'rank',
    description: 'Check your or someone\'s rank',
    usage: '!rank [user]',
    aliases: ['level', 'xp'],
    async execute(message, args) {
      const target = args[0] ? await resolveUser(message.guild, args[0]) : message.member;
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const data = await getLevelData(target.id, message.guild.id);
      const xpNeeded = xpForLevel(data.level + 1);
      const percent = Math.min(100, Math.floor((data.xp / xpNeeded) * 100));
      const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));

      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`📊 ${target.user.tag}'s Rank`)
        .setThumbnail(target.user.displayAvatarURL())
        .addFields(
          { name: 'Level', value: String(data.level), inline: true },
          { name: 'XP', value: `${data.xp} / ${xpNeeded}`, inline: true },
          { name: 'Total XP', value: String(data.totalXp || 0), inline: true },
          { name: 'Progress', value: `[${bar}] ${percent}%`, inline: false }
        )
        .setFooter({ text: CREDITS })
        .setTimestamp();
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'levelleaderboard',
    description: 'View the XP leaderboard',
    usage: '!levelleaderboard',
    aliases: ['levellb', 'xplb', 'ranklb'],
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('📊 Level Leaderboard', 'Chat to earn XP and level up!\nUse `!rank` to check your rank.')] });
    }
  },
  {
    name: 'setlevel',
    description: 'Set a user\'s level (Admin)',
    usage: '!setlevel <user> <level>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const level = parseInt(args[1]);
      if (isNaN(level) || level < 0) return message.reply({ embeds: [errorEmbed('Invalid level.')] });
      const data = await getLevelData(target.id, message.guild.id);
      data.level = level;
      data.xp = 0;
      await setLevelData(target.id, message.guild.id, data);
      message.reply({ embeds: [successEmbed('Level Set', `${target.user.tag}'s level set to **${level}**.`)] });
    }
  },
  {
    name: 'setxp',
    description: 'Set a user\'s XP (Admin)',
    usage: '!setxp <user> <xp>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const xp = parseInt(args[1]);
      if (isNaN(xp) || xp < 0) return message.reply({ embeds: [errorEmbed('Invalid XP.')] });
      const data = await getLevelData(target.id, message.guild.id);
      data.xp = xp;
      await setLevelData(target.id, message.guild.id, data);
      message.reply({ embeds: [successEmbed('XP Set', `${target.user.tag}'s XP set to **${xp}**.`)] });
    }
  },
  {
    name: 'addxp',
    description: 'Add XP to a user (Admin)',
    usage: '!addxp <user> <amount>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount < 0) return message.reply({ embeds: [errorEmbed('Invalid amount.')] });
      const data = await getLevelData(target.id, message.guild.id);
      data.xp += amount;
      data.totalXp = (data.totalXp || 0) + amount;
      await setLevelData(target.id, message.guild.id, data);
      message.reply({ embeds: [successEmbed('XP Added', `Added **${amount} XP** to ${target.user.tag}.`)] });
    }
  },
  {
    name: 'removexp',
    description: 'Remove XP from a user (Admin)',
    usage: '!removexp <user> <amount>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      const amount = parseInt(args[1]);
      if (isNaN(amount)) return message.reply({ embeds: [errorEmbed('Invalid amount.')] });
      const data = await getLevelData(target.id, message.guild.id);
      data.xp = Math.max(0, data.xp - amount);
      await setLevelData(target.id, message.guild.id, data);
      message.reply({ embeds: [successEmbed('XP Removed', `Removed **${amount} XP** from ${target.user.tag}.`)] });
    }
  },
  {
    name: 'resetlevel',
    description: 'Reset a user\'s level data (Admin)',
    usage: '!resetlevel <user>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const target = await resolveUser(message.guild, args[0]);
      if (!target) return message.reply({ embeds: [errorEmbed('Could not find that user.')] });
      await db.delete(`level_${message.guild.id}_${target.id}`);
      message.reply({ embeds: [successEmbed('Level Reset', `${target.user.tag}'s level data has been reset.`)] });
    }
  },
  {
    name: 'levelchannel',
    description: 'Set the channel for level-up messages',
    usage: '!levelchannel <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const { resolveChannel } = require('../utils/helpers');
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`levelchannel_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('Level Channel Set', `Level-up messages will be sent to ${ch}.`)] });
    }
  },
  {
    name: 'levelroles',
    description: 'View level roles',
    usage: '!levelroles',
    async execute(message, args) {
      const roles = (await db.get(`levelroles_${message.guild.id}`)) || {};
      const entries = Object.entries(roles);
      if (!entries.length) return message.reply({ embeds: [infoEmbed('Level Roles', 'No level roles configured. Use `!addlevelrole`.')] });
      const list = entries.map(([lvl, id]) => `Level **${lvl}** → <@&${id}>`).join('\n');
      message.reply({ embeds: [infoEmbed('🎭 Level Roles', list)] });
    }
  },
  {
    name: 'addlevelrole',
    description: 'Add a reward role for reaching a level',
    usage: '!addlevelrole <level> <role>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const level = parseInt(args[0]);
      if (isNaN(level)) return message.reply({ embeds: [errorEmbed('Invalid level.')] });
      const { resolveRole } = require('../utils/helpers');
      const role = await resolveRole(message.guild, args[1]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      const roles = (await db.get(`levelroles_${message.guild.id}`)) || {};
      roles[level] = role.id;
      await db.set(`levelroles_${message.guild.id}`, roles);
      message.reply({ embeds: [successEmbed('Level Role Added', `${role} will be given at level **${level}**.`)] });
    }
  },
  {
    name: 'removelevelrole',
    description: 'Remove a level reward role',
    usage: '!removelevelrole <level>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const level = parseInt(args[0]);
      if (isNaN(level)) return message.reply({ embeds: [errorEmbed('Invalid level.')] });
      const roles = (await db.get(`levelroles_${message.guild.id}`)) || {};
      delete roles[level];
      await db.set(`levelroles_${message.guild.id}`, roles);
      message.reply({ embeds: [successEmbed('Level Role Removed', `Level ${level} role removed.`)] });
    }
  },
  {
    name: 'disablexp',
    description: 'Disable XP gain in a channel',
    usage: '!disablexp [channel]',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const { resolveChannel } = require('../utils/helpers');
      const ch = args[0] ? await resolveChannel(message.guild, args[0]) : message.channel;
      const list = (await db.get(`noxp_channels_${message.guild.id}`)) || [];
      if (!list.includes(ch.id)) list.push(ch.id);
      await db.set(`noxp_channels_${message.guild.id}`, list);
      message.reply({ embeds: [successEmbed('XP Disabled', `XP gain disabled in ${ch}.`)] });
    }
  },
  {
    name: 'enablexp',
    description: 'Enable XP gain in a channel',
    usage: '!enablexp [channel]',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const { resolveChannel } = require('../utils/helpers');
      const ch = args[0] ? await resolveChannel(message.guild, args[0]) : message.channel;
      let list = (await db.get(`noxp_channels_${message.guild.id}`)) || [];
      list = list.filter(id => id !== ch.id);
      await db.set(`noxp_channels_${message.guild.id}`, list);
      message.reply({ embeds: [successEmbed('XP Enabled', `XP gain enabled in ${ch}.`)] });
    }
  },
  {
    name: 'xpmultiplier',
    description: 'Set XP multiplier for the server',
    usage: '!xpmultiplier <multiplier>',
    aliases: ['xpmult'],
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const mult = parseFloat(args[0]);
      if (isNaN(mult) || mult < 0.1 || mult > 10) return message.reply({ embeds: [errorEmbed('Multiplier must be between 0.1 and 10.')] });
      await db.set(`xpmult_${message.guild.id}`, mult);
      message.reply({ embeds: [successEmbed('XP Multiplier', `XP multiplier set to **${mult}x**.`)] });
    }
  },
  {
    name: 'noxprole',
    description: 'Set a role that gets no XP',
    usage: '!noxprole <role>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const { resolveRole } = require('../utils/helpers');
      const role = await resolveRole(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      await db.set(`noxprole_${message.guild.id}`, role.id);
      message.reply({ embeds: [successEmbed('No XP Role', `Members with ${role} will not gain XP.`)] });
    }
  },
  {
    name: 'levelupmessage',
    description: 'Set custom level-up message',
    usage: '!levelupmessage <message> (use {user} and {level})',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const msg = args.join(' ');
      if (!msg) return message.reply({ embeds: [errorEmbed('Please provide a message.')] });
      await db.set(`levelupmsg_${message.guild.id}`, msg);
      message.reply({ embeds: [successEmbed('Level-Up Message', `Message set to: ${msg}`)] });
    }
  },
  {
    name: 'togglelevelup',
    description: 'Toggle level-up announcements',
    usage: '!togglelevelup',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const key = `levelup_enabled_${message.guild.id}`;
      const current = (await db.get(key)) !== false;
      await db.set(key, !current);
      message.reply({ embeds: [successEmbed('Level-Up Announcements', `Level-up messages ${!current ? 'enabled' : 'disabled'}.`)] });
    }
  },
  {
    name: 'xpcheck',
    description: 'Check XP settings',
    usage: '!xpcheck',
    async execute(message, args) {
      const mult = (await db.get(`xpmult_${message.guild.id}`)) || 1;
      const noxpChannels = (await db.get(`noxp_channels_${message.guild.id}`)) || [];
      const noxpRole = await db.get(`noxprole_${message.guild.id}`);
      const levelCh = await db.get(`levelchannel_${message.guild.id}`);
      const embed = infoEmbed('⚙️ XP Settings')
        .addFields(
          { name: 'Multiplier', value: `${mult}x`, inline: true },
          { name: 'Level Channel', value: levelCh ? `<#${levelCh}>` : 'Not set', inline: true },
          { name: 'No-XP Role', value: noxpRole ? `<@&${noxpRole}>` : 'Not set', inline: true },
          { name: 'No-XP Channels', value: noxpChannels.map(id => `<#${id}>`).join(', ') || 'None', inline: false }
        );
      message.reply({ embeds: [embed] });
    }
  }
];

module.exports = { category, commands };
