
async function handleBan(msg, bot, collection) {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (msg.reply_to_message && text.toLowerCase().startsWith('/ban_bot')) {
        const parts = text.split(' ');
        const timeSpecifier = parts[1];
        const banReason = parts.slice(2).join(' ').trim();

        const bannedUserId = msg.reply_to_message.from.id;
        const bannedUser = await collection.findOne({ id: bannedUserId });

        if (bannedUser) {
            // Проверяем, находится ли пользователь уже в бане
            if (bannedUser.ban[0].ban && bannedUser.ban[0].unbanTime > Date.now()) {
                const remainingTime = Math.ceil((bannedUser.ban[0].unbanTime - Date.now()) / (60 * 60 * 1000)); // Оставшееся время бана в часах
                bot.sendMessage(chatId, `Пользователь уже забанен. До окончания бана осталось ${remainingTime} часов.`);
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
                { $set: { "ban.0.ban": true, "ban.0.unbanTime": unbanTime, "ban.0.cause": banReason } }
            );

            bot.sendMessage(bannedUserId, `Вы были забанены в боте.\nПричина: ${banReason}` + (banDuration ? `\nСрок бана: ${timeSpecifier} часов` : ''));
            bot.sendMessage(chatId, `Пользователь [${bannedUser.userName}](tg://user?id=${bannedUserId}) был забанен.\nПричина: ${banReason}` + (banDuration ? `\nСрок бана: ${timeSpecifier} часов` : ''), { parse_mode: 'Markdown' });

            if (banDuration) {
                // Здесь вы можете запустить таймер для снятия бана через указанное время
            }
        } else {
            bot.sendMessage(chatId, 'Ошибка: Пользователь не найден.');
        }
    }
}

module.exports = {
    handleBan,
};