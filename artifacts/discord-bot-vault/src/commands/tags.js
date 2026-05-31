const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tags')
    .setDescription('Custom tags/text commands')
    .addSubcommand(s => s.setName('create').setDescription('Create a tag').addStringOption(o => o.setName('name').setDescription('Tag name').setRequired(true)).addStringOption(o => o.setName('content').setDescription('Tag content').setRequired(true)))
    .addSubcommand(s => s.setName('get').setDescription('Show a tag').addStringOption(o => o.setName('name').setDescription('Tag name').setRequired(true)))
    .addSubcommand(s => s.setName('delete').setDescription('Delete a tag').addStringOption(o => o.setName('name').setDescription('Tag name').setRequired(true)))
    .addSubcommand(s => s.setName('edit').setDescription('Edit a tag').addStringOption(o => o.setName('name').setDescription('Tag name').setRequired(true)).addStringOption(o => o.setName('content').setDescription('New content').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List all tags'))
    .addSubcommand(s => s.setName('info').setDescription('Tag information').addStringOption(o => o.setName('name').setDescription('Tag name').setRequired(true)))
    .addSubcommand(s => s.setName('search').setDescription('Search tags').addStringOption(o => o.setName('query').setDescription('Search query').setRequired(true)))
    .addSubcommand(s => s.setName('transfer').setDescription('Transfer tag ownership').addStringOption(o => o.setName('name').setDescription('Tag name').setRequired(true)).addUserOption(o => o.setName('user').setDescription('New owner').setRequired(true)))
    .addSubcommand(s => s.setName('claim').setDescription('Claim a tag if owner left').addStringOption(o => o.setName('name').setDescription('Tag name').setRequired(true)))
    .addSubcommand(s => s.setName('raw').setDescription('Show raw tag content').addStringOption(o => o.setName('name').setDescription('Tag name').setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'create') {
      const name = interaction.options.getString('name').toLowerCase();
      const content = interaction.options.getString('content');
      const key = `tag_${guildId}_${name}`;
      if (await db.get(key)) return interaction.reply({ embeds: [errorEmbed(`Tag \`${name}\` already exists.`)], ephemeral: true });
      await db.set(key, { name, content, authorId: interaction.user.id, uses: 0, created: Date.now() });
      return interaction.reply({ embeds: [successEmbed('Tag Created', `Tag \`${name}\` created.`)] });
    }

    if (sub === 'get') {
      const name = interaction.options.getString('name').toLowerCase();
      const tag = await db.get(`tag_${guildId}_${name}`);
      if (!tag) return interaction.reply({ embeds: [errorEmbed(`Tag \`${name}\` not found.`)], ephemeral: true });
      tag.uses = (tag.uses || 0) + 1;
      await db.set(`tag_${guildId}_${name}`, tag);
      return interaction.reply({ content: tag.content });
    }

    if (sub === 'delete') {
      const name = interaction.options.getString('name').toLowerCase();
      const tag = await db.get(`tag_${guildId}_${name}`);
      if (!tag) return interaction.reply({ embeds: [errorEmbed(`Tag \`${name}\` not found.`)], ephemeral: true });
      if (tag.authorId !== interaction.user.id && !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
        return interaction.reply({ embeds: [errorEmbed('You can only delete your own tags.')], ephemeral: true });
      await db.delete(`tag_${guildId}_${name}`);
      return interaction.reply({ embeds: [successEmbed('Tag Deleted', `Tag \`${name}\` deleted.`)] });
    }

    if (sub === 'edit') {
      const name = interaction.options.getString('name').toLowerCase();
      const content = interaction.options.getString('content');
      const tag = await db.get(`tag_${guildId}_${name}`);
      if (!tag) return interaction.reply({ embeds: [errorEmbed(`Tag \`${name}\` not found.`)], ephemeral: true });
      if (tag.authorId !== interaction.user.id && !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
        return interaction.reply({ embeds: [errorEmbed('You can only edit your own tags.')], ephemeral: true });
      tag.content = content;
      await db.set(`tag_${guildId}_${name}`, tag);
      return interaction.reply({ embeds: [successEmbed('Tag Edited', `Tag \`${name}\` updated.`)] });
    }

    if (sub === 'list') {
      const allKeys = await db.all();
      const tags = allKeys.filter(k => k.id.startsWith(`tag_${guildId}_`));
      if (!tags.length) return interaction.reply({ embeds: [infoEmbed('Tags', 'No tags in this server.')] });
      const list = tags.slice(0, 25).map(t => `\`${t.value.name}\``).join(', ');
      return interaction.reply({ embeds: [infoEmbed(`🏷️ Tags (${tags.length})`, list)] });
    }

    if (sub === 'info') {
      const name = interaction.options.getString('name').toLowerCase();
      const tag = await db.get(`tag_${guildId}_${name}`);
      if (!tag) return interaction.reply({ embeds: [errorEmbed(`Tag \`${name}\` not found.`)], ephemeral: true });
      return interaction.reply({ embeds: [infoEmbed(`🏷️ Tag: ${name}`).addFields(
        { name: 'Owner', value: `<@${tag.authorId}>`, inline: true },
        { name: 'Uses', value: String(tag.uses || 0), inline: true },
        { name: 'Created', value: tag.created ? `<t:${Math.floor(tag.created / 1000)}:R>` : 'Unknown', inline: true }
      )] });
    }

    if (sub === 'search') {
      const query = interaction.options.getString('query').toLowerCase();
      const allKeys = await db.all();
      const tags = allKeys.filter(k => k.id.startsWith(`tag_${guildId}_`) && k.value.name.includes(query));
      if (!tags.length) return interaction.reply({ embeds: [infoEmbed('Search', `No tags matching \`${query}\`.`)] });
      return interaction.reply({ embeds: [infoEmbed(`🔍 Search: "${query}"`, tags.slice(0, 15).map(t => `\`${t.value.name}\``).join(', '))] });
    }

    if (sub === 'transfer') {
      const name = interaction.options.getString('name').toLowerCase();
      const newOwner = interaction.options.getUser('user');
      const tag = await db.get(`tag_${guildId}_${name}`);
      if (!tag) return interaction.reply({ embeds: [errorEmbed(`Tag \`${name}\` not found.`)], ephemeral: true });
      if (tag.authorId !== interaction.user.id && !interaction.member.permissions.has(PermissionFlagsBits.ManageMessages))
        return interaction.reply({ embeds: [errorEmbed('You can only transfer your own tags.')], ephemeral: true });
      tag.authorId = newOwner.id;
      await db.set(`tag_${guildId}_${name}`, tag);
      return interaction.reply({ embeds: [successEmbed('Tag Transferred', `Tag \`${name}\` transferred to ${newOwner.tag}.`)] });
    }

    if (sub === 'claim') {
      const name = interaction.options.getString('name').toLowerCase();
      const tag = await db.get(`tag_${guildId}_${name}`);
      if (!tag) return interaction.reply({ embeds: [errorEmbed(`Tag \`${name}\` not found.`)], ephemeral: true });
      const owner = interaction.guild.members.cache.get(tag.authorId);
      if (owner) return interaction.reply({ embeds: [errorEmbed('Tag owner is still in the server.')], ephemeral: true });
      tag.authorId = interaction.user.id;
      await db.set(`tag_${guildId}_${name}`, tag);
      return interaction.reply({ embeds: [successEmbed('Tag Claimed', `You now own tag \`${name}\`.`)] });
    }

    if (sub === 'raw') {
      const name = interaction.options.getString('name').toLowerCase();
      const tag = await db.get(`tag_${guildId}_${name}`);
      if (!tag) return interaction.reply({ embeds: [errorEmbed(`Tag \`${name}\` not found.`)], ephemeral: true });
      return interaction.reply({ embeds: [infoEmbed(`📝 Raw: ${name}`, `\`\`\`\n${tag.content}\n\`\`\``)] });
    }
  }
};
