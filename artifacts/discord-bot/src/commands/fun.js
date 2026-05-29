const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { randomInt, randomItem } = require('../utils/helpers');

const category = 'Fun';

const eightBallResponses = [
  'It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes – definitely.',
  'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.',
  'Yes.', 'Signs point to yes.', 'Reply hazy, try again.', 'Ask again later.',
  'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.',
  "Don't count on it.", 'My reply is no.', 'My sources say no.',
  'Outlook not so good.', 'Very doubtful.'
];

const jokes = [
  "Why don't scientists trust atoms? Because they make up everything!",
  "Why did the scarecrow win an award? He was outstanding in his field!",
  "Why don't eggs tell jokes? They'd crack each other up!",
  "I told my wife she should embrace her mistakes. She gave me a hug.",
  "What do you call fake spaghetti? An impasta!",
  "How do you organize a space party? You planet.",
  "Why did the bicycle fall over? It was two-tired.",
  "What's a skeleton's least favorite room? The living room.",
  "Why can't you give Elsa a balloon? She'll let it go.",
  "What do you call cheese that isn't yours? Nacho cheese!",
  "I'm reading a book about anti-gravity. It's impossible to put down!",
  "What do you call a fish without eyes? A fsh!",
  "Did you hear about the mathematician who's afraid of negative numbers? He'll stop at nothing to avoid them.",
  "Why was the math book sad? It had too many problems.",
  "What did the janitor say when he jumped out of the closet? Supplies!"
];

const roasts = [
  "You're the human equivalent of a participation trophy.",
  "Your secrets are safe with me — I never listen when you talk.",
  "I'd roast you, but my mom said I'm not allowed to burn trash.",
  "You're the reason they put instructions on shampoo.",
  "Keep rolling your eyes, maybe you'll find a brain back there.",
  "I'd explain it to you, but I don't have enough crayons.",
  "You're not stupid, you just have bad luck thinking.",
  "If laughter is the best medicine, your face must be curing diseases.",
  "You have your entire life to be an idiot. Why not take today off?",
  "I've seen better-looking heads on a cauliflower."
];

const compliments = [
  "You have the most incredible smile!",
  "You make the world a better place just by being in it.",
  "Your creativity is truly inspiring.",
  "You're more fun than bubble wrap.",
  "Somehow everything seems brighter when you're around.",
  "You're genuinely one of the funniest people I know.",
  "You're the kind of person people are lucky to know.",
  "You have an absolutely magnetic personality.",
  "You bring out the best in the people around you.",
  "Your potential is limitless — seriously."
];

const facts = [
  "A group of flamingos is called a flamboyance.",
  "Honey never spoils — archaeologists found 3000-year-old honey in Egyptian tombs.",
  "Bananas are technically berries, but strawberries are not.",
  "Octopuses have three hearts and blue blood.",
  "A day on Venus is longer than a year on Venus.",
  "Wombat droppings are cube-shaped.",
  "The Eiffel Tower grows taller in summer — up to 6 inches.",
  "Sloths can hold their breath longer than dolphins.",
  "Sharks are older than trees.",
  "A bolt of lightning is five times hotter than the surface of the sun.",
  "Cows have best friends and get stressed when separated.",
  "There are more possible chess games than atoms in the known universe.",
  "A snail can sleep for up to 3 years.",
  "Sea otters hold hands when sleeping so they don't drift apart."
];

const dadjokes = [
  "I'm afraid for the calendar. Its days are numbered.",
  "My wife said I had to stop acting like a flamingo. I had to put my foot down.",
  "I used to hate facial hair, but then it grew on me.",
  "What do you call a fish without eyes? A fsh.",
  "I asked the librarian if they had books about paranoia. She whispered, 'They're right behind you!'",
  "What do you call a bear with no teeth? A gummy bear!",
  "Why did the golfer bring an extra pair of pants? In case he got a hole in one!",
  "I'm on a seafood diet. I see food and I eat it.",
  "How many tickles does it take to make an octopus laugh? Ten-tickles.",
  "What do you call an alligator in a vest? An investigator!"
];

const wouldYouRather = [
  "Would you rather fight 100 duck-sized horses or 1 horse-sized duck?",
  "Would you rather always be 10 minutes late or always be 20 minutes early?",
  "Would you rather have no internet for a month or no phone for a month?",
  "Would you rather be able to fly or be invisible?",
  "Would you rather eat only pizza or only tacos forever?",
  "Would you rather speak every language or be able to talk to animals?",
  "Would you rather have unlimited money or unlimited time?",
  "Would you rather always tell the truth or always lie?",
  "Would you rather live underwater or in space?",
  "Would you rather be famous or powerful?"
];

const truths = [
  "What is the most embarrassing thing you've ever done?",
  "Who do you have a crush on?",
  "What's the weirdest dream you've ever had?",
  "Have you ever cheated on a test?",
  "What's your biggest fear?",
  "What's the worst lie you've ever told?",
  "Have you ever blamed someone else for something you did?",
  "What's your most embarrassing moment in school?",
  "What is your biggest secret?",
  "Have you ever stood someone up?"
];

const dares = [
  "Do your best impression of someone in this server.",
  "Type a message in all caps for your next 5 messages.",
  "Change your nickname to something embarrassing for 10 minutes.",
  "Speak only in questions for the next 5 minutes.",
  "Write a poem about the last person who typed in chat.",
  "React to the last 10 messages with a random emoji.",
  "Say 'I am a potato' in every message for 5 minutes.",
  "Come up with a new nickname for every active person in chat.",
  "Write a haiku about your day.",
  "Share your most recent photo (that you're comfortable with)."
];

const neverHaveIEver = [
  "Never have I ever stayed up all night gaming.",
  "Never have I ever eaten an entire pizza by myself.",
  "Never have I ever fallen asleep in class.",
  "Never have I ever broken a bone.",
  "Never have I ever cheated on a game.",
  "Never have I ever sent a text to the wrong person.",
  "Never have I ever skipped school or work.",
  "Never have I ever lied to get out of trouble.",
  "Never have I ever been in a car accident.",
  "Never have I ever eaten something I dropped on the floor."
];

const quotes = [
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { quote: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { quote: "The future belongs to those who believe in their dreams.", author: "Eleanor Roosevelt" },
  { quote: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { quote: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" },
  { quote: "Two things are infinite: the universe and human stupidity. I'm not sure about the universe.", author: "Einstein" },
  { quote: "In the middle of every difficulty lies opportunity.", author: "Einstein" },
  { quote: "Life is not measured by the number of breaths we take, but by moments that take our breath away.", author: "Maya Angelou" },
  { quote: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" }
];

const commands = [
  {
    name: '8ball',
    description: 'Ask the magic 8-ball a question',
    usage: '!8ball <question>',
    aliases: ['eightball'],
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please ask a question.')] });
      const response = randomItem(eightBallResponses);
      message.reply({ embeds: [infoEmbed('🎱 Magic 8-Ball', `**Question:** ${args.join(' ')}\n**Answer:** ${response}`)] });
    }
  },
  {
    name: 'coinflip',
    description: 'Flip a coin',
    usage: '!coinflip',
    aliases: ['flip', 'cf'],
    async execute(message, args) {
      const result = Math.random() < 0.5 ? '🪙 Heads' : '🪙 Tails';
      message.reply({ embeds: [infoEmbed('Coin Flip', result)] });
    }
  },
  {
    name: 'dice',
    description: 'Roll a dice',
    usage: '!dice [sides]',
    aliases: ['roll', 'rolldice'],
    async execute(message, args) {
      const sides = parseInt(args[0]) || 6;
      if (sides < 2 || sides > 1000) return message.reply({ embeds: [errorEmbed('Sides must be between 2 and 1000.')] });
      const result = randomInt(1, sides);
      message.reply({ embeds: [infoEmbed('🎲 Dice Roll', `You rolled a **${result}** (d${sides}).`)] });
    }
  },
  {
    name: 'rng',
    description: 'Generate a random number',
    usage: '!rng [min] [max]',
    aliases: ['random'],
    async execute(message, args) {
      const min = parseInt(args[0]) || 1;
      const max = parseInt(args[1]) || 100;
      if (min >= max) return message.reply({ embeds: [errorEmbed('Min must be less than max.')] });
      const result = randomInt(min, max);
      message.reply({ embeds: [infoEmbed('🎲 Random Number', `**Result:** ${result} (${min}-${max})`)] });
    }
  },
  {
    name: 'rps',
    description: 'Play rock, paper, scissors',
    usage: '!rps <rock/paper/scissors>',
    async execute(message, args) {
      const choices = ['rock', 'paper', 'scissors'];
      const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
      const player = args[0]?.toLowerCase();
      if (!choices.includes(player)) return message.reply({ embeds: [errorEmbed('Choose `rock`, `paper`, or `scissors`.')] });
      const bot = randomItem(choices);
      let result;
      if (player === bot) result = "It's a **tie**!";
      else if ((player === 'rock' && bot === 'scissors') || (player === 'paper' && bot === 'rock') || (player === 'scissors' && bot === 'paper'))
        result = '**You win!** 🎉';
      else result = '**You lose!** 😢';
      message.reply({ embeds: [infoEmbed('✂️ Rock Paper Scissors', `${emojis[player]} vs ${emojis[bot]}\n${result}`)] });
    }
  },
  {
    name: 'joke',
    description: 'Get a random joke',
    usage: '!joke',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('😂 Joke', randomItem(jokes))] });
    }
  },
  {
    name: 'dadjoke',
    description: 'Get a random dad joke',
    usage: '!dadjoke',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('👨 Dad Joke', randomItem(dadjokes))] });
    }
  },
  {
    name: 'fact',
    description: 'Get a random interesting fact',
    usage: '!fact',
    aliases: ['funfact'],
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('🧠 Did You Know?', randomItem(facts))] });
    }
  },
  {
    name: 'quote',
    description: 'Get a motivational quote',
    usage: '!quote',
    aliases: ['inspire'],
    async execute(message, args) {
      const q = randomItem(quotes);
      message.reply({ embeds: [infoEmbed('💬 Quote', `*"${q.quote}"*\n— **${q.author}**`)] });
    }
  },
  {
    name: 'roast',
    description: 'Roast someone',
    usage: '!roast [user]',
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      message.reply({ embeds: [infoEmbed(`🔥 Roasting ${target.username}`, randomItem(roasts))] });
    }
  },
  {
    name: 'compliment',
    description: 'Compliment someone',
    usage: '!compliment [user]',
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      message.reply({ embeds: [infoEmbed(`💖 Compliment for ${target.username}`, randomItem(compliments))] });
    }
  },
  {
    name: 'ship',
    description: 'Ship two users together',
    usage: '!ship <user1> [user2]',
    async execute(message, args) {
      const user1 = message.mentions.users.first() || message.author;
      const user2 = message.mentions.users.at(1) || message.author;
      const pct = randomInt(0, 100);
      const bar = '█'.repeat(Math.round(pct / 10)) + '░'.repeat(10 - Math.round(pct / 10));
      message.reply({ embeds: [infoEmbed('💕 Ship', `**${user1.username}** + **${user2.username}**\n[${bar}] **${pct}%**`)] });
    }
  },
  {
    name: 'rate',
    description: 'Rate something out of 10',
    usage: '!rate <thing>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide something to rate.')] });
      const rating = randomInt(0, 10);
      const bars = ['💀', '😭', '😞', '😕', '😐', '🙂', '😊', '😄', '🤩', '🔥', '💯'];
      message.reply({ embeds: [infoEmbed('⭐ Rating', `**${args.join(' ')}**\n${bars[rating]} **${rating}/10**`)] });
    }
  },
  {
    name: 'choose',
    description: 'Make the bot choose between options',
    usage: '!choose <option1> | <option2> | ...',
    async execute(message, args) {
      const options = args.join(' ').split('|').map(o => o.trim()).filter(Boolean);
      if (options.length < 2) return message.reply({ embeds: [errorEmbed('Please provide at least 2 options separated by `|`.')] });
      message.reply({ embeds: [infoEmbed('🤔 I Choose...', `**${randomItem(options)}**`)] });
    }
  },
  {
    name: 'wouldyourather',
    description: 'Get a would you rather question',
    usage: '!wouldyourather',
    aliases: ['wyr'],
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('🤷 Would You Rather', randomItem(wouldYouRather))] });
    }
  },
  {
    name: 'truth',
    description: 'Get a truth question',
    usage: '!truth',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('🤔 Truth', randomItem(truths))] });
    }
  },
  {
    name: 'dare',
    description: 'Get a dare',
    usage: '!dare',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('😈 Dare', randomItem(dares))] });
    }
  },
  {
    name: 'neverhaveiever',
    description: 'Get a never have I ever statement',
    usage: '!neverhaveiever',
    aliases: ['nhie'],
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed('🙅 Never Have I Ever', randomItem(neverHaveIEver))] });
    }
  },
  {
    name: 'howgay',
    description: 'Find out how gay someone is',
    usage: '!howgay [user]',
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      const pct = randomInt(0, 100);
      message.reply({ embeds: [infoEmbed('🌈 Gay Meter', `**${target.username}** is **${pct}%** gay.`)] });
    }
  },
  {
    name: 'howdumb',
    description: 'Find out how dumb someone is',
    usage: '!howdumb [user]',
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      const pct = randomInt(0, 100);
      message.reply({ embeds: [infoEmbed('🧠 Dumb Meter', `**${target.username}** is **${pct}%** dumb.`)] });
    }
  },
  {
    name: 'howrich',
    description: 'Find out how rich someone is',
    usage: '!howrich [user]',
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      const pct = randomInt(0, 100);
      message.reply({ embeds: [infoEmbed('💰 Rich Meter', `**${target.username}** is **${pct}%** rich.`)] });
    }
  },
  {
    name: 'howlucky',
    description: 'Find out how lucky someone is today',
    usage: '!howlucky [user]',
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      const pct = randomInt(0, 100);
      message.reply({ embeds: [infoEmbed('🍀 Luck Meter', `**${target.username}** is **${pct}%** lucky today.`)] });
    }
  },
  {
    name: 'howcool',
    description: 'Find out how cool someone is',
    usage: '!howcool [user]',
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      const pct = randomInt(0, 100);
      message.reply({ embeds: [infoEmbed('😎 Cool Meter', `**${target.username}** is **${pct}%** cool.`)] });
    }
  },
  {
    name: 'howcringe',
    description: 'Find out how cringe someone is',
    usage: '!howcringe [user]',
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      const pct = randomInt(0, 100);
      message.reply({ embeds: [infoEmbed('😬 Cringe Meter', `**${target.username}** is **${pct}%** cringe.`)] });
    }
  },
  {
    name: 'howiQ',
    description: 'Check someone\'s IQ',
    usage: '!howiQ [user]',
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      const iq = randomInt(50, 200);
      message.reply({ embeds: [infoEmbed('🧠 IQ Test', `**${target.username}**'s IQ is **${iq}**.`)] });
    }
  },
  {
    name: 'reverse',
    description: 'Reverse some text',
    usage: '!reverse <text>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      const reversed = args.join(' ').split('').reverse().join('');
      message.reply({ embeds: [infoEmbed('🔄 Reversed', reversed)] });
    }
  },
  {
    name: 'mock',
    description: 'Mock some text (SpOnGeBoB sTyLe)',
    usage: '!mock <text>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      const mocked = args.join(' ').split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
      message.reply({ embeds: [infoEmbed('🧽 Mock', mocked)] });
    }
  },
  {
    name: 'clap',
    description: 'Add claps between words',
    usage: '!clap <text>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      const result = args.join(' 👏 ') + ' 👏';
      message.reply({ embeds: [infoEmbed('👏', result)] });
    }
  },
  {
    name: 'aesthetic',
    description: 'Make text aesthetic',
    usage: '!aesthetic <text>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      const result = args.join(' ').split('').map(c => c === ' ' ? '　' : String.fromCharCode(c.charCodeAt(0) + (c.match(/[a-zA-Z]/) ? 65248 : 0))).join('');
      message.reply({ embeds: [infoEmbed('Aesthetic', result)] });
    }
  },
  {
    name: 'fortune',
    description: 'Get your fortune',
    usage: '!fortune',
    async execute(message, args) {
      const fortunes = [
        'Great success awaits you soon.',
        'Help someone in need today.',
        'Your creativity will solve a big problem.',
        'An unexpected gift is coming your way.',
        'Stay patient — good things take time.',
        'Someone is thinking of you right now.',
        'Your hard work will pay off soon.',
        'Adventure is just around the corner.',
        'Trust your instincts today.',
        'A new friendship will change your life.'
      ];
      message.reply({ embeds: [infoEmbed('🔮 Fortune', randomItem(fortunes))] });
    }
  },
  {
    name: 'slots',
    description: 'Play the slot machine (just for fun)',
    usage: '!slots',
    async execute(message, args) {
      const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '⭐'];
      const s1 = randomItem(symbols);
      const s2 = randomItem(symbols);
      const s3 = randomItem(symbols);
      const win = s1 === s2 && s2 === s3;
      message.reply({ embeds: [infoEmbed('🎰 Slots', `[ ${s1} | ${s2} | ${s3} ]\n${win ? '🎉 **JACKPOT!**' : '😢 No win this time.'}`)] });
    }
  },
  {
    name: 'gayrate',
    description: 'Rate your gay percentage with a bar',
    usage: '!gayrate [user]',
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      const pct = randomInt(0, 100);
      const filled = Math.round(pct / 10);
      const bar = '🏳️‍🌈'.repeat(filled) + '⬜'.repeat(10 - filled);
      message.reply({ embeds: [infoEmbed('🌈 Gay Rate', `**${target.username}**\n${bar}\n**${pct}%**`)] });
    }
  },
  {
    name: 'iq',
    description: 'Test someone\'s IQ',
    usage: '!iq [user]',
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      const iq = randomInt(50, 200);
      let label = iq < 85 ? '😂 Below average' : iq < 115 ? '🙂 Average' : iq < 130 ? '🧠 Above average' : iq < 145 ? '💡 Gifted' : '🔬 Genius';
      message.reply({ embeds: [infoEmbed('🧠 IQ Test', `**${target.username}**'s IQ: **${iq}** — ${label}`)] });
    }
  },
  {
    name: 'shrug',
    description: 'Shrug',
    usage: '!shrug',
    async execute(message, args) {
      message.channel.send('¯\\_(ツ)_/¯');
    }
  },
  {
    name: 'tableflip',
    description: 'Flip a table',
    usage: '!tableflip',
    async execute(message, args) {
      message.channel.send('(╯°□°）╯︵ ┻━┻');
    }
  },
  {
    name: 'unflip',
    description: 'Put the table back',
    usage: '!unflip',
    async execute(message, args) {
      message.channel.send('┬─┬ ノ( ゜-゜ノ)');
    }
  },
  {
    name: 'lenny',
    description: 'Post the Lenny face',
    usage: '!lenny',
    async execute(message, args) {
      message.channel.send('( ͡° ͜ʖ ͡°)');
    }
  },
  {
    name: 'fight',
    description: 'Fight someone',
    usage: '!fight <user>',
    async execute(message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [errorEmbed('Please mention someone to fight.')] });
      const winner = Math.random() < 0.5 ? message.author : target;
      message.reply({ embeds: [infoEmbed('⚔️ Fight', `${message.author} VS ${target}\n\n🏆 **${winner.username}** wins the fight!`)] });
    }
  },
  {
    name: 'hack',
    description: 'Fake hack someone',
    usage: '!hack <user>',
    async execute(message, args) {
      const target = message.mentions.users.first() || message.author;
      const fakeData = [`IP: 192.168.${randomInt(0, 255)}.${randomInt(0, 255)}`, `Password: ${'*'.repeat(randomInt(8, 16))}`, `Location: ${randomItem(['New York', 'Tokyo', 'London', 'Sydney', 'Paris'])}`, `SSN: ***-**-${randomInt(1000, 9999)}`];
      const reply = await message.reply({ embeds: [infoEmbed(`💻 Hacking ${target.username}...`, 'Initiating hack...')] });
      setTimeout(() => reply.edit({ embeds: [infoEmbed(`💻 Hack Complete`, fakeData.join('\n'))] }), 2000);
    }
  },
  {
    name: 'color8ball',
    description: 'Get a random color prediction',
    usage: '!color8ball',
    async execute(message, args) {
      const colors = ['🔴 Red', '🟠 Orange', '🟡 Yellow', '🟢 Green', '🔵 Blue', '🟣 Purple', '⚫ Black', '⚪ White', '🟤 Brown', '🩷 Pink'];
      message.reply({ embeds: [infoEmbed('🎱 Color 8-Ball', `Your lucky color today is **${randomItem(colors)}**!`)] });
    }
  },
  {
    name: 'zodiac',
    description: 'Get zodiac traits',
    usage: '!zodiac <sign>',
    async execute(message, args) {
      const signs = {
        aries: 'Bold, ambitious, and driven. A natural leader.',
        taurus: 'Reliable, patient, and practical. Loves comfort.',
        gemini: 'Curious, adaptable, and witty. Great communicator.',
        cancer: 'Intuitive, emotional, and loyal. Family-oriented.',
        leo: 'Charismatic, generous, and passionate. Natural performer.',
        virgo: 'Analytical, hardworking, and kind. Attention to detail.',
        libra: 'Diplomatic, fair-minded, and social. Loves balance.',
        scorpio: 'Resourceful, brave, and passionate. Deeply loyal.',
        sagittarius: 'Optimistic, adventurous, and honest. Freedom-loving.',
        capricorn: 'Disciplined, responsible, and ambitious. Goal-oriented.',
        aquarius: 'Innovative, independent, and humanitarian. Forward-thinking.',
        pisces: 'Empathetic, artistic, and gentle. Deeply intuitive.'
      };
      const sign = args[0]?.toLowerCase();
      if (!sign || !signs[sign]) return message.reply({ embeds: [errorEmbed(`Valid signs: ${Object.keys(signs).join(', ')}`)] });
      message.reply({ embeds: [infoEmbed(`♈ ${sign.charAt(0).toUpperCase() + sign.slice(1)}`, signs[sign])] });
    }
  },
  {
    name: 'numberword',
    description: 'Convert a number to words',
    usage: '!numberword <number>',
    async execute(message, args) {
      const num = parseInt(args[0]);
      if (isNaN(num)) return message.reply({ embeds: [errorEmbed('Please provide a valid number.')] });
      const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
      const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
      if (num === 0) return message.reply({ embeds: [infoEmbed('📝 Number', 'zero')] });
      function convert(n) {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
        if (n < 1000000) return convert(Math.floor(n / 1000)) + ' thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        return String(n);
      }
      message.reply({ embeds: [infoEmbed('📝 Number in Words', `**${num}** = *${convert(Math.abs(num))}*`)] });
    }
  }
];

module.exports = { category, commands };
