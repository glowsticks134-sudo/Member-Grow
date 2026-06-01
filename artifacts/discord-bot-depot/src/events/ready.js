const { ActivityType } = require('discord.js');
const { registerCommands } = require('../handlers/commandHandler');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[BOT] Logged in as ${client.user.tag}`);
    console.log(`[BOT] Serving ${client.guilds.cache.size} server(s)`);

    const activities = [
      { name: 'Member Depot | /help', type: ActivityType.Watching },
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
