let globalParts;
let globalCrypto3;
let globalCryptoPrice;
let globalPermission = false;

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
    const messageId = msg.message_id

    const parts = text.split(' ')

    let cryptoCurName;
    let cryptoStats;
    let cryptoPrice;

    const crypto = await collectionCrypto.findOne({})
    const user = await collection.findOne({ id: userId })

    const oplata = 'oplata'
    const oplataBack = 'oplataBack'

    const userCard = user.bankCard[0].cardNumber
    let options;
    if (chatId == userId) {
        options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${userCard}`, callback_data: `${oplata}_${userId}` }],
                    [{ text: 'Назад', callback_data: `${oplataBack}_${userId}` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };
    }
    else {
        options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `5444 **** **** ****`, callback_data: `${oplata}_${userId}` }],
                    [{ text: 'Назад', callback_data: `${oplataBack}_${userId}` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };
    }

    if (text.toLowerCase().startsWith('купить крипту')) {
        if (parts.length == 4) {
            if (parts[2].toLowerCase() == crypto.name) {
                cryptoCurName = crypto.name
                const crypto2 = await collectionCrypto.findOne({ name: cryptoCurName })
                const cryptoStatus = crypto2.status
                const cryptoPrice2 = crypto2.price

                cryptoStats = cryptoStatus
                cryptoPrice = cryptoPrice2
                globalCryptoPrice = cryptoPrice2
            }
            else {
                cryptoCurName = false
            }
            if (parts[2].toLowerCase() == cryptoCurName) {
                const crypto3 = parseInt(parts[3]) * cryptoPrice
                if (!isNaN(parts[3]) && parts[3] > 0) {
                    if (cryptoStats == true) {
                        globalParts = parts[3]
                        globalCrypto3 = crypto3
                        const userCheckPayment = user.checkPayment
                        if (userCheckPayment == 'not') {
                            collection.updateOne({ id: userId }, { $set: { checkPayment: `mastercard_${userCard}` } })
                        }
                        else {
                            console.log('no');
                        }

                        bot.sendMessage(chatId, `
Вы покупаете криптовалюту
<b>${cryptoCurName}:</b> кол-во ${parts[3]}

Стоимость покупки ${crypto3}
Подтвердите покупку через пластик карты
нажав на кнопку внизу
                        `, { parse_mode: "HTML", ...options, reply_to_message_id: messageId, })
                            .then((sentMessage) => {
                                // Получаем ID отправленного сообщения
                                const messageId = sentMessage.message_id;
                                // Устанавливаем таймер на 6 секунд
                                setTimeout(() => {
                                    // Отправляем новое сообщение с текстом "Вы не успели ответить на вопрос."
                                    // if (globalPermission != true) {
                                    bot.editMessageText(`Время прошло вы не успели купить криптовалюту надо было нажать на кнопку своей пластик карты в течении 6 секунд`, { chat_id: chatId, message_id: messageId, });
                                    // }
                                    collection.updateOne({ id: userId }, { $set: { checkPayment: 'not' } })
                                }, 20000);
                            });
                    }
                    else {
                        bot.sendMessage(chatId, 'Это крипто валюта не продаётся в данный момент', { reply_to_message_id: messageId, })
                    }
                }
                else {
                    bot.sendMessage(chatId, `Данные введены не правильно <code>купить крипту [имя крипты] [кол-во]</code> вы не можете купить отрицательное или 0 количество крипто валют`, { parse_mode: "HTML", reply_to_message_id: messageId, })
                }
            }
            else {
                bot.sendMessage(chatId, `Данные введены не правильно <code>купить крипту [имя крипты] [кол-во]</code>`, { parse_mode: "HTML", reply_to_message_id: messageId, })
            }
        }
        else {
            bot.sendMessage(chatId, `Данные введены не правильно <code>купить крипту [имя крипты] [кол-во]</code>`, { parse_mode: 'HTML', reply_to_message_id: messageId, })
        }
    }
}

async function buyCryptoCurrenceBtn(msg, bot, collection) {
    const data = msg.data
    const userId = msg.from.id
    const chatId = msg.message.chat.id
    const messageId = msg.message.message_id

    const [oplate, buttonUserId] = data.split('_');
    const user = await collection.findOne({ id: userId })
    const userCardNum = user.bankCard[0].cardNumber
    const userCheck = user.checkPayment


    if (oplate === 'oplata') {
        if (`mastercard_${userCardNum}` === userCheck  && buttonUserId === String(userId)) {
            const userCardBalance = user.bankCard[0].cardValue

            if (userCardBalance >= globalCrypto3) {

                // Ваша логика обработки действия с уникальным идентификатором uniqueId
                bot.answerCallbackQuery(msg.id, { text: 'Вы успешно оплатили', show_alert: true });
                bot.editMessageText(`Вы успешно оплатили покупку\nВам начислен на баланс крипты ${globalParts} altcoinidx`, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    reply_to_message_id: messageId,
                })
                collection.updateOne({ id: userId }, { $inc: { "crypto.0.altcoinidx": parseInt(globalParts) } })
                collection.updateOne({ id: userId }, { $inc: { "bankCard.0.cardValue": parseInt(-globalCrypto3) } })

                collection.updateOne({ id: userId }, { $set: { checkPayment: 'not' } });
                globalPermission = true
            }
            else {
                const new2 = userCardBalance > globalCryptoPrice ? userCardBalance / globalCryptoPrice : 0
                if (userCardBalance > globalCryptoPrice) {
                    bot.editMessageText(`
У вас не хватает средств в банковском счёте
Вы можете купить только ${Math.floor(new2)}
                    `, {
                        parse_mode: "HTML",
                        chat_id: chatId,
                        message_id: messageId,
                        reply_to_message_id: messageId,
                    })
                    collection.updateOne({ id: userId }, { $set: { checkPayment: 'not' } });
                    globalPermission = true
                }
                else {
                    bot.editMessageText(`
У вас не хватает средств в банковском счёте
Вы не можете купить
                    `, {
                        parse_mode: "HTML",
                        chat_id: chatId,
                        message_id: messageId,
                        reply_to_message_id: messageId,
                    })
                    collection.updateOne({ id: userId }, { $set: { checkPayment: 'not' } });
                    globalPermission = true
                }
            }
        }
        else {
            bot.answerCallbackQuery(msg.id, { text: 'Это кнопка не для тебя.' });
        }
    }
    if (oplate === 'oplataBack') {
        if (`mastercard_${userCardNum}` === userCheck  && buttonUserId === String(userId)) {
            bot.answerCallbackQuery(msg.id, { text: 'Вы успешно отменили оплату', show_alert: true });
            bot.editMessageText(`Вы успешно отменили оплату\nВам не чего не было начислено на баланс крипты`, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML'
            })

            collection.updateOne({ id: userId }, { $set: { checkPayment: 'not' } });
            globalPermission = true
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