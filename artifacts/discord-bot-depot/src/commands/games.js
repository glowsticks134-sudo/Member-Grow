const { SlashCommandBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS } = require('../utils/embed');
const { randomInt, randomItem } = require('../utils/helpers');

const triviaQuestions = [
  { q: 'What is the capital of France?', a: 'paris', hint: 'City of Light' },
  { q: 'How many planets are in our solar system?', a: '8', hint: 'Not 9 anymore!' },
  { q: 'What is 12 × 12?', a: '144', hint: 'Dozen squared' },
  { q: 'What gas do plants absorb?', a: 'carbon dioxide', hint: 'CO2' },
  { q: 'Who wrote Romeo and Juliet?', a: 'shakespeare', hint: 'The Bard' },
  { q: 'What is the largest ocean?', a: 'pacific', hint: 'It covers 165 million km²' },
  { q: 'What is the hardest natural substance?', a: 'diamond', hint: '💎' },
  { q: 'How many continents are there?', a: '7', hint: 'Count them!' },
  { q: 'What is the speed of light in km/s?', a: '300000', hint: '3 × 10⁵' },
  { q: 'What is the largest planet in our solar system?', a: 'jupiter', hint: 'Gas giant' },
  { q: 'What year did World War II end?', a: '1945', hint: 'Mid-40s' },
  { q: 'How many sides does a hexagon have?', a: '6', hint: 'Think of a honeycomb' },
  { q: 'What is the chemical symbol for gold?', a: 'au', hint: 'Latin: Aurum' },
  { q: 'What is the longest river in the world?', a: 'nile', hint: 'In Africa' }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('games')
    .setDescription('Mini-games')
    .addSubcommand(s => s.setName('trivia').setDescription('Answer a trivia question'))
    .addSubcommand(s => s.setName('numguess').setDescription('Guess a number between 1 and 100'))
    .addSubcommand(s => s.setName('typerace').setDescription('Typing speed race'))
    .addSubcommand(s => s.setName('hangman').setDescription('Play hangman'))
    .addSubcommand(s => s.setName('tictactoe').setDescription('Play Tic Tac Toe').addUserOption(o => o.setName('opponent').setDescription('Opponent').setRequired(true)))
    .addSubcommand(s => s.setName('duel').setDescription('Duel another member').addUserOption(o => o.setName('opponent').setDescription('Opponent').setRequired(true)))
    .addSubcommand(s => s.setName('akinator').setDescription('Think of a character (yes/no game)'))
    .addSubcommand(s => s.setName('scramble').setDescription('Unscramble the word'))
    .addSubcommand(s => s.setName('math').setDescription('Solve a math problem first'))
    .addSubcommand(s => s.setName('riddle').setDescription('Answer a riddle'))
    .addSubcommand(s => s.setName('wordsearch').setDescription('Find a hidden word'))
    .addSubcommand(s => s.setName('roulette').setDescription('Russian roulette')),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'trivia') {
      const q = randomItem(triviaQuestions);
      await interaction.reply({ embeds: [infoEmbed('🧠 Trivia', `${q.q}\n\n*Hint: ${q.hint}*\n\nType your answer in this channel! You have **20 seconds**.`)] });
      const filter = m => m.author.id === interaction.user.id;
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 20000 }).catch(() => null);
      if (!collected?.size) return interaction.channel.send({ embeds: [errorEmbed(`⏰ Time's up! The answer was **${q.a}**.`)] });
      const answer = collected.first().content.toLowerCase().trim();
      if (answer === q.a || q.a.includes(answer)) {
        return interaction.channel.send({ embeds: [successEmbed('✅ Correct!', `The answer is **${q.a}**. Well done, ${interaction.user}!`)] });
      }
      return interaction.channel.send({ embeds: [errorEmbed(`❌ Wrong! The correct answer was **${q.a}**.`)] });
    }

    if (sub === 'numguess') {
      const num = randomInt(1, 100);
      await interaction.reply({ embeds: [infoEmbed('🔢 Number Guess', 'I\'m thinking of a number between **1** and **100**. You have 5 tries!')] });
      let tries = 0;
      const filter = m => m.author.id === interaction.user.id && !isNaN(m.content);
      while (tries < 5) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 20000 }).catch(() => null);
        if (!collected?.size) return interaction.channel.send({ embeds: [errorEmbed(`⏰ Time's up! The number was **${num}**.`)] });
        const guess = parseInt(collected.first().content);
        tries++;
        if (guess === num) return interaction.channel.send({ embeds: [successEmbed('🎉 Correct!', `You got it in **${tries}** tries! The number was **${num}**.`)] });
        if (tries >= 5) return interaction.channel.send({ embeds: [errorEmbed(`❌ Out of tries! The number was **${num}**.`)] });
        const hint = guess < num ? '📈 Too low! Try higher.' : '📉 Too high! Try lower.';
        await interaction.channel.send({ embeds: [infoEmbed(`Guess ${tries}/5`, `${hint} Tries left: **${5 - tries}**`)] });
      }
    }

    if (sub === 'typerace') {
      const words = ['the quick brown fox jumps over the lazy dog', 'discord bots are built with javascript', 'member grow bot made by stichachu13', 'practice makes perfect with typing speed', 'how fast can you type this sentence'];
      const sentence = randomItem(words);
      await interaction.reply({ embeds: [infoEmbed('⌨️ Type Race', `Type this sentence as fast as you can!\n\n\`\`\`${sentence}\`\`\``)] });
      const start = Date.now();
      const filter = m => m.author.id === interaction.user.id;
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
      if (!collected?.size) return interaction.channel.send({ embeds: [errorEmbed('⏰ Time\'s up!')] });
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      const typed = collected.first().content;
      const correct = typed.toLowerCase() === sentence;
      if (correct) return interaction.channel.send({ embeds: [successEmbed('✅ Complete!', `You typed it in **${elapsed}s**!\nWPM: ~**${Math.round(sentence.split(' ').length / (elapsed / 60))}**`)] });
      return interaction.channel.send({ embeds: [errorEmbed(`❌ Typo detected! Time: ${elapsed}s`)] });
    }

    if (sub === 'scramble') {
      const words = ['discord', 'server', 'gaming', 'channel', 'member', 'message', 'command', 'keyboard', 'minecraft', 'javascript'];
      const word = randomItem(words);
      const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
      await interaction.reply({ embeds: [infoEmbed('🔀 Word Scramble', `Unscramble this word: **${scrambled}**\nYou have 15 seconds!`)] });
      const filter = m => m.author.id === interaction.user.id;
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 15000 }).catch(() => null);
      if (!collected?.size) return interaction.channel.send({ embeds: [errorEmbed(`⏰ Time's up! The word was **${word}**.`)] });
      const answer = collected.first().content.toLowerCase().trim();
      if (answer === word) return interaction.channel.send({ embeds: [successEmbed('✅ Correct!', `**${word}** is right!`)] });
      return interaction.channel.send({ embeds: [errorEmbed(`❌ Wrong! The word was **${word}**.`)] });
    }

    if (sub === 'hangman') {
      const words = ['javascript', 'discord', 'server', 'channel', 'moderator', 'developer', 'keyboard', 'community', 'giveaway', 'reaction'];
      const word = randomItem(words);
      let guessed = [];
      let wrong = 0;
      const maxWrong = 6;
      const hangmanStages = ['', 'O', 'O\n|', 'O\n/|', 'O\n/|\\', 'O\n/|\\\n/', 'O\n/|\\\n/ \\'];

      function display() {
        return word.split('').map(c => guessed.includes(c) ? c : '_').join(' ');
      }

      await interaction.reply({ embeds: [infoEmbed('🪢 Hangman', `\`${display()}\`\nWrong: **${wrong}/${maxWrong}**\nGuessed: ${guessed.join(', ') || 'none'}\n\nGuess a letter!`)] });

      const filter = m => m.author.id === interaction.user.id && m.content.length === 1 && /[a-z]/i.test(m.content);
      while (wrong < maxWrong) {
        const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 20000 }).catch(() => null);
        if (!collected?.size) return interaction.channel.send({ embeds: [errorEmbed(`⏰ Time's up! The word was **${word}**.`)] });
        const letter = collected.first().content.toLowerCase();
        if (guessed.includes(letter)) { await interaction.channel.send(`Already guessed \`${letter}\`!`); continue; }
        guessed.push(letter);
        if (!word.includes(letter)) wrong++;
        const current = display();
        if (!current.includes('_')) return interaction.channel.send({ embeds: [successEmbed('🎉 You won!', `The word was **${word}**! Guessed in ${guessed.length} tries.`)] });
        if (wrong >= maxWrong) return interaction.channel.send({ embeds: [errorEmbed(`💀 You lost! The word was **${word}**.`)] });
        await interaction.channel.send({ embeds: [infoEmbed('🪢 Hangman', `\`${current}\`\nWrong: **${wrong}/${maxWrong}** ${hangmanStages[wrong]}\nGuessed: ${guessed.join(', ')}`)] });
      }
    }

    if (sub === 'math') {
      const a = randomInt(2, 20), b = randomInt(2, 20);
      const ops = ['+', '-', '*'];
      const op = randomItem(ops);
      const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
      await interaction.reply({ embeds: [infoEmbed('🔢 Math Race', `What is **${a} ${op} ${b}**?\nYou have 10 seconds!`)] });
      const filter = m => m.author.id === interaction.user.id && !isNaN(m.content);
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 10000 }).catch(() => null);
      if (!collected?.size) return interaction.channel.send({ embeds: [errorEmbed(`⏰ Time's up! The answer was **${answer}**.`)] });
      if (parseInt(collected.first().content) === answer) return interaction.channel.send({ embeds: [successEmbed('✅ Correct!', `**${a} ${op} ${b} = ${answer}**`)] });
      return interaction.channel.send({ embeds: [errorEmbed(`❌ Wrong! The answer was **${answer}**.`)] });
    }

    if (sub === 'riddle') {
      const riddles = [
        { q: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?', a: 'echo' },
        { q: 'The more you take, the more you leave behind. What am I?', a: 'footsteps' },
        { q: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?", a: 'map' },
        { q: "What has hands but can't clap?", a: 'clock' },
        { q: "What gets wetter the more it dries?", a: 'towel' },
        { q: "I'm light as a feather, but the strongest man can't hold me for more than a few minutes. What am I?", a: 'breath' }
      ];
      const r = randomItem(riddles);
      await interaction.reply({ embeds: [infoEmbed('🤔 Riddle', `${r.q}\n\nYou have 30 seconds!`)] });
      const filter = m => m.author.id === interaction.user.id;
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 }).catch(() => null);
      if (!collected?.size) return interaction.channel.send({ embeds: [errorEmbed(`⏰ Time's up! The answer was **${r.a}**.`)] });
      if (collected.first().content.toLowerCase().includes(r.a)) return interaction.channel.send({ embeds: [successEmbed('✅ Correct!', `The answer was **${r.a}**!`)] });
      return interaction.channel.send({ embeds: [errorEmbed(`❌ Wrong! The answer was **${r.a}**.`)] });
    }

    if (sub === 'duel') {
      const opponent = interaction.options.getUser('opponent');
      if (opponent.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed("You can't duel yourself.")], ephemeral: true });
      if (opponent.bot) return interaction.reply({ embeds: [errorEmbed("You can't duel a bot.")], ephemeral: true });
      const p1hp = randomInt(50, 100), p2hp = randomInt(50, 100);
      const winner = p1hp > p2hp ? interaction.user : opponent;
      const loser = p1hp > p2hp ? opponent : interaction.user;
      return interaction.reply({ embeds: [infoEmbed('⚔️ Duel Result', `${interaction.user} (${p1hp} HP) vs ${opponent} (${p2hp} HP)\n\n🏆 **${winner.username}** wins!\n💀 **${loser.username}** is defeated!`)] });
    }

    if (sub === 'tictactoe') {
      const opponent = interaction.options.getUser('opponent');
      if (opponent.id === interaction.user.id) return interaction.reply({ embeds: [errorEmbed("You can't play against yourself.")], ephemeral: true });
      return interaction.reply({ embeds: [infoEmbed('❌⭕ Tic Tac Toe', `${interaction.user} vs ${opponent}\n\nType positions 1-9 to play!\n\`\`\`\n1 | 2 | 3\n---------\n4 | 5 | 6\n---------\n7 | 8 | 9\n\`\`\`\n${interaction.user.username}, you go first (❌)!`)] });
    }

    if (sub === 'roulette') {
      const chamber = randomInt(1, 6);
      const pull = randomInt(1, 6);
      if (chamber === pull) return interaction.reply({ embeds: [errorEmbed(`💀 BANG! ${interaction.user.username} lost the game of Russian Roulette!`)] });
      return interaction.reply({ embeds: [infoEmbed('🔫 Click!', `${interaction.user.username} survived! Lucky chamber was #${chamber}, you pulled #${pull}.`)] });
    }

    if (sub === 'akinator' || sub === 'wordsearch') {
      return interaction.reply({ embeds: [infoEmbed('🎮 Game', 'This mini-game requires a live session — think of a character or check #games for server activities!')] });
    }
  }
};
