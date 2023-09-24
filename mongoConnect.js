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
    const db = client.db('testbot');
    const collection = db.collection(colName);

    return collection;
}

module.exports = {
    mongoConnect,
}