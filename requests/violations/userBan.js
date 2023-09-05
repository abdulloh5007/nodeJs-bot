const { donatedUsers } = require("../donate/donatedUsers");

async function handleBan(msg, bot, collection) {
    const text = msg.text
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)

    if (!msg.reply_to_message) {
        bot.sendMessage(chatId, `
${userDonateStatus}, ответье сообщение пользователя которого нужно забанить 
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const parts = text.split(' ');
    const timeSpecifier = parts[1];
    const banReason = parts.slice(2).join(' ').trim();

    const bannedUserId = msg.reply_to_message.from.id;
    const bannedUser = await collection.findOne({ id: bannedUserId });

    if (bannedUser) {
        // Проверяем, находится ли пользователь уже в бане
        if (bannedUser.ban[0].ban && bannedUser.ban[0].unbanTime > Date.now()) {
            const remainingTime = Math.ceil((bannedUser.ban[0].unbanTime - Date.now()) / (60 * 60 * 1000)); // Оставшееся время бана в часах
            bot.sendMessage(chatId, `${userDonateStatus}, Пользователь уже забанен. До окончания бана осталось ${remainingTime} часов.`, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            });
            return;
        }

        let banDuration = null;

        if (!isNaN(timeSpecifier)) {
            banDuration = parseInt(timeSpecifier) * 60 * 60 * 1000; // Преобразование часов в миллисекунды
        }

        const now = new Date().getTime();
        const unbanTime = banDuration ? now + banDuration : null;

        await collection.updateOne(
            { id: bannedUserId },
            { $set: { "ban.0.ban": true, "ban.0.unbanTime": unbanTime, "ban.0.cause": banReason, "ban.0.banTime": new Date() } }
        );

        try {
            await bot.sendMessage(bannedUserId, `${userDonateStatus}, Вы были забанены в боте.\nПричина: ${banReason}` + (banDuration ? `\nСрок бана: ${timeSpecifier} часов` : ''), {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            });
        }
        catch (err) {
            if (err.response.status === 403) {
                console.log('Пользователь заблокировал бота');
            }
            else {
                console.log('Error send ban ' + err);
            }
        }
        bot.sendMessage(chatId, `${userDonateStatus}, Пользователь <a href='tg://user?id=${bannedUserId}'>${bannedUser.userName}</a> был забанен.\nПричина: ${banReason}` + (banDuration ? `\nСрок бана: ${timeSpecifier} часов` : ''), {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        });

    } else {
        bot.sendMessage(chatId, `${userDonateStatus}, Ошибка: Пользователь не найден.`);
    }
}

module.exports = {
    handleBan,
};