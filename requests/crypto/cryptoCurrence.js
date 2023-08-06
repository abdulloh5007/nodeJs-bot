require('dotenv').config()
const adminId = parseInt(process.env.ADMIN_ID_INT)

const date = new Date()
const year = date.getFullYear()
const month = date.getMonth()
const day = date.getDate()
const hours = date.getHours()
const minutes = date.getMinutes()
const lastUpdateTime = `${day}-${month}-${year} ${hours}:${minutes}`

// Это команда используется только 1 раз 
async function cryptoCurrenceLaunch(msg, bot, collectionCrypto) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    if (text.toLowerCase() === 'launch crypto') {
        if (userId === adminId) {
            collectionCrypto.insertOne({
                // id: userId,
                name: 'altcoinidx',
                status: false,
                price: 0,
                lastUpdateTime: "",
                move: "center"
            })
            bot.sendMessage(chatId, 'Успешно')
        }
        else {
            bot.sendMessage(chatId, 'Вы не являетесь администратором')
        }
    }
}

async function updateCryptoToUp(msg, bot, collectionCrypto) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const parts = text.split(' ')

    let cryptoCur;
    let cryptoPrice
    const crypto = await collectionCrypto.findOne({})

    if (text.toLowerCase().startsWith('крипта вверх')) {
        if (userId === adminId) {
            if (parts[2].toLowerCase() == crypto.name) {
                cryptoCur = crypto.name
                cryptoPrice = crypto.price
            }
            else {
                cryptoCur = null
            }


            if (parts[2].toLowerCase() == cryptoCur) {
                if (parts.length === 4) {
                    const price = parseInt(parts[3])
                    const price2 = cryptoPrice + price
                    if (!isNaN(price)) {
                        bot.sendMessage(chatId, `
<b><a href='tg://user?id=${userId}'>Владелец</a> вы успешно изменили</b>

<b>Цену криптовалюты на:</b> вверх <i>${price}</i>
<b>Время:</b> <i>${lastUpdateTime}</i>

теперь 1 криптовалюта ALTCOINIDX равна ${price2}
                        `, { parse_mode: 'HTML' })
                        collectionCrypto.updateOne({ name: 'altcoinidx' }, { $set: { price: price2 } })
                        collectionCrypto.updateOne({ name: 'altcoinidx' }, { $set: { move: parts[1] } })
                        collectionCrypto.updateOne({ name: 'altcoinidx' }, { $set: { lastUpdateTime: lastUpdateTime } })
                    }
                    else {
                        bot.sendMessage(chatId, `Данные введены не правильно напишите\n<code>крипта [вверх, вниз] [имя крипты] цену</code> цена только в цыфрах`, { parse_mode: "HTML" })
                    }
                }
                else {
                    bot.sendMessage(chatId, `Данные введены не правильно напишите\n<code>крипта [вверх, вниз] цену</code> цена только в цыфрах`, { parse_mode: "HTML" })
                }
            }
            else {
                const dostupCrypto = await collectionCrypto.findOne()
                const dostupName = dostupCrypto.name
                console.log(dostupName);
                bot.sendMessage(chatId, `
Данные имя крипты введены не правильно напишите
<code>крипта [вверх, вниз] [имя крипты] цену</code> цена только в цыфрах
Доступные криптовалюты <code>${dostupName}</code>
                `, { parse_mode: "HTML" })
            }
        }
        else {
            bot.sendMessage(chatId, 'Вы не являетесь администратором')
        }
    }
}

async function updateCryptoToDown(msg, bot, collectionCrypto) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const parts = text.split(' ')

    let cryptoCur;
    let cryptoPrice
    const crypto = await collectionCrypto.findOne({})

    if (text.toLowerCase().startsWith('крипта вниз')) {
        if (userId === adminId) {
            if (parts[2].toLowerCase() == crypto.name) {
                cryptoCur = crypto.name
                cryptoPrice = crypto.price
            }
            else {
                cryptoCur = null
            }

            if (parts[2].toLowerCase() == cryptoCur) {
                if (parts.length == 4) {
                    if (parts[3] < cryptoPrice) {
                        const price2 = cryptoPrice - parseInt(parts[3])
                        const price = parseInt(parts[3])
                        if (!isNaN(price)) {
                            bot.sendMessage(chatId, `
<b><a href='tg://user?id=${userId}'>Владелец</a> вы успешно изменили</b>

<b>Цену криптовалюты на:</b> вниз <i>${price}</i>
<b>Время:</b> <i>${lastUpdateTime}</i>

теперь 1 криптовалюта ALTCOINIDX равна ${price2}
                            `, { parse_mode: 'HTML' })
                            collectionCrypto.updateOne({ name: cryptoCur }, { $inc: { price: -price } })
                            collectionCrypto.updateOne({ name: cryptoCur }, { $set: { move: parts[1] } })
                            collectionCrypto.updateOne({ name: cryptoCur }, { $set: { lastUpdateTime: lastUpdateTime } })
                        }
                        else {
                            bot.sendMessage(chatId, `Данные введены не правильно напишите\n<code>крипта [вверх, вниз] [имя крипты] цену</code> цена только в цыфрах`, { parse_mode: "HTML" })
                        }
                    }
                    else {
                        bot.sendMessage(chatId, 'Вы не можете понизить цену крипты до отрицательной или до 0 цены')
                    }
                }
                else {
                    bot.sendMessage(chatId, `Данные введены не правильно напишите\n<code>крипта [вверх, вниз] [имя крипты] цену</code>`, { parse_mode: "HTML" })
                }
            }
            else {
                const dostupCrypto = await collectionCrypto.findOne()
                const dostupName = dostupCrypto.name
                console.log(dostupName);
                bot.sendMessage(chatId, `
Данные имя крипты введены не правильно напишите
<code>крипта [вверх, вниз] [имя крипты] цену</code> цена только в цыфрах
Доступные криптовалюты <code>${dostupName}</code>
                `, { parse_mode: "HTML" })
            }
        }
        else {
            bot.sendMessage(chatId, 'Вы не являетесь администратором')
        }
    }
}

async function cryptoStatus(msg, bot, collectionCrypto) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const parts = text.split(' ')

    let cryptoCur;
    const crypto = await collectionCrypto.findOne({})

    let stats;

    if (text.toLowerCase().startsWith('crypto status')) {
        if (userId === adminId) {
            if (parts.length == 4) {
                if (parts[2].toLowerCase() == crypto.name) {
                    cryptoCur = crypto.name
                }
                else {
                    cryptoCur = false
                }

                if (parts[3].toLowerCase() == 'true') {
                    stats = 'продаваемым'
                }
                else if (parts[3].toLowerCase() == 'false') {
                    stats = 'не продаваемым'
                }

                if (parts[2].toLowerCase() == cryptoCur) {
                    if (parts[3].toLowerCase() == 'true') {
                        bot.sendMessage(chatId, `
Вы успешно сделали критовалюту

<b>Под именем:</b> ${cryptoCur}
<b>Статус:</b> ${stats}
                        `, { parse_mode: "HTML" })
                        collectionCrypto.updateOne({ name: cryptoCur }, { $set: { status: true } })
                    }
                    else if (parts[3].toLowerCase() == 'false') {
                        bot.sendMessage(chatId, `
Вы успешно сделали критовалюту

<b>Под именем:</b> ${cryptoCur}
<b>Статус:</b> ${stats}
                        `, { parse_mode: "HTML" })
                        collectionCrypto.updateOne({ name: cryptoCur }, { $set: { status: false } })
                    }
                    else {
                        bot.sendMessage(chatId, 'Криптовалюту сделать продаваемым? напишите <code>crypto status [имя крипты] [true или false]</code>', { parse_mode: "HTML" })
                    }
                }
                else {
                    bot.sendMessage(chatId, `
Имя криптовалюты введён не правильно

доступные криптовалюты 
                    `)
                }
            }
            else {
                bot.sendMessage(chatId, 'Данные не правильно введены напишите <code>crypto status [имя крипты] [true или false]</code>', { parse_mode: "HTML" })
            }
        }
        else {
            bot.sendMessage(chatId, 'Вы не являетесь администратором бота')
        }
    }
}

async function cryptoShopWithBtn(msg, bot, collection, collectionCrypto) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const crypto = await collectionCrypto.findOne({})
    const cryptoName = crypto.name

    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: `${cryptoName}`, callback_data: `shopaltcoin` }],
                // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
            ],
        },
    };

    const user = await collection.findOne({ id: userId })

    if (text.toLowerCase() === 'магазин') {
        const userName = user.userName
        bot.sendMessage(chatId, `
<b><a href='tg://user?id=${userId}'>${userName}</a> доступные криптовалюты</b>

<b>${cryptoName}</b>

<i><b>нажмите на кнопку чтобы увидеть информацию о крипто валюте</b></i>
        `, { parse_mode: "HTML", ...options })
    }
}

async function shopCryptoCallback(msg, bot, collectionCrypto, collection) {
    const data = msg.data
    const messageId = msg.message.message_id
    const chatId = msg.message.chat.id
    const userId = msg.from.id


    if (data === 'shopaltcoin') {
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
        const optionsBackCrypto = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `Назад`, callback_data: `backShopaltcoin` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        }

        bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a> Вот магазин криптовалют
В данный момент🟣🌀💠🌐

<b>🪪Название:</b> ALTCOINIDX
<b>📠Цена:</b> ${cryptoPrice}
<b>⌚️Последнее время обновлении цены:</b> ${cryptoLastUpd}
<b>📉Действие:</b> ${cryptoMove}
<b>🏆Статус:</b> ${stats}
                `, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "HTML",
            ...optionsBackCrypto
        })
    }

    if (data === 'backShopaltcoin') {
        const crypto = await collectionCrypto.findOne({})
        const cryptoName = crypto.name

        const options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${cryptoName}`, callback_data: `shopaltcoin` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };

        const user = await collection.findOne({ id: userId })

        const userName = user.userName
        bot.editMessageText(`
<b><a href='tg://user?id=${userId}'>${userName}</a> доступные криптовалюты</b>

<b>${cryptoName}</b>

<i><b>нажмите на кнопку чтобы увидеть информацию о крипто валюте</b></i>
        `, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "HTML",
            ...options,
        })
    }
}

module.exports = {
    cryptoCurrenceLaunch,
    updateCryptoToUp,
    updateCryptoToDown,
    cryptoStatus,
    cryptoShopWithBtn,
    shopCryptoCallback,
}