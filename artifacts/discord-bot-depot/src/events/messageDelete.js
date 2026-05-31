const { EmbedBuilder } = require('discord.js');
const { CREDITS } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  name: 'messageDelete',
  async execute(client, message) {
    if (!message.guild || message.author?.bot) return;

    if (message.content) {
      client.snipes = client.snipes || new Map();
      client.snipes.set(message.channel.id, {
        content: message.content,
        author: message.author,
        createdAt: message.createdAt
      });
    }

    const logChId = await db.get(`msglog_channel_${message.guild.id}`) || await db.get(`log_channel_${message.guild.id}`);
    if (!logChId) return;

    const logCh = message.guild.channels.cache.get(logChId);
    if (!logCh) return;

    const events = (await db.get(`log_events_${message.guild.id}`)) || ['message_delete'];
    if (!events.includes('message_delete')) return;

    logCh.send({ embeds: [new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle('🗑️ Message Deleted')
      .setDescription(message.content?.slice(0, 1000) || '*[No text content]*')
      .addFields(
        { name: 'Author', value: message.author?.tag || 'Unknown', inline: true },
        { name: 'Channel', value: `${message.channel}`, inline: true }
      )
      .setFooter({ text: CREDITS })
      .setTimestamp()
    ] }).catch(() => null);
  }
};
