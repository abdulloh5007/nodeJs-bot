const { ObjectId } = require("mongodb")
const { donatedUsers } = require("../donate/donatedUsers")

async function globalReset(msg, bot, collection) {
    const chatId = msg.chat.id
    const messageId = msg.message_id
    const userDonateStatus = await donatedUsers(msg, collection)

    await collection.updateMany({ _id: ObjectId }, { $set: {
        balance: 5000,
    } })
    const usersCount = await collection.countDocuments();

    bot.sendMessage(chatId, `
${userDonateStatus}, успешно обнулены пользователи 
Кол-во: ${usersCount}
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
}

module.exports = {
    globalReset,
}