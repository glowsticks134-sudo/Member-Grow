const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { resolveRole, resolveChannel } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Reaction Roles';

const commands = [
  {
    name: 'rradd',
    description: 'Add a reaction role to a message',
    usage: '!rradd <messageID> <emoji> <role>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const [msgId, emoji, ...roleParts] = args;
      if (!msgId || !emoji || !roleParts.length) return message.reply({ embeds: [errorEmbed('Usage: `!rradd <messageID> <emoji> <role>`')] });
      const role = await resolveRole(message.guild, roleParts.join(' '));
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      const msg = await message.channel.messages.fetch(msgId).catch(() => null);
      if (!msg) return message.reply({ embeds: [errorEmbed('Could not find that message.')] });
      await msg.react(emoji).catch(() => null);
      const key = `rr_${message.guild.id}_${msgId}`;
      const rrs = (await db.get(key)) || {};
      rrs[emoji] = role.id;
      await db.set(key, rrs);
      message.reply({ embeds: [successEmbed('Reaction Role Added', `Reacting with ${emoji} on that message will give ${role}.`)] });
    }
  },
  {
    name: 'rrremove',
    description: 'Remove a reaction role from a message',
    usage: '!rrremove <messageID> <emoji>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const [msgId, emoji] = args;
      if (!msgId || !emoji) return message.reply({ embeds: [errorEmbed('Usage: `!rrremove <messageID> <emoji>`')] });
      const key = `rr_${message.guild.id}_${msgId}`;
      const rrs = (await db.get(key)) || {};
      delete rrs[emoji];
      await db.set(key, rrs);
      message.reply({ embeds: [successEmbed('Reaction Role Removed', `Removed ${emoji} from reaction roles.`)] });
    }
  },
  {
    name: 'rrlist',
    description: 'List all reaction roles for a message',
    usage: '!rrlist <messageID>',
    async execute(message, args) {
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide a message ID.')] });
      const key = `rr_${message.guild.id}_${args[0]}`;
      const rrs = (await db.get(key)) || {};
      const entries = Object.entries(rrs);
      if (!entries.length) return message.reply({ embeds: [infoEmbed('Reaction Roles', 'No reaction roles for this message.')] });
      const list = entries.map(([emoji, roleId]) => `${emoji} → <@&${roleId}>`).join('\n');
      message.reply({ embeds: [infoEmbed('🎭 Reaction Roles', list)] });
    }
  },
  {
    name: 'rrcreate',
    description: 'Create a reaction role embed',
    usage: '!rrcreate <title> | <emoji> <role> | ...',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const full = args.join(' ');
      const parts = full.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length < 2) return message.reply({ embeds: [errorEmbed('Usage: `!rrcreate Title | emoji role | emoji role ...`')] });
      const title = parts[0];
      const pairs = parts.slice(1);
      const fields = [];
      const rrs = {};
      for (const pair of pairs) {
        const [emoji, ...roleParts] = pair.split(' ').filter(Boolean);
        const role = await resolveRole(message.guild, roleParts.join(' '));
        if (!role) continue;
        fields.push({ name: emoji, value: `${role}`, inline: true });
        rrs[emoji] = role.id;
      }
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`🎭 ${title}`)
        .setDescription('React below to get your roles!')
        .addFields(fields)
        .setFooter({ text: CREDITS });
      const msg = await message.channel.send({ embeds: [embed] });
      const key = `rr_${message.guild.id}_${msg.id}`;
      await db.set(key, rrs);
      for (const emoji of Object.keys(rrs)) await msg.react(emoji).catch(() => null);
      await message.delete().catch(() => null);
    }
  },
  {
    name: 'rrdelete',
    description: 'Delete all reaction roles from a message',
    usage: '!rrdelete <messageID>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide a message ID.')] });
      await db.delete(`rr_${message.guild.id}_${args[0]}`);
      message.reply({ embeds: [successEmbed('Reaction Roles Deleted', 'All reaction roles removed from that message.')] });
    }
  },
  {
    name: 'rrsetup',
    description: 'Quick setup for reaction roles in a new embed',
    usage: '!rrsetup',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      message.reply({ embeds: [infoEmbed('📝 Reaction Role Setup', 'Use `!rrcreate Title | emoji role | emoji role` to create a reaction role embed.')] });
    }
  },
  {
    name: 'rrunique',
    description: 'Set a reaction role message to be unique (one role at a time)',
    usage: '!rrunique <messageID>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide a message ID.')] });
      await db.set(`rr_unique_${message.guild.id}_${args[0]}`, true);
      message.reply({ embeds: [successEmbed('Unique Mode', 'Users can only have one role from this message at a time.')] });
    }
  },
  {
    name: 'rrpanel',
    description: 'View all reaction role messages in the server',
    usage: '!rrpanel',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('🎭 Reaction Role Panel', 'All reaction roles are managed per-message ID. Use `!rrlist <messageID>` to view them.')] });
    }
  },
  {
    name: 'rrverify',
    description: 'Set a verification reaction role',
    usage: '!rrverify <channel> <emoji> <role>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      const emoji = args[1];
      const role = await resolveRole(message.guild, args[2]);
      if (!role) return message.reply({ embeds: [errorEmbed('Could not find that role.')] });
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('✅ Verification')
        .setDescription(`React with ${emoji} to get the ${role} role and access the server!`)
        .setFooter({ text: CREDITS });
      const msg = await ch.send({ embeds: [embed] });
      await msg.react(emoji);
      await db.set(`rr_${message.guild.id}_${msg.id}`, { [emoji]: role.id });
      message.reply({ embeds: [successEmbed('Verification Set', `Verification panel created in ${ch}.`)] });
    }
  },
  {
    name: 'rredit',
    description: 'Edit the title of a reaction role embed',
    usage: '!rredit <messageID> <new title>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const msgId = args[0];
      const title = args.slice(1).join(' ');
      if (!msgId || !title) return message.reply({ embeds: [errorEmbed('Usage: `!rredit <messageID> <new title>`')] });
      const msg = await message.channel.messages.fetch(msgId).catch(() => null);
      if (!msg || !msg.embeds[0]) return message.reply({ embeds: [errorEmbed('Could not find that message.')] });
      const oldEmbed = EmbedBuilder.from(msg.embeds[0]).setTitle(title);
      await msg.edit({ embeds: [oldEmbed] });
      message.reply({ embeds: [successEmbed('Embed Edited', 'Title updated.')] });
    }
  }
];

module.exports = { category, commands };
