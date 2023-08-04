const { parseNumber } = require("../systems/systemRu")

async function generateCardNumber(msg, bot, collection) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const replyId = msg.message_id

    const user = await collection.findOne({ id: userId })

    if (text.toLowerCase() === 'карта создать') {
        const userCardHave = user.bankCard[0].cardHave
        const userName = user.userName

        if (userCardHave === false) {
            const prefix = "5444";
            let cardNumber = prefix;
            for (let i = 0; i < 12; i++) {
                if (i % 4 === 0) {
                    cardNumber += " ";
                }
                cardNumber += Math.floor(Math.random() * 10).toString();
            }
            if (chatId === userId) {
                bot.sendMessage(chatId, `Вот ваша карта <code>${cardNumber}</code> \nНе забудьте поставить пароль на свою карту с командой <code>+карта пароль (4-значная цифра)</code> \nА то если игроки узнают номер вашей пластик карты то они могут снять деньги с него легко\nНапишите <code>карта инфо</code> чтобы узнать информацию о карте`, { parse_mode: 'HTML' });
            }
            else {
                bot.sendMessage(chatId, `Вот ваша карта <code>5444 **** **** ****</code>\nНапишите в лс бота карта инфо чтобы узнать информацию о карте \nНе забудьте поставить пароль на свою карту с командой <code>+карта пароль (4-значная цифра)</code> \nА то если игроки узнают номер вашей пластик карты то они могут снять деньги с него легко\nНапишите <code>карта инфо</code> чтобы узнать информацию о карте`, { parse_mode: 'HTML' });
            }
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardHave": true } })
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardNumber": cardNumber } })
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardName": "mastercard" } })
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardOwner": userName } })
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardValue": 0 } })
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardPassword": 0 } })
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardOwnerId": userId } })
        }
        else {
            bot.sendMessage(chatId, `У вас уже есть пластик карта \nВведите команду <code>карта инфо</code> чтобы узнать инрформацию о своей карты`, { parse_mode: 'HTML', reply_to_message_id: replyId });
        }
    }
}

async function infoAboutCards(msg, bot, collection) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const replyId = msg.message_id

    const user = await collection.findOne({ id: userId })

    if(text.toLowerCase() == 'инфо карта'){
        const userName = user.userName
        bot.sendMessage(chatId, `
Игрок <a href='tg://user?id=${userId}'>${userName}</a> вот информация о картах

<b>Напишите:</b> <i><code>карта создать</code></i> (чтобы, иметь
Банковскую карту Master Card)

<b>Напишите:</b> <i><code>моя карта</code></i> (чтобы, узнать ифнормацию
своей карты)

<b>Напишите:</b> <i><code>+карта пароль (4-значное число)</code></i> (чтобы, 
Поставить пароль в карту p.s только цыфры)

<b>Напишите:</b> <i><code>карта положить (сумму)</code></i> (чтобы, положить
деньги в карту конечно если у вас есть они в балансе)

<b>Напишите:</b> <i><code>мкарта снять (сумму)</code></i> (чтобы, снять только со своей карты
напишите только в личке бота. ПОчему мкарта снять ? потому что мкарта это означает моя карта)

<b>Напишите:</b> <i><code>карта снять (номер карты) (пароль карты если она есть) (сумму)
</code></i> (чтобы снять с чужой карты обратите внимание это пример как вывести деньги с
другой карты <i>карта снять (номер1234 5678 1234 5678) (пароль1111) (сумма который вы хотите снять)</i> Напишите без скобок и без слов номер и пароль)

<b>!Если нету пароля карты то вместо пароля вы просто можете поставить 0</b>
        `, { parse_mode: 'HTML', reply_to_message_id: replyId })
    }
}

async function cardInfo(msg, bot, collection) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const replyId = msg.message_id

    const user = await collection.findOne({ id: userId })

    if (text.toLowerCase() === 'моя карта') {
        const userCardHave = user.bankCard[0].cardHave
        if (userCardHave === true) {
            const userCardNumber = user.bankCard[0].cardNumber
            const userCardName = user.bankCard[0].cardName
            const userCardOwner = user.bankCard[0].cardOwner
            const userCardValue = user.bankCard[0].cardValue
            const userCardPassword = user.bankCard[0].cardPassword

            if (chatId === userId) {
                if (userCardPassword !== 0) {
                    bot.sendMessage(chatId, `Игрок: вот ваши данные о карте\n
<b>Номер карты:</b> |<code>${userCardNumber}</code>|\n
<b>Имя карты:</b> <i>${userCardName}</i>
<b>Владелец карты:</b> <i>${userCardOwner}</i>
<b>Деньги:</b> <i>${userCardValue}</i>
<b>Пароль карты:</b> <i>${userCardPassword}</i>
                    `, { parse_mode: 'HTML', reply_to_message_id: replyId })
                }
                else {
                    bot.sendMessage(chatId, `Игрок: вот ваши данные о карте\n
<b>Номер карты:</b> |<code>${userCardNumber}</code>|\n
<b>Имя карты:</b> <i>${userCardName}</i>
<b>Владелец карты:</b> <i>${userCardOwner}</i>
<b>Деньги:</b> <i>${userCardValue}</i>
<b>Пароль карты:</b> <i>Вы еще не ставили пароль</i>

<b>Рекомендация поставьте пароль с командой <code>+карта пароль (4-значная цифра)</code></b>
                    `, { parse_mode: 'HTML', reply_to_message_id: replyId })
                }
            }
            else {
                bot.sendMessage(chatId, `Игрок: вот ваши данные о карте\n
<b>Номер карты:</b> |5444 **** **** ****|\n
<b>Имя карты:</b> <i>${userCardName}</i>
<b>Владелец карты:</b> <i>${userCardOwner}</i>
<b>Деньги:</b> <i>${userCardValue}</i>
<b>Пароль карты:</b> ****

<b>Напишите в лс бота чтобы узнать свои данные</b>
                `, { parse_mode: 'HTML', reply_to_message_id: replyId })
            }
        }
        else {
            bot.sendMessage(chatId, `Сперва создайте карту с командой <code>карта создать</code>`, { parse_mode: 'HTML', reply_to_message_id: replyId })
        }
    }
}

async function createUpdateCardPassword(msg, bot, collection) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const replyId = msg.message_id

    const parts = text.split(' ')

    const user = await collection.findOne({ id: userId })

    if (text.toLowerCase().startsWith('+карта пароль')) {
        const newCardPassword = parts[2]
        if (chatId === userId) {
            if (parts.length === 3 && newCardPassword.length == 4) {
                const cardPs = parseInt(parts[2])
                if (!isNaN(cardPs) && parts[2] > 0) {
                    const oldPassword = user.bankCard[0].cardPassword
                    if (cardPs !== oldPassword) {
                        bot.sendMessage(chatId, `
Игрок вы успешно сменили свой пароль от карты
Новый пароль <code>${newCardPassword}</code>
                        `, { parse_mode: 'HTML' })
                        collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardPassword": parseInt(newCardPassword) } })
                    }
                    else {
                        bot.sendMessage(chatId, 'Пароль не должен совпадать со старым паролём', { parse_mode: 'HTML', reply_to_message_id: replyId })
                    }
                }
                else {
                    bot.sendMessage(chatId, `<b>Рекомендация поставьте пароль с командой <code>+карта пароль (4-значная цифра)</code> \nТолько цифры!</b>`, { parse_mode: 'HTML', reply_to_message_id: replyId })
                }
            }
            else {
                bot.sendMessage(chatId, `<b>Рекомендация поставьте пароль с командой <code>+карта пароль (4-значная цифра)</code></b>`, { parse_mode: 'HTML', reply_to_message_id: replyId })
            }
        }
        else {
            bot.sendMessage(chatId, `
Этот пароль который вы поставили в чате, не будет использован как новый пароль
<b>Рекомендация поставьте пароль с командой <code>+карта пароль (4-значная цифра)</code></b> 

<b>Только в лс боте поставьте пароль, а то ваш пароль не будет безопасен</b>
            `, { parse_mode: 'HTML', reply_to_message_id: replyId })
        }
    }
}

async function getMoneyFromCard(msg, bot, collection) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const messageId = msg.message_id

    const parts = text.split(' ')

    if (text.toLowerCase().startsWith('карта снять')) {

        const num1 = parts[2]
        const num2 = parts[3]
        const num3 = parts[4]
        const num4 = parts[5]

        const ovr = num1 + ' ' + num2 + ' ' + num3 + ' ' + num4

        const userCardOwner = await collection.findOne({ "bankCard.0.cardNumber": ovr })
        let userCardNumber;

        if (userCardOwner != null) {
            userCardNumber = userCardOwner.bankCard[0].cardNumber
        }
        else {
            userCardNumber = null
        }

        if (chatId == userId) {
            if (ovr.length == 19 && ovr == userCardNumber && userCardNumber != null) {

                const userCardPassword = userCardOwner.bankCard[0].cardPassword
                const userCardValue = userCardOwner.bankCard[0].cardValue
                const userCardOwnerId = userCardOwner.bankCard[0].cardOwnerId
                const systemGet = parseNumber(parts[7])

                if (userCardPassword == 0) {
                    if (systemGet <= userCardValue && parts[6] == 0) {
                        if (systemGet > 0) {
                            bot.sendMessage(chatId, `
Вы успешно сняли денег с карты: ${userCardNumber}
Сумму: ${systemGet}
                            `)

                            collection.updateOne({ "bankCard.0.cardOwnerId": userCardOwnerId }, { $inc: { "bankCard.0.cardValue": -systemGet } })
                            collection.updateOne({ id: userId }, { $inc: { balance: systemGet } })
                        }
                        else {
                            bot.sendMessage(chatId, 'Вы неможете снять отрицательное или 0 количество денег')
                        }
                    }
                    else {
                        bot.sendMessage(chatId, 'Вы неможете снять больше денег чем денег в карте')
                    }
                }
                else {
                    if (userCardPassword != 0) {
                        if (parts[6] == userCardPassword) {
                            if (systemGet <= userCardValue) {
                                if (systemGet > 0) {
                                    bot.sendMessage(chatId, `
Вы успешно сняли денег с карты: ${userCardNumber}
Сумму: ${parts[7]}
                                `)
                                    collection.updateOne({ "bankCard.0.cardOwnerId": userCardOwnerId }, { $inc: { "bankCard.0.cardValue": -systemGet } })
                                    collection.updateOne({ id: userId }, { $inc: { balance: systemGet } })
                                }
                                else {
                                    bot.sendMessage(chatId, 'Вы неможете снять отрицательное или 0 количество денег')
                                }
                            }
                            else {
                                bot.sendMessage(chatId, 'Вы неможете снять больше денег чем денег в карте')
                            }
                        }
                        else {
                            bot.sendMessage(chatId, `Пароль карты не верный напишите <code>инфо карта</code> чтобы узнать как снимать деньги`, { parse_mode: 'HTML' })
                        }
                    }
                    else {
                        bot.sendMessage(chatId, `У этой карты пароля нету можете использовать 0 вместе пароля напишите <code>инфо карта</code> чтобы узнать как снимать деньги`, { parse_mode: 'HTML' })
                    }
                }
            }
            else {
                bot.sendMessage(chatId, `Такой карты несуществует напишите <code>инфо карта</code> чтобы узнать как снимать деньги`, { parse_mode: 'HTML' })
            }
        }
        else {
            bot.sendMessage(chatId, `С другой карты можно снять только в лс боте напишите <code>инфо карта</code> чтобы узнать как снимать деньги`, { parse_mode: 'HTML', reply_to_message_id: messageId })
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

    if (text.toLowerCase().startsWith('мкарта снять')) {
        const userCardBalance = user.bankCard[0].cardValue
        const moneyToGet = parseInt(parseNumber(parts[2]))
        if (moneyToGet <= userCardBalance) {
            if (moneyToGet > 0) {
                if (chatId == userId) {
                    const userCardNumber = user.bankCard[0].cardNumber
                    bot.sendMessage(chatId, `
Вы успешно сняли с вашей карты: <code>|${userCardNumber}|</code>
Сумму: ${moneyToGet}

Баланс карты: ${userCardBalance - moneyToGet}
                    `, { parse_mode: 'HTML' })
                }
                else {
                    bot.sendMessage(chatId, `
Вы успешно сняли с вашей карты: <code>|5444 **** **** ****|</code>
Сумму: ${moneyToGet}

Баланс карты: ${userCardBalance - moneyToGet}
                    `, { parse_mode: 'HTML', reply_to_message_id: replyId })
                }
                collection.updateOne({ id: userId }, { $inc: { "bankCard.0.cardValue": -moneyToGet } })
                collection.updateOne({ id: userId }, { $inc: { balance: moneyToGet } })
            }
            else {
                bot.sendMessage(chatId, `
Вы не можете снять отрицательное или 0 количество денег
                `)
            }
        }
        else {
            bot.sendMessage(chatId, `
Вы не можете снять денег больше чем у вас на карте
            `)
        }
    }
}

async function setMoneyToCard(msg, bot, collection) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const userName = msg.from.username
    const replyId = msg.message_id

    const parts = text.split(' ')
    const user = await collection.findOne({ id: userId })

    if (text.toLowerCase().startsWith('карта положить') || text.toLowerCase().startsWith('карта пополнить')) {
        const userBalance = user.balance
        const moneyToSet = parseInt(parseNumber(parts[2]))
        if (userBalance >= moneyToSet) {
            if (moneyToSet > 0) {
                bot.sendMessage(chatId, `
Вы успешно положили в свою карту
Сумму: ${moneyToSet}
                `, { reply_to_message_id: replyId })
                collection.updateOne({ id: userId }, { $inc: { "bankCard.0.cardValue": moneyToSet } })
                collection.updateOne({ id: userId }, { $inc: { balance: -moneyToSet } })

            }
            else {
                bot.sendMessage(chatId, `
Вы не можете положить отрицательное или 0 количество денег
                `)
            }
        }
        else {
            bot.sendMessage(chatId, `
Вы не можете положить денег больше чем у вас на балансе
            `)
        }
    }
}

module.exports = {
    generateCardNumber,
    cardInfo,
    createUpdateCardPassword,
    setMoneyToCard,
    getMoneyFromOwnCard,
    getMoneyFromCard,
    infoAboutCards,
}