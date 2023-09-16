require('dotenv').config();
const mongoDbUrl = process.env.MONGO_DB_URL
const { MongoClient, ObjectId } = require('mongodb');
const { formatNumberInScientificNotation } = require('../systems/systemRu');
const { donatedUsers } = require('../donate/donatedUsers');
const client = new MongoClient(mongoDbUrl);
const adminId = parseInt(process.env.ADMIN_ID_INT)

// let addChannelOpt = {
//     reply_markup: {
//         inline_keyboard: [
//             [{ text: 'Добавить в канал', url: 'https://telegram.me/levoujs_bot?startchannel=new' }]
//         ]
//     }
// }
// bot.sendMessage(chatId, `
// Добавить в канал
// `, {
//     parse_mode: 'HTML',
//     ...addChannelOpt,
// })

async function connecting() {
    await client.connect();
}

async function autoCreatePromoCodes(bot) {
    const db = client.db('bot');
    const collectionPromo = db.collection('promo');

    const randomPromoName = generateRandomString(10);
    const randomActivation = Math.floor(Math.random() * 11)
    const randomAmount = generateRandomNumber(30000)
    const promoComents = 'Спасибо что вы с нами'
    const finishedAmountForOne = randomAmount / randomActivation

    let channelId = '@sbi_promos'
    bot.sendMessage(channelId, `
<b>Промокод от бота ↓</b>

<b>Название:</b> <code>${randomPromoName}</code>
<b>Количество использований:</b> ${randomActivation}
<b>Приз каждому по:</b> ${finishedAmountForOne.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(finishedAmountForOne)}

<b>Коментарии</b> <u>${promoComents}</u>
        `, {
        parse_mode: 'HTML',
    })
    await collectionPromo.insertOne({
        promoName: randomPromoName,
        promoActivision: parseInt(randomActivation),
        promoMoney: parseInt(Math.floor(randomAmount)),
        promoDonate: false,
        promoComent: promoComents,
        promoUsedBy: []
    })
}

async function autoDeleteAllPromocodes(bot) {
    const db = client.db('bot');
    const collectionPromo = db.collection('promo');

    await collectionPromo.deleteMany({ _id: ObjectId }).then(() => {
        bot.sendMessage(adminId, `
Все промокоды успешно удалены автоматически
        `)
    })
}

async function manualDeleteAllPromocodes(bot) {
    const db = client.db('bot');
    const collectionPromo = db.collection('promo');

    await collectionPromo.deleteMany({ _id: ObjectId }).then(() => {
        bot.sendMessage(adminId, `
Все промокоды успешно удалены в ручную
        `)
    })
}

async function manualCreatePromoCodes(msg, bot, collection) {
    const db = client.db('bot');
    const collectionPromo = db.collection('promo');

    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const randomPromoName = generateRandomString(10);
    const randomActivation = Math.floor(Math.random() * 11) + 1
    const randomAmount = generateRandomNumber(30000)
    const promoComents = 'Спасибо что вы с нами'
    const finishedAmountForOne = randomAmount / randomActivation

    if (userId1 === adminId) {
        let channelId = '@sbi_promos'
        bot.sendMessage(channelId, `
<b>Промокод от бота ↓</b>

<b>Название:</b> <code>${randomPromoName}</code>
<b>Количество использований:</b> ${randomActivation}
<b>Приз каждому по:</b> ${finishedAmountForOne.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(finishedAmountForOne)}

<b>Коментарии</b> <u>${promoComents}</u>
            `, {
            parse_mode: 'HTML',
        })
        await collectionPromo.insertOne({
            promoName: randomPromoName,
            promoActivision: parseInt(randomActivation),
            promoMoney: parseInt(randomAmount),
            promoDonate: false,
            promoComent: promoComents,
            promoUsedBy: []
        })
    }
    else {
        bot.sendMessage(chatId, `
${userDonateStatus}, Простите но вы не являетесь администратором бота
            `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }
}

function generateRandomNumber(num) {
    // Генерируем случайное число в заданном диапазоне
    return Math.floor(Math.random() * num);
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

module.exports = {
    autoCreatePromoCodes,
    manualCreatePromoCodes,
    manualDeleteAllPromocodes,
    autoDeleteAllPromocodes,
}