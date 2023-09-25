const { donatedUsers } = require("../donate/donatedUsers");

let bonusCooldown = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

// Пример функции для генерации случайного типа бонуса (монеты или UC)
function getRandomBonusType() {
    return Math.random() < 0.5 ? 'монеты' : 'UC';
}

// Пример функции для генерации случайной суммы
function getRandomAmount() {
    return Math.floor(Math.random() * (10000 - 10) + 10); // Пример суммы от 10 до 10000
}

function getRandomUc() {
    return Math.floor(Math.random() * (10 - 1) + 1); // Пример суммы от 1 до 10
}

async function handleDailyBonus(msg, collection, bot) {
    const userId = msg.from.id;
    const currentTime = Date.now();

    const user = await collection.findOne({ id: userId });

    const lastBonusTime = user.lastBonusTime || 0;
    const userStatusName = user.status[0].statusName
    // Изменяем cooldown для VIP и Premium пользователей
    if (userStatusName === 'vip' || userStatusName === 'premium') {
        bonusCooldown = 12 * 60 * 60 * 1000; // 12 часов в миллисекундах
    } else {
        bonusCooldown = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах
    }

    const userDonateStatus = await donatedUsers(msg, collection)

    if (currentTime - lastBonusTime >= bonusCooldown) {
        // Пользователь может получить бонус
        const bonusAmount = getRandomAmount();
        const bonusType = getRandomBonusType();
        const bonusUc = getRandomUc();

        if (bonusType === 'UC') {
            const donateX2 = bonusUc * 2

            if (userStatusName === 'vip') {
                // Обновляем время последнего бонуса в базе данных
                await collection.updateOne({ id: userId }, { $set: { lastBonusTime: currentTime } });

                // Добавляем бонус к балансу пользователя
                await collection.updateOne({ id: userId }, { $inc: { uc: donateX2 } });

                // Отправляем сообщение о получении бонуса
                const bonusMessage = `
${userDonateStatus}, Вы получили свой ежедневный бонус:\n${bonusUc} UC.
<b>${userStatusName.toUpperCase()} 💎</b> 2X = ${donateX2} UC.
                `;
                bot.sendMessage(msg.message.chat.id, bonusMessage, { reply_to_message_id: msg.message.message_id, parse_mode: 'HTML' });
            }
            else if (userStatusName === 'premium') {
                // Обновляем время последнего бонуса в базе данных
                await collection.updateOne({ id: userId }, { $set: { lastBonusTime: currentTime } });

                // Добавляем бонус к балансу пользователя
                await collection.updateOne({ id: userId }, { $inc: { uc: donateX2 } });

                // Отправляем сообщение о получении бонуса
                const bonusMessage = `
${userDonateStatus}, Вы получили свой ежедневный бонус:\n${bonusUc} UC.
<b>${userStatusName.toUpperCase()} ⭐️</b> 2X = ${donateX2} UC.
                `;
                bot.answerCallbackQuery(msg.id, { show_alert: false, text: 'успех' })
                bot.sendMessage(msg.message.chat.id, bonusMessage, { reply_to_message_id: msg.message.message_id, parse_mode: 'HTML' });
            }
            else {
                // Обновляем время последнего бонуса в базе данных
                await collection.updateOne({ id: userId }, { $set: { lastBonusTime: currentTime } });

                // Добавляем бонус к балансу пользователя
                await collection.updateOne({ id: userId }, { $inc: { uc: bonusUc } });

                // Отправляем сообщение о получении бонуса
                const bonusMessage = `
${userDonateStatus}, Вы получили свой ежедневный бонус:\n${bonusUc} UC.
                `;
                bot.sendMessage(msg.message.chat.id, bonusMessage, { reply_to_message_id: msg.message.message_id, parse_mode: 'HTML' });
            }
        }
        if (bonusType === 'монеты') {
            const donateX2 = bonusAmount * 2
            if (userStatusName === 'vip') {
                // Обновляем время последнего бонуса в базе данных
                await collection.updateOne({ id: userId }, { $set: { lastBonusTime: currentTime } });

                // Добавляем бонус к балансу пользователя
                await collection.updateOne({ id: userId }, { $inc: { balance: donateX2 } });

                // Отправляем сообщение о получении бонуса
                const bonusMessage = `
${userDonateStatus}, Вы получили свой ежедневный бонус:\n${bonusAmount.toLocaleString('de-DE')} $.
<b>${userStatusName.toUpperCase()} 💎</b> 2X = ${donateX2.toLocaleString('de-DE')} $.
                `;
                bot.sendMessage(msg.message.chat.id, bonusMessage, { reply_to_message_id: msg.message.message_id, parse_mode: 'HTML' });
            }
            else if (userStatusName === 'premium') {
                // Обновляем время последнего бонуса в базе данных
                await collection.updateOne({ id: userId }, { $set: { lastBonusTime: currentTime } });

                // Добавляем бонус к балансу пользователя
                await collection.updateOne({ id: userId }, { $inc: { balance: donateX2 } });

                // Отправляем сообщение о получении бонуса
                const bonusMessage = `
${userDonateStatus}, Вы получили свой ежедневный бонус:\n${bonusAmount.toLocaleString('de-DE')} $.
<b>${userStatusName.toUpperCase()} ⭐️</b> 2X = ${donateX2.toLocaleString('de-DE')} $.
                `;
                bot.sendMessage(msg.message.chat.id, bonusMessage, { reply_to_message_id: msg.message.message_id, parse_mode: 'HTML' });
            }
            else {
                // Обновляем время последнего бонуса в базе данных
                await collection.updateOne({ id: userId }, { $set: { lastBonusTime: currentTime } });

                // Добавляем бонус к балансу пользователя
                await collection.updateOne({ id: userId }, { $inc: { balance: bonusAmount } });

                // Отправляем сообщение о получении бонуса
                const bonusMessage = `
${userDonateStatus}, Вы получили свой ежедневный бонус:\n${bonusAmount.toLocaleString('de-DE')} $.
                `;
                bot.sendMessage(msg.message.chat.id, bonusMessage, { reply_to_message_id: msg.message.message_id, parse_mode: 'HTML' });
            }
        }
    } else {
        // Пользователь уже получил бонус в течение 24 часов
        const remainingTime = formatRemainingTime(bonusCooldown - (currentTime - lastBonusTime));
        const errorMessage = `
${userDonateStatus}, Вы уже получили бонус. Вы сможете получить следующий бонус через ${remainingTime}.
        `;
        bot.sendMessage(msg.message.chat.id, errorMessage, { reply_to_message_id: msg.message.message_id, parse_mode: 'HTML' });
    }
}

// Пример функции для форматирования оставшегося времени
function formatRemainingTime(remainingTime) {
    const hours = Math.floor(remainingTime / (60 * 60 * 1000));
    const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

    return `${hours} ч ${minutes} мин ${seconds} сек`;
}

module.exports = {
    handleDailyBonus,
    formatRemainingTime,
};
