const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const db = require('../utils/database');

const category = 'Info';

const commands = [
  {
    name: 'credits',
    description: 'Show bot credits',
    usage: '!credits',
    async execute(message, args, client) {
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('✨ Bot Credits')
        .setDescription('This bot was created with ❤️ for the **Member Grow** server.')
        .addFields(
          { name: 'Developer', value: '**Stichachu13**', inline: true },
          { name: 'Bot Name', value: client.user.username, inline: true },
          { name: 'Framework', value: 'discord.js v14', inline: true },
          { name: 'Total Commands', value: String(client.commands.size), inline: true }
        )
        .setFooter({ text: CREDITS })
        .setTimestamp();
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'developer',
    description: 'Info about the bot developer',
    usage: '!developer',
    aliases: ['dev'],
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('👨‍💻 Developer', 'This bot was built and maintained by **Stichachu13**.\n\nThank you for using Member Grow Bot!')] });
    }
  },
  {
    name: 'version',
    description: 'Show the bot version',
    usage: '!version',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('📦 Version', `**Member Grow Bot** v1.0.0\n**discord.js:** v${require('discord.js').version}\n**Node.js:** ${process.version}`)] });
    }
  },
  {
    name: 'support',
    description: 'Get support information',
    usage: '!support',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('🆘 Support', 'For support, contact **Stichachu13** or open a ticket using `!ticketsetup`.')] });
    }
  },
  {
    name: 'github',
    description: 'Show the GitHub link',
    usage: '!github',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('🐙 GitHub', 'Bot source code is private.\nMade by **Stichachu13** for Member Grow.')] });
    }
  },
  {
    name: 'faq',
    description: 'Show frequently asked questions',
    usage: '!faq',
    async execute(message, args) {
      const faqs = [
        '**Q: How do I change the prefix?**\nA: Use `!setprefix <prefix>` (Admin only)',
        '**Q: How do I set up tickets?**\nA: Use `!ticketsetup` (Admin only)',
        '**Q: How does leveling work?**\nA: Chat to earn XP. Use `!rank` to check your level.',
        '**Q: How do I enable welcome messages?**\nA: Use `!setwelcome <channel>` (Admin only)',
        '**Q: Who made this bot?**\nA: **Stichachu13**'
      ];
      message.reply({ embeds: [infoEmbed('❓ FAQ', faqs.join('\n\n'))] });
    }
  },
  {
    name: 'report',
    description: 'Report a bug or issue',
    usage: '!report <issue>',
    async execute(message, args) {
      const issue = args.join(' ');
      if (!issue) return message.reply({ embeds: [errorEmbed('Please describe the issue.')] });
      message.reply({ embeds: [successEmbed('📋 Report Submitted', `Your report has been noted. Contact **Stichachu13** for follow-up.\n**Issue:** ${issue}`)] });
    }
  },
  {
    name: 'feedback',
    description: 'Submit feedback about the bot',
    usage: '!feedback <message>',
    async execute(message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [errorEmbed('Please provide feedback.')] });
      message.reply({ embeds: [successEmbed('💬 Feedback', `Thank you for your feedback, **${message.author.username}**! It has been forwarded to **Stichachu13**.`)] });
    }
  },
  {
    name: 'contact',
    description: 'How to contact the developer',
    usage: '!contact',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('📧 Contact', 'You can reach the developer **Stichachu13** through the Member Grow Discord server.')] });
    }
  },
  {
    name: 'tos',
    description: 'View the bot Terms of Service',
    usage: '!tos',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('📜 Terms of Service', 'By using this bot you agree to:\n• Not abuse the bot commands\n• Respect other server members\n• Follow Discord ToS\n\nViolations may result in being blacklisted.')] });
    }
  },
  {
    name: 'privacy',
    description: 'View the privacy policy',
    usage: '!privacy',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('🔒 Privacy Policy', 'This bot stores:\n• Server configurations (channels, roles, settings)\n• Economy data (balances, inventories)\n• Level/XP data\n• Moderation logs\n\nNo personal data is sold or shared externally.')] });
    }
  },
  {
    name: 'status',
    description: 'Check bot status',
    usage: '!status',
    async execute(message, args, client) {
      const status = ['🟢 Online', '🟡 Idle', '🔴 Do Not Disturb', '⚫ Offline'];
      message.reply({ embeds: [infoEmbed('🟢 Bot Status', `The bot is **online** and fully operational!\n**Ping:** ${Math.round(client.ws.ping)}ms`)] });
    }
  },
  {
    name: 'changelog',
    description: 'View the bot changelog',
    usage: '!changelog',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('📋 Changelog', `**v1.0.0** — Initial Release\n• 350+ commands added\n• Economy system\n• Leveling system\n• Moderation tools\n• Ticket system\n• Giveaway system\n• And much more!\n\n*Made by Stichachu13*`)] });
    }
  },
  {
    name: 'donate',
    description: 'Support the developer',
    usage: '!donate',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('💖 Support the Dev', 'Want to support **Stichachu13**? Your kind words and positive feedback mean the world! 🙏')] });
    }
  },
  {
    name: 'partner',
    description: 'View partnership information',
    usage: '!partner',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('🤝 Partnerships', 'Interested in partnering with Member Grow? Contact **Stichachu13** for more information.')] });
    }
  },
  {
    name: 'setbotname',
    description: 'Change the bot\'s username (Owner only)',
    usage: '!setbotname <name>',
    async execute(message, args, client) {
      const OWNER_ID = process.env.OWNER_ID;
      if (OWNER_ID && message.author.id !== OWNER_ID) return message.reply({ embeds: [errorEmbed('Owner only.')] });
      const name = args.join(' ');
      if (!name) return message.reply({ embeds: [errorEmbed('Please provide a name.')] });
      await client.user.setUsername(name);
      message.reply({ embeds: [successEmbed('Name Changed', `Bot name changed to **${name}**.`)] });
    }
  },
  {
    name: 'setstatus',
    description: 'Set the bot\'s status (Owner)',
    usage: '!setstatus <text>',
    async execute(message, args, client) {
      const OWNER_ID = process.env.OWNER_ID;
      if (OWNER_ID && message.author.id !== OWNER_ID) return message.reply({ embeds: [errorEmbed('Owner only.')] });
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [errorEmbed('Please provide status text.')] });
      client.user.setActivity(text);
      message.reply({ embeds: [successEmbed('Status Set', `Status set to: ${text}`)] });
    }
  },
  {
    name: 'eval',
    description: 'Evaluate code (Owner only)',
    usage: '!eval <code>',
    async execute(message, args, client) {
      const OWNER_ID = process.env.OWNER_ID;
      if (!OWNER_ID || message.author.id !== OWNER_ID) return message.reply({ embeds: [errorEmbed('Owner only.')] });
      const code = args.join(' ');
      try {
        let result = eval(code);
        if (result instanceof Promise) result = await result;
        const output = String(result).slice(0, 1000);
        message.reply({ embeds: [infoEmbed('📝 Eval', `\`\`\`js\n${output}\n\`\`\``)] });
      } catch (err) {
        message.reply({ embeds: [errorEmbed(`\`\`\`\n${err.message}\n\`\`\``)] });
      }
    }
  },
  {
    name: 'blacklist',
    description: 'Blacklist a user from using the bot (Owner)',
    usage: '!blacklist <userID>',
    async execute(message, args, client) {
      const OWNER_ID = process.env.OWNER_ID;
      if (OWNER_ID && message.author.id !== OWNER_ID) return message.reply({ embeds: [errorEmbed('Owner only.')] });
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide a user ID.')] });
      const list = (await db.get('bot_blacklist')) || [];
      if (list.includes(args[0])) {
        const filtered = list.filter(id => id !== args[0]);
        await db.set('bot_blacklist', filtered);
        return message.reply({ embeds: [successEmbed('Blacklist', `User <@${args[0]}> removed from blacklist.`)] });
      }
      list.push(args[0]);
      await db.set('bot_blacklist', list);
      message.reply({ embeds: [successEmbed('Blacklist', `User <@${args[0]}> added to blacklist.`)] });
    }
  },
  {
    name: 'announce',
    description: 'Send an announcement to a channel',
    usage: '!announce <channel> <message>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const { resolveChannel } = require('../utils/helpers');
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      const text = args.slice(1).join(' ');
      if (!text) return message.reply({ embeds: [errorEmbed('Please provide announcement text.')] });
      ch.send({ embeds: [infoEmbed('📢 Announcement', text).setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })] });
      message.reply({ embeds: [successEmbed('Announcement Sent', `Announcement sent to ${ch}.`)] });
    }
  },
  {
    name: 'embedsay',
    description: 'Send a custom titled embed',
    usage: '!embedsay <channel> <title> | <description>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const { resolveChannel } = require('../utils/helpers');
      const ch = await resolveChannel(message.guild, args[0]);
      if (!ch) return message.reply({ embeds: [errorEmbed('Could not find that channel.')] });
      const full = args.slice(1).join(' ');
      const [title, ...desc] = full.split('|');
      if (!title) return message.reply({ embeds: [errorEmbed('Provide title | description')] });
      ch.send({ embeds: [infoEmbed(title.trim(), desc.join('|').trim())] });
      await message.delete().catch(() => null);
    }
  }
];

module.exports = { category, commands };
