const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Bot information commands')
    .addSubcommand(s => s.setName('credits').setDescription('Show bot credits'))
    .addSubcommand(s => s.setName('developer').setDescription('About the developer'))
    .addSubcommand(s => s.setName('version').setDescription('Bot version'))
    .addSubcommand(s => s.setName('changelog').setDescription('Recent bot changes'))
    .addSubcommand(s => s.setName('support').setDescription('Support server link'))
    .addSubcommand(s => s.setName('privacy').setDescription('Privacy policy'))
    .addSubcommand(s => s.setName('tos').setDescription('Terms of service'))
    .addSubcommand(s => s.setName('faq').setDescription('Frequently asked questions'))
    .addSubcommand(s => s.setName('features').setDescription('List bot features'))
    .addSubcommand(s => s.setName('donate').setDescription('Support the developer'))
    .addSubcommand(s => s.setName('upvote').setDescription('Upvote the bot'))
    .addSubcommand(s => s.setName('review').setDescription('Leave a review'))
    .addSubcommand(s => s.setName('botlist').setDescription('Where to find this bot'))
    .addSubcommand(s => s.setName('status').setDescription('Bot status page'))
    .addSubcommand(s => s.setName('social').setDescription('Bot social media links'))
    .addSubcommand(s => s.setName('commands').setDescription('Full command list'))
    .addSubcommand(s => s.setName('about').setDescription('About Member Grow bot'))
    .addSubcommand(s => s.setName('whois').setDescription('Who is Stichachu13?'))
    .addSubcommand(s => s.setName('setup').setDescription('Quick setup guide'))
    .addSubcommand(s => s.setName('permissions').setDescription('Required bot permissions'))
    .addSubcommand(s => s.setName('roadmap').setDescription('Upcoming features')),

  async execute(interaction, client) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'credits') {
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('✨ Bot Credits')
        .setDescription('This bot was created with ❤️ for the **Member Grow** server.')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: 'Developer', value: '**Stichachu13**', inline: true },
          { name: 'Bot Name', value: client.user.username, inline: true },
          { name: 'Framework', value: 'discord.js v14', inline: true },
          { name: 'Modules', value: String(client.slashCommands.size) + ' slash commands', inline: true },
          { name: 'Servers', value: String(client.guilds.cache.size), inline: true },
          { name: 'Node.js', value: process.version, inline: true }
        )
        .setFooter({ text: CREDITS })
        .setTimestamp();
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'developer') {
      return interaction.reply({ embeds: [infoEmbed('👨‍💻 Developer', '**Stichachu13** built and maintains this bot.\n\nThis bot powers the **Member Grow** community with 300+ commands covering moderation, fun, leveling, giveaways, tickets, and more.\n\nThank you for using Member Grow Bot! ❤️')] });
    }

    if (sub === 'version') {
      return interaction.reply({ embeds: [infoEmbed('📦 Version', '**Member Grow Bot v2.0**\n\n✅ Now running on **Slash Commands** (converted from prefix)\n✅ discord.js v14\n✅ 18 command categories\n✅ Hosted on Railway')] });
    }

    if (sub === 'changelog') {
      return interaction.reply({ embeds: [infoEmbed('📋 Changelog — v2.0', '**Latest Changes:**\n• Converted all commands to slash commands\n• Added ticket panel button system\n• Improved giveaway enter/leave buttons\n• Added starboard support\n• Better XP/leveling system\n• AutoMod improvements')] });
    }

    if (sub === 'support') {
      return interaction.reply({ embeds: [infoEmbed('💬 Support', 'Join the **Member Grow** server for support!\n\nContact **Stichachu13** directly for bot issues.')] });
    }

    if (sub === 'privacy') {
      return interaction.reply({ embeds: [infoEmbed('🔒 Privacy Policy', 'This bot stores:\n• Server configuration settings\n• User XP and level data\n• Warning/mod logs\n• Active tickets, giveaways, polls, tags\n\nNo data is sold or shared with third parties.\nData can be deleted on request.')] });
    }

    if (sub === 'tos') {
      return interaction.reply({ embeds: [infoEmbed('📜 Terms of Service', '• Do not abuse bot commands\n• Do not use commands to harass others\n• Respect server rules\n• The bot may be updated or removed at any time\n\nBy using this bot, you agree to these terms.')] });
    }

    if (sub === 'faq') {
      return interaction.reply({ embeds: [infoEmbed('❓ FAQ', '**Q: How do I use slash commands?**\nA: Type `/` followed by a command name.\n\n**Q: How does leveling work?**\nA: Earn XP by chatting. Check rank with `/leveling rank`.\n\n**Q: How do I open a ticket?**\nA: Set up tickets with `/tickets setup`, then click the panel.\n\n**Q: Can I reset all XP?**\nA: Admins can use `/leveling resetallxp`.')] });
    }

    if (sub === 'features') {
      return interaction.reply({ embeds: [infoEmbed('🌟 Features', '• **18 command categories**\n• Moderation (ban, kick, mute, warn...)\n• Leveling & XP system\n• Giveaways with button entry\n• Support tickets\n• AutoMod (links, spam, caps, badwords)\n• Starboard\n• Welcome/leave messages\n• Reaction roles\n• Custom tags\n• Polls & suggestions\n• Fun games & mini-games\n• Logging & audit trail')] });
    }

    if (sub === 'setup') {
      return interaction.reply({ embeds: [infoEmbed('⚙️ Quick Setup Guide', '**1. Moderation**\n`/mod roles setmuterole` — set mute role\n`/logging setlog` — set log channel\n\n**2. Welcome System**\n`/welcome setchannel` — set welcome channel\n`/welcome setmessage` — set message\n\n**3. Tickets**\n`/tickets setup` — creates panel button\n\n**4. AutoMod**\n`/automod antilink` — enable link filter\n`/automod antispam` — enable spam filter\n\n**5. Leveling**\n`/leveling levelchannel` — set level-up channel')] });
    }

    if (sub === 'permissions') {
      return interaction.reply({ embeds: [infoEmbed('🔑 Required Permissions', '• Administrator (recommended)\n\nOr these specific permissions:\n• Ban Members, Kick Members\n• Manage Roles, Manage Channels\n• Moderate Members\n• Manage Messages\n• Send Messages, Embed Links\n• Add Reactions, Read Message History\n• View Channels\n• Manage Webhooks (for logging)')] });
    }

    if (sub === 'commands') {
      return interaction.reply({ embeds: [infoEmbed('📚 All Commands', 'Type `/` in Discord to browse all commands!\n\n**Categories:**\n`/mod` `/utility` `/fun` `/social`\n`/leveling` `/games` `/giveaway` `/poll`\n`/tickets` `/automod` `/logging` `/starboard`\n`/welcome` `/rr` `/tags` `/reminder`\n`/misc` `/info`')] });
    }

    if (sub === 'about') {
      return interaction.reply({ embeds: [new EmbedBuilder().setColor(BRAND_COLOR).setTitle('🤖 About Member Grow Bot').setThumbnail(client.user.displayAvatarURL()).setDescription('Member Grow Bot is a full-featured Discord bot designed for the **Member Grow** community.\n\nBuilt by **Stichachu13** with discord.js v14, featuring 300+ commands across 18 categories.').setFooter({ text: CREDITS }).setTimestamp()] });
    }

    if (sub === 'whois') {
      return interaction.reply({ embeds: [infoEmbed('👤 Stichachu13', '**Stichachu13** is the developer and owner of this bot.\n\nBuilt Member Grow Bot from scratch with JavaScript and discord.js v14.\n\nFor support or feature requests, reach out directly!')] });
    }

    if (sub === 'roadmap') {
      return interaction.reply({ embeds: [infoEmbed('🗺️ Roadmap', '**Upcoming Features:**\n• Music commands\n• Economy system\n• Custom rank cards\n• Multi-language support\n• Dashboard web panel\n• Advanced automod AI\n\n*Subject to change — suggest features to Stichachu13!*')] });
    }

    const defaults = { donate: '💝 Support', upvote: '⬆️ Upvote', review: '⭐ Review', botlist: '📋 Bot Lists', status: '🟢 Status', social: '📱 Social' };
    if (defaults[sub]) return interaction.reply({ embeds: [infoEmbed(defaults[sub], `Thank you for using **Member Grow Bot**!\n\nContact **Stichachu13** for links and more info.`)] });
  }
};
