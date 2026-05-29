const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, infoEmbed } = require('../utils/embed');
const { randomItem } = require('../utils/helpers');

function makeSocialSub(name, description) {
  return new SlashCommandBuilder().addSubcommand
    ? null
    : null;
}

const socialData = {
  hug: { emoji: '🤗', msgs: ['gives a warm hug to', 'wraps their arms around', 'hugs tightly'] },
  kiss: { emoji: '😘', msgs: ['gives a sweet kiss to', 'kisses softly', 'leans in and kisses'] },
  slap: { emoji: '👋', msgs: ['slaps', 'gives a hard slap to', 'smacks'] },
  pat: { emoji: '🤲', msgs: ['pats the head of', 'gives a gentle pat to', 'lovingly pats'] },
  poke: { emoji: '👉', msgs: ['pokes', 'lightly pokes', 'jabs'] },
  wave: { emoji: '👋', msgs: ['waves at', 'enthusiastically waves at', 'gives a friendly wave to'] },
  cuddle: { emoji: '🥰', msgs: ['cuddles with', 'snuggles up to', 'wraps up with'] },
  bite: { emoji: '😤', msgs: ['bites', 'chomps on', 'takes a bite of'] },
  punch: { emoji: '👊', msgs: ['punches', 'throws a punch at', 'decks'] },
  highfive: { emoji: '🙌', msgs: ['high fives', 'smacks hands with', 'gives a big high five to'] },
  headpat: { emoji: '🫶', msgs: ['gives a comforting headpat to', 'pats the head of', 'boops the head of'] },
  nuzzle: { emoji: '🥺', msgs: ['nuzzles up to', 'rubs their face against', 'nuzzles affectionately'] },
  lick: { emoji: '👅', msgs: ['licks', 'gives a big lick to', 'tastes'] },
  boop: { emoji: '☝️', msgs: ['boops the nose of', 'gently boops', 'gives a boop to'] },
  tickle: { emoji: '🤣', msgs: ['tickles', 'attacks with tickles', 'mercilessly tickles'] },
  feed: { emoji: '🍪', msgs: ['feeds a cookie to', 'offers food to', 'feeds'] },
  stare: { emoji: '👀', msgs: ['stares intensely at', 'locks eyes with', 'gazes deeply at'] },
  throw: { emoji: '🎯', msgs: ['throws something at', 'lobs an object at', 'chucks something at'] },
  shoot: { emoji: '🎯', msgs: ['shoots a nerf dart at', 'fires at', 'zaps'] },
  bonk: { emoji: '🔨', msgs: ['bonks', 'sends to horny jail', 'bonks on the head'] }
};

const builder = new SlashCommandBuilder()
  .setName('social')
  .setDescription('Social interaction commands')
  .addSubcommandGroup(g => {
    g.setName('action').setDescription('Action commands');
    for (const [name, data] of Object.entries(socialData).slice(0, 10)) {
      g.addSubcommand(s => s.setName(name).setDescription(`${name} a user`).addUserOption(o => o.setName('user').setDescription('User').setRequired(true)));
    }
    return g;
  })
  .addSubcommandGroup(g => {
    g.setName('emote').setDescription('Emote commands');
    for (const [name, data] of Object.entries(socialData).slice(10)) {
      g.addSubcommand(s => s.setName(name).setDescription(`${name} a user`).addUserOption(o => o.setName('user').setDescription('User').setRequired(true)));
    }
    g.addSubcommand(s => s.setName('cry').setDescription('Cry').addUserOption(o => o.setName('user').setDescription('Cry at someone (optional)')));
    g.addSubcommand(s => s.setName('laugh').setDescription('Laugh').addUserOption(o => o.setName('user').setDescription('Laugh at someone (optional)')));
    g.addSubcommand(s => s.setName('dance').setDescription('Dance').addUserOption(o => o.setName('user').setDescription('Dance with someone (optional)')));
    g.addSubcommand(s => s.setName('blush').setDescription('Blush').addUserOption(o => o.setName('user').setDescription('Blush at someone (optional)')));
    g.addSubcommand(s => s.setName('smile').setDescription('Smile').addUserOption(o => o.setName('user').setDescription('Smile at someone (optional)')));
    g.addSubcommand(s => s.setName('wink').setDescription('Wink').addUserOption(o => o.setName('user').setDescription('Wink at someone (optional)')));
    g.addSubcommand(s => s.setName('shy').setDescription('Act shy').addUserOption(o => o.setName('user').setDescription('Be shy around someone (optional)')));
    g.addSubcommand(s => s.setName('sleep').setDescription('Go to sleep'));
    return g;
  });

module.exports = {
  data: builder,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const author = interaction.user;

    if (socialData[sub]) {
      const target = interaction.options.getUser('user');
      if (target.id === author.id) return interaction.reply({ embeds: [errorEmbed("You can't do that to yourself.")], ephemeral: true });
      const data = socialData[sub];
      const text = randomItem(data.msgs);
      return interaction.reply({ embeds: [infoEmbed(null, `${data.emoji} **${author.username}** ${text} **${target.username}**`)] });
    }

    const emoteMap = {
      cry: (u) => u ? `😭 **${author.username}** cries because of **${u.username}**` : `😭 **${author.username}** is crying`,
      laugh: (u) => u ? `😂 **${author.username}** laughs at **${u.username}**` : `😂 **${author.username}** is laughing`,
      dance: (u) => u ? `💃 **${author.username}** dances with **${u.username}**` : `💃 **${author.username}** is dancing`,
      blush: (u) => u ? `😊 **${author.username}** blushes at **${u.username}**` : `😊 **${author.username}** is blushing`,
      smile: (u) => u ? `😊 **${author.username}** smiles at **${u.username}**` : `😊 **${author.username}** is smiling`,
      wink: (u) => u ? `😉 **${author.username}** winks at **${u.username}**` : `😉 **${author.username}** winks`,
      shy: (u) => u ? `😳 **${author.username}** is shy around **${u.username}**` : `😳 **${author.username}** is feeling shy`,
      sleep: () => `😴 **${author.username}** has gone to sleep... zzz`,
    };

    if (emoteMap[sub]) {
      const user = interaction.options.getUser('user');
      return interaction.reply({ embeds: [infoEmbed(null, emoteMap[sub](user))] });
    }
  }
};
