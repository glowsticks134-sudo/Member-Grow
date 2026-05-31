const { EmbedBuilder } = require('discord.js');
const { CREDITS } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  name: 'messageUpdate',
  async execute(client, oldMessage, newMessage) {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.content === newMessage.content) return;

    client.editSnipes = client.editSnipes || new Map();
    client.editSnipes.set(newMessage.channel.id, {
      oldContent: oldMessage.content,
      newContent: newMessage.content,
      author: newMessage.author,
      editedAt: new Date()
    });

    const logChId = await db.get(`msglog_channel_${newMessage.guild.id}`) || await db.get(`log_channel_${newMessage.guild.id}`);
    if (!logChId) return;

    const logCh = newMessage.guild.channels.cache.get(logChId);
    if (!logCh) return;

    const events = (await db.get(`log_events_${newMessage.guild.id}`)) || ['message_edit'];
    if (!events.includes('message_edit')) return;

    logCh.send({ embeds: [new EmbedBuilder()
      .setColor(0xFEE75C)
      .setTitle('✏️ Message Edited')
      .addFields(
        { name: 'Before', value: oldMessage.content?.slice(0, 500) || '*[Empty]*', inline: false },
        { name: 'After', value: newMessage.content?.slice(0, 500) || '*[Empty]*', inline: false },
        { name: 'Author', value: newMessage.author?.tag || 'Unknown', inline: true },
        { name: 'Channel', value: `${newMessage.channel}`, inline: true }
      )
      .setFooter({ text: CREDITS })
      .setTimestamp()
    ] }).catch(() => null);
  }
};
