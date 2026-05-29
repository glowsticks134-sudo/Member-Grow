const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { randomInt, randomItem } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Games';

const triviaQuestions = [
  { q: 'What is the capital of France?', a: 'paris', hint: 'City of Light' },
  { q: 'How many planets are in our solar system?', a: '8', hint: 'Not 9 anymore!' },
  { q: 'What is 12 × 12?', a: '144', hint: 'Dozen squared' },
  { q: 'What gas do plants absorb?', a: 'carbon dioxide', hint: 'CO2' },
  { q: 'Who wrote Romeo and Juliet?', a: 'shakespeare', hint: 'The Bard' },
  { q: 'What is the largest ocean?', a: 'pacific', hint: 'It covers 165 million km²' },
  { q: 'What is the hardest natural substance?', a: 'diamond', hint: '💎' },
  { q: 'How many continents are there?', a: '7', hint: 'Count them!' },
  { q: 'What language does the word "robot" come from?', a: 'czech', hint: 'Slavic language' },
  { q: 'What is the speed of light in km/s?', a: '300000', hint: '3 × 10⁵' }
];

const commands = [
  {
    name: 'trivia',
    description: 'Answer a trivia question',
    usage: '!trivia',
    async execute(message, args) {
      const q = randomItem(triviaQuestions);
      const embed = infoEmbed('🧠 Trivia', `${q.q}\n\n*Hint: ${q.hint}*\n\nType your answer below! You have **15 seconds**.`);
      await message.reply({ embeds: [embed] });
      const filter = m => m.author.id === message.author.id;
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 15000 }).catch(() => null);
      if (!collected || !collected.size) {
        return message.channel.send({ embeds: [errorEmbed(`⏰ Time's up! The answer was **${q.a}**.`)] });
      }
      const answer = collected.first().content.toLowerCase().trim();
      if (answer === q.a || q.a.includes(answer)) {
        message.channel.send({ embeds: [successEmbed('✅ Correct!', `The answer is **${q.a}**. Well done, ${message.author}!`)] });
      } else {
        message.channel.send({ embeds: [errorEmbed(`❌ Wrong! The correct answer was **${q.a}**.`)] });
      }
    }
  },
  {
    name: 'numguess',
    description: 'Guess a number between 1 and 100',
    usage: '!numguess',
    aliases: ['guess', 'numberguess'],
    async execute(message, args) {
      const num = randomInt(1, 100);
      let tries = 0;
      const max = 7;
      await message.reply({ embeds: [infoEmbed('🎯 Number Guess', `I'm thinking of a number between **1-100**. You have **${max} tries**!`)] });
      const filter = m => m.author.id === message.author.id && !isNaN(m.content);
      let won = false;
      while (tries < max) {
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
        if (!collected || !collected.size) break;
        const guess = parseInt(collected.first().content);
        tries++;
        if (guess === num) {
          won = true;
          break;
        } else if (guess < num) {
          await message.channel.send({ embeds: [infoEmbed(null, `📈 Too low! ${max - tries} tries left.`)] });
        } else {
          await message.channel.send({ embeds: [infoEmbed(null, `📉 Too high! ${max - tries} tries left.`)] });
        }
      }
      if (won) {
        message.channel.send({ embeds: [successEmbed('🎉 You got it!', `The number was **${num}**! Solved in **${tries}** tries.`)] });
      } else {
        message.channel.send({ embeds: [errorEmbed(`😢 Game over! The number was **${num}**.`)] });
      }
    }
  },
  {
    name: 'hangman',
    description: 'Play a game of hangman',
    usage: '!hangman',
    async execute(message, args) {
      const words = ['discord', 'javascript', 'server', 'channel', 'message', 'reaction', 'webhook', 'database', 'python', 'gaming'];
      const word = randomItem(words);
      let guessed = [];
      let wrong = 0;
      const maxWrong = 6;

      function display() {
        const shown = word.split('').map(c => guessed.includes(c) ? c : '_').join(' ');
        const stages = ['😊', '😟', '😦', '😧', '😨', '😰', '💀'];
        return `${stages[wrong]} | ${shown}\nWrong: ${wrong}/${maxWrong} | Used: ${guessed.join(', ') || 'None'}`;
      }

      const m = await message.reply({ embeds: [infoEmbed('🔤 Hangman', display() + '\nGuess a letter!')] });
      const filter = msg => msg.author.id === message.author.id && msg.content.length === 1 && /[a-z]/i.test(msg.content);

      while (wrong < maxWrong) {
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
        if (!collected || !collected.size) break;
        const letter = collected.first().content.toLowerCase();
        if (guessed.includes(letter)) { await message.channel.send('Already guessed!'); continue; }
        guessed.push(letter);
        if (!word.includes(letter)) wrong++;
        const allGuessed = word.split('').every(c => guessed.includes(c));
        if (allGuessed) {
          await m.edit({ embeds: [successEmbed('🎉 You Win!', `The word was **${word}**!`)] });
          return;
        }
        if (wrong < maxWrong) await m.edit({ embeds: [infoEmbed('🔤 Hangman', display())] });
      }
      await m.edit({ embeds: [errorEmbed(`💀 Game Over! The word was **${word}**.`)] });
    }
  },
  {
    name: 'tictactoe',
    description: 'Play Tic-Tac-Toe against someone',
    usage: '!tictactoe <user>',
    aliases: ['ttt'],
    async execute(message, args) {
      const opponent = message.mentions.users.first();
      if (!opponent || opponent.bot) return message.reply({ embeds: [errorEmbed('Please mention a valid user.')] });
      if (opponent.id === message.author.id) return message.reply({ embeds: [errorEmbed("You can't play against yourself.")] });

      const board = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
      const players = [message.author, opponent];
      let turn = 0;

      function checkWin(b, sym) {
        const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        return wins.some(([a,c,d]) => b[a] === sym && b[c] === sym && b[d] === sym);
      }

      function renderBoard() {
        return board.map((v, i) => v === 'X' ? '❌' : v === 'O' ? '⭕' : `\`${v}\``).join('').match(/.{1,9}/g).join('\n');
      }

      const msg = await message.reply({ embeds: [infoEmbed('❌ Tic-Tac-Toe', `${players[0]} vs ${players[1]}\n\n${renderBoard()}\n\n${players[0]}'s turn! Type 1-9 to place.`)] });

      for (let move = 0; move < 9; move++) {
        const current = players[turn % 2];
        const sym = turn % 2 === 0 ? 'X' : 'O';
        const filter = m => m.author.id === current.id && /^[1-9]$/.test(m.content) && board[parseInt(m.content) - 1] !== 'X' && board[parseInt(m.content) - 1] !== 'O';
        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
        if (!collected || !collected.size) {
          await msg.edit({ embeds: [errorEmbed(`⏰ ${current.username} took too long! Game over.`)] });
          return;
        }
        board[parseInt(collected.first().content) - 1] = sym;
        if (checkWin(board, sym)) {
          await msg.edit({ embeds: [successEmbed('🎉 Winner!', `${renderBoard()}\n\n${current} wins!`)] });
          return;
        }
        turn++;
        if (move < 8) await msg.edit({ embeds: [infoEmbed('❌ Tic-Tac-Toe', `${renderBoard()}\n\n${players[turn % 2]}'s turn!`)] });
      }
      await msg.edit({ embeds: [infoEmbed('🤝 Draw!', `${renderBoard()}\n\nIt's a draw!`)] });
    }
  },
  {
    name: 'scramble',
    description: 'Unscramble the word',
    usage: '!scramble',
    async execute(message, args) {
      const words = ['gaming', 'discord', 'server', 'channel', 'friend', 'member', 'boost', 'emoji', 'voice', 'admin'];
      const word = randomItem(words);
      const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
      await message.reply({ embeds: [infoEmbed('🔀 Scramble', `Unscramble: **${scrambled}**\n\nYou have **20 seconds**!`)] });
      const filter = m => m.author.id === message.author.id;
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 20000 }).catch(() => null);
      if (!collected || !collected.size) return message.channel.send({ embeds: [errorEmbed(`⏰ Time's up! The word was **${word}**.`)] });
      if (collected.first().content.toLowerCase() === word) {
        message.channel.send({ embeds: [successEmbed('✅ Correct!', `The word was **${word}**! Well done!`)] });
      } else {
        message.channel.send({ embeds: [errorEmbed(`❌ Wrong! The word was **${word}**.`)] });
      }
    }
  },
  {
    name: 'typerace',
    description: 'Type a sentence as fast as possible',
    usage: '!typerace',
    async execute(message, args) {
      const sentences = [
        'The quick brown fox jumps over the lazy dog',
        'Discord is the best chat app for gamers',
        'Member Grow is the best server ever',
        'Type this sentence as fast as you can',
        'The bot was made by Stichachu13 with love'
      ];
      const sentence = randomItem(sentences);
      await message.reply({ embeds: [infoEmbed('⌨️ Type Race', `Type the following sentence:\n\n**${sentence}**\n\nYou have **30 seconds**!`)] });
      const start = Date.now();
      const filter = m => m.author.id === message.author.id;
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
      if (!collected || !collected.size) return message.channel.send({ embeds: [errorEmbed("⏰ Time's up!")] });
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      const typed = collected.first().content;
      if (typed === sentence) {
        const wpm = Math.round((sentence.split(' ').length / elapsed) * 60);
        message.channel.send({ embeds: [successEmbed('✅ Done!', `Finished in **${elapsed}s** (~${wpm} WPM)!`)] });
      } else {
        message.channel.send({ embeds: [errorEmbed('❌ That does not match the sentence.')] });
      }
    }
  },
  {
    name: 'riddle',
    description: 'Answer a riddle',
    usage: '!riddle',
    async execute(message, args) {
      const riddles = [
        { q: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?", a: "map" },
        { q: "The more you take, the more you leave behind. What am I?", a: "footsteps" },
        { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", a: "echo" },
        { q: "What has hands but cannot clap?", a: "clock" },
        { q: "What gets wetter as it dries?", a: "towel" }
      ];
      const r = randomItem(riddles);
      await message.reply({ embeds: [infoEmbed('🧩 Riddle', `${r.q}\n\nYou have **20 seconds**!`)] });
      const filter = m => m.author.id === message.author.id;
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 20000 }).catch(() => null);
      if (!collected || !collected.size) return message.channel.send({ embeds: [errorEmbed(`⏰ Time's up! Answer: **${r.a}**`)] });
      if (collected.first().content.toLowerCase().includes(r.a)) {
        message.channel.send({ embeds: [successEmbed('✅ Correct!', `The answer is **${r.a}**! 🎉`)] });
      } else {
        message.channel.send({ embeds: [errorEmbed(`❌ Wrong! The answer was **${r.a}**.`)] });
      }
    }
  },
  {
    name: 'mathgame',
    description: 'Solve a math problem quickly',
    usage: '!mathgame',
    async execute(message, args) {
      const a = randomInt(1, 50);
      const b = randomInt(1, 50);
      const ops = ['+', '-', '*'];
      const op = randomItem(ops);
      let answer;
      if (op === '+') answer = a + b;
      else if (op === '-') answer = a - b;
      else answer = a * b;
      await message.reply({ embeds: [infoEmbed('🔢 Math Game', `What is **${a} ${op} ${b}**?\n\nYou have **10 seconds**!`)] });
      const filter = m => m.author.id === message.author.id && !isNaN(m.content);
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 10000 }).catch(() => null);
      if (!collected || !collected.size) return message.channel.send({ embeds: [errorEmbed(`⏰ Time's up! Answer: **${answer}**`)] });
      if (parseInt(collected.first().content) === answer) {
        message.channel.send({ embeds: [successEmbed('✅ Correct!', `**${a} ${op} ${b} = ${answer}**! Great job!`)] });
      } else {
        message.channel.send({ embeds: [errorEmbed(`❌ Wrong! **${a} ${op} ${b} = ${answer}**`)] });
      }
    }
  },
  {
    name: 'duel',
    description: 'Challenge someone to a duel',
    usage: '!duel <user>',
    async execute(message, args) {
      const opponent = message.mentions.users.first();
      if (!opponent || opponent.bot) return message.reply({ embeds: [errorEmbed('Please mention a valid user.')] });
      const p1hp = randomInt(80, 120);
      const p2hp = randomInt(80, 120);
      const winner = Math.random() < 0.5 ? message.author : opponent;
      const loser = winner.id === message.author.id ? opponent : message.author;
      message.reply({ embeds: [infoEmbed('⚔️ Duel Result', `**${message.author.username}** (${p1hp} HP) VS **${opponent.username}** (${p2hp} HP)\n\n🏆 **${winner.username}** wins the duel!\n💀 **${loser.username}** has been defeated!`)] });
    }
  },
  {
    name: 'rpg',
    description: 'Quick RPG adventure',
    usage: '!rpg',
    async execute(message, args) {
      const events = [
        { text: 'You encounter a dragon! You slay it and find a treasure chest!', reward: randomInt(200, 500) },
        { text: 'You stumble upon a merchant who gives you gold!', reward: randomInt(100, 300) },
        { text: 'You find a magic coin purse on the road!', reward: randomInt(50, 150) },
        { text: 'A bandit ambushes you but you escape!', reward: 0 },
        { text: 'You rescue a villager who rewards you handsomely!', reward: randomInt(150, 400) }
      ];
      const event = randomItem(events);
      const embed = infoEmbed('⚔️ RPG Adventure', `${event.text}${event.reward ? `\n\n+**${event.reward} gold**!` : ''}`);
      message.reply({ embeds: [embed] });
    }
  },
  {
    name: 'quiz',
    description: 'Take a random quiz',
    usage: '!quiz',
    async execute(message, args) {
      const questions = [
        { q: 'What does HTML stand for?', options: ['HyperText Markup Language', 'HyperTransfer Markup Language', 'HomeTool Markup Language', 'HyperText Main Language'], a: 0 },
        { q: 'Which programming language runs in browsers?', options: ['Python', 'Java', 'JavaScript', 'C++'], a: 2 },
        { q: 'What does CPU stand for?', options: ['Computer Processing Unit', 'Central Processing Unit', 'Core Processing Unit', 'Circuit Processing Unit'], a: 1 }
      ];
      const q = randomItem(questions);
      const letters = ['A', 'B', 'C', 'D'];
      const optList = q.options.map((o, i) => `**${letters[i]}.** ${o}`).join('\n');
      await message.reply({ embeds: [infoEmbed(`❓ Quiz`, `${q.q}\n\n${optList}\n\nReply with A, B, C, or D. You have **20s**!`)] });
      const filter = m => m.author.id === message.author.id && /^[ABCD]$/i.test(m.content);
      const collected = await message.channel.awaitMessages({ filter, max: 1, time: 20000 }).catch(() => null);
      if (!collected || !collected.size) return message.channel.send({ embeds: [errorEmbed(`⏰ Time's up! Answer: **${letters[q.a]}. ${q.options[q.a]}**`)] });
      const idx = letters.indexOf(collected.first().content.toUpperCase());
      if (idx === q.a) {
        message.channel.send({ embeds: [successEmbed('✅ Correct!', `The answer is **${letters[q.a]}. ${q.options[q.a]}**!`)] });
      } else {
        message.channel.send({ embeds: [errorEmbed(`❌ Wrong! The answer was **${letters[q.a]}. ${q.options[q.a]}**.`)] });
      }
    }
  },
  {
    name: 'roulette',
    description: 'Play roulette',
    usage: '!roulette <red/black/green>',
    async execute(message, args) {
      const bet = args[0]?.toLowerCase();
      if (!['red', 'black', 'green'].includes(bet)) return message.reply({ embeds: [errorEmbed('Choose `red`, `black`, or `green`.')] });
      const num = randomInt(0, 36);
      let color;
      if (num === 0) color = 'green';
      else if (num % 2 === 0) color = 'black';
      else color = 'red';
      const win = bet === color;
      const mult = color === 'green' ? 14 : 2;
      const colorEmoji = { red: '🔴', black: '⚫', green: '🟢' };
      message.reply({ embeds: [win
        ? successEmbed('🎡 Roulette', `Ball landed on **${colorEmoji[color]} ${color} (${num})**!\n**${win ? `You won! ${mult}x multiplier!` : 'You lost!'}**`)
        : errorEmbed(`🎡 Ball landed on **${colorEmoji[color]} ${color} (${num})**\nYou bet on ${bet}. You lose!`)
      ] });
    }
  }
];

module.exports = { category, commands };
