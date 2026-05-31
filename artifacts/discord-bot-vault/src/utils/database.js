const path = require('path');
const { QuickDB } = require('quick.db');
const db = new QuickDB({ filePath: path.join(__dirname, '../../data/database.sqlite') });

module.exports = db;
