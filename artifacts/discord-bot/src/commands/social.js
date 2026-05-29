const { infoEmbed, errorEmbed } = require('../utils/embed');

const category = 'Social';

function socialCommand(name, emoji, description, messages) {
  return {
    name,
    description,
    usage: `!${name} <user>`,
    async execute(message, args) {
      const target = message.mentions.users.first();
      if (!target) return message.reply({ embeds: [errorEmbed('Please mention a user.')] });
      if (target.id === message.author.id) return message.reply({ embeds: [errorEmbed("You can't do that to yourself.")] });
      const text = messages[Math.floor(Math.random() * messages.length)];
      message.reply({ embeds: [infoEmbed(null, `${emoji} **${message.author.username}** ${text} **${target.username}**`)] });
    }
  };
}

const commands = [
  socialCommand('hug', '🤗', 'Hug someone', ['gives a warm hug to', 'wraps their arms around', 'hugs tightly']),
  socialCommand('kiss', '😘', 'Kiss someone', ['gives a sweet kiss to', 'kisses softly', 'leans in and kisses']),
  socialCommand('slap', '👋', 'Slap someone', ['slaps', 'gives a hard slap to', 'smacks']),
  socialCommand('pat', '🤲', 'Pat someone', ['pats the head of', 'gives a gentle pat to', 'lovingly pats']),
  socialCommand('poke', '👉', 'Poke someone', ['pokes', 'lightly pokes', 'jabs']),
  socialCommand('wave', '👋', 'Wave at someone', ['waves at', 'enthusiastically waves at', 'gives a friendly wave to']),
  socialCommand('cuddle', '🥰', 'Cuddle with someone', ['cuddles with', 'snuggles up to', 'wraps up with']),
  socialCommand('bite', '😤', 'Bite someone', ['bites', 'chomps on', 'takes a bite of']),
  socialCommand('punch', '👊', 'Punch someone', ['punches', 'throws a punch at', 'decks']),
  socialCommand('highfive', '🙌', 'High five someone', ['high fives', 'smacks hands with', 'gives a big high five to']),
  socialCommand('headpat', '🫶', 'Headpat someone', ['gives a comforting headpat to', 'pats the head of', 'boops the head of']),
  socialCommand('nuzzle', '🥺', 'Nuzzle someone', ['nuzzles up to', 'rubs their face against', 'nuzzles affectionately']),
  socialCommand('lick', '👅', 'Lick someone', ['licks', 'gives a big lick to', 'tastes']),
  socialCommand('boop', '☝️', 'Boop someone', ['boops the nose of', 'gently boops', 'gives a boop to']),
  socialCommand('tickle', '🤣', 'Tickle someone', ['tickles', 'attacks with tickles', 'mercilessly tickles']),
  socialCommand('feed', '🍪', 'Feed someone', ['feeds a cookie to', 'offers food to', 'feeds']),
  socialCommand('stare', '👀', 'Stare at someone', ['stares intensely at', 'locks eyes with', 'gazes deeply at']),
  socialCommand('throw', '🎯', 'Throw something at someone', ['throws something at', 'lobs an object at', 'chucks something at']),
  socialCommand('shoot', '🎯', 'Shoot someone (nerf)', ['shoots a nerf dart at', 'fires at', 'zaps']),
  socialCommand('bonk', '🔨', 'Bonk someone', ['bonks', 'sends to horny jail', 'bonks on the head']),
  {
    name: 'cry',
    description: 'Cry alone or at someone',
    usage: '!cry [user]',
    async execute(message, args) {
      const target = message.mentions.users.first();
      const text = target
        ? `😭 **${message.author.username}** cries because of **${target.username}**`
        : `😭 **${message.author.username}** is crying`;
      message.reply({ embeds: [infoEmbed(null, text)] });
    }
  },
  {
    name: 'laugh',
    description: 'Laugh at something',
    usage: '!laugh [user]',
    async execute(message, args) {
      const target = message.mentions.users.first();
      const text = target
        ? `😂 **${message.author.username}** laughs at **${target.username}**`
        : `😂 **${message.author.username}** is laughing hysterically`;
      message.reply({ embeds: [infoEmbed(null, text)] });
    }
  },
  {
    name: 'smile',
    description: 'Smile at someone',
    usage: '!smile [user]',
    async execute(message, args) {
      const target = message.mentions.users.first();
      const text = target
        ? `😊 **${message.author.username}** smiles at **${target.username}**`
        : `😊 **${message.author.username}** is smiling`;
      message.reply({ embeds: [infoEmbed(null, text)] });
    }
  },
  {
    name: 'dance',
    description: 'Dance',
    usage: '!dance [user]',
    async execute(message, args) {
      const target = message.mentions.users.first();
      const text = target
        ? `💃 **${message.author.username}** dances with **${target.username}**`
        : `💃 **${message.author.username}** is dancing!`;
      message.reply({ embeds: [infoEmbed(null, text)] });
    }
  },
  {
    name: 'blush',
    description: 'Blush',
    usage: '!blush [user]',
    async execute(message, args) {
      const target = message.mentions.users.first();
      const text = target
        ? `😳 **${message.author.username}** blushes at **${target.username}**`
        : `😳 **${message.author.username}** is blushing!`;
      message.reply({ embeds: [infoEmbed(null, text)] });
    }
  },
  {
    name: 'facepalm',
    description: 'Facepalm at something',
    usage: '!facepalm [user]',
    async execute(message, args) {
      const target = message.mentions.users.first();
      const text = target
        ? `🤦 **${message.author.username}** facepalms at **${target.username}**`
        : `🤦 **${message.author.username}** facepalms`;
      message.reply({ embeds: [infoEmbed(null, text)] });
    }
  },
  {
    name: 'think',
    description: 'Think about something',
    usage: '!think [topic]',
    async execute(message, args) {
      const topic = args.join(' ') || 'life';
      message.reply({ embeds: [infoEmbed(null, `🤔 **${message.author.username}** thinks about *${topic}*...`)] });
    }
  },
  {
    name: 'sleep',
    description: 'Fall asleep',
    usage: '!sleep',
    async execute(message, args) {
      message.reply({ embeds: [infoEmbed(null, `😴 **${message.author.username}** has fallen asleep. zzz...`)] });
    }
  }
];

module.exports = { category, commands };
