const { donatedUsers } = require('../donate/donatedUsers');

require('dotenv').config();

const adminIdInt = parseInt(process.env.ADMIN_ID_INT);

const botLastIncludedTime = new Date().toLocaleString();

async function botInfo(msg, collectionBot, bot, collection) {
    const userId = msg.from.id;
    const text = msg.text;
    const chatId = msg.chat.id;

    if (userId === adminIdInt) {

        const [botInn, botInnOwner] = await Promise.all([
            collectionBot.findOne({ id: adminIdInt }),
            collection.findOne({ id: adminIdInt })
        ]);

        const ownerGameId = botInnOwner.gameId;
        const updateUserBotInfo = await collection.countDocuments();

        await collectionBot.updateOne({}, { $set: { registeredUsers: updateUserBotInfo } });

        await bot.sendMessage(chatId, `
<b>Игровой айди Владельца бота: <a href='tg://user?id=${botInnOwner.id}'>${ownerGameId}</a></b>
<b>Количество пользователей: ${updateUserBotInfo}</b>
<b>Последнее время запуска бота или обновление бота: ${botLastIncludedTime}</b>

<b>Версия: ${botInn.botVersion}</b>
            `, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
    } else {
        await bot.sendMessage(chatId, 'Ошибка: у вас нет прав для выполнения этой команды.', { reply_to_message_id: msg.message_id });
    }
}

async function botVersionChange(msg, bot, collectionBot, collection) {
    const userId = msg.from.id;
    const text = msg.text;
    const chatId = msg.chat.id;

    const parts = text.split(' ');
    const userDonateStatus = await donatedUsers(msg, collection)

    if (userId !== adminIdInt) {
        await bot.sendMessage(chatId, `
${userDonateStatus}, вы не являетесь администратором бота
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (userId === adminIdInt) {
        if (parts[2] !== undefined && parts[1] !== undefined && parts.length >= 3) {
            const versionBot = text.slice(parts[0].length + 1);
            bot.sendMessage(chatId, `Версия бота успешно обновлена до ${versionBot}`);
            collectionBot.updateOne({ id: adminIdInt }, { $set: { botVersion: versionBot } });
        } else {
            bot.sendMessage(chatId, `Данные введены неправильно, напишите\n<code>botversion [версия бота] [beta, test, V]</code>`, { parse_mode: "HTML" });
        }
    } else {
        await bot.sendMessage(chatId, 'Ошибка: у вас нет прав для выполнения этой команды.', { reply_to_message_id: msg.message_id });
    }
}

async function isJoinNotification(msg) {
    return msg.new_chat_members && msg.new_chat_members.length > 0;
}

async function handleJoinLeaveMessages(msg, bot) {
    const chatId = msg.chat.id;
    const messageType = msg.new_chat_members ? 'join' : msg.left_chat_member ? 'leave' : null;

    if (messageType === 'join' || messageType === 'leave') {
        await bot.deleteMessage(chatId, msg.message_id);
    }
}

async function deleteMessageBot(msg, bot) {
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    try {
        await bot.deleteMessage(chatId, messageId);
    } catch (error) {
        console.error('Ошибка при удалении сообщения:', error.message);
    }
}

module.exports = {
    botInfo,
    botVersionChange,
    isJoinNotification,
    handleJoinLeaveMessages,
    deleteMessageBot
};