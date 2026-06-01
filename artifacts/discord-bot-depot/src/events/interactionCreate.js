const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const db = require('../utils/database');

module.exports = {
  name: 'interactionCreate',
  async execute(client, interaction) {

    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;
      const { isOwner } = require('../config');
      const db = require('../utils/database');
      if (command.ownerOnly && !isOwner(interaction.user.id)) {
        return interaction.reply({ content: '❌ You do not have permission to use this command.', ephemeral: true });
      }
      const botBan = await db.get(`botban_${interaction.user.id}`);
      if (botBan) {
        return interaction.reply({ content: `🚫 You are banned from using this bot.\nReason: ${botBan.reason}`, ephemeral: true });
      }
      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(`[CMD ERROR] /${interaction.commandName}:`, err);
        const errMsg = { embeds: [errorEmbed('Something went wrong running that command.')], ephemeral: true };
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(errMsg).catch(() => null);
        } else {
          await interaction.reply(errMsg).catch(() => null);
        }
      }
      return;
    }

    if (!interaction.isButton()) return;

    const { customId, guild, member, user } = interaction;

    if (customId === 'ticket_create') {
      const roleId = await db.get(`ticket_role_${guild.id}`);
      const catId = await db.get(`ticket_category_${guild.id}`);
      const max = (await db.get(`ticket_max_${guild.id}`)) || 1;

      const existing = guild.channels.cache.filter(c => c.topic === `ticket-${user.id}`);
      if (existing.size >= max) {
        return interaction.reply({ embeds: [errorEmbed('You already have an open ticket!')], ephemeral: true });
      }

      let count = (await db.get(`ticket_count_${guild.id}`)) || 0;
      count++;
      await db.set(`ticket_count_${guild.id}`, count);

      const perms = [
        { id: guild.id, deny: ['ViewChannel'] },
        { id: user.id, allow: ['ViewChannel', 'SendMessages', 'AttachFiles'] }
      ];
      if (roleId) {
        const role = guild.roles.cache.get(roleId);
        if (role) perms.push({ id: role.id, allow: ['ViewChannel', 'SendMessages'] });
      }

      const ch = await guild.channels.create({
        name: `ticket-${count}`,
        topic: `ticket-${user.id}`,
        parent: catId || null,
        permissionOverwrites: perms
      });

      await db.set(`ticket_${guild.id}_${ch.id}`, { userId: user.id, channelId: ch.id, created: Date.now() });

      const customMsg = await db.get(`ticket_message_${guild.id}`);
      const embed = new EmbedBuilder()
        .setColor(BRAND_COLOR)
        .setTitle('🎫 Ticket Opened')
        .setDescription(customMsg || `Hello ${user}! A staff member will assist you shortly.\n\nPlease describe your issue.`)
        .addFields({ name: 'Close Ticket', value: 'Use `/tickets close` when resolved.' })
        .setFooter({ text: CREDITS })
        .setTimestamp();

      await ch.send({ content: roleId ? `<@&${roleId}>` : undefined, embeds: [embed] });
      interaction.reply({ embeds: [successEmbed('Ticket Created', `Your ticket has been opened: ${ch}`)], ephemeral: true });

      const logChId = await db.get(`ticket_log_${guild.id}`);
      if (logChId) {
        const logCh = guild.channels.cache.get(logChId);
        if (logCh) logCh.send({ embeds: [infoEmbed('🎫 Ticket Opened', `${user.tag} opened ${ch}`).setTimestamp()] });
      }
    }

    else if (customId === 'giveaway_enter') {
      const msgId = interaction.message.id;
      const id = `${guild.id}_${msgId}`;
      const giveaway = await db.get(`giveaway_${id}`);

      if (!giveaway) return interaction.reply({ content: '❌ Giveaway not found.', ephemeral: true });
      if (giveaway.ended) return interaction.reply({ content: '❌ This giveaway has ended.', ephemeral: true });
      if (giveaway.paused) return interaction.reply({ content: '⏸️ This giveaway is paused.', ephemeral: true });

      const blacklist = (await db.get(`gblacklist_${guild.id}`)) || [];
      if (blacklist.includes(user.id)) return interaction.reply({ content: '❌ You are blacklisted from giveaways.', ephemeral: true });

      const reqRoleId = await db.get(`giveaway_req_${guild.id}`);
      if (reqRoleId && !member.roles.cache.has(reqRoleId)) {
        return interaction.reply({ content: `❌ You need the <@&${reqRoleId}> role to enter.`, ephemeral: true });
      }

      if (giveaway.entries.includes(user.id)) {
        const idx = giveaway.entries.indexOf(user.id);
        giveaway.entries.splice(idx, 1);
        await db.set(`giveaway_${id}`, giveaway);
        const embed = EmbedBuilder.from(interaction.message.embeds[0]).setFields({ name: 'Entries', value: String(giveaway.entries.length), inline: true });
        await interaction.message.edit({ embeds: [embed] });
        return interaction.reply({ content: '✅ You have left the giveaway.', ephemeral: true });
      }

      giveaway.entries.push(user.id);
      await db.set(`giveaway_${id}`, giveaway);
      const embed = EmbedBuilder.from(interaction.message.embeds[0]).setFields({ name: 'Entries', value: String(giveaway.entries.length), inline: true });
      await interaction.message.edit({ embeds: [embed] });
      interaction.reply({ content: `🎉 You entered the giveaway for **${giveaway.prize}**!`, ephemeral: true });
    }
  }
};
