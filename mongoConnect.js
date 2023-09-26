require('dotenv').config();
const mongoDbUrl = process.env.MONGO_DB_URL
const { MongoClient } = require('mongodb');
const client = new MongoClient(mongoDbUrl);

async function connection() {
    try {
        await client.connect();
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

async function mongoConnect(colName) {
    const db = client.db('bot');
    const collection = db.collection(colName);

    return collection;
}

function botUrl(string) {
    const botUrl = `<a href='https://t.me/levouJS_bot'>${string}</a>`
    return botUrl;
}

module.exports = {
    mongoConnect,
    botUrl,
}