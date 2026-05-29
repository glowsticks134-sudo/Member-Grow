const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: './data/database.sqlite' });

module.exports = db;
