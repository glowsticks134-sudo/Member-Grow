const { EmbedBuilder } = require('discord.js');
const { CREDITS, BRAND_COLOR } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  name: 'messageReactionAdd',
  async execute(client, reaction, user) {
    if (user.bot) return;
    if (reaction.partial) {
      try { await reaction.fetch(); } catch { return; }
    }
    if (reaction.message.partial) {
      try { await reaction.message.fetch(); } catch { return; }
    }

    const guild = reaction.message.guild;
    if (!guild) return;

    const member = await guild.members.fetch(user.id).catch(() => null);
    if (!member) return;

    const rrKey = `rr_${guild.id}_${reaction.message.id}`;
    const rrs = await db.get(rrKey);
    if (rrs) {
      const emoji = reaction.emoji.id ? `<:${reaction.emoji.name}:${reaction.emoji.id}>` : reaction.emoji.name;
      const roleId = rrs[emoji] || rrs[reaction.emoji.name];
      if (roleId) {
        const role = guild.roles.cache.get(roleId);
        if (role) {
          const unique = await db.get(`rr_unique_${guild.id}_${reaction.message.id}`);
          if (unique) {
            for (const [e, rid] of Object.entries(rrs)) {
              if (rid !== roleId && member.roles.cache.has(rid)) {
                const oldRole = guild.roles.cache.get(rid);
                if (oldRole) await member.roles.remove(oldRole).catch(() => null);
                const oldEmoji = e;
                const msgReaction = reaction.message.reactions.cache.get(oldEmoji);
                if (msgReaction) await msgReaction.users.remove(user.id).catch(() => null);
              }
            }
          }
          await member.roles.add(role).catch(() => null);
        }
      }
    }

    const starboardEnabled = (await db.get(`starboard_enabled_${guild.id}`)) !== false;
    const starboardEmoji = (await db.get(`starboard_emoji_${guild.id}`)) || '⭐';
    const starboardMin = (await db.get(`starboard_min_${guild.id}`)) || 3;
    const starboardChId = await db.get(`starboard_channel_${guild.id}`);

    if (starboardEnabled && starboardChId && (reaction.emoji.name === starboardEmoji || reaction.emoji.toString() === starboardEmoji)) {
      const blacklist = (await db.get(`starboard_blacklist_${guild.id}`)) || [];
      if (blacklist.includes(reaction.message.channelId)) return;

      if (reaction.count >= starboardMin) {
        const existing = await db.get(`starboard_msg_${guild.id}_${reaction.message.id}`);
        if (existing) return;

        const starCh = guild.channels.cache.get(starboardChId);
        if (!starCh) return;

        const msg = reaction.message;
        const embed = new EmbedBuilder()
          .setColor(0xFEE75C)
          .setAuthor({ name: msg.author.tag, iconURL: msg.author.displayAvatarURL() })
          .setDescription(msg.content || '*[No text]*')
          .addFields({ name: 'Source', value: `[Jump!](${msg.url})`, inline: true })
          .setFooter({ text: `${starboardEmoji} ${reaction.count} | ${CREDITS}` })
          .setTimestamp(msg.createdAt);

        if (msg.attachments.size) embed.setImage(msg.attachments.first().url);

        await starCh.send({ embeds: [embed] });
        await db.set(`starboard_msg_${guild.id}_${reaction.message.id}`, true);

        let count = (await db.get(`starboard_count_${guild.id}`)) || 0;
        await db.set(`starboard_count_${guild.id}`, count + 1);
      }
    }
  }
};
