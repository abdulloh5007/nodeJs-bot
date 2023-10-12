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
    const botUrl = `<a href='https://t.me/levouJs_bot'>${string}</a>`
    return botUrl;
}

const botName = '@levouJS_bot'
const mongoDbCollectionName = 'bot'
const chatName = '@cty_channeldev'

module.exports = {
    mongoConnect,
    botUrl,
    botName,
    mongoDbCollectionName,
    chatName,
}