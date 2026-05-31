const { EmbedBuilder } = require('discord.js');

const BRAND_COLOR = 0x5865F2;
const CREDITS = 'Bot made by Stichachu13';

function successEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0x57F287)
    .setTitle(title || null)
    .setDescription(description || null)
    .setFooter({ text: CREDITS })
    .setTimestamp();
}

function errorEmbed(description) {
  return new EmbedBuilder()
    .setColor(0xED4245)
    .setTitle('Error')
    .setDescription(description)
    .setFooter({ text: CREDITS })
    .setTimestamp();
}

function infoEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(title || null)
    .setDescription(description || null)
    .setFooter({ text: CREDITS })
    .setTimestamp();
}

function warnEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(0xFEE75C)
    .setTitle(title || null)
    .setDescription(description || null)
    .setFooter({ text: CREDITS })
    .setTimestamp();
}

function modEmbed(action, target, moderator, reason, extra) {
  const e = new EmbedBuilder()
    .setColor(0xED4245)
    .setTitle(`🔨 ${action}`)
    .addFields(
      { name: 'User', value: `${target.tag || target} (${target.id || target})`, inline: true },
      { name: 'Moderator', value: `${moderator.tag || moderator}`, inline: true },
      { name: 'Reason', value: reason || 'No reason provided', inline: false }
    )
    .setFooter({ text: CREDITS })
    .setTimestamp();
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      e.addFields({ name: k, value: String(v), inline: true });
    }
  }
  return e;
}

function helpEmbed(category, commands) {
  return new EmbedBuilder()
    .setColor(BRAND_COLOR)
    .setTitle(`📖 ${category} Commands`)
    .setDescription(commands.map(c => `\`!${c.name}\` — ${c.description}`).join('\n'))
    .setFooter({ text: CREDITS })
    .setTimestamp();
}

module.exports = { successEmbed, errorEmbed, infoEmbed, warnEmbed, modEmbed, helpEmbed, CREDITS, BRAND_COLOR };
