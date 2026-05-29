const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Poll commands')
    .addSubcommand(s => s.setName('create').setDescription('Create a multi-option poll').addStringOption(o => o.setName('question').setDescription('Poll question').setRequired(true)).addStringOption(o => o.setName('options').setDescription('Options separated by | (min 2, max 10)').setRequired(true)).addChannelOption(o => o.setName('channel').setDescription('Channel (default: current)')))
    .addSubcommand(s => s.setName('yesno').setDescription('Quick yes/no poll').addStringOption(o => o.setName('question').setDescription('Question').setRequired(true)))
    .addSubcommand(s => s.setName('end').setDescription('End a poll and show results').addStringOption(o => o.setName('messageid').setDescription('Poll message ID').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List active polls'))
    .addSubcommand(s => s.setName('results').setDescription('Show poll results').addStringOption(o => o.setName('messageid').setDescription('Poll message ID').setRequired(true)))
    .addSubcommand(s => s.setName('anonymous').setDescription('Create an anonymous poll').addStringOption(o => o.setName('question').setDescription('Question').setRequired(true)).addStringOption(o => o.setName('options').setDescription('Options separated by |').setRequired(true)))
    .addSubcommand(s => s.setName('timed').setDescription('Create a poll with a timer').addStringOption(o => o.setName('question').setDescription('Question').setRequired(true)).addStringOption(o => o.setName('options').setDescription('Options separated by |').setRequired(true)).addIntegerOption(o => o.setName('minutes').setDescription('Duration in minutes').setRequired(true).setMinValue(1).setMaxValue(1440)))
    .addSubcommand(s => s.setName('vote').setDescription('Vote on an existing poll').addStringOption(o => o.setName('messageid').setDescription('Poll message ID').setRequired(true)).addIntegerOption(o => o.setName('option').setDescription('Option number (1-10)').setRequired(true).setMinValue(1).setMaxValue(10)))
    .addSubcommand(s => s.setName('suggest').setDescription('Send a suggestion').addStringOption(o => o.setName('suggestion').setDescription('Your suggestion').setRequired(true)))
    .addSubcommand(s => s.setName('setsuggestchannel').setDescription('Set suggestions channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('pollchannel').setDescription('Set default poll channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;
    const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];

    if (sub === 'create') {
      const question = interaction.options.getString('question');
      const optStr = interaction.options.getString('options');
      const options = optStr.split('|').map(o => o.trim()).filter(Boolean);
      if (options.length < 2) return interaction.reply({ embeds: [errorEmbed('Please provide at least 2 options separated by `|`.')], ephemeral: true });
      if (options.length > 10) return interaction.reply({ embeds: [errorEmbed('Maximum 10 options.')], ephemeral: true });
      const ch = interaction.options.getChannel('channel') || interaction.channel;
      const desc = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n');
      const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`📊 ${question}`).setDescription(desc).setFooter({ text: `Poll by ${interaction.user.tag} | ${CREDITS}` }).setTimestamp();
      const msg = await ch.send({ embeds: [embed] });
      for (let i = 0; i < options.length; i++) await msg.react(emojis[i]);
      await db.set(`poll_${msg.id}`, { question, options, channelId: ch.id, guildId, authorId: interaction.user.id });
      return interaction.reply({ embeds: [successEmbed('Poll Created', `Poll started in ${ch}!`)], ephemeral: true });
    }

    if (sub === 'yesno') {
      const question = interaction.options.getString('question');
      const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`📊 ${question}`).setDescription('👍 Yes | 👎 No').setFooter({ text: `Poll by ${interaction.user.tag} | ${CREDITS}` }).setTimestamp();
      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
      await msg.react('👍');
      await msg.react('👎');
      await db.set(`poll_${msg.id}`, { question, options: ['Yes', 'No'], channelId: interaction.channel.id, guildId });
    }

    if (sub === 'timed') {
      const question = interaction.options.getString('question');
      const optStr = interaction.options.getString('options');
      const minutes = interaction.options.getInteger('minutes');
      const options = optStr.split('|').map(o => o.trim()).filter(Boolean);
      if (options.length < 2) return interaction.reply({ embeds: [errorEmbed('At least 2 options required.')], ephemeral: true });
      const endTime = Date.now() + minutes * 60000;
      const desc = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n');
      const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`📊 ${question}`).setDescription(desc + `\n\nEnds: <t:${Math.floor(endTime / 1000)}:R>`).setFooter({ text: `Poll by ${interaction.user.tag} | ${CREDITS}` }).setTimestamp();
      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
      for (let i = 0; i < options.length; i++) await msg.react(emojis[i]);
      await db.set(`poll_${msg.id}`, { question, options, channelId: interaction.channel.id, guildId, endTime });
    }

    if (sub === 'anonymous') {
      const question = interaction.options.getString('question');
      const options = interaction.options.getString('options').split('|').map(o => o.trim()).filter(Boolean);
      if (options.length < 2) return interaction.reply({ embeds: [errorEmbed('At least 2 options required.')], ephemeral: true });
      const desc = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n');
      const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(`📊 ${question}`).setDescription(desc + '\n\n🔒 *Anonymous Poll*').setFooter({ text: CREDITS }).setTimestamp();
      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
      for (let i = 0; i < options.length; i++) await msg.react(emojis[i]);
    }

    if (sub === 'results') {
      const msgId = interaction.options.getString('messageid');
      const poll = await db.get(`poll_${msgId}`);
      if (!poll) return interaction.reply({ embeds: [errorEmbed('Poll not found.')], ephemeral: true });
      const msg = await interaction.channel.messages.fetch(msgId).catch(() => null);
      if (!msg) return interaction.reply({ embeds: [errorEmbed('Message not found.')], ephemeral: true });
      const results = poll.options.map((opt, i) => {
        const reaction = msg.reactions.cache.find(r => r.emoji.name === emojis[i]);
        const count = (reaction?.count || 1) - 1;
        return `${emojis[i]} **${opt}**: ${count} votes`;
      }).join('\n');
      return interaction.reply({ embeds: [infoEmbed(`📊 Results: ${poll.question}`, results)] });
    }

    if (sub === 'end') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
        return interaction.reply({ embeds: [errorEmbed('You need Manage Messages permission.')], ephemeral: true });
      const msgId = interaction.options.getString('messageid');
      const poll = await db.get(`poll_${msgId}`);
      if (!poll) return interaction.reply({ embeds: [errorEmbed('Poll not found.')], ephemeral: true });
      await db.delete(`poll_${msgId}`);
      return interaction.reply({ embeds: [successEmbed('Poll Ended', 'The poll has been ended.')] });
    }

    if (sub === 'list') {
      const allKeys = await db.all();
      const polls = allKeys.filter(k => k.id.startsWith('poll_') && k.value.guildId === guildId);
      if (!polls.length) return interaction.reply({ embeds: [infoEmbed('Polls', 'No active polls.')] });
      const list = polls.slice(0, 10).map(p => `**${p.value.question}** — <#${p.value.channelId}>`).join('\n');
      return interaction.reply({ embeds: [infoEmbed('📊 Active Polls', list)] });
    }

    if (sub === 'suggest') {
      const suggestion = interaction.options.getString('suggestion');
      const chId = await db.get(`suggest_channel_${guildId}`);
      const ch = chId ? interaction.guild.channels.cache.get(chId) : interaction.channel;
      const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle('💡 Suggestion').setDescription(suggestion).setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() }).setFooter({ text: CREDITS }).setTimestamp();
      const msg = await ch.send({ embeds: [embed] });
      await msg.react('👍');
      await msg.react('👎');
      return interaction.reply({ content: '✅ Suggestion submitted!', ephemeral: true });
    }

    if (sub === 'setsuggestchannel') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const ch = interaction.options.getChannel('channel');
      await db.set(`suggest_channel_${guildId}`, ch.id);
      return interaction.reply({ embeds: [successEmbed('Suggestions Channel', `Suggestions will go to ${ch}.`)] });
    }

    if (sub === 'pollchannel') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
        return interaction.reply({ embeds: [errorEmbed('Admin only.')], ephemeral: true });
      const ch = interaction.options.getChannel('channel');
      await db.set(`poll_channel_${guildId}`, ch.id);
      return interaction.reply({ embeds: [successEmbed('Poll Channel', `Default poll channel set to ${ch}.`)] });
    }

    if (sub === 'vote') {
      return interaction.reply({ embeds: [infoEmbed('Vote', 'React directly on the poll message with the corresponding emoji!')] });
    }
  }
};
