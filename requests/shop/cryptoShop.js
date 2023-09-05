const { donatedUsers } = require("../donate/donatedUsers")
const { formatNumberInScientificNotation } = require("../systems/systemRu")

let globalAmountCrypto
let globalNameCrypto
let globalCountCrypto
let globalPermission = true

async function buyCryptoCurrence(msg, bot, collection, collectionCrypto) {
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userStatusName = user.status[0].statusName
    const parts = text.split(' ')

    let discount
    let payButton = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Оплатить', callback_data: `paymentCrypto_${userId1}` }]
            ]
        }
    }

    if (text.toLowerCase().startsWith('купить крипту')) {
        if (parts.length === 4) {
            const crypto = await collectionCrypto.findOne({ name: parts[2].toLowerCase() })
            if (!!crypto) {
                const cryptoPrice = crypto.price
                const cryptoStatus = crypto.status
                const amountCrypto = cryptoPrice * parts[3]
                if (isNaN(parts[3])) {
                    bot.sendMessage(chatId, `
${userDonateStatus}, Вы не можете купить количество букв
                    `, { parse_mode: 'HTML', reply_to_message_id: messageId })
                    return;
                }
                if (parts[3] <= 0) {
                    bot.sendMessage(chatId, `
${userDonateStatus}, Не возможно купить отрицательное или нолевое количество крипто валют
                    `, { parse_mode: 'HTML', reply_to_message_id: messageId })
                    return;
                }

                if (userStatusName === 'premium') {
                    const discountedVal = Math.floor((amountCrypto * 10) / 100)
                    globalAmountCrypto = amountCrypto - discountedVal
                    discount = `${globalAmountCrypto} 10%`
                }
                else if (userStatusName === 'vip') {
                    const discountedVal = Math.floor((amountCrypto * 7) / 100)
                    globalAmountCrypto = amountCrypto - discountedVal
                    discount = `${globalAmountCrypto} 7%`
                }
                else if (userStatusName === 'standart') {
                    const discountedVal = Math.floor((amountCrypto * 5) / 100)
                    globalAmountCrypto = amountCrypto - discountedVal
                    discount = `${globalAmountCrypto} 5%`
                }
                else {
                    globalAmountCrypto = amountCrypto
                    discount = `${amountCrypto}`
                }

                let againBuy = {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Купить', switch_inline_query_current_chat: `купить крипту ${globalNameCrypto} [кол-во]` }]
                        ]
                    }
                }

                if (cryptoStatus === true) {
                    globalNameCrypto = parts[2]
                    globalCountCrypto = parts[3]

                    bot.sendMessage(chatId, `
${userDonateStatus}, Подтвердите оплату нажав на кнопку ниже
Имя: ${crypto.name}
Кол-во: ${parts[3]}
Стоимость: ${discount}

После 6 секунд сообщение удалиться !
                    `, { parse_mode: 'HTML', reply_to_message_id: messageId, ...payButton }).then((message) => {
                        setTimeout(() => {
                            if (globalPermission === false) {
                                return;
                            }
                            bot.editMessageText(`
${userDonateStatus}, Вы не успели купить

Нажмите кнопку ниже чтобы купить еще раз
                            `, {
                                chat_id: chatId,
                                message_id: message.message_id,
                                ...againBuy,
                                parse_mode: 'HTML',
                            })
                        }, 6000);
                    })
                }
                else {
                    bot.sendMessage(chatId, `
${userDonateStatus}, Это криптовалюта еще не в продаже
                    `, { parse_mode: 'HTML', reply_to_message_id: messageId })
                }
            }
            else {
                bot.sendMessage(chatId, `
${userDonateStatus}, Данное введенно имя крипто валюты не существует
Напишите: <code>магазин</code> - чтобы узнать существующие крипто валюты
                `, { parse_mode: 'HTML', reply_to_message_id: messageId })
            }
        }
        else {
            bot.sendMessage(chatId, `
${userDonateStatus}, не правильно введена команда, 
Пример <code>купить крипту [имя] [кол-во]</code>
            `, { parse_mode: 'HTML', reply_to_message_id: messageId })
        }
    }
    const txt = '@levouJS_bot купить крипту'

    if (text.toLowerCase().startsWith(txt.toLocaleLowerCase())) {
        if (parts.length === 5) {
            const crypto = await collectionCrypto.findOne({ name: parts[3].toLowerCase() })
            if (!!crypto) {
                const cryptoPrice = crypto.price
                const cryptoStatus = crypto.status
                const amountCrypto = cryptoPrice * parts[4]

                if (isNaN(parts[4])) {
                    bot.sendMessage(chatId, `
${userDonateStatus}, Вы не можете купить количество букв
                    `, { parse_mode: 'HTML', reply_to_message_id: messageId })
                    return;
                }

                if (parts[4] <= 0) {
                    bot.sendMessage(chatId, `
${userDonateStatus}, Не возможно купить отрицательное или нулевое количество крипто валют
                    `, { parse_mode: 'HTML', reply_to_message_id: messageId })
                    return;
                }

                if (userStatusName === 'premium') {
                    const discountedVal = Math.floor((amountCrypto * 10) / 100)
                    globalAmountCrypto = amountCrypto - discountedVal
                    discount = `${globalAmountCrypto} с 10% скидкой`
                }
                else if (userStatusName === 'vip') {
                    const discountedVal = Math.floor((amountCrypto * 7) / 100)
                    globalAmountCrypto = amountCrypto - discountedVal
                    discount = `${globalAmountCrypto} с 7% скидкой`
                }
                else if (userStatusName === 'standart') {
                    const discountedVal = Math.floor((amountCrypto * 5) / 100)
                    globalAmountCrypto = amountCrypto - discountedVal
                    discount = `${globalAmountCrypto} с 5% скидкой`
                }
                else {
                    globalAmountCrypto = amountCrypto
                    discount = `${amountCrypto}`
                }

                if (cryptoStatus === true) {
                    globalNameCrypto = parts[3]
                    globalCountCrypto = parts[4]

                    bot.sendMessage(chatId, `
${userDonateStatus}, Подтвердите оплату нажав на кнопку ниже
Имя: ${crypto.name}
Кол-во: ${parts[4]}
Стоимость: ${discount.toLocaleString('de-DE')} ${formatNumberInScientificNotation(discount)}

После 6 секунд сообщение удалиться !
                    `, { parse_mode: 'HTML', reply_to_message_id: messageId, ...payButton }).then((message) => {
                        let againBuy = {
                            reply_markup: {
                                inline_keyboard: [
                                    [{ text: 'Купить', switch_inline_query_current_chat: `купить крипту ${globalNameCrypto} [кол-во]` }]
                                ]
                            }
                        }

                        setTimeout(() => {
                            if (globalPermission === false) {
                                return;
                            }
                            bot.editMessageText(`
${userDonateStatus}, Вы не успели купить

Нажмите кнопку ниже чтобы купить еще раз
                            `, {
                                chat_id: chatId,
                                message_id: message.message_id,
                                ...againBuy,
                                parse_mode: 'HTML',
                            })
                        }, 6000);
                    })
                }
                else {
                    bot.sendMessage(chatId, `
${userDonateStatus}, Это криптовалюта еще не в продаже
                    `, { parse_mode: 'HTML', reply_to_message_id: messageId })
                }
            }
            else {
                bot.sendMessage(chatId, `
${userDonateStatus}, Данное введенно имя крипто валюты не существует
Напишите: <code>магазин</code> - чтобы узнать существующие крипто валюты
                `, { parse_mode: 'HTML', reply_to_message_id: messageId })
            }
        }
        else {
            bot.sendMessage(chatId, `
${userDonateStatus}, не правильно введена команда, 
Пример <code>купить крипту [имя] [кол-во]</code>
            `, { parse_mode: 'HTML', reply_to_message_id: messageId })
        }
    }
}

async function payTransactions(msg, bot, collection) {
    const data = msg.data
    const userId1 = msg.from.id
    const chatId = msg.message.chat.id
    const messageId = msg.message.message_id

    const user = await collection.findOne({ id: userId1 })
    const userCardBalance = user.bankCard[0].cardValue
    const userDonateStatus = await donatedUsers(msg, collection)

    const [payment, userToPayment] = data.split('_')

    if (payment === 'paymentCrypto') {
        if (userId1 != userToPayment) {
            bot.answerCallbackQuery(msg.id, { show_alert: true, text: 'Это кнопка не для тебя' })
            globalPermission = true
            return;
        }

        if (userCardBalance < globalAmountCrypto) {
            bot.answerCallbackQuery(msg.id, { show_alert: true, text: 'У вас не хватает средств на балансе КАРТЫ !' })
            globalPermission = true
            return;
        }

        bot.editMessageText(`
${userDonateStatus}, Вы успешно оплатили

Имя валюты: ${globalNameCrypto}
Кол-во: ${globalCountCrypto}
        `, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML'
        })
        const updateObject = {};
        updateObject[`crypto.0.${globalNameCrypto}`] = parseInt(globalCountCrypto);
        collection.updateOne({ id: parseInt(userToPayment) }, { $inc: updateObject })
        collection.updateOne({ id: parseInt(userToPayment) }, { $inc: { "bankCard.0.cardValue": -parseInt(globalAmountCrypto) } })
        globalPermission = false
    }
}

async function cryptoShop(msg, bot, collectionCrypto, collection) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    if (text.toLowerCase() == 'магазин крипты') {
        const crypto = await collectionCrypto.findOne({ name: 'altcoinidx' })
        const user = await collection.findOne({ id: userId })

        const userName = user.userName
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
<a href='tg://user?id=${userId}'>${userName}</a> Вот магазин криптовалют
В данный момент🟣🌀💠🌐

<b>🪪Название:</b> ALTCOINIDX
<b>📠Цена:</b> ${cryptoPrice}
<b>⌚️Последнее время обновлении цены:</b> ${cryptoLastUpd}
<b>📉Действие:</b> ${cryptoMove}
<b>🏆Статус:</b> ${stats}
        `, { parse_mode: "HTML" })
    }
}

module.exports = {
    buyCryptoCurrence,
    payTransactions,
    cryptoShop,
}