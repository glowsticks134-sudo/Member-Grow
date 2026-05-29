const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { resolveChannel } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Polls';

const commands = [
  {
    name: 'poll',
    description: 'Create a poll with multiple options',
    usage: '!poll <question> | <option1> | <option2> ...',
    async execute(message, args) {
      const full = args.join(' ');
      const parts = full.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length < 3) return message.reply({ embeds: [errorEmbed('Usage: `!poll <question> | <opt1> | <opt2> ...`\nMinimum 2 options required.')] });
      const question = parts[0];
      const options = parts.slice(1);
      if (options.length > 10) return message.reply({ embeds: [errorEmbed('Maximum 10 options.')] });
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      const desc = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n');
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`📊 ${question}`)
        .setDescription(desc)
        .setFooter({ text: `Poll by ${message.author.tag} | ${CREDITS}` })
        .setTimestamp();
      await message.delete().catch(() => null);
      const msg = await message.channel.send({ embeds: [embed] });
      for (let i = 0; i < options.length; i++) await msg.react(emojis[i]);
      await db.set(`poll_${msg.id}`, { question, options, channelId: message.channel.id, guildId: message.guild.id });
    }
  },
  {
    name: 'quickpoll',
    description: 'Create a simple yes/no poll',
    usage: '!quickpoll <question>',
    aliases: ['ynpoll'],
    async execute(message, args) {
      const question = args.join(' ');
      if (!question) return message.reply({ embeds: [errorEmbed('Please provide a question.')] });
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`📊 ${question}`)
        .setDescription('✅ Yes   ❌ No')
        .setFooter({ text: `Poll by ${message.author.tag} | ${CREDITS}` })
        .setTimestamp();
      await message.delete().catch(() => null);
      const msg = await message.channel.send({ embeds: [embed] });
      await msg.react('✅');
      await msg.react('❌');
    }
  },
  {
    name: 'strawpoll',
    description: 'Create a straw poll with options',
    usage: '!strawpoll <question> | <opt1> | <opt2>',
    aliases: ['straw'],
    async execute(message, args) {
      const full = args.join(' ');
      const parts = full.split('|').map(p => p.trim()).filter(Boolean);
      if (parts.length < 3) return message.reply({ embeds: [errorEmbed('At least 2 options required.')] });
      const question = parts[0];
      const options = parts.slice(1);
      const letters = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯'];
      const desc = options.map((opt, i) => `${letters[i]} ${opt}`).join('\n');
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle(`🗳️ ${question}`)
        .setDescription(desc)
        .setFooter({ text: `Straw Poll by ${message.author.tag} | ${CREDITS}` })
        .setTimestamp();
      await message.delete().catch(() => null);
      const msg = await message.channel.send({ embeds: [embed] });
      for (let i = 0; i < options.length; i++) await msg.react(letters[i]);
    }
  },
  {
    name: 'endpoll',
    description: 'End a poll and show results',
    usage: '!endpoll <messageID>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide the poll message ID.')] });
      const pollData = await db.get(`poll_${args[0]}`);
      if (!pollData) return message.reply({ embeds: [errorEmbed('Poll not found.')] });
      const ch = message.guild.channels.cache.get(pollData.channelId);
      if (!ch) return message.reply({ embeds: [errorEmbed('Poll channel not found.')] });
      const msg = await ch.messages.fetch(args[0]).catch(() => null);
      if (!msg) return message.reply({ embeds: [errorEmbed('Poll message not found.')] });
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      const results = pollData.options.map((opt, i) => {
        const reaction = msg.reactions.cache.get(emojis[i]);
        const count = (reaction?.count || 1) - 1;
        return `${emojis[i]} ${opt}: **${count} vote${count !== 1 ? 's' : ''}**`;
      });
      const embed = new EmbedBuilder()
        .setColor(0xFEE75C)
        .setTitle(`📊 Poll Results: ${pollData.question}`)
        .setDescription(results.join('\n'))
        .setFooter({ text: CREDITS })
        .setTimestamp();
      message.reply({ embeds: [embed] });
      await db.delete(`poll_${args[0]}`);
    }
  },
  {
    name: 'delpoll',
    description: 'Delete a poll message',
    usage: '!delpoll <messageID>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide the poll message ID.')] });
      const pollData = await db.get(`poll_${args[0]}`);
      if (pollData) {
        const ch = message.guild.channels.cache.get(pollData.channelId);
        if (ch) {
          const msg = await ch.messages.fetch(args[0]).catch(() => null);
          if (msg) await msg.delete().catch(() => null);
        }
        await db.delete(`poll_${args[0]}`);
      }
      message.reply({ embeds: [successEmbed('Poll Deleted', 'The poll has been deleted.')] });
    }
  },
  {
    name: 'pollresults',
    description: 'Show live results of a poll',
    usage: '!pollresults <messageID>',
    async execute(message, args) {
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide the poll message ID.')] });
      const pollData = await db.get(`poll_${args[0]}`);
      if (!pollData) return message.reply({ embeds: [errorEmbed('Poll not found.')] });
      const ch = message.guild.channels.cache.get(pollData.channelId);
      if (!ch) return message.reply({ embeds: [errorEmbed('Poll channel not found.')] });
      const msg = await ch.messages.fetch(args[0]).catch(() => null);
      if (!msg) return message.reply({ embeds: [errorEmbed('Poll message not found.')] });
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      const results = pollData.options.map((opt, i) => {
        const reaction = msg.reactions.cache.get(emojis[i]);
        const count = (reaction?.count || 1) - 1;
        return `${emojis[i]} ${opt}: **${count}**`;
      });
      const embed = infoEmbed(`📊 Live Results: ${pollData.question}`, results.join('\n'));
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'votechannel',
    description: 'Set a channel where all messages get vote reactions',
    usage: '!votechannel <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      const list = (await db.get(`votechannels_${message.guild.id}`)) || [];
      if (!list.includes(ch.id)) list.push(ch.id);
      await db.set(`votechannels_${message.guild.id}`, list);
      message.reply({ embeds: [successEmbed('Vote Channel', `${ch} is now a vote channel.`)] });
    }
  },
  {
    name: 'unvotechannel',
    description: 'Remove a vote channel',
    usage: '!unvotechannel <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      let list = (await db.get(`votechannels_${message.guild.id}`)) || [];
      list = list.filter(id => id !== ch.id);
      await db.set(`votechannels_${message.guild.id}`, list);
      message.reply({ embeds: [successEmbed('Vote Channel Removed', `${ch} is no longer a vote channel.`)] });
    }
  },
  {
    name: 'pollsettings',
    description: 'View poll settings',
    usage: '!pollsettings',
    async execute(message, args) {
      const voteChannels = (await db.get(`votechannels_${message.guild.id}`)) || [];
      message.reply({ embeds: [infoEmbed('📊 Poll Settings', `**Vote Channels:** ${voteChannels.map(id => `<#${id}>`).join(', ') || 'None'}`)] });
    }
  },
  {
    name: 'suggest',
    description: 'Submit a suggestion',
    usage: '!suggest <text>',
    async execute(message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [errorEmbed('Please provide your suggestion.')] });
      const chId = await db.get(`suggest_channel_${message.guild.id}`);
      if (!chId) return message.reply({ embeds: [errorEmbed('No suggestion channel set. Ask an admin to use `!setsuggest`.')] });
      const ch = message.guild.channels.cache.get(chId);
      if (!ch) return message.reply({ embeds: [errorEmbed('Suggestion channel not found.')] });
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('💡 New Suggestion')
        .setDescription(text)
        .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
        .addFields({ name: 'Status', value: '⏳ Pending' })
        .setFooter({ text: CREDITS })
        .setTimestamp();
      const msg = await ch.send({ embeds: [embed] });
      await msg.react('✅');
      await msg.react('❌');
      message.reply({ embeds: [successEmbed('Suggestion Submitted', 'Your suggestion has been submitted!')] });
    }
  },
  {
    name: 'setsuggest',
    description: 'Set the suggestions channel',
    usage: '!setsuggest <channel>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      await db.set(`suggest_channel_${message.guild.id}`, ch.id);
      message.reply({ embeds: [successEmbed('Suggestion Channel', `Suggestions will be sent to ${ch}.`)] });
    }
  }
];

module.exports = { category, commands };
