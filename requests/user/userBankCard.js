const { donatedUsers } = require("../donate/donatedUsers")
const { parseNumber, formatNumberInScientificNotation } = require("../systems/systemRu")
require('dotenv').config();
const mongoDbUrl = process.env.MONGO_DB_URL
const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(mongoDbUrl);

async function connecting() {
    await client.connect();
}

async function generateCardNumber(msg, bot, collection) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const replyId = msg.message_id
    const user = await collection.findOne({ id: userId })
    const userDonateStatus = await donatedUsers(msg, collection)

    if (text.toLowerCase() === 'карта создать') {
        const userCard = user.bankCard[0]
        const userCardHave = userCard.cardHave
        const userName = user.userName
        const cardNumber = generateRandomCardNumber();
        const isChatIdSameAsUserId = chatId === userId;

        if (!userCardHave) {
            const messageText = `
${userDonateStatus}
Вот ваша карта ${isChatIdSameAsUserId ? `<code>${cardNumber}</code>` : '<code>5444 **** **** ****</code>'}
${isChatIdSameAsUserId ? 'Не забудьте поставить пароль на свою карту с командой <code>+карта пароль (4-значная цифра)</code>' : 'Напишите в лс бота карта инфо чтобы узнать информацию о карте'}`;

            bot.sendMessage(chatId, messageText, { parse_mode: 'HTML' });
            collection.updateOne({ id: userId }, {
                $set: {
                    "bankCard.0.cardHave": true,
                    "bankCard.0.cardNumber": cardNumber,
                    "bankCard.0.cardName": "mastercard",
                    "bankCard.0.cardOwner": userName,
                    "bankCard.0.cardValue": 0,
                    "bankCard.0.cardPassword": 0,
                    "bankCard.0.cardOwnerId": userId
                }
            });
        }
        else {
            bot.sendMessage(chatId, `У вас уже есть пластик карта \nВведите команду <code>моя карта</code> чтобы узнать информацию о своей карты`, { parse_mode: 'HTML', reply_to_message_id: replyId });
        }
    }
}

function generateRandomCardNumber() {
    const prefix = "5444";
    let cardNumber = prefix;
    for (let i = 0; i < 12; i++) {
        if (i % 4 === 0) {
            cardNumber += " ";
        }
        cardNumber += Math.floor(Math.random() * 10).toString();
    }
    return cardNumber;
}


async function infoAboutCards(msg, bot) {
    const db = client.db('bot');
    const collection = db.collection('users');

    const text = msg.text
    const chatId = msg.chat.id
    const replyId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)

    if (text.toLowerCase() == 'инфо карта') {
        await bot.sendMessage(chatId, `
${userDonateStatus}, вот информация о картах:

• <code>Карта создать</code> - <b>создать свою банковскую карту Master Card.</b>

• <code>Моя карта</code> - <b>информация о вашей банковской карте.</b>

• <code>+карта пароль [4-значное число]</code> - <b>установить пин-код на вашу карту.</b>

• <code>Карта положить [сумма]</code> - <b>возможность положить монеты с баланса на карту.</b>

• <code>Карта снять [сумма]</code> - <b>снять баланс с вашей карты.</b>

<b>❗️ | Если на вашей карте не установлен пин-код, то вы можете просто выставить «0»</b>
        `, { parse_mode: 'HTML', reply_to_message_id: replyId })
    }
}

async function cardInfo(msg, bot) {
    const db = client.db('bot');
    const collection = db.collection('users');

    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const replyId = msg.message_id
    const user = await collection.findOne({ id: userId })

    if (text.toLowerCase() === 'моя карта') {
        const userCard = user.bankCard[0]
        const userCardNumber = userCard.cardNumber
        const userCardName = userCard.cardName
        const userCardOwner = userCard.cardOwner
        const userCardValue = userCard.cardValue
        const userCardPassword = userCard.cardPassword

        const userDonateStatus = await donatedUsers(msg, collection)

        const isChatIdSameAsUserId = chatId === userId

        let passwordInfo;
        if (userCardPassword === 0) {
            passwordInfo = `<b>Пароль карты:</b> <i>Вы еще не ставили пароль</i>`
        }
        else if (isChatIdSameAsUserId && userCardPassword !== 0) {
            passwordInfo = `<b>Пароль карты:</b> <code>${userCardPassword}</code>`
        }
        else {
            passwordInfo = `<b>Пароль карты:</b> <code>****</code>`
        }

        const messageText = `
${userDonateStatus}, вот ваши данные о карте\n
<b>Номер карты:</b> |<code>${isChatIdSameAsUserId ? userCardNumber : '5444 **** **** ****'}</code>|\n
<b>Имя карты:</b> <i>${userCardName}</i>
<b>Владелец карты:</b> <i>${userCardOwner}</i>
<b>Деньги:</b> <i>${userCardValue.toLocaleString('de-DE')} ${formatNumberInScientificNotation(userCardValue)}</i>
${passwordInfo}

${isChatIdSameAsUserId ? '' : '<b>Напишите в лс бота чтобы узнать свои данные</b>'}
        `

        bot.sendMessage(chatId, messageText, { parse_mode: 'HTML', reply_to_message_id: replyId })
    }
}

async function createUpdateCardPassword(msg, bot) {
    const db = client.db('bot');
    const collection = db.collection('users');
    
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const replyId = msg.message_id

    const parts = text.split(' ')
    const user = await collection.findOne({ id: userId })

    const userDonateStatus = await donatedUsers(msg, collection)

    if (text.toLowerCase().startsWith('+карта пароль')) {
        const newCardPassword = parts[2]
        if (chatId === userId) {
            if (parts.length === 3 && newCardPassword.length === 4 && !isNaN(newCardPassword)) {
                const oldPassword = user.bankCard[0].cardPassword
                if (parseInt(newCardPassword) !== oldPassword) {
                    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно сменили свой пароль от карты
Новый пароль <code>${newCardPassword}</code>
                    `, { parse_mode: 'HTML' })
                    collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardPassword": parseInt(newCardPassword) } })
                } else {
                    bot.sendMessage(chatId, `
${userDonateStatus}, Пароль не должен совпадать со старым паролем
                    `, { parse_mode: 'HTML', reply_to_message_id: replyId })
                }
            } else {
                bot.sendMessage(chatId, `
${userDonateStatus}, <b>Рекомендация поставьте пароль с командой <code>+карта пароль (4-значная цифра)</code> \nТолько цифры!</b>
                `, { parse_mode: 'HTML', reply_to_message_id: replyId })
            }
        } else {
            bot.sendMessage(chatId, `
${userDonateStatus}, Этот пароль, который вы поставили в чате, не будет использован как новый пароль
<b>Рекомендация: поставьте пароль с командой <code>+карта пароль (4-значная цифра)</code></b> 

<b>Только в лс бота поставьте пароль, иначе ваш пароль не будет безопасен</b>
            `, { parse_mode: 'HTML', reply_to_message_id: replyId })
        }
    }
}

async function getMoneyFromOwnCard(msg, bot, collection) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const replyId = msg.message_id

    const parts = text.split(' ')
    const user = await collection.findOne({ id: userId })
    const userDonateStatus = await donatedUsers(msg, collection)

    if (text.toLowerCase().startsWith('карта снять')) {
        const userCardBalance = user.bankCard[0].cardValue

        if (parts.length === 3) {
            const moneyToGet = parseInt(parseNumber(parts[2]))

            if (moneyToGet > userCardBalance) {
                bot.sendMessage(chatId, `
        ${userDonateStatus}, Вы не можете снять денег больше чем у вас на карте
                `, { parse_mode: 'HTML' })
                return;
            }

            if (isNaN(moneyToGet)) {
                bot.sendMessage(chatId, `
${userDonateStatus}, не возможно снять с карты БУКВЫ !
                `, { parse_mode: 'HTML' })
                return;
            }

            if (moneyToGet <= 0) {
                bot.sendMessage(chatId, `
${userDonateStatus}, Вы не можете снять отрицательное или 0 количество денег
                `, { parse_mode: 'HTML' })
                return;
            }

            const userCardNumber = user.bankCard[0].cardNumber
            const newCardBalance = userCardBalance - moneyToGet

            const message = `
${userDonateStatus}, Вы успешно сняли с вашей карты: |<code>${chatId === userId ? userCardNumber : '5444 **** **** ****'}</code>|
Сумма: ${moneyToGet.toLocaleString('de-DE')} ${formatNumberInScientificNotation(moneyToGet)}
Баланс карты: ${newCardBalance.toLocaleString('de-DE')} ${formatNumberInScientificNotation(newCardBalance)}
            `;

            bot.sendMessage(chatId, message, { parse_mode: 'HTML', reply_to_message_id: replyId });

            collection.updateOne({ id: userId }, { $inc: { "bankCard.0.cardValue": -moneyToGet } })
            collection.updateOne({ id: userId }, { $inc: { balance: moneyToGet } })
        }
        else {
            bot.sendMessage(chatId, `
${userDonateStatus}, не правильно введена команда 
Пример: <code>карта снять [сумма]</code>
        `, { parse_mode: 'HTML' })
        }
    }
}


async function setMoneyToCard(msg, bot, collection) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const replyId = msg.message_id

    const parts = text.split(' ')
    const user = await collection.findOne({ id: userId })
    const userDonateStatus = await donatedUsers(msg, collection)

    if (text.toLowerCase().startsWith('карта положить') || text.toLowerCase().startsWith('карта пополнить')) {
        if (parts.length === 3) {
            const userBalance = user.balance
            const moneyToSet = parseInt(parseNumber(parts[2]))

            if (moneyToSet <= 0) {
                bot.sendMessage(chatId, `
${userDonateStatus}, Вы не можете положить отрицательное или 0 количество денег
                `, { parse_mode: 'HTML' })
                return;
            }

            if (isNaN(moneyToSet)) {
                bot.sendMessage(chatId, `
${userDonateStatus}, не возможно на карту БУКВЫ !
                `, { parse_mode: 'HTML' })
                return;
            }

            if (userBalance < moneyToSet) {
                bot.sendMessage(chatId, `
${userDonateStatus}, Вы не можете положить денег больше чем у вас на балансе
                `, { parse_mode: 'HTML' })
                return;
            }

            bot.sendMessage(chatId, `
${userDonateStatus}, Вы успешно положили в свою карту

Сумму: ${moneyToSet.toLocaleString('de-DE')} ${formatNumberInScientificNotation(moneyToSet)}
            `, { reply_to_message_id: replyId, parse_mode: 'HTML' })

            collection.updateOne({ id: userId }, { $inc: { "bankCard.0.cardValue": moneyToSet } })
            collection.updateOne({ id: userId }, { $inc: { balance: -moneyToSet } })
        }
    }
}

module.exports = {
    generateCardNumber,
    cardInfo,
    createUpdateCardPassword,
    setMoneyToCard,
    getMoneyFromOwnCard,
    infoAboutCards,
}