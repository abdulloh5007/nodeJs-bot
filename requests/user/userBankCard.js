async function generateCardNumber(msg, bot, collection) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

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
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardName": "MasterCard" } })
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardOwner": userName } })
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardValue": 0 } })
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardPassword": 0 } })
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardOwnerId": userId } })
        }
        else {
            bot.sendMessage(chatId, `У вас уже есть пластик карта \nВведите команду <code>карта инфо</code> чтобы узнать инрформацию о своей карты`, { parse_mode: 'HTML' });
        }
    }
}

async function cardInfo(msg, bot, collection) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const user = await collection.findOne({ id: userId })

    if (text.toLowerCase() === 'карта инфо') {
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
<b>Имя карты:</b> ${userCardName}
<b>Владелец карты:</b> ${userCardOwner}
<b>Деньги:</b> ${userCardValue}
<b>Пароль карты:</b> ${userCardPassword}
                    `, { parse_mode: 'HTML' })
                }
                else {
                    bot.sendMessage(chatId, `Игрок: вот ваши данные о карте\n
<b>Номер карты:</b> |<code>${userCardNumber}</code>|\n
<b>Имя карты:</b> ${userCardName}
<b>Владелец карты:</b> ${userCardOwner}
<b>Деньги:</b> ${userCardValue}
<b>Пароль карты:</b> Вы еще не ставили пароль

<b>Рекомендация поставьте пароль с командой <code>+карта пароль (4-значная цифра)</code></b>
                    `, { parse_mode: 'HTML' })
                }
            }
            else {
                bot.sendMessage(chatId, `Игрок: вот ваши данные о карте\n
<b>Номер карты:</b> |5444 **** **** ****|\n
<b>Имя карты:</b> ${userCardName}
<b>Владелец карты:</b> ${userCardOwner}
<b>Деньги:</b> ${userCardValue}
<b>Пароль карты:</b> ****

<b>Напишите в лс бота чтобы узнать свои данные</b>
                `, { parse_mode: 'HTML' })
            }
        }
        else {
            bot.sendMessage(chatId, `Сперва создайте карту с командой <code>карта создать</code>`, { parse_mode: 'HTML' })
        }
    }
}

async function createUpdateCardPassword(msg, bot, collection) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const replyId = msg.message_id

    const parts = text.split(' ')

    if (text.toLowerCase().startsWith('+карта пароль')) {
        const newCardPassword = parts[2]
        if (chatId === userId) {
            if (parts.length === 3 && newCardPassword.length == 4) {
                bot.sendMessage(chatId, `
Игрок вы успешно сменили свой пароль от карты
Новый пароль <code>${newCardPassword}</code>
                `, { parse_mode: 'HTML' })
                collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardPassword": parseInt(newCardPassword) } })
            }
            else {
                bot.sendMessage(chatId, `<b>Рекомендация поставьте пароль с командой <code>+карта пароль (4-значная цифра)</code></b>`, { parse_mode: 'HTML', reply_to_message_id: replyId })
            }
        }
        else {
            bot.sendMessage(chatId, `Этот пароль который вы поставили в чате не будет использован как новый пароль\n<b>Рекомендация поставьте пароль с командой <code>+карта пароль (4-значная цифра)</code></b> только в лс боте а то ваш пароль не будет безопасен`, { parse_mode: 'HTML', reply_to_message_id: replyId })
        }
    }
}

async function getMoneyFromCard(msg, bot, collection) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text

    const parts = text.split(' ')

    if (text.toLowerCase().startsWith('карта снять')) {

        const num1 = parts[2]
        const num2 = parts[3]
        const num3 = parts[4]
        const num4 = parts[5]

        const ovr = num1 + ' ' + num2 + ' ' + num3 + ' ' + num4

        const userCardOwner = await collection.findOne({ "bankCard.0.cardNumber": ovr })
        const userCardNumber = userCardOwner.bankCard[0].cardNumber
        const userCardPassword = userCardOwner.bankCard[0].cardPassword
        const userCardValue = userCardOwner.bankCard[0].cardValue
        const userCardOwnerId = userCardOwner.bankCard[0].cardOwnerId

        // if(ovr == null){
        if (ovr.length == 19 && ovr == userCardNumber) {
            if (parts[6] == 0 && userCardPassword == 0) {
                if(parts[7] <= userCardValue){
                    bot.sendMessage(chatId, `
Вы успешно сняли денег с карты: ${userCardNumber}
Сумму: ${parts[7]}
                    `)
    
                    collection.updateOne({ "bankCard.0.cardOwnerId": userCardOwnerId }, { $inc: { "bankCard.0.cardValue": -parseInt(parts[7]) } })
                    collection.updateOne({ id: userId }, { $inc: { balance: parseInt(parts[7]) } })
                }
                else{
                    bot.sendMessage(chatId, 'Вы неможете снять больще денег чем денег в карте')
                }
            }
            else{
                if (userCardPassword != 0 && parts[6] == 0) {
                    if (parts[6] == userCardPassword) {
                        if (parts[7] <= userCardValue) {
                            bot.sendMessage(chatId, `
Вы успешно сняли денег с карты: ${userCardNumber}
Сумму: ${parts[7]}
                                    `)
                            collection.updateOne({ "bankCard.0.cardOwnerId": userCardOwnerId }, { $inc: { "bankCard.0.cardValue": -parseInt(parts[7]) } })
                            collection.updateOne({ id: userId }, { $inc: { balance: parseInt(parts[7]) } })
                        }
                        else {
                            bot.sendMessage(chatId, 'Вы неможете снять больще денег чем денег в карте')
                        }
                    }
                    else {
                        bot.sendMessage(chatId, 'Пароль карты не верный')
                    }
                }
                else {
                    bot.sendMessage(chatId, 'У этой карты пароля нету можете использовать 0 вместе пароля')
                }
                
            }
        }


    }
    //     else{
    //         bot.sendMessage(chatId, 'Такой карты несуществует')
    //     }

    // }

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
        const moneyToGet = parseInt(parts[2])
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

    if (text.toLowerCase().startsWith('карта положить')) {
        const userBalance = user.balance
        const moneyToSet = parseInt(parts[2])
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
}