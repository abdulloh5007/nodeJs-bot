const { parseNumber } = require('../systems/systemRu');

require('dotenv').config();
const adminIdInt = parseInt(process.env.ADMIN_ID_INT)

async function extraditeMoney(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const messageId = msg.message_id
    const parts = text && text.split(' ');

    const userIdToGet = msg.reply_to_message?.from?.id;
    const userToGet = userIdToGet ? await collection.findOne({ id: userIdToGet }) : null

    if (text.toLowerCase().startsWith('выдать')) {
        if (userId == adminIdInt) {
            if (parts.length == 2) {
                const sum = parseInt(parseNumber(parts[1]))

                if (!!userToGet) {
                    const userNameToGet = userToGet.userName
                    bot.sendMessage(chatId, `Вы успешно выдали игроку <a href='tg://user?id=${userIdToGet}'>${userNameToGet}</a>\nСумму: ${sum}`, { parse_mode: "HTML" })

                    collection.updateOne({ id: userIdToGet }, { $inc: { balance: sum } })

                }
                else {
                    bot.sendMessage(chatId, 'Этот пользователь не найден', { reply_to_message_id: messageId })
                }
            }
            else {
                bot.sendMessage(chatId, 'Ответь сообщением <code>выдать сумма</code> кому бы хотели выдать денег', { parse_mode: 'HTML' })
            }
        }
        else {
            bot.sendMessage(chatId, 'Вы не являетесь администратором бота')
        }
    }
}

async function takeMoney(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const messageId = msg.message_id
    const parts = text && text.split(' ');

    const userIdToTake = msg.reply_to_message?.from?.id;
    const userToTake = userIdToTake ? await collection.findOne({ id: userIdToTake }) : null

    if (text.toLowerCase().startsWith('забрать')) {
        if (userId == adminIdInt) {
            if (parts.length == 2) {
                const sum = parseInt(parseNumber(parts[1]))

                if (!!userToTake) {
                    const userToTakeBalance = userToTake.balance
                    if (sum <= userToTakeBalance) {
                        const userNameToTake = userToTake.userName
                        bot.sendMessage(chatId, `Вы успешно забрали от игрока <a href='tg://user?id=${userIdToTake}'>${userNameToTake}</a>\nСумму: ${sum}`, { parse_mode: "HTML" })

                        collection.updateOne({ id: userIdToTake }, { $inc: { balance: -sum } })

                    }
                    else {
                        bot.sendMessage(chatId, `У этого пользователя меньше денег чем вы назначили чтобы забрать вы можете забрать у него\nСумму: ${userToTakeBalance}`, { reply_to_message_id: messageId })
                    }
                }
                else {
                    bot.sendMessage(chatId, 'Этот пользователь не найден', { reply_to_message_id: messageId })
                }
            }
            else {
                bot.sendMessage(chatId, 'Ответь сообщением <code>выдать сумма</code> кому бы хотели выдать денег', { parse_mode: 'HTML', reply_to_message_id: messageId })
            }
        }
        else {
            bot.sendMessage(chatId, 'Вы не являетесь администратором бота', { reply_to_message_id: messageId })
        }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
}

async function takeAllMoney(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const messageId = msg.message_id
    const parts = text && text.split(' ');

    const userIdToTake = msg.reply_to_message?.from?.id;
    const userToTake = userIdToTake ? await collection.findOne({ id: userIdToTake }) : null

    if (text.toLowerCase() == 'забрать все') {
        if (userId == adminIdInt) {
            if (parts.length == 2) {
                if (!!userToTake) {
                    const userToTakeBalance = userToTake.balance
                    if (userToTakeBalance > 0) {
                        const userNameToTake = userToTake.userName
                        bot.sendMessage(chatId, `Вы успешно забрали от игрока <a href='tg://user?id=${userIdToTake}'>${userNameToTake}</a>\nСумму: все деньги`, { parse_mode: "HTML" })

                        collection.updateOne({ id: userIdToTake }, { $inc: { balance: -userToTakeBalance } })

                    }
                    else {
                        bot.sendMessage(chatId, `У этого пользователя и так нету денег`, { reply_to_message_id: messageId })
                    }
                }
                else {
                    bot.sendMessage(chatId, 'Этот пользователь не найден', { reply_to_message_id: messageId })
                }
            }
            else {
                bot.sendMessage(chatId, 'Ответь сообщением <code>выдать сумма</code> кому бы хотели выдать денег', { parse_mode: 'HTML', reply_to_message_id: messageId })
            }
        }
        else {
            bot.sendMessage(chatId, 'Вы не являетесь администратором бота', { reply_to_message_id: messageId })
        }
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
}

module.exports = {
    extraditeMoney,
    takeMoney,
    takeAllMoney,
}