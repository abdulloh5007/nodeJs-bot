const { donatedUsers } = require("../donate/donatedUsers")
const { formatNumberInScientificNotation } = require("../systems/systemRu")
require('dotenv').config()

const adminId = parseInt(process.env.ADMIN_ID_INT)

let giveCooldown = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

async function limitations(msg, bot, collection) {
    const chatId = msg.chat.id
    const userId1 = msg.from.id
    const text = msg.text
    const currentTime = Date.now();

    const user = await collection.findOne({ id: userId1 })
    const userDonateStatus = await donatedUsers(msg, collection)

    const userGiveMoneyLimit = user.limit[0].giveMoneyLimit
    const userGivedMoney = user.limit[0].givedMoney
    const userLimitTime = user.limit[0].updateDayLimit
    const remainingTime = formatRemainingTime(giveCooldown - (currentTime - userLimitTime));
    bot.sendMessage(chatId, `
${userDonateStatus}, вот данные за ваш лимит

<b>Деньги переданы:</b> ${userGivedMoney.toLocaleString('de-DE')} ${formatNumberInScientificNotation(userGivedMoney)} / ${userGiveMoneyLimit.toLocaleString('de-DE')} ${formatNumberInScientificNotation(userGiveMoneyLimit)}

<b>До обновления дневного лимита:</b> ${userLimitTime > 0 ? remainingTime : ''}
    `, { parse_mode: 'HTML' })
}

async function removeLimit(msg, bot, collection, ObjectId) {
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)

    bot.sendMessage(chatId, `
${userDonateStatus}, успешно обновлены лимиты передачи
        `, { parse_mode: 'HTML' })
    await collection.updateMany({ _id: ObjectId }, { $set: { "limit.0.givedMoney": 0, "limit.0.updateDayLimit": Date.now() } })
}

// Пример функции для форматирования оставшегося времени
function formatRemainingTime(remainingTime) {
    const hours = Math.floor(remainingTime / (60 * 60 * 1000));
    const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

    return `${hours} ч ${minutes} мин ${seconds} сек`;
}

async function updateDayLimitAtUTC9(bot, collection) {
    // Обновление лимитов пользователей
    await updateLimits(collection);
    bot.sendMessage(adminId, `
Обновлены лимиты
        `)
}

async function updateLimits(collection) {
    const users = await collection.find({}).toArray();

    for (const user of users) {
        collection.updateOne({ id: user.id }, { $set: { "limit.0.givedMoney": 0 } });
        collection.updateOne({ id: user.id }, { $set: { "limit.0.updateDayLimit": Date.now() } });
    }
}

module.exports = {
    limitations,
    removeLimit,
    updateDayLimitAtUTC9,
}