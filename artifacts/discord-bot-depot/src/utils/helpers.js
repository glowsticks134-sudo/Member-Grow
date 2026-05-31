const ms = require('ms');

function parseDuration(str) {
  try { return ms(str); } catch { return null; }
}

function formatDuration(ms_val) {
  const seconds = Math.floor(ms_val / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function chunk(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function abbreviate(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return String(num);
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function resolveUser(guild, query) {
  if (!query) return null;
  const id = query.replace(/[<@!>]/g, '');
  return guild.members.fetch(id).catch(() => null);
}

async function resolveRole(guild, query) {
  if (!query) return null;
  const id = query.replace(/[<@&>]/g, '');
  return guild.roles.fetch(id).catch(() =>
    guild.roles.cache.find(r => r.name.toLowerCase() === query.toLowerCase()) || null
  );
}

async function resolveChannel(guild, query) {
  if (!query) return null;
  const id = query.replace(/[<#>]/g, '');
  return guild.channels.cache.get(id) ||
    guild.channels.cache.find(c => c.name.toLowerCase() === query.toLowerCase()) || null;
}

module.exports = { parseDuration, formatDuration, chunk, randomInt, randomItem, capitalize, abbreviate, clamp, sleep, resolveUser, resolveRole, resolveChannel };
