const { EmbedBuilder } = require('discord.js');
const { successEmbed, errorEmbed, infoEmbed, CREDITS, BRAND_COLOR } = require('../utils/embed');
const { randomInt, randomItem } = require('../utils/helpers');
const db = require('../utils/database');

const category = 'Misc';

const commands = [
  {
    name: 'countdown',
    description: 'Start a countdown timer in chat',
    usage: '!countdown <seconds>',
    async execute(message, args) {
      const secs = parseInt(args[0]);
      if (isNaN(secs) || secs < 1 || secs > 60) return message.reply({ embeds: [errorEmbed('Please provide a number between 1 and 60.')] });
      const msg = await message.reply({ embeds: [infoEmbed('⏱️ Countdown', `**${secs}** seconds remaining...`)] });
      let remaining = secs - 1;
      const interval = setInterval(async () => {
        if (remaining <= 0) {
          clearInterval(interval);
          await msg.edit({ embeds: [successEmbed('🎉 Done!', 'Countdown complete!')] });
          return;
        }
        await msg.edit({ embeds: [infoEmbed('⏱️ Countdown', `**${remaining}** second${remaining !== 1 ? 's' : ''} remaining...`)] });
        remaining--;
      }, 1000);
    }
  },
  {
    name: 'math',
    description: 'Solve a math problem',
    usage: '!math <expression>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide a math expression.')] });
      const expr = args.join(' ').replace(/[^0-9+\-*/().\s^%]/g, '');
      try {
        const result = Function(`"use strict"; return (${expr})`)();
        message.reply({ embeds: [infoEmbed('🔢 Math', `**${expr}** = **${result}**`)] });
      } catch {
        message.reply({ embeds: [errorEmbed('Invalid math expression.')] });
      }
    }
  },
  {
    name: 'bmi',
    description: 'Calculate BMI',
    usage: '!bmi <weight_kg> <height_cm>',
    async execute(message, args) {
      const weight = parseFloat(args[0]);
      const height = parseFloat(args[1]) / 100;
      if (isNaN(weight) || isNaN(height) || height <= 0) return message.reply({ embeds: [errorEmbed('Usage: `!bmi <weight_kg> <height_cm>`')] });
      const bmi = (weight / (height * height)).toFixed(1);
      let category = '';
      if (bmi < 18.5) category = '🔵 Underweight';
      else if (bmi < 25) category = '🟢 Normal weight';
      else if (bmi < 30) category = '🟡 Overweight';
      else category = '🔴 Obese';
      message.reply({ embeds: [infoEmbed('⚖️ BMI Calculator', `**BMI:** ${bmi}\n**Category:** ${category}`)] });
    }
  },
  {
    name: 'temperature',
    description: 'Convert temperature units',
    usage: '!temperature <value> <unit>',
    aliases: ['temp', 'convert-temp'],
    async execute(message, args) {
      const val = parseFloat(args[0]);
      const unit = args[1]?.toUpperCase();
      if (isNaN(val) || !unit) return message.reply({ embeds: [errorEmbed('Usage: `!temperature <value> <C/F/K>`')] });
      let result;
      if (unit === 'C') result = `${val}°C = **${(val * 9/5 + 32).toFixed(1)}°F** | **${(val + 273.15).toFixed(1)}K**`;
      else if (unit === 'F') result = `${val}°F = **${((val - 32) * 5/9).toFixed(1)}°C** | **${((val - 32) * 5/9 + 273.15).toFixed(1)}K**`;
      else if (unit === 'K') result = `${val}K = **${(val - 273.15).toFixed(1)}°C** | **${((val - 273.15) * 9/5 + 32).toFixed(1)}°F**`;
      else return message.reply({ embeds: [errorEmbed('Unit must be C, F, or K.')] });
      message.reply({ embeds: [infoEmbed('🌡️ Temperature Converter', result)] });
    }
  },
  {
    name: 'binary',
    description: 'Convert text to binary or binary to text',
    usage: '!binary <text or binary>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide text or binary.')] });
      const input = args.join(' ');
      if (/^[01\s]+$/.test(input)) {
        const text = input.split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
        message.reply({ embeds: [infoEmbed('💾 Binary → Text', text)] });
      } else {
        const binary = input.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        message.reply({ embeds: [infoEmbed('💾 Text → Binary', `\`${binary}\``)] });
      }
    }
  },
  {
    name: 'morse',
    description: 'Convert text to Morse code',
    usage: '!morse <text>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      const MORSE = { A:'.-',B:'-...',C:'-.-.',D:'-..',E:'.',F:'..-.',G:'--.',H:'....',I:'..',J:'.---',K:'-.-',L:'.-..',M:'--',N:'-.',O:'---',P:'.--.',Q:'--.-',R:'.-.',S:'...',T:'-',U:'..-',V:'...-',W:'.--',X:'-..-',Y:'-.--',Z:'--..',0:'-----',1:'.----',2:'..---',3:'...--',4:'....-',5:'.....',6:'-....',7:'--...',8:'---..',9:'----.' };
      const result = args.join(' ').toUpperCase().split('').map(c => c === ' ' ? '/' : (MORSE[c] || '?')).join(' ');
      message.reply({ embeds: [infoEmbed('📡 Morse Code', result)] });
    }
  },
  {
    name: 'caesar',
    description: 'Caesar cipher encode/decode',
    usage: '!caesar <shift> <text>',
    async execute(message, args) {
      const shift = parseInt(args[0]);
      const text = args.slice(1).join(' ');
      if (isNaN(shift) || !text) return message.reply({ embeds: [errorEmbed('Usage: `!caesar <shift> <text>`')] });
      const result = text.split('').map(c => {
        if (/[a-zA-Z]/.test(c)) {
          const base = c >= 'a' ? 97 : 65;
          return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26 + 26) % 26 + base);
        }
        return c;
      }).join('');
      message.reply({ embeds: [infoEmbed('🔐 Caesar Cipher', `**Input:** ${text}\n**Shift:** ${shift}\n**Output:** ${result}`)] });
    }
  },
  {
    name: 'passwordgen',
    description: 'Generate a random secure password',
    usage: '!passwordgen [length]',
    aliases: ['genpassword', 'randpassword'],
    async execute(message, args) {
      const length = Math.min(parseInt(args[0]) || 16, 64);
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
      let password = '';
      for (let i = 0; i < length; i++) password += chars[randomInt(0, chars.length - 1)];
      const reply = await message.reply({ embeds: [infoEmbed('🔑 Password Generator', `||\`${password}\`||\n*(Click to reveal — ${length} characters)*`)] });
    }
  },
  {
    name: 'tinyurl',
    description: 'Shorten a URL (format only)',
    usage: '!tinyurl <url>',
    async execute(message, args) {
      const url = args[0];
      if (!url || !url.startsWith('http')) return message.reply({ embeds: [errorEmbed('Please provide a valid URL.')] });
      message.reply({ embeds: [infoEmbed('🔗 URL Shortener', `To shorten URLs, visit [tinyurl.com](https://tinyurl.com) and paste:\n\`${url}\``)] });
    }
  },
  {
    name: 'charactercount',
    description: 'Count characters in text',
    usage: '!charactercount <text>',
    aliases: ['charcount', 'wordcount'],
    async execute(message, args) {
      const text = args.join(' ');
      if (!text) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      const chars = text.length;
      const words = text.split(/\s+/).filter(Boolean).length;
      const lines = text.split('\n').length;
      message.reply({ embeds: [infoEmbed('📝 Text Stats', `**Characters:** ${chars}\n**Words:** ${words}\n**Lines:** ${lines}`)] });
    }
  },
  {
    name: 'upper',
    description: 'Convert text to uppercase',
    usage: '!upper <text>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      message.reply({ embeds: [infoEmbed('⬆️ Uppercase', args.join(' ').toUpperCase())] });
    }
  },
  {
    name: 'lower',
    description: 'Convert text to lowercase',
    usage: '!lower <text>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      message.reply({ embeds: [infoEmbed('⬇️ Lowercase', args.join(' ').toLowerCase())] });
    }
  },
  {
    name: 'owoify',
    description: 'Convert text to OwO speak',
    usage: '!owoify <text>',
    aliases: ['owo'],
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      const text = args.join(' ')
        .replace(/r/g, 'w').replace(/R/g, 'W')
        .replace(/l/g, 'w').replace(/L/g, 'W')
        .replace(/n([aeiou])/g, 'ny$1')
        .replace(/N([aeiou])/g, 'Ny$1');
      const endings = [' UwU', ' OwO', ' >w<', ' ^w^', '~'];
      message.reply({ embeds: [infoEmbed('OwO', text + randomItem(endings))] });
    }
  },
  {
    name: 'piglatin',
    description: 'Convert text to Pig Latin',
    usage: '!piglatin <text>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      const result = args.map(word => {
        const vowels = 'aeiouAEIOU';
        if (vowels.includes(word[0])) return word + 'way';
        let i = 0;
        while (i < word.length && !vowels.includes(word[i])) i++;
        return word.slice(i) + word.slice(0, i) + 'ay';
      }).join(' ');
      message.reply({ embeds: [infoEmbed('🐷 Pig Latin', result)] });
    }
  },
  {
    name: 'acronym',
    description: 'Create an acronym from a phrase',
    usage: '!acronym <phrase>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide a phrase.')] });
      const acronym = args.map(w => w[0].toUpperCase()).join('');
      message.reply({ embeds: [infoEmbed('🔤 Acronym', `**${args.join(' ')}**\n→ **${acronym}**`)] });
    }
  },
  {
    name: 'percentage',
    description: 'Calculate a percentage',
    usage: '!percentage <value> <total>',
    async execute(message, args) {
      const val = parseFloat(args[0]);
      const total = parseFloat(args[1]);
      if (isNaN(val) || isNaN(total) || total === 0) return message.reply({ embeds: [errorEmbed('Usage: `!percentage <value> <total>`')] });
      const pct = ((val / total) * 100).toFixed(2);
      message.reply({ embeds: [infoEmbed('📊 Percentage', `**${val}** out of **${total}** = **${pct}%**`)] });
    }
  },
  {
    name: 'splittext',
    description: 'Split text by a delimiter',
    usage: '!splittext <delimiter> <text>',
    async execute(message, args) {
      const delim = args[0];
      const text = args.slice(1).join(' ');
      if (!delim || !text) return message.reply({ embeds: [errorEmbed('Usage: `!splittext <delimiter> <text>`')] });
      const parts = text.split(delim).map((p, i) => `**${i+1}.** ${p.trim()}`).join('\n');
      message.reply({ embeds: [infoEmbed('✂️ Split Text', parts || 'No splits found.')] });
    }
  },
  {
    name: 'fliptext',
    description: 'Flip text upside-down',
    usage: '!fliptext <text>',
    async execute(message, args) {
      if (!args.length) return message.reply({ embeds: [errorEmbed('Please provide text.')] });
      const normal = 'abcdefghijklmnopqrstuvwxyz';
      const flipped = 'ɐqɔpǝɟɓɥᴉɾʞlɯuodbɹsʇnʌʍxʎz';
      const result = args.join(' ').toLowerCase().split('').map(c => {
        const i = normal.indexOf(c);
        return i !== -1 ? flipped[i] : c;
      }).reverse().join('');
      message.reply({ embeds: [infoEmbed('🙃 Flipped Text', result)] });
    }
  }
];

module.exports = { category, commands };
