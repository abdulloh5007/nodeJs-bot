const userStates = {};
let globalParts;
let globalCrypto3;


async function cryptoShop(msg, bot, collectionCrypto) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    if (text.toLowerCase() == 'магазин крипты') {
        const crypto = await collectionCrypto.findOne({ name: 'altcoinidx' })
        const cryptoPrice = crypto.price
        const cryptoLastUpd = crypto.lastUpdateTime
        const cryptoStatus = crypto.status
        const cryptoMove = crypto.move

        let stats;
        if (cryptoStatus === true) {
            stats = 'продаётся'
        }
        else {
            stats = 'не продаётся'
        }

        bot.sendMessage(chatId, `
<a href='tg://user?id=${userId}'>😎Игрок</a> Вот магазин криптовалют
В данный момент🟣🌀💠🌐

<b>🪪Название:</b> ALTCOINIDX
<b>📠Цена:</b> ${cryptoPrice}
<b>⌚️Последнее время обновлении цены:</b> ${cryptoLastUpd}
<b>📉Действие:</b> ${cryptoMove}
<b>🏆Статус:</b> ${stats}
        `, { parse_mode: "HTML" })
    }
}

async function buyCryptoCurrence(msg, bot, collection, collectionCrypto) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const parts = text.split(' ')

    let cryptoCurName;
    let cryptoStats;
    let cryptoPrice;
    const crypto = await collectionCrypto.findOne({})
    if (parts[2] == crypto.name) {
        cryptoCurName = crypto.name
        const crypto2 = await collectionCrypto.findOne({ name: cryptoCurName })
        const cryptoStatus = crypto2.status
        const cryptoPrice2 = crypto2.price

        cryptoStats = cryptoStatus
        cryptoPrice = cryptoPrice2
    }
    else {
        cryptoCurName = false
    }

    const uniqueId = `${userId}`;

    const user = await collection.findOne({ id: userId })
    const userCard = user.bankCard[0].cardNumber
    const userCardBalance = user.bankCard[0].cardValue

    // Сохраняем состояние пользователя и уникальный идентификатор в объекте userStates
    userStates[userId] = { state: 'mastercard', uniqueId };

    let options;
    if (chatId == userId) {
        options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${userCard}`, callback_data: uniqueId }],
                    // Добавьте другие кнопки с уникальными идентификаторами
                ],
            },
        };
    }
    else {
        options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '5444 **** **** ****', callback_data: uniqueId }],
                    // Добавьте другие кнопки с уникальными идентификаторами
                ],
            },
        };
    }

    if (text.toLowerCase().startsWith('купить крипту')) {
        if (parts.length == 4) {
            if (parts[2] == cryptoCurName) {
                const crypto3 = parseInt(parts[3]) * cryptoPrice
                if (!isNaN(parts[3])) {
                    if (userCardBalance >= crypto3) {
                        if (cryptoStats == true) {
                            globalParts = parts[3]
                            globalCrypto3 = crypto3
                            bot.sendMessage(chatId, `
Вы покупаете криптовалюту
<b>${cryptoCurName}:</b> кол-во ${parts[3]}

Стоимость покупки ${crypto3}
Подтвердите покупку через пластик карты
нажав на кнопку внизу
                            `, { parse_mode: "HTML", ...options })

                        }
                        else {
                            bot.sendMessage(chatId, 'Это крипто валюта не продаётся')
                        }
                    }
                    else {
                        const new2 = userCardBalance / crypto3
                        bot.sendMessage(chatId, `
У вас не хватает средств в банковском счёте
Вы можете купить только ${Math.floor(new2)}
                        `, { parse_mode: "HTML" })
                    }
                }

                else {
                    bot.sendMessage(chatId, `Данные введены не правильно <code>купить крипту [имя крипты] [кол-во]</code>`, { parse_mode: "HTML" })
                }
            }
            else {
                bot.sendMessage(chatId, `Данные введены не правильно <code>купить крипту [имя крипты] [кол-во]</code>`, { parse_mode: "HTML" })
            }
        }
        else {
            bot.sendMessage(chatId, `Данные введены не правильно <code>купить крипту [имя крипты] [кол-во]</code>`, { parse_mode: 'HTML' })
        }
    }
}

async function buyCryptoCurrenceBtn(msg, bot, collection) {
    const data = msg.data
    const userId = msg.from.id
    const chatId = msg.message.chat.id
    const messageId = msg.message.message_id

    const userState = userStates[userId]?.state;

    if (userState === 'mastercard') {
        if (data === userStates[userId].uniqueId) {

            // Ваша логика обработки действия с уникальным идентификатором uniqueId
            bot.answerCallbackQuery(msg.id, { text: 'Вы успешно оплатили', show_alert: true });
            bot.editMessageText('Вы успешно оплатили', {
                chat_id: chatId,
                message_id: messageId
            })
            collection.updateOne({ id: userId }, { $inc: { "crypto.0.altcoinidx": parseInt(globalParts) } })
            collection.updateOne({ id: userId }, { $inc: { "bankCard.0.cardValue": parseInt(-globalCrypto3) } })
        }
        else {
            bot.answerCallbackQuery(msg.id, { text: 'Это кнопка не для тебя.' });
        }
    }
}

module.exports = {
    cryptoShop,
    buyCryptoCurrence,
    buyCryptoCurrenceBtn,
}