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

    if (text.toLowerCase().startsWith('крипта вверх')) {
        if (userId === adminId) {
            const crypto = await collectionCrypto.findOne({ name: 'altcoinidx' })
            const cryptoPrice = crypto.price
            const price = parseInt(parts[2])
            const price2 = cryptoPrice + price
            if (parts.length === 3 && !isNaN(price)) {
                bot.sendMessage(chatId, `
<b><a href='tg://user?id=${userId}'>Владелец</a> вы успешно изменили</b>

<b>Цену криптовалюты на:</b> <i>${price}</i>
<b>Время:</b> <i>${lastUpdateTime}</i>

теперь 1 криптовалюта ALTCOINIDX равна ${price2}
                `, { parse_mode: 'HTML' })
                collectionCrypto.updateOne({ name: 'altcoinidx' }, { $set: { price: price2 } })
                collectionCrypto.updateOne({ name: 'altcoinidx' }, { $set: { move: parts[1] } })
                collectionCrypto.updateOne({ name: 'altcoinidx' }, { $set: { lastUpdateTime: lastUpdateTime } })
            }
            else {
                bot.sendMessage(chatId, `Данные введены не правильно напишите\n<code>крипта [вверх, вниз] цену</code> цена только в цыфрах`, { parse_mode: "HTML" })
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

    if (text.toLowerCase().startsWith('крипта вниз')) {
        if (userId === adminId) {
            const crypto = await collectionCrypto.findOne({ name: 'altcoinidx' })
            const cryptoPrice = crypto.price

            const price2 = cryptoPrice - parseInt(parts[2])
            const price = parseInt(parts[2])
            if (parts.length === 3 && !isNaN(price)) {
                bot.sendMessage(chatId, `
<b><a href='tg://user?id=${userId}'>Владелец</a> вы успешно изменили</b>

<b>Цену криптовалюты на:</b> <i>${price}</i>
<b>Время:</b> <i>${lastUpdateTime}</i>

теперь 1 криптовалюта ALTCOINIDX равна ${price2}
                `, { parse_mode: 'HTML' })
                collectionCrypto.updateOne({ name: 'altcoinidx' }, { $inc: { price: -price } })
                collectionCrypto.updateOne({ name: 'altcoinidx' }, { $set: { move: parts[1] } })
                collectionCrypto.updateOne({ name: 'altcoinidx' }, { $set: { lastUpdateTime: lastUpdateTime } })
            }
            else {
                bot.sendMessage(chatId, `Данные введены не правильно напишите\n<code>крипта [вверх, вниз] цену</code> цена только в цыфрах`, { parse_mode: "HTML" })
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
    if (parts[2] == crypto.name) {
        cryptoCur = crypto.name
    }
    else {
        cryptoCur = false
    }

    let stats;
    if (parts[3] == 'true') {
        stats = 'продаваемым'
    }
    else if (parts[3] == 'false') {
        stats = 'не продаваемым'
    }

    if (text.toLowerCase().startsWith('crypto status')) {
        if (userId === adminId) {
            if (parts.length == 4) {
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

module.exports = {
    cryptoCurrenceLaunch,
    updateCryptoToUp,
    updateCryptoToDown,
    cryptoStatus,
}