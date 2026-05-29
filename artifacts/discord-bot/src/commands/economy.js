const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, warnEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { randomInt, randomItem, abbreviate } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Economy';

const DAILY_AMOUNT = 500;
const WEEKLY_AMOUNT = 2000;
const MONTHLY_AMOUNT = 10000;
const WORK_MIN = 100;
const WORK_MAX = 400;

async function getBalance(userId) {
  const data = (await db.get(`eco_${userId}`)) || { wallet: 0, bank: 0, xp: 0 };
  return data;
}
async function setBalance(userId, data) {
  await db.set(`eco_${userId}`, data);
}

const workJobs = ['You coded a website', 'You delivered pizzas', 'You walked dogs', 'You fixed a computer', 'You drove for Uber', 'You sold lemonade', 'You streamed on Twitch', 'You wrote an article', 'You tutored students', 'You cleaned houses'];
const crimeResults = ['You robbed a convenience store', 'You pickpocketed someone', 'You hacked a database', 'You scammed a tourist', 'You ran a con'];
const begResults = ['Someone felt sorry for you', 'A kind stranger gave you coins', 'You found money on the ground', 'Nobody gave you anything', 'A rich person donated'];

const shopItems = [
  { id: 'fishingrod', name: '🎣 Fishing Rod', price: 500, description: 'Needed to fish' },
  { id: 'gun', name: '🔫 Gun', price: 1000, description: 'Used for hunting' },
  { id: 'pickaxe', name: '⛏️ Pickaxe', price: 750, description: 'Used for mining' },
  { id: 'axe', name: '🪓 Axe', price: 600, description: 'Used for chopping' },
  { id: 'laptop', name: '💻 Laptop', price: 2000, description: 'Used for hacking' },
  { id: 'shield', name: '🛡️ Shield', price: 1500, description: 'Protects from robbery' },
  { id: 'luckycharm', name: '🍀 Lucky Charm', price: 3000, description: 'Increases luck' }
];

const commands = [
  {
    name: 'balance',
    description: 'Check your or someone\'s balance',
    usage: '!balance [user]',
    aliases: ['bal', 'money'],
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      const data = await getBalance(target.id);
      message.reply({ embeds: [infoEmbed(`💰 ${target.username}'s Balance`, `**Wallet:** $${abbreviate(data.wallet)}\n**Bank:** $${abbreviate(data.bank)}\n**Total:** $${abbreviate(data.wallet + data.bank)}`)] });
    }
  },
  {
    name: 'daily',
    description: 'Claim your daily reward',
    usage: '!daily',
    async execute(message, args) {
      const key = `daily_${message.author.id}`;
      const last = await db.get(key);
      const now = Date.now();
      const cooldown = 86400000;
      if (last && now - last < cooldown) {
        const remaining = cooldown - (now - last);
        const hours = Math.floor(remaining / 3600000);
        const mins = Math.floor((remaining % 3600000) / 60000);
        return message.reply({ embeds: [warnEmbed('⏳ Daily Cooldown', `Come back in **${hours}h ${mins}m**.`)] });
      }
      await db.set(key, now);
      const data = await getBalance(message.author.id);
      data.wallet += DAILY_AMOUNT;
      await setBalance(message.author.id, data);
      message.reply({ embeds: [successEmbed('💰 Daily Claimed!', `You received **$${DAILY_AMOUNT}**!\nNew balance: **$${abbreviate(data.wallet)}**`)] });
    }
  },
  {
    name: 'weekly',
    description: 'Claim your weekly reward',
    usage: '!weekly',
    async execute(message, args) {
      const key = `weekly_${message.author.id}`;
      const last = await db.get(key);
      const now = Date.now();
      const cooldown = 604800000;
      if (last && now - last < cooldown) {
        const remaining = cooldown - (now - last);
        const days = Math.floor(remaining / 86400000);
        const hours = Math.floor((remaining % 86400000) / 3600000);
        return message.reply({ embeds: [warnEmbed('⏳ Weekly Cooldown', `Come back in **${days}d ${hours}h**.`)] });
      }
      await db.set(key, now);
      const data = await getBalance(message.author.id);
      data.wallet += WEEKLY_AMOUNT;
      await setBalance(message.author.id, data);
      message.reply({ embeds: [successEmbed('💰 Weekly Claimed!', `You received **$${WEEKLY_AMOUNT}**!\nNew balance: **$${abbreviate(data.wallet)}**`)] });
    }
  },
  {
    name: 'monthly',
    description: 'Claim your monthly reward',
    usage: '!monthly',
    async execute(message, args) {
      const key = `monthly_${message.author.id}`;
      const last = await db.get(key);
      const now = Date.now();
      const cooldown = 2592000000;
      if (last && now - last < cooldown) {
        const remaining = cooldown - (now - last);
        const days = Math.floor(remaining / 86400000);
        return message.reply({ embeds: [warnEmbed('⏳ Monthly Cooldown', `Come back in **${days}d**.`)] });
      }
      await db.set(key, now);
      const data = await getBalance(message.author.id);
      data.wallet += MONTHLY_AMOUNT;
      await setBalance(message.author.id, data);
      message.reply({ embeds: [successEmbed('💰 Monthly Claimed!', `You received **$${MONTHLY_AMOUNT}**!\nNew balance: **$${abbreviate(data.wallet)}**`)] });
    }
  },
  {
    name: 'work',
    description: 'Work to earn money',
    usage: '!work',
    async execute(message, args) {
      const key = `work_${message.author.id}`;
      const last = await db.get(key);
      const now = Date.now();
      if (last && now - last < 3600000) {
        const remaining = 3600000 - (now - last);
        const mins = Math.ceil(remaining / 60000);
        return message.reply({ embeds: [warnEmbed('⏳ Work Cooldown', `You can work again in **${mins}m**.`)] });
      }
      const earned = randomInt(WORK_MIN, WORK_MAX);
      await db.set(key, now);
      const data = await getBalance(message.author.id);
      data.wallet += earned;
      await setBalance(message.author.id, data);
      message.reply({ embeds: [successEmbed('💼 Work Complete', `${randomItem(workJobs)} and earned **$${earned}**!`)] });
    }
  },
  {
    name: 'crime',
    description: 'Commit a crime to earn money (risky!)',
    usage: '!crime',
    async execute(message, args) {
      const key = `crime_${message.author.id}`;
      const last = await db.get(key);
      const now = Date.now();
      if (last && now - last < 7200000) {
        const remaining = 7200000 - (now - last);
        const mins = Math.ceil(remaining / 60000);
        return message.reply({ embeds: [warnEmbed('⏳ Crime Cooldown', `You can commit a crime again in **${mins}m**.`)] });
      }
      await db.set(key, now);
      const success = Math.random() < 0.6;
      const data = await getBalance(message.author.id);
      if (success) {
        const earned = randomInt(200, 800);
        data.wallet += earned;
        await setBalance(message.author.id, data);
        return message.reply({ embeds: [successEmbed('🦹 Crime Success!', `${randomItem(crimeResults)} and got away with **$${earned}**!`)] });
      } else {
        const fine = randomInt(100, 400);
        data.wallet = Math.max(0, data.wallet - fine);
        await setBalance(message.author.id, data);
        return message.reply({ embeds: [errorEmbed(`🚔 You got caught! Fined **$${fine}**.`)] });
      }
    }
  },
  {
    name: 'beg',
    description: 'Beg for some money',
    usage: '!beg',
    async execute(message, args) {
      const key = `beg_${message.author.id}`;
      const last = await db.get(key);
      const now = Date.now();
      if (last && now - last < 600000) {
        const remaining = 600000 - (now - last);
        return message.reply({ embeds: [warnEmbed('⏳ Beg Cooldown', `Wait **${Math.ceil(remaining / 60000)}m**.`)] });
      }
      await db.set(key, now);
      const success = Math.random() < 0.7;
      if (success) {
        const earned = randomInt(10, 100);
        const data = await getBalance(message.author.id);
        data.wallet += earned;
        await setBalance(message.author.id, data);
        return message.reply({ embeds: [successEmbed('🙏 Begging', `${randomItem(begResults)} and you got **$${earned}**!`)] });
      }
      message.reply({ embeds: [infoEmbed('🙏 Begging', 'Nobody gave you anything this time...')] });
    }
  },
  {
    name: 'deposit',
    description: 'Deposit money into your bank',
    usage: '!deposit <amount/all>',
    aliases: ['dep'],
    async execute(message, args) {
      const data = await getBalance(message.author.id);
      const amount = args[0]?.toLowerCase() === 'all' ? data.wallet : parseInt(args[0]);
      if (isNaN(amount) || amount <= 0) return message.reply({ embeds: [errorEmbed('Invalid amount.')] });
      if (amount > data.wallet) return message.reply({ embeds: [errorEmbed(`You only have $${data.wallet} in your wallet.`)] });
      data.wallet -= amount;
      data.bank += amount;
      await setBalance(message.author.id, data);
      message.reply({ embeds: [successEmbed('🏦 Deposited', `Deposited **$${amount}** into your bank.\nWallet: $${abbreviate(data.wallet)} | Bank: $${abbreviate(data.bank)}`)] });
    }
  },
  {
    name: 'withdraw',
    description: 'Withdraw money from your bank',
    usage: '!withdraw <amount/all>',
    aliases: ['with'],
    async execute(message, args) {
      const data = await getBalance(message.author.id);
      const amount = args[0]?.toLowerCase() === 'all' ? data.bank : parseInt(args[0]);
      if (isNaN(amount) || amount <= 0) return message.reply({ embeds: [errorEmbed('Invalid amount.')] });
      if (amount > data.bank) return message.reply({ embeds: [errorEmbed(`You only have $${data.bank} in your bank.`)] });
      data.bank -= amount;
      data.wallet += amount;
      await setBalance(message.author.id, data);
      message.reply({ embeds: [successEmbed('🏦 Withdrawn', `Withdrew **$${amount}** from your bank.\nWallet: $${abbreviate(data.wallet)} | Bank: $${abbreviate(data.bank)}`)] });
    }
  },
  {
    name: 'pay',
    description: 'Pay another user',
    usage: '!pay <user> <amount>',
    aliases: ['transfer', 'give'],
    async execute(message, args) {
      const target = message.mentions.users.first();
      if (!target || target.bot) return message.reply({ embeds: [errorEmbed('Please mention a valid user.')] });
      if (target.id === message.author.id) return message.reply({ embeds: [errorEmbed("You can't pay yourself.")] });
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) return message.reply({ embeds: [errorEmbed('Invalid amount.')] });
      const senderData = await getBalance(message.author.id);
      if (amount > senderData.wallet) return message.reply({ embeds: [errorEmbed(`You only have $${senderData.wallet} in your wallet.`)] });
      senderData.wallet -= amount;
      await setBalance(message.author.id, senderData);
      const receiverData = await getBalance(target.id);
      receiverData.wallet += amount;
      await setBalance(target.id, receiverData);
      message.reply({ embeds: [successEmbed('💸 Transfer', `Sent **$${amount}** to ${target.username}.`)] });
    }
  },
  {
    name: 'shop',
    description: 'View the item shop',
    usage: '!shop',
    async execute(message, args) {
      const list = shopItems.map(i => `**${i.name}** — $${i.price}\n*${i.description}*`).join('\n\n');
      message.reply({ embeds: [infoEmbed('🛒 Item Shop', list + `\n\nUse \`!buy <item>\` to purchase.`)] });
    }
  },
  {
    name: 'buy',
    description: 'Buy an item from the shop',
    usage: '!buy <item>',
    async execute(message, args) {
      const itemName = args.join(' ').toLowerCase();
      const item = shopItems.find(i => i.id === itemName || i.name.toLowerCase().includes(itemName));
      if (!item) return message.reply({ embeds: [errorEmbed('Item not found. Use `!shop` to view items.')] });
      const data = await getBalance(message.author.id);
      if (data.wallet < item.price) return message.reply({ embeds: [errorEmbed(`You need $${item.price} but only have $${data.wallet}.`)] });
      data.wallet -= item.price;
      const inv = (await db.get(`inv_${message.author.id}`)) || {};
      inv[item.id] = (inv[item.id] || 0) + 1;
      await db.set(`inv_${message.author.id}`, inv);
      await setBalance(message.author.id, data);
      message.reply({ embeds: [successEmbed('🛒 Purchased', `You bought **${item.name}** for $${item.price}!`)] });
    }
  },
  {
    name: 'sell',
    description: 'Sell an item from your inventory',
    usage: '!sell <item>',
    async execute(message, args) {
      const itemName = args.join(' ').toLowerCase();
      const item = shopItems.find(i => i.id === itemName || i.name.toLowerCase().includes(itemName));
      if (!item) return message.reply({ embeds: [errorEmbed('Item not found.')] });
      const inv = (await db.get(`inv_${message.author.id}`)) || {};
      if (!inv[item.id]) return message.reply({ embeds: [errorEmbed("You don't have that item.")] });
      inv[item.id]--;
      if (inv[item.id] <= 0) delete inv[item.id];
      await db.set(`inv_${message.author.id}`, inv);
      const sellPrice = Math.floor(item.price * 0.5);
      const data = await getBalance(message.author.id);
      data.wallet += sellPrice;
      await setBalance(message.author.id, data);
      message.reply({ embeds: [successEmbed('💰 Sold', `Sold **${item.name}** for $${sellPrice}.`)] });
    }
  },
  {
    name: 'inventory',
    description: 'View your inventory',
    usage: '!inventory [user]',
    aliases: ['inv', 'bag'],
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      const inv = (await db.get(`inv_${target.id}`)) || {};
      const items = Object.entries(inv);
      if (!items.length) return message.reply({ embeds: [infoEmbed(`🎒 ${target.username}'s Inventory`, 'Empty.')] });
      const list = items.map(([id, qty]) => {
        const item = shopItems.find(i => i.id === id);
        return `${item?.name || id} × ${qty}`;
      }).join('\n');
      message.reply({ embeds: [infoEmbed(`🎒 ${target.username}'s Inventory`, list)] });
    }
  },
  {
    name: 'gamble',
    description: 'Gamble your money',
    usage: '!gamble <amount>',
    aliases: ['bet'],
    async execute(message, args) {
      const amount = parseInt(args[0]);
      if (isNaN(amount) || amount < 1) return message.reply({ embeds: [errorEmbed('Please provide a valid amount.')] });
      const data = await getBalance(message.author.id);
      if (amount > data.wallet) return message.reply({ embeds: [errorEmbed(`You only have $${data.wallet}.`)] });
      const win = Math.random() < 0.45;
      if (win) {
        data.wallet += amount;
        await setBalance(message.author.id, data);
        return message.reply({ embeds: [successEmbed('🎰 You Won!', `You won **$${amount}**! Balance: $${abbreviate(data.wallet)}`)] });
      } else {
        data.wallet -= amount;
        await setBalance(message.author.id, data);
        return message.reply({ embeds: [errorEmbed(`🎰 You Lost $${amount}. Balance: $${abbreviate(data.wallet)}`)] });
      }
    }
  },
  {
    name: 'blackjack',
    description: 'Play blackjack',
    usage: '!blackjack <amount>',
    aliases: ['bj'],
    async execute(message, args) {
      const amount = parseInt(args[0]);
      if (isNaN(amount) || amount < 1) return message.reply({ embeds: [errorEmbed('Please provide a valid amount.')] });
      const data = await getBalance(message.author.id);
      if (amount > data.wallet) return message.reply({ embeds: [errorEmbed(`You only have $${data.wallet}.`)] });

      function drawCard() {
        const vals = [2,3,4,5,6,7,8,9,10,10,10,10,11];
        return randomItem(vals);
      }

      let player = drawCard() + drawCard();
      let dealer = drawCard() + drawCard();

      const result = player > 21 ? 'bust' : player === 21 ? 'blackjack' : dealer > 21 ? 'win' : player > dealer ? 'win' : player === dealer ? 'tie' : 'lose';

      if (result === 'win' || result === 'blackjack') {
        const mult = result === 'blackjack' ? 1.5 : 1;
        const winAmount = Math.floor(amount * mult);
        data.wallet += winAmount;
        await setBalance(message.author.id, data);
        return message.reply({ embeds: [successEmbed('🃏 Blackjack — Win!', `You: ${player} | Dealer: ${dealer}\nYou won **$${winAmount}**! Balance: $${abbreviate(data.wallet)}`)] });
      } else if (result === 'tie') {
        return message.reply({ embeds: [infoEmbed('🃏 Blackjack — Tie', `You: ${player} | Dealer: ${dealer}\nYour bet has been returned.`)] });
      } else {
        data.wallet -= amount;
        await setBalance(message.author.id, data);
        return message.reply({ embeds: [errorEmbed(`🃏 Blackjack — You Lost!\nYou: ${player} | Dealer: ${dealer}\nLost **$${amount}**. Balance: $${abbreviate(data.wallet)}`)] });
      }
    }
  },
  {
    name: 'rob',
    description: 'Try to rob another user',
    usage: '!rob <user>',
    async execute(message, args) {
      const target = message.mentions.users.first();
      if (!target || target.bot) return message.reply({ embeds: [errorEmbed('Please mention a valid user.')] });
      if (target.id === message.author.id) return message.reply({ embeds: [errorEmbed("You can't rob yourself.")] });

      const key = `rob_${message.author.id}`;
      const last = await db.get(key);
      const now = Date.now();
      if (last && now - last < 3600000) {
        const remaining = 3600000 - (now - last);
        return message.reply({ embeds: [warnEmbed('⏳ Rob Cooldown', `Wait **${Math.ceil(remaining / 60000)}m**.`)] });
      }

      await db.set(key, now);
      const targetData = await getBalance(target.id);
      if (targetData.wallet < 100) return message.reply({ embeds: [infoEmbed('😅 Rob Failed', `${target.username} doesn't have enough money to rob.`)] });

      const success = Math.random() < 0.4;
      if (success) {
        const amount = Math.floor(targetData.wallet * randomInt(10, 40) / 100);
        targetData.wallet -= amount;
        await setBalance(target.id, targetData);
        const senderData = await getBalance(message.author.id);
        senderData.wallet += amount;
        await setBalance(message.author.id, senderData);
        return message.reply({ embeds: [successEmbed('🦹 Rob Success!', `You stole **$${amount}** from ${target.username}!`)] });
      } else {
        const fine = randomInt(50, 200);
        const senderData = await getBalance(message.author.id);
        senderData.wallet = Math.max(0, senderData.wallet - fine);
        await setBalance(message.author.id, senderData);
        return message.reply({ embeds: [errorEmbed(`🚔 You got caught robbing ${target.username}! Fined **$${fine}**.`)] });
      }
    }
  },
  {
    name: 'richleaderboard',
    description: 'View the richest users',
    usage: '!richleaderboard',
    aliases: ['richest', 'ecoleaderboard', 'ecolb'],
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('💰 Richest Users', 'Leaderboard not available — data is per-user. Use `!balance <user>` to check someone.')] });
    }
  },
  {
    name: 'fish',
    description: 'Go fishing',
    usage: '!fish',
    async execute(message, args) {
      const inv = (await db.get(`inv_${message.author.id}`)) || {};
      if (!inv['fishingrod']) return message.reply({ embeds: [errorEmbed('You need a 🎣 Fishing Rod! Buy one with `!buy fishingrod`.')] });

      const key = `fish_${message.author.id}`;
      const last = await db.get(key);
      const now = Date.now();
      if (last && now - last < 1800000) {
        const remaining = 1800000 - (now - last);
        return message.reply({ embeds: [warnEmbed('⏳ Fishing Cooldown', `Wait **${Math.ceil(remaining / 60000)}m**.`)] });
      }
      await db.set(key, now);

      const catches = ['🐟 Common Fish', '🐠 Tropical Fish', '🐡 Blowfish', '🦈 Shark', '🐙 Octopus', '🦞 Lobster', '🦑 Squid', '🐚 Shell (nothing useful)'];
      const values = [50, 120, 80, 500, 300, 250, 200, 10];
      const idx = randomInt(0, catches.length - 1);
      const earned = values[idx];
      const data = await getBalance(message.author.id);
      data.wallet += earned;
      await setBalance(message.author.id, data);
      message.reply({ embeds: [successEmbed('🎣 Fishing', `You caught a **${catches[idx]}** and sold it for **$${earned}**!`)] });
    }
  },
  {
    name: 'hunt',
    description: 'Go hunting',
    usage: '!hunt',
    async execute(message, args) {
      const inv = (await db.get(`inv_${message.author.id}`)) || {};
      if (!inv['gun']) return message.reply({ embeds: [errorEmbed('You need a 🔫 Gun! Buy one with `!buy gun`.')] });

      const key = `hunt_${message.author.id}`;
      const last = await db.get(key);
      const now = Date.now();
      if (last && now - last < 1800000) {
        return message.reply({ embeds: [warnEmbed('⏳ Hunt Cooldown', `Wait.`)] });
      }
      await db.set(key, now);

      const animals = ['🐇 Rabbit', '🦊 Fox', '🐗 Boar', '🦌 Deer', '🐺 Wolf', '🐻 Bear', '🦁 Lion'];
      const values = [100, 200, 300, 400, 500, 700, 1000];
      const idx = randomInt(0, animals.length - 1);
      const earned = values[idx];
      const data = await getBalance(message.author.id);
      data.wallet += earned;
      await setBalance(message.author.id, data);
      message.reply({ embeds: [successEmbed('🔫 Hunting', `You hunted a **${animals[idx]}** and sold it for **$${earned}**!`)] });
    }
  },
  {
    name: 'mine',
    description: 'Go mining',
    usage: '!mine',
    async execute(message, args) {
      const inv = (await db.get(`inv_${message.author.id}`)) || {};
      if (!inv['pickaxe']) return message.reply({ embeds: [errorEmbed('You need a ⛏️ Pickaxe! Buy one with `!buy pickaxe`.')] });

      const key = `mine_${message.author.id}`;
      const last = await db.get(key);
      const now = Date.now();
      if (last && now - last < 1800000) return message.reply({ embeds: [warnEmbed('⏳ Mining Cooldown', `Wait.`)] });
      await db.set(key, now);

      const resources = ['🪨 Stone', '🔩 Iron', '⚙️ Steel', '💎 Diamond', '🥇 Gold', '💍 Ruby'];
      const values = [50, 150, 300, 600, 450, 800];
      const idx = randomInt(0, resources.length - 1);
      const earned = values[idx];
      const data = await getBalance(message.author.id);
      data.wallet += earned;
      await setBalance(message.author.id, data);
      message.reply({ embeds: [successEmbed('⛏️ Mining', `You mined **${resources[idx]}** and sold it for **$${earned}**!`)] });
    }
  },
  {
    name: 'chop',
    description: 'Chop wood',
    usage: '!chop',
    async execute(message, args) {
      const inv = (await db.get(`inv_${message.author.id}`)) || {};
      if (!inv['axe']) return message.reply({ embeds: [errorEmbed('You need a 🪓 Axe! Buy one with `!buy axe`.')] });

      const key = `chop_${message.author.id}`;
      const last = await db.get(key);
      const now = Date.now();
      if (last && now - last < 1800000) return message.reply({ embeds: [warnEmbed('⏳ Chop Cooldown', `Wait.`)] });
      await db.set(key, now);

      const woods = ['🌲 Pine', '🌳 Oak', '🎋 Bamboo', '🍁 Maple', '🌴 Palm'];
      const values = [80, 120, 100, 200, 150];
      const idx = randomInt(0, woods.length - 1);
      const earned = values[idx];
      const data = await getBalance(message.author.id);
      data.wallet += earned;
      await setBalance(message.author.id, data);
      message.reply({ embeds: [successEmbed('🪓 Chopping', `You chopped **${woods[idx]}** and sold it for **$${earned}**!`)] });
    }
  },
  {
    name: 'leaderboard',
    description: 'View the economy leaderboard',
    usage: '!leaderboard',
    aliases: ['lb', 'top'],
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('🏆 Economy Leaderboard', 'Use `!balance <user>` to check balances. Global leaderboard tracks top earners.')] });
    }
  },
  {
    name: 'setmoney',
    description: 'Set a user\'s balance (Admin)',
    usage: '!setmoney <user> <amount>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [errorEmbed('Please mention a user.')] });
      const amount = parseInt(args[1]);
      if (isNaN(amount)) return message.reply({ embeds: [errorEmbed('Invalid amount.')] });
      const data = await getBalance(target.id);
      data.wallet = amount;
      await setBalance(target.id, data);
      message.reply({ embeds: [successEmbed('💰 Balance Set', `${target.username}'s wallet set to $${amount}.`)] });
    }
  },
  {
    name: 'addmoney',
    description: 'Add money to a user (Admin)',
    usage: '!addmoney <user> <amount>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [errorEmbed('Please mention a user.')] });
      const amount = parseInt(args[1]);
      if (isNaN(amount)) return message.reply({ embeds: [errorEmbed('Invalid amount.')] });
      const data = await getBalance(target.id);
      data.wallet += amount;
      await setBalance(target.id, data);
      message.reply({ embeds: [successEmbed('💰 Money Added', `Added $${amount} to ${target.username}.`)] });
    }
  },
  {
    name: 'removemoney',
    description: 'Remove money from a user (Admin)',
    usage: '!removemoney <user> <amount>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [errorEmbed('Please mention a user.')] });
      const amount = parseInt(args[1]);
      if (isNaN(amount)) return message.reply({ embeds: [errorEmbed('Invalid amount.')] });
      const data = await getBalance(target.id);
      data.wallet = Math.max(0, data.wallet - amount);
      await setBalance(target.id, data);
      message.reply({ embeds: [successEmbed('💰 Money Removed', `Removed $${amount} from ${target.username}.`)] });
    }
  },
  {
    name: 'reseteconomy',
    description: 'Reset a user\'s economy data (Admin)',
    usage: '!reseteconomy <user>',
    async execute(message, args) {
      if (!message.member.permissions.has(8n)) return message.reply({ embeds: [errorEmbed('Admin only.')] });
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [errorEmbed('Please mention a user.')] });
      await db.delete(`eco_${target.id}`);
      await db.delete(`inv_${target.id}`);
      message.reply({ embeds: [successEmbed('♻️ Economy Reset', `${target.username}'s economy data has been reset.`)] });
    }
  }
];

module.exports = { category, commands };
