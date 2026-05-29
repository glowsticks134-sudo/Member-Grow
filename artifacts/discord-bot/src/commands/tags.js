const { successEmbed, errorEmbed, infoEmbed } = require('../utils/embed');
const db = require('../utils/database');

const category = 'Tags';

const commands = [
  {
    name: 'tag',
    description: 'Use a custom tag',
    usage: '!tag <name>',
    aliases: ['t'],
    async execute(message, args) {
      if (!args[0]) return message.reply({ embeds: [errorEmbed('Please provide a tag name.')] });
      const key = `tag_${message.guild.id}_${args[0].toLowerCase()}`;
      const tag = await db.get(key);
      if (!tag) return message.reply({ embeds: [errorEmbed(`Tag \`${args[0]}\` not found. Use \`!tags\` to view all tags.`)] });
      message.channel.send(tag.content);
    }
  },
  {
    name: 'addtag',
    description: 'Add a custom tag',
    usage: '!addtag <name> <content>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n) && !message.member.permissions.has(BigInt(0x20))) return message.reply({ embeds: [errorEmbed('You need Manage Messages permission.')] });
      const name = args[0]?.toLowerCase();
      if (!name) return message.reply({ embeds: [errorEmbed('Please provide a tag name.')] });
      const content = args.slice(1).join(' ');
      if (!content) return message.reply({ embeds: [errorEmbed('Please provide tag content.')] });
      const key = `tag_${message.guild.id}_${name}`;
      await db.set(key, { content, author: message.author.id, created: Date.now(), name });
      const list = (await db.get(`taglist_${message.guild.id}`)) || [];
      if (!list.includes(name)) { list.push(name); await db.set(`taglist_${message.guild.id}`, list); }
      message.reply({ embeds: [successEmbed('Tag Created', `Tag \`${name}\` has been created.`)] });
    }
  },
  {
    name: 'removetag',
    description: 'Remove a custom tag',
    usage: '!removetag <name>',
    aliases: ['deltag'],
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const name = args[0]?.toLowerCase();
      if (!name) return message.reply({ embeds: [errorEmbed('Please provide a tag name.')] });
      await db.delete(`tag_${message.guild.id}_${name}`);
      let list = (await db.get(`taglist_${message.guild.id}`)) || [];
      list = list.filter(t => t !== name);
      await db.set(`taglist_${message.guild.id}`, list);
      message.reply({ embeds: [successEmbed('Tag Removed', `Tag \`${name}\` has been removed.`)] });
    }
  },
  {
    name: 'edittag',
    description: 'Edit a tag\'s content',
    usage: '!edittag <name> <content>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const name = args[0]?.toLowerCase();
      const content = args.slice(1).join(' ');
      if (!name || !content) return message.reply({ embeds: [errorEmbed('Usage: !edittag <name> <content>')] });
      const key = `tag_${message.guild.id}_${name}`;
      const tag = await db.get(key);
      if (!tag) return message.reply({ embeds: [errorEmbed(`Tag \`${name}\` not found.`)] });
      tag.content = content;
      tag.edited = Date.now();
      await db.set(key, tag);
      message.reply({ embeds: [successEmbed('Tag Edited', `Tag \`${name}\` updated.`)] });
    }
  },
  {
    name: 'tags',
    description: 'List all server tags',
    usage: '!tags',
    aliases: ['taglist'],
    async execute(message, args) {
      const list = (await db.get(`taglist_${message.guild.id}`)) || [];
      if (!list.length) return message.reply({ embeds: [infoEmbed('📝 Tags', 'No tags found. Use `!addtag` to create one.')] });
      message.reply({ embeds: [infoEmbed(`📝 Server Tags (${list.length})`, list.map(t => `\`${t}\``).join(', '))] });
    }
  },
  {
    name: 'taginfo',
    description: 'Get info about a tag',
    usage: '!taginfo <name>',
    async execute(message, args) {
      const name = args[0]?.toLowerCase();
      if (!name) return message.reply({ embeds: [errorEmbed('Please provide a tag name.')] });
      const tag = await db.get(`tag_${message.guild.id}_${name}`);
      if (!tag) return message.reply({ embeds: [errorEmbed(`Tag \`${name}\` not found.`)] });
      message.reply({ embeds: [infoEmbed(`📝 Tag: ${name}`)
        .addFields(
          { name: 'Author', value: `<@${tag.author}>`, inline: true },
          { name: 'Created', value: `<t:${Math.floor(tag.created / 1000)}:R>`, inline: true },
          { name: 'Content Preview', value: tag.content.slice(0, 100) + (tag.content.length > 100 ? '...' : ''), inline: false }
        )
      ] });
    }
  },
  {
    name: 'tagsearch',
    description: 'Search for tags by name',
    usage: '!tagsearch <query>',
    async execute(message, args) {
      const query = args.join(' ').toLowerCase();
      if (!query) return message.reply({ embeds: [errorEmbed('Please provide a search query.')] });
      const list = (await db.get(`taglist_${message.guild.id}`)) || [];
      const matches = list.filter(t => t.includes(query));
      if (!matches.length) return message.reply({ embeds: [infoEmbed('🔍 Tag Search', `No tags found matching \`${query}\`.`)] });
      message.reply({ embeds: [infoEmbed(`🔍 Tag Search Results (${matches.length})`, matches.map(t => `\`${t}\``).join(', '))] });
    }
  },
  {
    name: 'rawtag',
    description: 'View the raw content of a tag',
    usage: '!rawtag <name>',
    async execute(message, args) {
      const name = args[0]?.toLowerCase();
      if (!name) return message.reply({ embeds: [errorEmbed('Please provide a tag name.')] });
      const tag = await db.get(`tag_${message.guild.id}_${name}`);
      if (!tag) return message.reply({ embeds: [errorEmbed(`Tag \`${name}\` not found.`)] });
      message.reply({ embeds: [infoEmbed(`📝 Raw Tag: ${name}`, `\`\`\`\n${tag.content}\n\`\`\``)] });
    }
  },
  {
    name: 'clearalltags',
    description: 'Delete all server tags (Admin)',
    usage: '!clearalltags',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const list = (await db.get(`taglist_${message.guild.id}`)) || [];
      for (const name of list) await db.delete(`tag_${message.guild.id}_${name}`);
      await db.delete(`taglist_${message.guild.id}`);
      message.reply({ embeds: [successEmbed('Tags Cleared', `Deleted **${list.length}** tags.`)] });
    }
  },
  {
    name: 'importtag',
    description: 'Import a tag from another message (reply to it)',
    usage: '!importtag <name>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const name = args[0]?.toLowerCase();
      if (!name) return message.reply({ embeds: [errorEmbed('Please provide a tag name.')] });
      const ref = message.reference?.messageId;
      if (!ref) return message.reply({ embeds: [errorEmbed('Reply to a message to import its content as a tag.')] });
      const refMsg = await message.channel.messages.fetch(ref).catch(() => null);
      if (!refMsg) return message.reply({ embeds: [errorEmbed('Could not fetch the referenced message.')] });
      const content = refMsg.content || refMsg.embeds[0]?.description || '';
      if (!content) return message.reply({ embeds: [errorEmbed('No text content found in that message.')] });
      const key = `tag_${message.guild.id}_${name}`;
      await db.set(key, { content, author: message.author.id, created: Date.now(), name });
      const list = (await db.get(`taglist_${message.guild.id}`)) || [];
      if (!list.includes(name)) { list.push(name); await db.set(`taglist_${message.guild.id}`, list); }
      message.reply({ embeds: [successEmbed('Tag Imported', `Tag \`${name}\` created from message.`)] });
    }
  }
];

module.exports = { category, commands };
