require('dotenv').config();
const adminIdInt = parseInt(process.env.ADMIN_ID_INT)
const adminIdStr = process.env.ADMIN_ID

const date = new Date()
const year = date.getFullYear()
const month = date.getMonth()
const day = date.getDate()
const hours = date.getHours()
const minutes = date.getMinutes()
const botLastIncludedTime = `${day}-${month}-${year} ${hours}:${minutes}`

async function botInfo2(msg, collectionBot, bot, collection) {
    const userId = msg.from.id;
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === 'botinfo launch') {
        if (userId == adminIdInt) {
            const count = await collection.countDocuments();

            collectionBot.insertOne({
                id: adminIdInt,
                botLastIncTime: botLastIncludedTime,
                botVersion: "",
                registeredUsers: count || 0
            });

            await bot.sendMessage(chatId, `Успешно`, { reply_to_message_id: msg.message_id });
        } else {
            await bot.sendMessage(chatId, 'Ошибка: у вас нет прав для выполнения этой команды.', { reply_to_message_id: msg.message_id });
        }
    }
}

async function botInfo(msg, collectionBot, bot, collection) {
    const userId = msg.from.id;
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text.toLowerCase() === 'botinfo') {
        if (userId === adminIdInt) {
            const botInn = await collectionBot.findOne({ id: adminIdInt });
            const botInnOwner = await collection.findOne({ id: adminIdInt });
            const ownerGameId = botInnOwner.gameId;
            const botInnLastInc = botInn.botLastIncTime;
            const botInnVersion = botInn.botVersion;

            const updateUserBotInfo = await collection.countDocuments()
            collectionBot.updateOne({}, { $set: { registeredUsers: updateUserBotInfo } })

            await bot.sendMessage(chatId, `
<b>Игровой айди Владельца бота: <a href='tg://user?id=${botInnOwner.id}'>${ownerGameId}</a></b>
<b>Количество пользователей: ${updateUserBotInfo}</b>
<b>Последнее время запуска бота или обновление бота: ${botInnLastInc}</b>

<b>Версия: ${botInnVersion}</b>
            `, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
        } else {
            await bot.sendMessage(chatId, 'Ошибка: у вас нет прав для выполнения этой команды.', { reply_to_message_id: msg.message_id });
        }
    }
}

async function botVersionChange(msg, bot, collectionBot) {
    const userId = msg.from.id;
    const text = msg.text;
    const chatId = msg.chat.id;

    const parts = text.split(' ')

    if (text.toLowerCase().startsWith('bot version')) {
        if (userId === adminIdInt) {
            if(parts[3] === undefined && parts.length === 3) {
                console.log(parts[3], 'ok');
            }
            else if(parts[3] !== undefined && parts[2] !== undefined && parts.length === 4){
                const versionBot = parts[2] + ' ' + parts[3]
                bot.sendMessage(chatId, `Версия бота успешно обновлена до ${versionBot}`)
                collectionBot.updateOne({ id: adminIdInt }, { $set: { botVersion: versionBot } })
            }
            else{
                bot.sendMessage(chatId, `Данные введены не правильно, напишите\n<code>bot version [версия бота] [beta, test, V]</code>`, { parse_mode: "HTML" })
            }
        }
    }
}

// настройки бота

async function isJoinNotification(msg) {
    // Проверяем, есть ли свойство new_chat_members в сообщении
    return msg.new_chat_members && msg.new_chat_members.length > 0;
}

async function handleJoinLeaveMessages(msg, bot) {
    const chatId = msg.chat.id;
    const messageType = msg.new_chat_members ? 'join' : msg.left_chat_member ? 'leave' : null;

    if (messageType === 'join' || messageType === 'leave') {
        // Удаляем сообщение о добавлении или удалении участника
        await bot.deleteMessage(chatId, msg.message_id);
    }
}

// Функция для удаления сообщения по его идентификатору
async function deleteMessageBot(msg, bot) {
    const chatId = msg.chat.id
    const messageId = msg.message_id

    try {
        await bot.deleteMessage(chatId, messageId);
    } catch (error) {
        console.error('Ошибка при удалении сообщения:', error.message);
    }
}


module.exports = {
    botInfo,
    botInfo2,
    isJoinNotification,
    handleJoinLeaveMessages,
    deleteMessageBot,
    botVersionChange,
};
