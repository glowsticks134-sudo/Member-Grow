const { EmbedBuilder } = require('discord.js');
const { CREDITS } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  name: 'guildMemberRemove',
  async execute(client, member) {
    const guild = member.guild;

    const enabled = (await db.get(`farewell_enabled_${guild.id}`)) !== false;
    if (!enabled) return;

    const chId = await db.get(`farewell_channel_${guild.id}`);
    if (!chId) return;

    const ch = guild.channels.cache.get(chId);
    if (!ch) return;

    const msgTemplate = (await db.get(`farewell_msg_${guild.id}`)) || '👋 **{username}** has left the server. We now have **{count}** members.';
    const formatted = msgTemplate
      .replace('{user}', member.toString())
      .replace('{username}', member.user.username)
      .replace('{server}', guild.name)
      .replace('{count}', guild.memberCount)
      .replace('{tag}', member.user.tag);

    const embed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle('📤 Member Left')
      .setDescription(formatted)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .setFooter({ text: CREDITS })
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => null);

    const logChId = await db.get(`log_channel_${guild.id}`);
    if (logChId) {
      const logCh = guild.channels.cache.get(logChId);
      if (logCh) {
        const events = (await db.get(`log_events_${guild.id}`)) || ['member_leave'];
        if (events.includes('member_leave')) {
          logCh.send({ embeds: [new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('📤 Member Left')
            .setDescription(`${member.user.tag} (${member.id})`)
            .setFooter({ text: CREDITS })
            .setTimestamp()
          ] }).catch(() => null);
        }
      }
    }
  }
};
