const db = require('../utils/database');
const { errorEmbed } = require('../utils/embed');
const { randomInt } = require('../utils/helpers');

const spamMap = new Map();
const afkMap = new Map();

async function handleXP(message, client) {
  if (message.author.bot) return;
  const guildId = message.guild.id;
  const userId = message.author.id;

  const noxpChannels = (await db.get(`noxp_channels_${guildId}`)) || [];
  if (noxpChannels.includes(message.channel.id)) return;

  const noxpRoleId = await db.get(`noxprole_${guildId}`);
  if (noxpRoleId && message.member.roles.cache.has(noxpRoleId)) return;

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

    const enabled = (await db.get(`levelup_enabled_${guildId}`)) !== false;
    if (enabled) {
      const levelChId = await db.get(`levelchannel_${guildId}`);
      const levelCh = levelChId ? client.channels.cache.get(levelChId) : message.channel;
      if (levelCh) {
        const customMsg = await db.get(`levelupmsg_${guildId}`);
        const text = customMsg
          ? customMsg.replace('{user}', message.author.toString()).replace('{level}', data.level)
          : `🎉 ${message.author} leveled up to **Level ${data.level}**!`;
        levelCh.send(text);
      }
    }

    const levelRoles = (await db.get(`levelroles_${guildId}`)) || {};
    if (levelRoles[data.level]) {
      const role = message.guild.roles.cache.get(levelRoles[data.level]);
      if (role) message.member.roles.add(role).catch(() => null);
    }
  }

  await db.set(levelKey, data);
}

async function handleAutoMod(message, client) {
  if (message.author.bot) return;
  if (message.member.permissions.has(8n)) return;

  const settings = (await db.get(`automod_${message.guild.id}`)) || {};
  const exempt = (await db.get(`automod_exempt_${message.guild.id}`)) || [];
  if (message.member.roles.cache.some(r => exempt.includes(r.id))) return;

  const logChId = await db.get(`automodlog_${message.guild.id}`);

  async function deleteAndWarn(reason) {
    await message.delete().catch(() => null);
    const reply = await message.channel.send({ content: `${message.author}, ${reason}`, embeds: [] }).catch(() => null);
    if (reply) setTimeout(() => reply.delete().catch(() => null), 5000);
    if (logChId) {
      const logCh = client.channels.cache.get(logChId);
      if (logCh) logCh.send(`🛡️ **AutoMod** | ${message.author.tag} in ${message.channel} — *${reason}*`);
    }
    const stats = (await db.get(`automod_stats_${message.guild.id}`)) || { deleted: 0, warned: 0, muted: 0 };
    stats.deleted++;
    await db.set(`automod_stats_${message.guild.id}`, stats);
  }

  if (settings.antilink && /https?:\/\//i.test(message.content)) {
    return deleteAndWarn('Links are not allowed here!');
  }

  if (settings.badwords) {
    const badwords = (await db.get(`badwords_${message.guild.id}`)) || [];
    if (badwords.some(w => message.content.toLowerCase().includes(w))) {
      return deleteAndWarn('Your message contained a prohibited word.');
    }
  }

  if (settings.anticaps) {
    const letters = message.content.replace(/[^a-zA-Z]/g, '');
    if (letters.length > 10) {
      const caps = letters.replace(/[^A-Z]/g, '').length;
      if (caps / letters.length > 0.7) return deleteAndWarn('Please avoid using excessive caps!');
    }
  }

  if (settings.antiemoji) {
    const emojiCount = (message.content.match(/[\p{Emoji}]/gu) || []).length;
    if (emojiCount > 10) return deleteAndWarn('Please avoid excessive emoji spam!');
  }

  if (settings.antimentions) {
    if (message.mentions.users.size > 5) return deleteAndWarn('Please avoid mention spamming!');
  }

  if (settings.antispam) {
    const key = `${message.guild.id}_${message.author.id}`;
    const timestamps = spamMap.get(key) || [];
    const now = Date.now();
    const recent = timestamps.filter(t => now - t < 5000);
    recent.push(now);
    spamMap.set(key, recent);
    if (recent.length >= 5) {
      spamMap.delete(key);
      return deleteAndWarn('You are sending messages too fast!');
    }
  }
}

async function handleAFKCheck(message, client) {
  if (message.author.bot) return;
  const afkKey = `afk_${message.guild.id}_${message.author.id}`;
  const afk = await db.get(afkKey);
  if (afk) {
    await db.delete(afkKey);
    const reply = await message.reply({ content: `👋 Welcome back, ${message.author}! Your AFK status has been removed.` });
    setTimeout(() => reply.delete().catch(() => null), 5000);
  }

  for (const user of message.mentions.users.values()) {
    if (user.bot) continue;
    const mentionAfk = await db.get(`afk_${message.guild.id}_${user.id}`);
    if (mentionAfk) {
      const reply = await message.reply({ content: `💤 **${user.username}** is AFK: ${mentionAfk.reason} — <t:${Math.floor(mentionAfk.time / 1000)}:R>` });
      setTimeout(() => reply.delete().catch(() => null), 8000);
    }
  }
}

async function handleVoteChannels(message, client) {
  if (message.author.bot) return;
  const voteChannels = (await db.get(`votechannels_${message.guild.id}`)) || [];
  if (voteChannels.includes(message.channel.id)) {
    await message.react('✅').catch(() => null);
    await message.react('❌').catch(() => null);
  }
}

async function handleStarboard(message, client) {}

module.exports = {
  name: 'messageCreate',
  async execute(client, message) {
    if (message.author.bot || !message.guild) return;

    const blacklist = (await db.get('bot_blacklist')) || [];
    if (blacklist.includes(message.author.id)) return;

    handleXP(message, client).catch(() => null);
    handleAutoMod(message, client).catch(() => null);
    handleAFKCheck(message, client).catch(() => null);
    handleVoteChannels(message, client).catch(() => null);

    const prefix = (await db.get(`prefix_${message.guild.id}`)) || '!';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.get(client.aliases.get(commandName));
    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`[CMD ERROR] ${commandName}:`, err);
      message.reply({ embeds: [errorEmbed(`An error occurred while running this command.\n\`${err.message}\``)] }).catch(() => null);
    }
  }
};
