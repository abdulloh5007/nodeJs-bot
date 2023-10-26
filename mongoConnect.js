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

const botName = '@levouJS_bot'
const mongoDbCollectionName = 'bot'
const chatName = '@cty_channeldev'

async function addingToDB(collection, userId) {
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const registerUserTime = `${day}-${month}-${year} ${hours}:${minutes}`

    function generateRandomElementsOnlyUsers(letters, numbers) {
        const alphabet = letters;
        const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    
        let randomNumberString = '';
        for (let i = 0; i < numbers; i++) {
            randomNumberString += Math.floor(Math.random() * 10);
        }
    
        return randomLetter + randomNumberString;
    }
    
    // Пример использования функции
    const onlyUsersId = generateRandomElementsOnlyUsers('BFNPRS', 7);
    const prefix = "5444";
    let cardNumber = prefix;
    for (let i = 0; i < 12; i++) {
        if (i % 4 === 0) {
            cardNumber += " ";
        }
        cardNumber += Math.floor(Math.random() * 10).toString();
    }

    collection.insertOne({
        id: userId,
        gameId: onlyUsersId,
        userName: 'Игрок',
        balance: 5000,
        uc: 0,
        registerTime: registerUserTime,
        lastBonusTime: 0,
        toBeAnAdmin: true,
        status: [{
            statusName: 'player',
            purchaseDate: 0,
            statusExpireDate: 0,
        }],
        limit: [{
            giveMoneyLimit: 50000,
            givedMoney: 0,
            updateDayLimit: 0,
            // promoMoneyLimit: 1000,
            // promoMoney: 0,
        }],
        business: [{
            have: false,
            name: "",
            workers: 0,
            maxWorkers: 0,
            profit: 0,
            workersProfit: 0,
            tax: 0,
            lastUpdTime: 0,
            speeds: 1,
        }],
        avatar: [{
            waiting: '',
            avaUrl: '',
        }],
        properties: [{
            houses: '',
            cars: '',
            lendHouse: 0,
            carGasoline: 0,
            carStatus: 0,
        }],
        referral: [{
            code: '',
            amount: 0,
        }],
        rates: [{
            wins: 0,
            loses: 0,
            all: 0
        }],
        ban: [{
            ban: false,
            cause: "",
            banTime: 0,
            unbanTime: 0,
        }],
        bankCard: [{
            cardHave: true,
            cardNumber: cardNumber,
            cardName: "mastercard",
            cardOwner: 'Игрок',
            cardValue: 0,
            cardPassword: 0,
            cardOwnerId: userId
        }],
        depozit: [{
            balance: 0,
            procent: 10,
            limit: 50000,
            date: 0,
        }],
        stats: [{
            openCaseHouses: 0,
            openCaseCars: 0,
            createPromos: 0,
        }]
    })
    
    const collectionAchievs = await mongoConnect('achievs');
    await collectionAchievs.insertOne({
        id: userId,
        race: [{
            botRacing: 0,
            maxBotRacing: 50,
            cost: 5,
        }],
        kazino: [{
            kazino: 0,
            maxKazino: 100,
            cost: 5,
        }],
        case: [{
            openCase: 0,
            maxOpenCase: 10,
            cost: 10,
        }],
        car: [{
            buyCar: false,
            cost: 5,
        }],
        house: [{
            buyHouse: false,
            cost: 5,
        }],
        island: [{
            openIsland: false,
            cost: 5,
        }],
        business: [{
            buyBusiness: false,
            cost: 10,
        }]
    })
}

module.exports = {
    mongoConnect,
    botUrl,
    botName,
    mongoDbCollectionName,
    chatName,
    addingToDB,
}