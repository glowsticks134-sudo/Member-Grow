const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, infoEmbed, successEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { randomInt, randomItem } = require('../utils/helpers');
const db = require('../utils/database');

const eightball = ['Yes!', 'No.', 'Maybe...', 'Absolutely!', 'Definitely not.', 'Ask again later.', 'I have no idea.', 'Without a doubt!', 'Very unlikely.', 'The stars say yes!'];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('misc')
    .setDescription('Miscellaneous commands')
    .addSubcommand(s => s.setName('servertime').setDescription('Current server time'))
    .addSubcommand(s => s.setName('weather').setDescription('Fake weather report').addStringOption(o => o.setName('city').setDescription('City name').setRequired(true)))
    .addSubcommand(s => s.setName('horoscope').setDescription('Daily horoscope').addStringOption(o => o.setName('sign').setDescription('Zodiac sign').setRequired(true)))
    .addSubcommand(s => s.setName('urban').setDescription('Urban dictionary lookup').addStringOption(o => o.setName('word').setDescription('Word to look up').setRequired(true)))
    .addSubcommand(s => s.setName('ascii').setDescription('ASCII art generator').addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)))
    .addSubcommand(s => s.setName('encode').setDescription('Encode text to morse code').addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)))
    .addSubcommand(s => s.setName('decode').setDescription('Decode morse code').addStringOption(o => o.setName('code').setDescription('Morse code').setRequired(true)))
    .addSubcommand(s => s.setName('haiku').setDescription('Generate a random haiku'))
    .addSubcommand(s => s.setName('acronym').setDescription('Generate acronym meaning').addStringOption(o => o.setName('word').setDescription('Acronym').setRequired(true)))
    .addSubcommand(s => s.setName('word').setDescription('Random word of the day'))
    .addSubcommand(s => s.setName('inspiration').setDescription('Inspirational quote'))
    .addSubcommand(s => s.setName('countdown').setDescription('Countdown to a date').addStringOption(o => o.setName('date').setDescription('Date e.g. 2025-12-25').setRequired(true)))
    .addSubcommand(s => s.setName('binary').setDescription('Convert text to binary').addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)))
    .addSubcommand(s => s.setName('hex').setDescription('Convert text to hex').addStringOption(o => o.setName('text').setDescription('Text').setRequired(true)))
    .addSubcommand(s => s.setName('password').setDescription('Generate a random password').addIntegerOption(o => o.setName('length').setDescription('Length (8-64)').setMinValue(8).setMaxValue(64)))
    .addSubcommand(s => s.setName('uuid').setDescription('Generate a UUID'))
    .addSubcommand(s => s.setName('flip').setDescription('Flip a coin'))
    .addSubcommand(s => s.setName('rng').setDescription('Random number').addIntegerOption(o => o.setName('min').setDescription('Min')).addIntegerOption(o => o.setName('max').setDescription('Max'))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'servertime') {
      const now = new Date();
      return interaction.reply({ embeds: [infoEmbed('🕐 Server Time', `<t:${Math.floor(now.getTime() / 1000)}:F>\n<t:${Math.floor(now.getTime() / 1000)}:R>`)] });
    }

    if (sub === 'weather') {
      const city = interaction.options.getString('city');
      const conditions = ['☀️ Sunny', '🌤 Partly Cloudy', '🌧 Rainy', '🌩 Thunderstorm', '❄️ Snowy', '🌫 Foggy', '🌪 Windy'];
      const temp = randomInt(0, 35);
      const condition = randomItem(conditions);
      return interaction.reply({ embeds: [infoEmbed(`🌍 Weather in ${city}`, `**Condition:** ${condition}\n**Temperature:** ${temp}°C (${Math.round(temp * 1.8 + 32)}°F)\n**Humidity:** ${randomInt(20, 90)}%\n**Wind:** ${randomInt(5, 40)} km/h\n\n*Note: Fake weather for fun!*`)] });
    }

    if (sub === 'horoscope') {
      const sign = interaction.options.getString('sign');
      const predictions = ['Today is your day! Opportunities await.', 'Be cautious with decisions today.', 'Love is in the air for you this week.', 'Financial luck comes your way soon.', 'Take a step back and reflect on your goals.', 'A new friendship will bring great joy.', 'The stars align in your favor today!', 'Focus on your health and well-being.'];
      return interaction.reply({ embeds: [infoEmbed(`♈ Horoscope — ${sign}`, randomItem(predictions) + '\n\n*Lucky number: ' + randomInt(1, 99) + '*')] });
    }

    if (sub === 'urban') {
      const word = interaction.options.getString('word');
      return interaction.reply({ embeds: [infoEmbed(`📖 Urban: ${word}`, `*Urban dictionary integration coming soon!*\n\nFor now: **${word}** — probably something weird or funny.`)] });
    }

    if (sub === 'ascii') {
      const text = interaction.options.getString('text').slice(0, 10);
      const simple = `\`\`\`\n${text.split('').join(' ')}\n\`\`\``;
      return interaction.reply({ embeds: [infoEmbed('ASCII Art', simple)] });
    }

    if (sub === 'encode') {
      const morseMap = { A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.', H:'....', I:'..', J:'.---', K:'-.-', L:'.-..', M:'--', N:'-.', O:'---', P:'.--.', Q:'--.-', R:'.-.', S:'...', T:'-', U:'..-', V:'...-', W:'.--', X:'-..-', Y:'-.--', Z:'--..', '0':'-----', '1':'.----', '2':'..---', '3':'...--', '4':'....-', '5':'.....', '6':'-....', '7':'--...', '8':'---..', '9':'----.' };
      const text = interaction.options.getString('text').toUpperCase();
      const encoded = text.split('').map(c => c === ' ' ? '/' : morseMap[c] || '?').join(' ');
      return interaction.reply({ embeds: [infoEmbed('📡 Morse Code', `\`${encoded}\``)] });
    }

    if (sub === 'decode') {
      const reverseMap = { '.-':'A', '-...':'B', '-.-.':'C', '-..':'D', '.':'E', '..-.':'F', '--.':'G', '....':'H', '..':'I', '.---':'J', '-.-':'K', '.-..':'L', '--':'M', '-.':'N', '---':'O', '.--.':'P', '--.-':'Q', '.-.':'R', '...':'S', '-':'T', '..-':'U', '...-':'V', '.--':'W', '-..-':'X', '-.--':'Y', '--..':'Z', '-----':'0', '.----':'1', '..---':'2', '...--':'3', '....-':'4', '.....':'5', '-....':'6', '--...':'7', '---..':'8', '----.':'9' };
      const code = interaction.options.getString('code');
      const decoded = code.split(' ').map(c => c === '/' ? ' ' : reverseMap[c] || '?').join('');
      return interaction.reply({ embeds: [infoEmbed('📡 Decoded', decoded)] });
    }

    if (sub === 'haiku') {
      const haikus = [
        'An old silent pond\nA frog jumps into the pond\nSplash! Silence again.',
        'Over the wintry\nForest, winds howl in rage\nWith no leaves to blow.',
        'In the cicada\'s cry\nNo sign can foretell\nHow soon it must die.',
        'Autumn moonlight\nA worm digs silently\nInto the chestnut.'
      ];
      return interaction.reply({ embeds: [infoEmbed('🌸 Haiku', randomItem(haikus))] });
    }

    if (sub === 'acronym') {
      const word = interaction.options.getString('word').toUpperCase();
      const words = ['Amazing', 'Brilliant', 'Creative', 'Dynamic', 'Energetic', 'Fantastic', 'Glorious', 'Honorable', 'Incredible', 'Joyful', 'Keen', 'Lively', 'Marvelous', 'Noble', 'Outstanding', 'Powerful', 'Quirky', 'Radiant', 'Stunning', 'Talented', 'Unique', 'Vibrant', 'Wonderful', 'Xenial', 'Youthful', 'Zestful'];
      const meaning = word.split('').map(l => words.find(w => w[0] === l) || l).join(' ');
      return interaction.reply({ embeds: [infoEmbed(`📝 ${word}`, meaning)] });
    }

    if (sub === 'word') {
      const wotd = ['serendipity', 'ephemeral', 'mellifluous', 'sonder', 'hiraeth', 'petrichor', 'halcyon', 'limerence', 'phosphene', 'vellichor'];
      const definitions = { serendipity: 'finding happy accidents', ephemeral: 'lasting for a very short time', mellifluous: 'sweet or musical, pleasant to hear', sonder: 'the realization that each passerby has a life as vivid as your own', hiraeth: 'a deep longing for a home you can\'t return to', petrichor: 'the smell of earth after rain', halcyon: 'denoting a period of time that was idyllically happy', limerence: 'the state of being infatuated with another person', phosphene: 'a ring of light seen when pressure is applied to the eyes', vellichor: 'the strange wistfulness of used bookshops' };
      const w = randomItem(wotd);
      return interaction.reply({ embeds: [infoEmbed(`📚 Word of the Day: ${w}`, definitions[w] || 'A wonderful word!')] });
    }

    if (sub === 'inspiration') {
      const quotes = ['The only way to do great work is to love what you do.', 'Believe you can and you\'re halfway there.', 'It does not matter how slowly you go as long as you do not stop.', 'Everything you\'ve ever wanted is on the other side of fear.', 'Success is not final, failure is not fatal: it is the courage to continue that counts.', 'The future belongs to those who believe in the beauty of their dreams.'];
      return interaction.reply({ embeds: [infoEmbed('✨ Inspiration', `*"${randomItem(quotes)}"*`)] });
    }

    if (sub === 'countdown') {
      const dateStr = interaction.options.getString('date');
      const target = new Date(dateStr);
      if (isNaN(target)) return interaction.reply({ embeds: [errorEmbed('Invalid date format.')], ephemeral: true });
      const diff = target - Date.now();
      if (diff < 0) return interaction.reply({ embeds: [infoEmbed('Countdown', `That date has already passed!`)] });
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      return interaction.reply({ embeds: [infoEmbed(`⏳ Countdown to ${dateStr}`, `**${days}** days, **${hours}** hours, **${mins}** minutes`)] });
    }

    if (sub === 'binary') {
      const text = interaction.options.getString('text');
      const binary = text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
      return interaction.reply({ embeds: [infoEmbed('💻 Binary', `\`${binary}\``)] });
    }

    if (sub === 'hex') {
      const text = interaction.options.getString('text');
      const hex = text.split('').map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
      return interaction.reply({ embeds: [infoEmbed('🔡 Hex', `\`${hex}\``)] });
    }

    if (sub === 'password') {
      const len = interaction.options.getInteger('length') || 16;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      const pwd = Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      return interaction.reply({ embeds: [infoEmbed('🔐 Password', `\`${pwd}\`\n\n*Keep this private!*`)], ephemeral: true });
    }

    if (sub === 'uuid') {
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });
      return interaction.reply({ embeds: [infoEmbed('🆔 UUID', `\`${uuid}\``)] });
    }

    if (sub === 'flip') {
      return interaction.reply({ embeds: [infoEmbed('🪙 Coin Flip', Math.random() < 0.5 ? 'Heads!' : 'Tails!')] });
    }

    if (sub === 'rng') {
      const min = interaction.options.getInteger('min') || 1;
      const max = interaction.options.getInteger('max') || 100;
      if (min >= max) return interaction.reply({ embeds: [errorEmbed('Min must be less than max.')], ephemeral: true });
      return interaction.reply({ embeds: [infoEmbed('🎲 Random Number', `**${randomInt(min, max)}** (${min}–${max})`)] });
    }
  }
};
