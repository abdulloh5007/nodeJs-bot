require('dotenv').config();
const mongoDbUrl = process.env.MONGO_DB_URL
const { MongoClient } = require('mongodb');
const client = new MongoClient(mongoDbUrl);
const { donatedUsers } = require("../donate/donatedUsers")

/**
 * Establishes a connection to a MongoDB database using the MongoClient class.
 */
async function connection() {
    try {
        await client.connect();
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789♂♀♪♫☼►◄‼►¶∟▲▼';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
}

async function openIsland(msg, bot, collection) {
    const db = client.db('bot');
    const collectionIslands = db.collection('islands');

    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const userIsland = await collectionIslands.findOne({ id: userId1 })
    const user = await collection.findOne({ id: userId1 })
    const userName = user.userName
    const generatedString = generateRandomString(7)
    const startNameIsland = `Смени имя острова_${generatedString}`

    if (!userIsland) {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно открыли свой остров
<b>Название:</b> <i>${startNameIsland}</i>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        await collectionIslands.insertOne({
            id: userId1,
            name: startNameIsland,
            owner: userName,
            population: 10,
            workPopulation: 0,
            place: 2,
            maxPlace: 250,
            balance: 1000,
            maxBalance: 50000,
            foods: 100,
            maxFoods: 5000,
            waters: 100,
            maxWaters: 5000,
            companies: [{
                airLines: 0,
                restaurants: 0,
                shops: 0,
                boats: 0,
                carFactory: 0,
            }],
        })
        return;
    }

    const islandName = userIsland.name
    bot.sendMessage(chatId, `
${userDonateStatus}, у вас уже есть остров под 
<b>Названием:</b> <u>${islandName}</u>

<b>Напишите:</b> <code>мой остров</code> инфо об острове
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
}

async function myIsland(msg, bot, collection) {
    const db = client.db('bot');
    const collectionIslands = db.collection('islands');

    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const island = await collectionIslands.findOne({ id: userId1 })

    if (!island) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас нет острова, чтобы открыть его вам нужно прописать команду открыть остров 
<b>Открытие острова бесплатно !</b> <code>открыть остров</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const islandName = island.name;
    const islandOwner = island.owner;
    const islandPopulation = island.population;
    const islandWorkPopulation = island.workPopulation;
    const islandBal = island.balance.toLocaleString('de-DE');
    const islandMaxBal = island.balance.toLocaleString('de-DE');
    const islandFoods = island.foods;
    const islandMaxFoods = island.maxFoods;
    const islandWaters = island.waters;
    const islandMaxWaters = island.maxWaters;
    const islandPlace = island.place;
    const islandMaxPlace = island.maxPlace;

    const airLines = island.companies[0].airLines;
    const restaurants = island.companies[0].restaurants;
    const shops = island.companies[0].shops;
    const boats = island.companies[0].boats;
    const carFactory = island.companies[0].carFactory;

    bot.sendMessage(chatId, `
${userDonateStatus}, вот информация за ваш остров

<b>Создатель:</b> <i>${islandOwner}</i>
<b>Название:</b> <i>${islandName}</i>
<b>Казна:</b> <i>${islandBal} / ${islandMaxBal}</i>
<b>Жителей:</b> <i>${islandPopulation}</i>
  └<b>Работающие:</b> <i>${islandWorkPopulation}</i>

<b>Место:</b> <i>${islandPlace} / ${islandMaxPlace}</i> км²

<b>Пищи:</b>
  └<b>Еды:</b> <i>${islandFoods} / ${islandMaxFoods}</i>
  └<b>Воды:</b> <i>${islandWaters} / ${islandMaxWaters}</i>

<b>Работы:</b>
  └<b>Авиакомпании:</b> <i>${airLines} / 10</i>
  └<b>Рестораны:</b> <i>${restaurants} / 10</i>
  └<b>Магазины:</b> <i>${shops} / 10</i>
  └<b>Кораблей:</b> <i>${boats} / 10</i>
  └<b>Завод машин:</b> <i>${carFactory} / 10</i>

<b>Все команды острова можно узнать отправив команду!</b> <code>инфо островы</code>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
}

async function islandCommands(msg, bot, collection) {
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)

    if (chatId !== userId1) {
        bot.sendMessage(chatId, `
${userDonateStatus}, команды островов очень много я посеветую отправить команду
<code>инфо островы</code> в лс бота
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    let islandsOptions = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Смена имени', switch_inline_query_current_chat: '+остров имя ' },
                    { text: 'Пополнить казну', switch_inline_query_current_chat: '+остров +казна ' },
                ],
                [
                    { text: 'Купить еды', switch_inline_query_current_chat: '+остров еда ' },
                    { text: 'Купить воды', switch_inline_query_current_chat: '+остров вода ' },
                ],
                [
                    { text: 'Купить авикомп', switch_inline_query_current_chat: '+остров авиакомпания' },
                    { text: 'Купить ресторан', switch_inline_query_current_chat: '+остров ресторан' },
                ],
                [
                    { text: 'Купить магазин', switch_inline_query_current_chat: '+остров магазин' },
                    { text: 'Купить корабль', switch_inline_query_current_chat: '+остров корабль' },
                ],
                [
                    { text: 'Купить машиназавод', switch_inline_query_current_chat: '+остров машиназавод' },
                ]
            ]
        }
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вот команды островов

<b>Смена имени:</b> - <i>Изменяет имя острова который не совпадает других островов</i>
<b>Пополнить казну:</b> - <i>Пополнение казны острова</i>
<b>Купить еды:</b> - <i>Покупка еды для жителей</i>
<b>Купить воды:</b> - <i>Покупка воды для жителей</i>

<b>Работы:</b>
  └<b>Купить авиакомп:</b> - <i>Покупка авиакопании для жителей</i>
  └<b>Купить ресторан:</b> - <i>Покупка ресторанов для жителей</i>
  └<b>Купить магазин:</b> - <i>Покупка магазинов для жителей</i>
  └<b>Купить корабль:</b> - <i>Покупка кораблей для жителей</i>
  └<b>Купить машиназавод:</b> - <i>Покупка завод машин для жителей</i>

<b>В работах будут работать по 10 жителей в каждом виде работ</b>
<b>Место сама будет расширяться по количество жителей</b>
<b>Жители сами прибывают когда пищи много</b>
<b>Пример: 200воды и 200еда = 20жителей = 4км²</b>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
        ...islandsOptions
    })
}

async function islandProduct(msg, bot, collection) {
    const db = client.db('bot');
    const collectionIslands = db.collection('islands');
    
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const parts = text.split(' ')

}

module.exports = {
    openIsland,
    myIsland,
    islandCommands,
}