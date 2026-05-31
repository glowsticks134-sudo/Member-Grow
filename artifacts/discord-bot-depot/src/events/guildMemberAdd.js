const { EmbedBuilder } = require('discord.js');
const { CREDITS, BRAND_COLOR } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  name: 'guildMemberAdd',
  async execute(client, member) {
    const guild = member.guild;

    const autoroleId = await db.get(`autorole_${guild.id}`);
    if (autoroleId) {
      const role = guild.roles.cache.get(autoroleId);
      if (role) member.roles.add(role).catch(() => null);
    }

    const enabled = (await db.get(`welcome_enabled_${guild.id}`)) !== false;
    if (!enabled) return;

    const chId = await db.get(`welcome_channel_${guild.id}`);
    if (!chId) return;

    const ch = guild.channels.cache.get(chId);
    if (!ch) return;

    const msgTemplate = (await db.get(`welcome_msg_${guild.id}`)) || '👋 Welcome to **{server}**, {user}! You are member **#{count}**.';
    const color = (await db.get(`welcome_color_${guild.id}`)) || BRAND_COLOR;

    const formatted = msgTemplate
      .replace('{user}', member.toString())
      .replace('{username}', member.user.username)
      .replace('{server}', guild.name)
      .replace('{count}', guild.memberCount)
      .replace('{tag}', member.user.tag);

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle('👋 Welcome!')
      .setDescription(formatted)
      .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
        { name: 'Member #', value: String(guild.memberCount), inline: true }
      )
      .setFooter({ text: CREDITS })
      .setTimestamp();

    ch.send({ embeds: [embed] }).catch(() => null);

    const logChId = await db.get(`log_channel_${guild.id}`);
    if (logChId) {
      const logCh = guild.channels.cache.get(logChId);
      if (logCh) {
        const events = (await db.get(`log_events_${guild.id}`)) || ['member_join'];
        if (events.includes('member_join')) {
          logCh.send({ embeds: [new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('📥 Member Joined')
            .setDescription(`${member} (${member.user.tag})`)
            .addFields({ name: 'Account Age', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>` })
            .setFooter({ text: CREDITS })
            .setTimestamp()
          ] }).catch(() => null);
        }
      }
    }
  }
};
