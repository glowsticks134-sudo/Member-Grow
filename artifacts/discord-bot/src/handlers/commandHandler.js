const fs = require('fs');
const path = require('path');

function loadCommands(client) {
  client.commands = new Map();
  client.aliases = new Map();
  client.categories = new Map();

  const commandsPath = path.join(__dirname, '../commands');
  const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

  for (const file of files) {
    const mod = require(path.join(commandsPath, file));
    if (!mod.commands) continue;
    const category = mod.category || file.replace('.js', '');
    const catCommands = [];
    for (const cmd of mod.commands) {
      cmd.category = category;
      client.commands.set(cmd.name, cmd);
      catCommands.push(cmd);
      if (cmd.aliases) {
        for (const alias of cmd.aliases) {
          client.aliases.set(alias, cmd.name);
        }
      }
    }
    client.categories.set(category, catCommands);
  }

  console.log(`[CMD] Loaded ${client.commands.size} commands across ${client.categories.size} categories`);
}

module.exports = { loadCommands };
