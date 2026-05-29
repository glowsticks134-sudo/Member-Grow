const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, warnEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { parseDuration, formatDuration, resolveChannel } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Giveaways';

async function endGiveaway(client, giveaway) {
  const guild = client.guilds.cache.get(giveaway.guildId);
  if (!guild) return;
  const ch = guild.channels.cache.get(giveaway.channelId);
  if (!ch) return;
  const msg = await ch.messages.fetch(giveaway.messageId).catch(() => null);
  if (!msg) return;

  const entries = giveaway.entries || [];
  if (!entries.length) {
    const embed = new EmbedBuilder()
      .setColor(0xED4245)
      .setTitle('🎉 Giveaway Ended')
      .setDescription(`**${giveaway.prize}**\nNo valid entries. No winner.`)
      .setFooter({ text: CREDITS });
    return msg.edit({ embeds: [embed], components: [] });
  }

  const winners = [];
  const pool = [...entries];
  for (let i = 0; i < Math.min(giveaway.winners, pool.length); i++) {
    const idx = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(idx, 1)[0]);
  }

  const embed = new EmbedBuilder()
    .setColor(0xFEE75C)
    .setTitle('🎉 Giveaway Ended!')
    .setDescription(`**Prize:** ${giveaway.prize}\n**Winner(s):** ${winners.map(id => `<@${id}>`).join(', ')}\n**Entries:** ${entries.length}`)
    .setFooter({ text: CREDITS })
    .setTimestamp();
  msg.edit({ embeds: [embed], components: [] });
  ch.send({ content: `🎉 Congratulations ${winners.map(id => `<@${id}>`).join(', ')}! You won **${giveaway.prize}**!` });
  giveaway.ended = true;
  giveaway.winnerIds = winners;
  await db.set(`giveaway_${giveaway.id}`, giveaway);
}

const commands = [
  {
    name: 'gcreate',
    description: 'Create a giveaway',
    usage: '!gcreate <duration> <winners> <prize>',
    aliases: ['gstart', 'giveaway'],
    async execute(message, args, client) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const duration = parseDuration(args[0]);
      if (!duration) return message.reply({ embeds: [errorEmbed('Invalid duration. Ex: `1h`, `30m`, `1d`')] });
      const winners = parseInt(args[1]);
      if (isNaN(winners) || winners < 1) return message.reply({ embeds: [errorEmbed('Invalid winner count.')] });
      const prize = args.slice(2).join(' ');
      if (!prize) return message.reply({ embeds: [errorEmbed('Please provide a prize.')] });

      const endsAt = Date.now() + duration;
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('🎉 GIVEAWAY!')
        .setDescription(`**Prize:** ${prize}\n**Winners:** ${winners}\n**Ends:** <t:${Math.floor(endsAt / 1000)}:R>\n**Hosted by:** ${message.author}`)
        .addFields({ name: 'Entries', value: '0', inline: true })
        .setFooter({ text: CREDITS })
        .setTimestamp(endsAt);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('giveaway_enter').setLabel('🎉 Enter').setStyle(ButtonStyle.Success)
      );

      await message.delete().catch(() => null);
      const msg = await message.channel.send({ embeds: [embed], components: [row] });

      const id = `${message.guild.id}_${msg.id}`;
      const giveaway = { id, guildId: message.guild.id, channelId: message.channel.id, messageId: msg.id, prize, winners, endsAt, entries: [], hostId: message.author.id, ended: false };
      await db.set(`giveaway_${id}`, giveaway);

      setTimeout(() => endGiveaway(client, giveaway), duration);
    }
  },
  {
    name: 'gend',
    description: 'End a giveaway early',
    usage: '!gend <messageID>',
    async execute(message, args, client) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide the giveaway message ID.')] });
      const id = `${message.guild.id}_${args[0]}`;
      const giveaway = await db.get(`giveaway_${id}`);
      if (!giveaway) return message.reply({ embeds: [errorEmbed('Giveaway not found.')] });
      if (giveaway.ended) return message.reply({ embeds: [warnEmbed('Already Ended', 'This giveaway has already ended.')] });
      await endGiveaway(client, giveaway);
      message.reply({ embeds: [successEmbed('Giveaway Ended', 'The giveaway has been ended early.')] });
    }
  },
  {
    name: 'greroll',
    description: 'Reroll a giveaway winner',
    usage: '!greroll <messageID>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide the giveaway message ID.')] });
      const id = `${message.guild.id}_${args[0]}`;
      const giveaway = await db.get(`giveaway_${id}`);
      if (!giveaway || !giveaway.ended) return message.reply({ embeds: [errorEmbed('Giveaway not found or not ended.')] });
      const entries = giveaway.entries || [];
      if (!entries.length) return message.reply({ embeds: [errorEmbed('No entries to reroll.')] });
      const winner = entries[Math.floor(Math.random() * entries.length)];
      message.reply({ embeds: [successEmbed('🎉 Rerolled!', `New winner: <@${winner}>! Congratulations!`)] });
    }
  },
  {
    name: 'gdelete',
    description: 'Delete a giveaway',
    usage: '!gdelete <messageID>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide the giveaway message ID.')] });
      const id = `${message.guild.id}_${args[0]}`;
      const giveaway = await db.get(`giveaway_${id}`);
      if (!giveaway) return message.reply({ embeds: [errorEmbed('Giveaway not found.')] });
      const ch = message.guild.channels.cache.get(giveaway.channelId);
      if (ch) {
        const msg = await ch.messages.fetch(giveaway.messageId).catch(() => null);
        if (msg) await msg.delete().catch(() => null);
      }
      await db.delete(`giveaway_${id}`);
      message.reply({ embeds: [successEmbed('Giveaway Deleted', 'The giveaway has been deleted.')] });
    }
  },
  {
    name: 'glist',
    description: 'List all active giveaways',
    usage: '!glist',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('🎉 Active Giveaways', 'Use `!gcreate` to start a giveaway.')] });
    }
  },
  {
    name: 'gpause',
    description: 'Pause a giveaway',
    usage: '!gpause <messageID>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide the giveaway message ID.')] });
      const id = `${message.guild.id}_${args[0]}`;
      const giveaway = await db.get(`giveaway_${id}`);
      if (!giveaway) return message.reply({ embeds: [errorEmbed('Giveaway not found.')] });
      giveaway.paused = true;
      await db.set(`giveaway_${id}`, giveaway);
      message.reply({ embeds: [successEmbed('Giveaway Paused', 'Entries are paused.')] });
    }
  },
  {
    name: 'gresume',
    description: 'Resume a paused giveaway',
    usage: '!gresume <messageID>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide the giveaway message ID.')] });
      const id = `${message.guild.id}_${args[0]}`;
      const giveaway = await db.get(`giveaway_${id}`);
      if (!giveaway) return message.reply({ embeds: [errorEmbed('Giveaway not found.')] });
      giveaway.paused = false;
      await db.set(`giveaway_${id}`, giveaway);
      message.reply({ embeds: [successEmbed('Giveaway Resumed', 'Entries are now open again.')] });
    }
  },
  {
    name: 'gblacklist',
    description: 'Blacklist a user from entering giveaways',
    usage: '!gblacklist <user>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [errorEmbed('Please mention a user.')] });
      const list = (await db.get(`gblacklist_${message.guild.id}`)) || [];
      if (list.includes(target.id)) {
        const idx = list.indexOf(target.id);
        list.splice(idx, 1);
        await db.set(`gblacklist_${message.guild.id}`, list);
        return message.reply({ embeds: [successEmbed('Giveaway Blacklist', `${target.tag} removed from blacklist.`)] });
      }
      list.push(target.id);
      await db.set(`gblacklist_${message.guild.id}`, list);
      message.reply({ embeds: [successEmbed('Giveaway Blacklist', `${target.tag} added to blacklist.`)] });
    }
  },
  {
    name: 'grequirement',
    description: 'Set a role requirement for giveaways',
    usage: '!grequirement <role>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const { resolveRole: rr } = require('../utils/helpers');
      const role = await rr(message.guild, args[0]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      await db.set(`giveaway_req_${message.guild.id}`, role.id);
      message.reply({ embeds: [successEmbed('Giveaway Requirement', `Users must have ${role} to enter giveaways.`)] });
    }
  },
  {
    name: 'gclearrequirement',
    description: 'Remove giveaway role requirement',
    usage: '!gclearrequirement',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      await db.delete(`giveaway_req_${message.guild.id}`);
      message.reply({ embeds: [successEmbed('Requirement Cleared', 'Giveaway role requirement removed.')] });
    }
  }
];

module.exports = { category, commands };
