const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`[BOT] Logged in as ${client.user.tag}`);
    console.log(`[BOT] Serving ${client.guilds.cache.size} server(s)`);
    console.log(`[BOT] ${client.commands.size} commands loaded`);

    const activities = [
      { name: 'Member Grow | !help', type: ActivityType.Watching },
      { name: `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} members`, type: ActivityType.Watching },
      { name: `${client.commands.size} commands | !help`, type: ActivityType.Listening },
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
  }
};
