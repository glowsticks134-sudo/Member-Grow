const db = require('../utils/database');

module.exports = {
  name: 'messageReactionRemove',
  async execute(client, reaction, user) {
    if (user.bot) return;
    if (reaction.partial) {
      try { await reaction.fetch(); } catch { return; }
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
        if (role) await member.roles.remove(role).catch(() => null);
      }
    }
  }
};
