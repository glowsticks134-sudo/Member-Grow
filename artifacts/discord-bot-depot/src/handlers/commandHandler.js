const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

function loadCommands(client) {
  client.slashCommands = new Map();

  const commandsPath = path.join(__dirname, '../commands');
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const mod = require(path.join(commandsPath, file));
    if (!mod.data || !mod.execute) continue;
    client.slashCommands.set(mod.data.name, mod);
  }

  console.log(`[CMD] Loaded ${client.slashCommands.size} slash command modules`);
}

async function registerCommands(client) {
  const rest = new REST().setToken(process.env.TOKEN_1);
  const commands = [...client.slashCommands.values()].map(c => c.data.toJSON());

  try {
    console.log(`[CMD] Registering ${commands.length} slash commands globally...`);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('[CMD] Slash commands registered successfully.');
  } catch (err) {
    console.error('[CMD] Failed to register commands:', err);
  }
}

module.exports = { loadCommands, registerCommands };
