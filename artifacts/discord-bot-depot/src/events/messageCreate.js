const db = require('../utils/database');
const { EmbedBuilder } = require('discord.js');
const { CREDITS, BRAND_COLOR } = require('../utils/embed');
const { randomInt } = require('../utils/helpers');
const { isOwner } = require('../config');

const spamMap = new Map();

async function handleXP(message, client) {
  if (message.author.bot || !message.guild) return;
  const guildId = message.guild.id;
  const userId = message.author.id;

  const noxpChannels = (await db.get(`noxp_channels_${guildId}`)) || [];
  if (noxpChannels.includes(message.channel.id)) return;

  const noxpRoleId = await db.get(`noxprole_${guildId}`);
  if (noxpRoleId && message.member?.roles.cache.has(noxpRoleId)) return;

  const xpCooldownKey = `xpcooldown_${guildId}_${userId}`;
  const lastXp = await db.get(xpCooldownKey);
  const now = Date.now();
  if (lastXp && now - lastXp < 60000) return;

  await db.set(xpCooldownKey, now);

  const mult = (await db.get(`xpmult_${guildId}`)) || 1;
  const gained = Math.floor(randomInt(15, 40) * mult);

  const levelKey = `level_${guildId}_${userId}`;
  const data = (await db.get(levelKey)) || { xp: 0, level: 0, totalXp: 0 };
  data.xp += gained;
  data.totalXp = (data.totalXp || 0) + gained;

  const xpNeeded = Math.floor(100 * Math.pow(1.5, data.level + 1));
  if (data.xp >= xpNeeded) {
    data.xp -= xpNeeded;
    data.level++;

    const msgEnabled = await db.get(`levelup_msg_${guildId}`);
    if (msgEnabled !== false) {
      const chId = await db.get(`levelup_channel_${guildId}`);
      const targetCh = chId ? message.guild.channels.cache.get(chId) : message.channel;
      if (targetCh) {
        const embed = new EmbedBuilder()
          .setColor(BRAND_COLOR)
          .setTitle('🎉 Level Up!')
          .setDescription(`${message.author} reached **Level ${data.level}**!`)
          .setThumbnail(message.author.displayAvatarURL())
          .setFooter({ text: CREDITS });
        targetCh.send({ embeds: [embed] }).catch(() => null);
      }
    }

    const rewards = (await db.get(`levelroles_${guildId}`)) || {};
    const roleId = rewards[data.level];
    if (roleId) {
      message.member.roles.add(roleId).catch(() => null);
    }
  }

  await db.set(levelKey, data);
}

async function handleAFK(message) {
  if (message.author.bot || !message.guild) return;
  const guildId = message.guild.id;
  const userId = message.author.id;

  const afkData = await db.get(`afk_${guildId}_${userId}`);
  if (afkData) {
    await db.delete(`afk_${guildId}_${userId}`);
    message.reply({ content: `Welcome back, ${message.author}! AFK removed.` }).then(m => setTimeout(() => m.delete().catch(() => null), 5000)).catch(() => null);
  }

  const mentions = message.mentions.users;
  for (const [, user] of mentions) {
    const targetAfk = await db.get(`afk_${guildId}_${user.id}`);
    if (targetAfk) {
      const elapsed = Math.floor((Date.now() - targetAfk.time) / 60000);
      message.reply({ content: `${user.username} is AFK: **${targetAfk.reason}** (${elapsed}m ago)` }).then(m => setTimeout(() => m.delete().catch(() => null), 5000)).catch(() => null);
    }
  }
}

async function handleAutoMod(message) {
  if (message.author.bot || !message.guild || !message.member) return;
  if (message.member.permissions.has(8n)) return;
  const guildId = message.guild.id;

  const whitelist = (await db.get(`automod_whitelist_${guildId}`)) || [];
  if (whitelist.includes(message.channel.id)) return;
  const roleWhitelist = (await db.get(`automod_whitelist_roles_${guildId}`)) || [];
  if (roleWhitelist.some(r => message.member.roles.cache.has(r))) return;

  const settings = (await db.get(`automod_${guildId}`)) || {};
  const action = settings.action || 'delete';

  async function punish(reason) {
    if (action === 'delete' || action === 'warn' || action === 'mute') {
      await message.delete().catch(() => null);
    }
    if (action === 'warn') {
      const key = `warnings_${guildId}_${message.author.id}`;
      const warns = (await db.get(key)) || [];
      warns.push({ reason, mod: 'AutoMod', date: Date.now() });
      await db.set(key, warns);
    }
    if (action === 'mute') {
      await message.member.timeout(60000, reason).catch(() => null);
    }
    message.channel.send({ content: `${message.author} — ${reason}` }).then(m => setTimeout(() => m.delete().catch(() => null), 4000)).catch(() => null);
  }

  if (settings.antilink && /https?:\/\/|discord\.gg\//i.test(message.content)) {
    return punish('No links allowed!');
  }

  if (settings.badwords) {
    const badwords = (await db.get(`badwords_${guildId}`)) || [];
    const lower = message.content.toLowerCase();
    if (badwords.some(w => lower.includes(w))) return punish('Message contained a filtered word.');
  }

  if (settings.anticaps) {
    const threshold = settings.capsThreshold || 70;
    const letters = message.content.replace(/[^a-zA-Z]/g, '');
    if (letters.length > 8) {
      const upper = letters.replace(/[^A-Z]/g, '').length;
      if ((upper / letters.length) * 100 >= threshold) return punish('Too many capital letters!');
    }
  }

  if (settings.antiemoji) {
    const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g;
    const emojiCount = (message.content.match(emojiRegex) || []).length;
    if (emojiCount >= 7) return punish('Too many emojis!');
  }

  if (settings.antispam) {
    const threshold = settings.spamThreshold || 5;
    const key = `${message.guild.id}_${message.author.id}`;
    const now = Date.now();
    if (!spamMap.has(key)) spamMap.set(key, []);
    const timestamps = spamMap.get(key).filter(t => now - t < 5000);
    timestamps.push(now);
    spamMap.set(key, timestamps);
    if (timestamps.length >= threshold) {
      spamMap.delete(key);
      return punish('Stop spamming!');
    }
  }

  if (settings.antimentions) {
    const mentionCount = (message.mentions.users.size || 0) + (message.mentions.roles.size || 0);
    if (mentionCount >= 5) return punish('Too many mentions!');
  }
}

async function handleSnipe(message, client) {
  if (!client.snipes) client.snipes = new Map();
  if (!message.author.bot) {
    client.snipes.set(message.channel.id, { content: message.content, author: message.author, createdAt: message.createdAt });
  }
}

async function handleOwnerCommands(message, client) {
  if (!isOwner(message.author.id)) return;
  if (!message.content.startsWith('.')) return;

  const args = message.content.slice(1).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  if (cmd === 'dmspam') {
    const userId = args.shift();
    const spamMsg = args.join(' ');
    if (!userId || !spamMsg) {
      return message.reply('Usage: `.dmspam <userID> <message>`').then(m => setTimeout(() => m.delete().catch(() => null), 5000));
    }
    const target = await client.users.fetch(userId).catch(() => null);
    if (!target) return message.reply('❌ User not found.').then(m => setTimeout(() => m.delete().catch(() => null), 5000));

    await message.delete().catch(() => null);

    for (let i = 0; i < 5; i++) {
      await target.send(spamMsg).catch(() => null);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

module.exports = {
  name: 'messageCreate',
  async execute(client, message) {
    if (!message.guild) return;
    await Promise.all([
      handleXP(message, client),
      handleAFK(message),
      handleAutoMod(message),
      handleOwnerCommands(message, client)
    ]);
  }
};
