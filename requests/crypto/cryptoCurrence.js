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

async function isPrivateChatWithBot(userId) {
    try {
        // Выполняем запрос к API Telegram для получения информации о пользователе
        const chatMember = await bot.getChat(userId, userId);

        // Если метод выполнен без ошибок, значит пользователь является участником приватного чата с ботом
        return chatMember;
    } catch (error) {
        // Если произошла ошибка, значит приватного чата с ботом нет
        return false;
    }
}

async function cryptoShopWithBtn(msg, bot, collectionCrypto) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    if (text.toLowerCase() === 'магазин') {
        const hasPrivateChat = isPrivateChatWithBot(userId);

        // Выводим результат в консоль
        console.log(`У пользователя с id ${userId} ${hasPrivateChat ? 'есть' : 'нет'} приватного чата с ботом`);
        // bot.getUpdates().then((updates) => {
        //     const privateChatUpdates = updates.filter((update) => {
        //         return update.message && update.message.chat.type === 'private' && update.message.chat.id === userId;
        //     });

        //     if (privateChatUpdates.length > 0) {
        //         bot.sendMessage(chatId, 'У вас есть сообщения от бота в личке.');
        //     } else {
        //         bot.sendMessage(chatId, 'У вас нет сообщений от бота в личке.');
        //     }
        // }).catch((error) => {
        //     console.error('Ошибка при проверке сообщений в личке:', error);
        //     bot.sendMessage(chatId, 'Произошла ошибка при проверке сообщений в личке.');
        // });
    }
}

module.exports = {
    cryptoCurrenceLaunch,
    updateCryptoToUp,
    updateCryptoToDown,
    cryptoStatus,
    cryptoShopWithBtn,
}