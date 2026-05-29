const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rr')
    .setDescription('Reaction roles')
    .addSubcommand(s => s.setName('add').setDescription('Add a reaction role').addStringOption(o => o.setName('messageid').setDescription('Message ID').setRequired(true)).addStringOption(o => o.setName('emoji').setDescription('Emoji').setRequired(true)).addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true)))
    .addSubcommand(s => s.setName('remove').setDescription('Remove a reaction role').addStringOption(o => o.setName('messageid').setDescription('Message ID').setRequired(true)).addStringOption(o => o.setName('emoji').setDescription('Emoji').setRequired(true)))
    .addSubcommand(s => s.setName('list').setDescription('List all reaction roles'))
    .addSubcommand(s => s.setName('clear').setDescription('Clear all reaction roles from a message').addStringOption(o => o.setName('messageid').setDescription('Message ID').setRequired(true)))
    .addSubcommand(s => s.setName('create').setDescription('Create a reaction role panel').addStringOption(o => o.setName('title').setDescription('Panel title').setRequired(true)).addStringOption(o => o.setName('description').setDescription('Panel description').setRequired(true)).addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(true)))
    .addSubcommand(s => s.setName('setmode').setDescription('Set assignment mode').addStringOption(o => o.setName('mode').setDescription('Mode').setRequired(true).addChoices({ name: 'Toggle (default)', value: 'toggle' }, { name: 'Add only', value: 'add' }, { name: 'Remove only', value: 'remove' }, { name: 'Single (exclusive)', value: 'single' })))
    .addSubcommand(s => s.setName('limit').setDescription('Set max roles per user').addIntegerOption(o => o.setName('max').setDescription('Max roles (0 = unlimited)').setRequired(true).setMinValue(0)))
    .addSubcommand(s => s.setName('required').setDescription('Set required role to use reaction roles').addRoleOption(o => o.setName('role').setDescription('Required role').setRequired(true)))
    .addSubcommand(s => s.setName('reset').setDescription('Reset all reaction role settings')),

  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles))
      return interaction.reply({ embeds: [errorEmbed('You need Manage Roles permission.')], ephemeral: true });

    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guild.id;

    if (sub === 'add') {
      const msgId = interaction.options.getString('messageid');
      const emoji = interaction.options.getString('emoji');
      const role = interaction.options.getRole('role');
      const key = `rr_${guildId}_${msgId}`;
      const data = (await db.get(key)) || {};
      data[emoji] = role.id;
      await db.set(key, data);
      const msg = await interaction.channel.messages.fetch(msgId).catch(() => null);
      if (msg) await msg.react(emoji).catch(() => null);
      return interaction.reply({ embeds: [successEmbed('Reaction Role Added', `${emoji} → ${role} added to message \`${msgId}\`.`)] });
    }

    if (sub === 'remove') {
      const msgId = interaction.options.getString('messageid');
      const emoji = interaction.options.getString('emoji');
      const key = `rr_${guildId}_${msgId}`;
      const data = (await db.get(key)) || {};
      delete data[emoji];
      await db.set(key, data);
      return interaction.reply({ embeds: [successEmbed('Reaction Role Removed', `${emoji} removed from message.`)] });
    }

    if (sub === 'list') {
      const allKeys = await db.all();
      const rrs = allKeys.filter(k => k.id.startsWith(`rr_${guildId}_`));
      if (!rrs.length) return interaction.reply({ embeds: [infoEmbed('Reaction Roles', 'No reaction roles set up.')] });
      const list = rrs.slice(0, 10).map(k => {
        const msgId = k.id.replace(`rr_${guildId}_`, '');
        const entries = Object.entries(k.value).map(([e, r]) => `${e} → <@&${r}>`).join(', ');
        return `**Msg \`${msgId}\`:** ${entries}`;
      }).join('\n');
      return interaction.reply({ embeds: [infoEmbed('🎭 Reaction Roles', list)] });
    }

    if (sub === 'clear') {
      const msgId = interaction.options.getString('messageid');
      await db.delete(`rr_${guildId}_${msgId}`);
      return interaction.reply({ embeds: [successEmbed('Cleared', `Reaction roles cleared from \`${msgId}\`.`)] });
    }

    if (sub === 'create') {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');
      const ch = interaction.options.getChannel('channel');
      const embed = new EmbedBuilder().setColor(BRAND_COLOR).setTitle(title).setDescription(description).setFooter({ text: CREDITS }).setTimestamp();
      const msg = await ch.send({ embeds: [embed] });
      return interaction.reply({ embeds: [successEmbed('Panel Created', `Reaction role panel created in ${ch}!\nMessage ID: \`${msg.id}\`\nUse \`/rr add\` to add reaction roles.`)] });
    }

    if (sub === 'setmode') {
      const mode = interaction.options.getString('mode');
      await db.set(`rr_mode_${guildId}`, mode);
      return interaction.reply({ embeds: [successEmbed('Mode Set', `Reaction role mode set to **${mode}**.`)] });
    }

    if (sub === 'limit') {
      const max = interaction.options.getInteger('max');
      await db.set(`rr_limit_${guildId}`, max);
      return interaction.reply({ embeds: [successEmbed('Role Limit', max === 0 ? 'No limit on reaction roles.' : `Users can have max **${max}** reaction roles.`)] });
    }

    if (sub === 'required') {
      const role = interaction.options.getRole('role');
      await db.set(`rr_required_${guildId}`, role.id);
      return interaction.reply({ embeds: [successEmbed('Required Role', `${role} is now required to use reaction roles.`)] });
    }

    if (sub === 'reset') {
      await db.delete(`rr_mode_${guildId}`);
      await db.delete(`rr_limit_${guildId}`);
      await db.delete(`rr_required_${guildId}`);
      return interaction.reply({ embeds: [successEmbed('Reset', 'Reaction role settings reset.')] });
    }
  }
};
