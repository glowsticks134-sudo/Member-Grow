const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { randomInt, randomItem } = require('../utils/helpers');

const eightBallResponses = ['It is certain.','It is decidedly so.','Without a doubt.','Yes – definitely.','You may rely on it.','As I see it, yes.','Most likely.','Outlook good.','Yes.','Signs point to yes.','Reply hazy, try again.','Ask again later.','Better not tell you now.','Cannot predict now.','Concentrate and ask again.',"Don't count on it.",'My reply is no.','My sources say no.','Outlook not so good.','Very doubtful.'];
const jokes = ["Why don't scientists trust atoms? Because they make up everything!","Why did the scarecrow win an award? He was outstanding in his field!","Why don't eggs tell jokes? They'd crack each other up!","I told my wife she should embrace her mistakes. She gave me a hug.","What do you call fake spaghetti? An impasta!","How do you organize a space party? You planet.","Why did the bicycle fall over? It was two-tired.","What's a skeleton's least favorite room? The living room.","Why can't you give Elsa a balloon? She'll let it go.","What do you call cheese that isn't yours? Nacho cheese!","I'm reading a book about anti-gravity. It's impossible to put down!"];
const dadjokes = ["I'm afraid for the calendar. Its days are numbered.","My wife said I had to stop acting like a flamingo. I had to put my foot down.","I used to hate facial hair, but then it grew on me.","I asked the librarian if they had books about paranoia. She whispered, 'They're right behind you!'","What do you call a bear with no teeth? A gummy bear!","Why did the golfer bring an extra pair of pants? In case he got a hole in one!","I'm on a seafood diet. I see food and I eat it.","How many tickles does it take to make an octopus laugh? Ten-tickles."];
const facts = ["A group of flamingos is called a flamboyance.","Honey never spoils — archaeologists found 3000-year-old honey in Egyptian tombs.","Bananas are technically berries, but strawberries are not.","Octopuses have three hearts and blue blood.","A day on Venus is longer than a year on Venus.","Wombat droppings are cube-shaped.","The Eiffel Tower grows taller in summer — up to 6 inches.","Sloths can hold their breath longer than dolphins.","Sharks are older than trees.","A bolt of lightning is five times hotter than the surface of the sun."];
const quotes = [{q:"The only way to do great work is to love what you do.",a:"Steve Jobs"},{q:"Life is what happens when you're busy making other plans.",a:"John Lennon"},{q:"The future belongs to those who believe in their dreams.",a:"Eleanor Roosevelt"},{q:"Be yourself; everyone else is already taken.",a:"Oscar Wilde"},{q:"In the middle of every difficulty lies opportunity.",a:"Einstein"},{q:"The best time to plant a tree was 20 years ago. The second best time is now.",a:"Chinese Proverb"}];
const fortunes = ['Great success awaits you soon.','Help someone in need today.','Your creativity will solve a big problem.','An unexpected gift is coming your way.','Stay patient — good things take time.','Someone is thinking of you right now.','Your hard work will pay off soon.','Adventure is just around the corner.'];
const roasts = ["You're the human equivalent of a participation trophy.","Your secrets are safe with me — I never listen when you talk.","I'd roast you, but my mom said I'm not allowed to burn trash.","You're the reason they put instructions on shampoo.","Keep rolling your eyes, maybe you'll find a brain back there.","I'd explain it to you, but I don't have enough crayons."];
const compliments = ["You have the most incredible smile!","You make the world a better place just by being in it.","Your creativity is truly inspiring.","You're more fun than bubble wrap.","Somehow everything seems brighter when you're around.","Your potential is limitless — seriously."];
const wouldYouRather = ["Would you rather fight 100 duck-sized horses or 1 horse-sized duck?","Would you rather always be 10 minutes late or always be 20 minutes early?","Would you rather have no internet for a month or no phone for a month?","Would you rather be able to fly or be invisible?","Would you rather eat only pizza or only tacos forever?","Would you rather speak every language or be able to talk to animals?","Would you rather have unlimited money or unlimited time?"];
const truths = ["What is the most embarrassing thing you've ever done?","Who do you have a crush on?","What's the weirdest dream you've ever had?","Have you ever cheated on a test?","What's your biggest fear?","What's the worst lie you've ever told?","What is your biggest secret?","Have you ever stood someone up?"];
const dares = ["Do your best impression of someone in this server.","Type a message in all caps for your next 5 messages.","Change your nickname to something embarrassing for 10 minutes.","Speak only in questions for the next 5 minutes.","Write a poem about the last person who typed in chat.","Come up with a new nickname for every active person in chat.","Write a haiku about your day."];
const neverHaveIEver = ["Never have I ever stayed up all night gaming.","Never have I ever eaten an entire pizza by myself.","Never have I ever fallen asleep in class.","Never have I ever broken a bone.","Never have I ever cheated on a game.","Never have I ever sent a text to the wrong person.","Never have I ever skipped school or work."];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fun')
    .setDescription('Fun commands')
    .addSubcommandGroup(g => g
      .setName('random')
      .setDescription('Random generators')
      .addSubcommand(s => s.setName('8ball').setDescription('Ask the magic 8-ball').addStringOption(o => o.setName('question').setDescription('Your question').setRequired(true)))
      .addSubcommand(s => s.setName('coinflip').setDescription('Flip a coin'))
      .addSubcommand(s => s.setName('dice').setDescription('Roll a dice').addIntegerOption(o => o.setName('sides').setDescription('Number of sides (default: 6)').setMinValue(2).setMaxValue(1000)))
      .addSubcommand(s => s.setName('rng').setDescription('Random number').addIntegerOption(o => o.setName('min').setDescription('Min (default: 1)')).addIntegerOption(o => o.setName('max').setDescription('Max (default: 100)')))
      .addSubcommand(s => s.setName('rps').setDescription('Rock paper scissors').addStringOption(o => o.setName('choice').setDescription('Your choice').setRequired(true).addChoices({ name: '🪨 Rock', value: 'rock' }, { name: '📄 Paper', value: 'paper' }, { name: '✂️ Scissors', value: 'scissors' })))
      .addSubcommand(s => s.setName('joke').setDescription('Get a random joke'))
      .addSubcommand(s => s.setName('dadjoke').setDescription('Get a dad joke'))
      .addSubcommand(s => s.setName('fact').setDescription('Random interesting fact'))
      .addSubcommand(s => s.setName('quote').setDescription('Motivational quote'))
      .addSubcommand(s => s.setName('fortune').setDescription('Get your fortune'))
      .addSubcommand(s => s.setName('slots').setDescription('Play the slot machine'))
      .addSubcommand(s => s.setName('wouldyourather').setDescription('Would you rather question'))
      .addSubcommand(s => s.setName('truth').setDescription('Truth or dare — truth'))
      .addSubcommand(s => s.setName('dare').setDescription('Truth or dare — dare'))
      .addSubcommand(s => s.setName('neverhaveiever').setDescription('Never have I ever'))
      .addSubcommand(s => s.setName('choose').setDescription('Choose between options').addStringOption(o => o.setName('options').setDescription('Options separated by | (e.g. option1 | option2)').setRequired(true)))
      .addSubcommand(s => s.setName('rate').setDescription('Rate something out of 10').addStringOption(o => o.setName('thing').setDescription('What to rate').setRequired(true)))
      .addSubcommand(s => s.setName('ship').setDescription('Ship two users').addUserOption(o => o.setName('user1').setDescription('First user').setRequired(true)).addUserOption(o => o.setName('user2').setDescription('Second user').setRequired(true)))
    )
    .addSubcommandGroup(g => g
      .setName('text')
      .setDescription('Text transformation')
      .addSubcommand(s => s.setName('reverse').setDescription('Reverse text').addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)))
      .addSubcommand(s => s.setName('mock').setDescription('SpOnGeBoB mock text').addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)))
      .addSubcommand(s => s.setName('clap').setDescription('Add 👏 between words').addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)))
      .addSubcommand(s => s.setName('aesthetic').setDescription('Full-width aesthetic text').addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)))
      .addSubcommand(s => s.setName('roast').setDescription('Roast a user').addUserOption(o => o.setName('user').setDescription('User to roast').setRequired(true)))
      .addSubcommand(s => s.setName('compliment').setDescription('Compliment a user').addUserOption(o => o.setName('user').setDescription('User to compliment').setRequired(true)))
      .addSubcommand(s => s.setName('shrug').setDescription('¯\\_(ツ)_/¯'))
      .addSubcommand(s => s.setName('tableflip').setDescription('(╯°□°）╯︵ ┻━┻'))
      .addSubcommand(s => s.setName('unflip').setDescription('┬─┬ ノ( ゜-゜ノ)'))
      .addSubcommand(s => s.setName('lenny').setDescription('( ͡° ͜ʖ ͡°)'))
    )
    .addSubcommandGroup(g => g
      .setName('meters')
      .setDescription('Fun percentage meters')
      .addSubcommand(s => s.setName('iq').setDescription('Check IQ').addUserOption(o => o.setName('user').setDescription('User (default: you)')))
      .addSubcommand(s => s.setName('howgay').setDescription('Gay meter').addUserOption(o => o.setName('user').setDescription('User (default: you)')))
      .addSubcommand(s => s.setName('howdumb').setDescription('Dumb meter').addUserOption(o => o.setName('user').setDescription('User (default: you)')))
      .addSubcommand(s => s.setName('howrich').setDescription('Rich meter').addUserOption(o => o.setName('user').setDescription('User (default: you)')))
      .addSubcommand(s => s.setName('howlucky').setDescription('Luck meter').addUserOption(o => o.setName('user').setDescription('User (default: you)')))
      .addSubcommand(s => s.setName('howcool').setDescription('Cool meter').addUserOption(o => o.setName('user').setDescription('User (default: you)')))
      .addSubcommand(s => s.setName('howcringe').setDescription('Cringe meter').addUserOption(o => o.setName('user').setDescription('User (default: you)')))
      .addSubcommand(s => s.setName('fight').setDescription('Fight a user').addUserOption(o => o.setName('user').setDescription('User to fight').setRequired(true)))
      .addSubcommand(s => s.setName('hack').setDescription('Fake hack a user').addUserOption(o => o.setName('user').setDescription('User (default: you)')))
      .addSubcommand(s => s.setName('gayrate').setDescription('Gay rate bar').addUserOption(o => o.setName('user').setDescription('User (default: you)')))
    ),

  async execute(interaction) {
    const group = interaction.options.getSubcommandGroup(false);
    const sub = interaction.options.getSubcommand();

    if (group === 'random') {
      if (sub === '8ball') {
        const q = interaction.options.getString('question');
        return interaction.reply({ embeds: [infoEmbed('🎱 Magic 8-Ball', `**Question:** ${q}\n**Answer:** ${randomItem(eightBallResponses)}`)] });
      }
      if (sub === 'coinflip') return interaction.reply({ embeds: [infoEmbed('🪙 Coin Flip', Math.random() < 0.5 ? 'Heads' : 'Tails')] });
      if (sub === 'dice') {
        const sides = interaction.options.getInteger('sides') || 6;
        return interaction.reply({ embeds: [infoEmbed('🎲 Dice Roll', `You rolled a **${randomInt(1, sides)}** (d${sides}).`)] });
      }
      if (sub === 'rng') {
        const min = interaction.options.getInteger('min') || 1;
        const max = interaction.options.getInteger('max') || 100;
        if (min >= max) return interaction.reply({ embeds: [errorEmbed('Min must be less than max.')], ephemeral: true });
        return interaction.reply({ embeds: [infoEmbed('🎲 Random Number', `**${randomInt(min, max)}** (${min}–${max})`)] });
      }
      if (sub === 'rps') {
        const choices = ['rock', 'paper', 'scissors'];
        const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
        const player = interaction.options.getString('choice');
        const bot = randomItem(choices);
        let result;
        if (player === bot) result = "It's a **tie**!";
        else if ((player==='rock'&&bot==='scissors')||(player==='paper'&&bot==='rock')||(player==='scissors'&&bot==='paper')) result = '**You win!** 🎉';
        else result = '**You lose!** 😢';
        return interaction.reply({ embeds: [infoEmbed('✂️ Rock Paper Scissors', `${emojis[player]} vs ${emojis[bot]}\n${result}`)] });
      }
      if (sub === 'joke') return interaction.reply({ embeds: [infoEmbed('😂 Joke', randomItem(jokes))] });
      if (sub === 'dadjoke') return interaction.reply({ embeds: [infoEmbed('👨 Dad Joke', randomItem(dadjokes))] });
      if (sub === 'fact') return interaction.reply({ embeds: [infoEmbed('🧠 Did You Know?', randomItem(facts))] });
      if (sub === 'quote') { const q = randomItem(quotes); return interaction.reply({ embeds: [infoEmbed('💬 Quote', `*"${q.q}"*\n— **${q.a}**`)] }); }
      if (sub === 'fortune') return interaction.reply({ embeds: [infoEmbed('🔮 Fortune', randomItem(fortunes))] });
      if (sub === 'slots') {
        const symbols = ['🍒','🍋','🍊','🍇','💎','7️⃣','⭐'];
        const s1=randomItem(symbols), s2=randomItem(symbols), s3=randomItem(symbols);
        const win = s1===s2&&s2===s3;
        return interaction.reply({ embeds: [infoEmbed('🎰 Slots', `[ ${s1} | ${s2} | ${s3} ]\n${win?'🎉 **JACKPOT!**':'😢 No win this time.'}`)] });
      }
      if (sub === 'wouldyourather') return interaction.reply({ embeds: [infoEmbed('🤷 Would You Rather', randomItem(wouldYouRather))] });
      if (sub === 'truth') return interaction.reply({ embeds: [infoEmbed('🤔 Truth', randomItem(truths))] });
      if (sub === 'dare') return interaction.reply({ embeds: [infoEmbed('😈 Dare', randomItem(dares))] });
      if (sub === 'neverhaveiever') return interaction.reply({ embeds: [infoEmbed('🙅 Never Have I Ever', randomItem(neverHaveIEver))] });
      if (sub === 'choose') {
        const opts = interaction.options.getString('options').split('|').map(o=>o.trim()).filter(Boolean);
        if (opts.length < 2) return interaction.reply({ embeds: [errorEmbed('Provide at least 2 options separated by `|`.')], ephemeral: true });
        return interaction.reply({ embeds: [infoEmbed('🤔 I Choose...', `**${randomItem(opts)}**`)] });
      }
      if (sub === 'rate') {
        const thing = interaction.options.getString('thing');
        const rating = randomInt(0, 10);
        const bars = ['💀','😭','😞','😕','😐','🙂','😊','😄','🤩','🔥','💯'];
        return interaction.reply({ embeds: [infoEmbed('⭐ Rating', `**${thing}**\n${bars[rating]} **${rating}/10**`)] });
      }
      if (sub === 'ship') {
        const u1 = interaction.options.getUser('user1');
        const u2 = interaction.options.getUser('user2');
        const pct = randomInt(0, 100);
        const bar = '█'.repeat(Math.round(pct/10))+'░'.repeat(10-Math.round(pct/10));
        return interaction.reply({ embeds: [infoEmbed('💕 Ship', `**${u1.username}** + **${u2.username}**\n[${bar}] **${pct}%**`)] });
      }
    }

    if (group === 'text') {
      if (sub === 'reverse') return interaction.reply({ embeds: [infoEmbed('🔄 Reversed', interaction.options.getString('text').split('').reverse().join(''))] });
      if (sub === 'mock') return interaction.reply({ embeds: [infoEmbed('🧽 Mock', interaction.options.getString('text').split('').map((c,i)=>i%2===0?c.toLowerCase():c.toUpperCase()).join(''))] });
      if (sub === 'clap') return interaction.reply({ embeds: [infoEmbed('👏', interaction.options.getString('text').split(' ').join(' 👏 ')+' 👏')] });
      if (sub === 'aesthetic') return interaction.reply({ embeds: [infoEmbed('Aesthetic', interaction.options.getString('text').split('').map(c=>c===' '?'　':String.fromCharCode(c.charCodeAt(0)+(c.match(/[a-zA-Z]/)?65248:0))).join(''))] });
      if (sub === 'roast') { const u = interaction.options.getUser('user'); return interaction.reply({ embeds: [infoEmbed(`🔥 Roasting ${u.username}`, randomItem(roasts))] }); }
      if (sub === 'compliment') { const u = interaction.options.getUser('user'); return interaction.reply({ embeds: [infoEmbed(`💖 Compliment for ${u.username}`, randomItem(compliments))] }); }
      if (sub === 'shrug') return interaction.reply({ content: '¯\\_(ツ)_/¯' });
      if (sub === 'tableflip') return interaction.reply({ content: '(╯°□°）╯︵ ┻━┻' });
      if (sub === 'unflip') return interaction.reply({ content: '┬─┬ ノ( ゜-゜ノ)' });
      if (sub === 'lenny') return interaction.reply({ content: '( ͡° ͜ʖ ͡°)' });
    }

    if (group === 'meters') {
      const user = interaction.options.getUser('user') || interaction.user;
      if (sub === 'iq') {
        const iq = randomInt(50, 200);
        const label = iq<85?'😂 Below average':iq<115?'🙂 Average':iq<130?'🧠 Above average':iq<145?'💡 Gifted':'🔬 Genius';
        return interaction.reply({ embeds: [infoEmbed('🧠 IQ Test', `**${user.username}**'s IQ: **${iq}** — ${label}`)] });
      }
      if (sub === 'howgay') return interaction.reply({ embeds: [infoEmbed('🌈 Gay Meter', `**${user.username}** is **${randomInt(0,100)}%** gay.`)] });
      if (sub === 'howdumb') return interaction.reply({ embeds: [infoEmbed('🧠 Dumb Meter', `**${user.username}** is **${randomInt(0,100)}%** dumb.`)] });
      if (sub === 'howrich') return interaction.reply({ embeds: [infoEmbed('💰 Rich Meter', `**${user.username}** is **${randomInt(0,100)}%** rich.`)] });
      if (sub === 'howlucky') return interaction.reply({ embeds: [infoEmbed('🍀 Luck Meter', `**${user.username}** is **${randomInt(0,100)}%** lucky today.`)] });
      if (sub === 'howcool') return interaction.reply({ embeds: [infoEmbed('😎 Cool Meter', `**${user.username}** is **${randomInt(0,100)}%** cool.`)] });
      if (sub === 'howcringe') return interaction.reply({ embeds: [infoEmbed('😬 Cringe Meter', `**${user.username}** is **${randomInt(0,100)}%** cringe.`)] });
      if (sub === 'fight') {
        const target = interaction.options.getUser('user');
        const winner = Math.random() < 0.5 ? interaction.user : target;
        return interaction.reply({ embeds: [infoEmbed('⚔️ Fight', `${interaction.user} VS ${target}\n\n🏆 **${winner.username}** wins!`)] });
      }
      if (sub === 'hack') {
        const target = interaction.options.getUser('user') || interaction.user;
        await interaction.reply({ embeds: [infoEmbed(`💻 Hacking ${target.username}...`, 'Initiating hack...')] });
        const fakeData = [`IP: 192.168.${randomInt(0,255)}.${randomInt(0,255)}`,`Password: ${'*'.repeat(randomInt(8,16))}`,`Location: ${randomItem(['New York','Tokyo','London','Sydney','Paris'])}`,`SSN: ***-**-${randomInt(1000,9999)}`];
        setTimeout(() => interaction.editReply({ embeds: [infoEmbed('💻 Hack Complete', fakeData.join('\n'))] }), 2000);
        return;
      }
      if (sub === 'gayrate') {
        const pct = randomInt(0, 100);
        const filled = Math.round(pct/10);
        const bar = '🏳️‍🌈'.repeat(filled)+'⬜'.repeat(10-filled);
        return interaction.reply({ embeds: [infoEmbed('🌈 Gay Rate', `**${user.username}**\n${bar}\n**${pct}%**`)] });
      }
    }
  }
};
