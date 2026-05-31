const { ActivityType } = require('discord.js');
const { registerCommands } = require('../handlers/commandHandler');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[BOT] Logged in as ${client.user.tag}`);
    console.log(`[BOT] Serving ${client.guilds.cache.size} server(s)`);

    try {
      const avatar = fs.readFileSync(path.join(__dirname, '../assets/avatar.jpeg'));
      await client.user.setAvatar(avatar);
      console.log('[BOT] Avatar set successfully');
    } catch (err) {
      console.log('[BOT] Could not set avatar (may already be set or rate limited):', err.message);
    }

    const activities = [
      { name: 'Member Grow | /help', type: ActivityType.Watching },
      { name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} members`, type: ActivityType.Watching },
      { name: 'Made by Stichachu13', type: ActivityType.Playing }
    ];

    let i = 0;
    function rotate() {
      const a = activities[i % activities.length];
      client.user.setActivity(a.name, { type: a.type });
      i++;
    }
    rotate();
    setInterval(rotate, 30000);

    await registerCommands(client);
  }
};
