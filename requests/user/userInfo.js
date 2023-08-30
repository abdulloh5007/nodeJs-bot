const { donatedUsers } = require("../donate/donatedUsers");
const { formatNumberWithAbbreviations, formatNumberInScientificNotation } = require("../systems/systemRu");
const { handleDailyBonus } = require("./bonusCollectBtn");
require('dotenv').config();
const adminIdInt = parseInt(process.env.ADMIN_ID_INT)

async function userChangeBFunc() {

}

async function userBalance(msg, collection, bot) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const user = await collection.findOne({ id: userId });

    if (['б', 'баланс', 'счёт', 'b', 'balance', 'balanc', 'balans'].includes(text.toLowerCase())) {
        const balance = user.balance;
        const balanceFuncE = formatNumberInScientificNotation(balance);
        const balanceFuncT = balance.toLocaleString('de-DE');
        const userUc = user.uc;
        const userStatusName = user.status[0].statusName;

        const userDonateStatus = await donatedUsers(msg, collection);

        // bot.getUserProfilePhotos(userId, { limit: 1 })
        //     .then((result) => {
        //         if (result.total_count > 0) {
        //             const photo = result.photos[0][0].file_id; // Получение идентификатора файла аватарки
        //             console.log(photo);
        //             // Отправка аватарки в чат
        //             bot.sendPhoto(chatId, photo)
        //                 .then(() => {
        //                     console.log('Аватарка пользователя успешно отправлена.');
        //                 })
        //                 .catch((error) => {
        //                     console.error('Ошибка при отправке аватарки:', error);
        //                 });
        //         } else {
        //             console.log('У пользователя нет аватарки.');
        //         }
        //     })
        //     .catch((error) => {
        //         console.error('Ошибка при получении информации о пользователе:', error);
        //     });

        let userStatus;
        if (userStatusName === 'standart' || userStatusName === 'player') {
            userStatus = `
${userDonateStatus}, ваш баланс

🪙 | Монет: ${balanceFuncT} ${balanceFuncE}
UC | ${userUc}

<b>РЕКЛАМА: Скоро</b>
            `;
        } else {
            userStatus = `
${userDonateStatus}, ваш баланс

🪙 | Монет: ${balanceFuncT} ${balanceFuncE}
UC | ${userUc}
            `;
        }

        const txt = `
${userStatus}
        `;

        const dayBonusOption = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Получить бонус', callback_data: `dayBonusCollect_${userId}` }]
                ]
            }
        };
        bot.sendMessage(chatId, txt, { reply_to_message_id: msg.message_id, ...dayBonusOption, parse_mode: 'HTML' });
    }
}

async function dayBonusCollectingBtn(msg, collection, bot) {
    const userId = msg.from.id
    const data = msg.data
    const msgId = msg.id

    const [bonus, userIdClick] = data.split('_')

    if (bonus === 'dayBonusCollect') {
        if (userId == userIdClick) {
            // bot.answerCallbackQuery(msgId, { text: "Вы нажали на кнопку! пока что в разработке", show_alert: true });
            // bot.sendMessage(chatId, `в разработке`, { reply_to_message_id: messageId })
            handleDailyBonus(msg, collection, bot)
        }
        else {
            bot.answerCallbackQuery(msgId, { show_alert: true, text: 'Это кнопка не для тебя' })
        }
    }
}

async function userEditGameId(msg, bot, collection) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const match = text && text.match(/сменить айди\s+(\S+)/i);

    if (match && match[1]) {
        const newId = match[1].toUpperCase();
        if (newId.length === 8) {
            if (userId === adminIdInt) {
                await bot.sendMessage(chatId, `Вы сменили айди на "${newId}"`, { reply_to_message_id: msg.message_id });
                collection.updateOne({ id: userId }, { $set: { gameId: newId } });
            } else {
                await bot.sendMessage(chatId, `Ты не можешь сменить свой айди. Напиши владельцу, чтобы сменить его.`, { reply_to_message_id: msg.message_id });
            }
        } else {
            await bot.sendMessage(chatId, `Длина айди должна составлять 8 знаков.\nНапример: <code>Сменить айди B7777777</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
        }
    }
    if (text === 'сменить айди') {
        await bot.sendMessage(chatId, `Напиши мне айди, который состоит из 8 знаков.\nНапример: <code>Сменить айди B7777777</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
    }
}

async function userEditGameName(msg, bot, collection) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const match = text && text.match(/сменить ник\s+(\S+)/i);

    const prohibitedStickers = ["🎁", "💎", "⭐️"]; // Запрещенные стикеры
    const user = await collection.findOne({ id: userId });
    if (match && match[1]) {
        const newName = match[1];
        const userStatus = user.status[0].statusName

        // Проверяем статус пользователя
        if (userStatus === "premium" || userStatus === "vip") {
            // Проверяем наличие запрещенных стикеров в новом никнейме
            const containsProhibitedSticker = prohibitedStickers.some(sticker => newName.includes(sticker));

            if (newName.length <= 16 && !containsProhibitedSticker) {
                await bot.sendMessage(chatId, `Вы сменили ник на "${newName}"`, { reply_to_message_id: msg.message_id });
                collection.updateOne({ id: userId }, { $set: { userName: newName } });
                collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardOwner": newName } });
            } else {
                let errorMessage = "Длина ника не должна превышать 16 знаков и не должен содержать запрещенные стикеры:\n";

                if (newName.length > 16) {
                    errorMessage += "Ник слишком длинный.\n";
                }

                await bot.sendMessage(chatId, errorMessage, { reply_to_message_id: msg.message_id });
            }
        } else {
            // Проверяем наличие запрещенных стикеров в новом никнейме
            const containsProhibitedSticker = prohibitedStickers.some(sticker => newName.includes(sticker));

            if (newName.length <= 9 && !containsProhibitedSticker) {
                await bot.sendMessage(chatId, `Вы сменили ник на "${newName}"`, { reply_to_message_id: msg.message_id });
                collection.updateOne({ id: userId }, { $set: { userName: newName } });
                collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardOwner": newName } });
            } else {
                let errorMessage = "Длина ника не должна превышать 9 знаков и не должен содержать запрещенные стикеры:\n";

                if (newName.length > 9) {
                    errorMessage += "Ник слишком длинный.\n";
                }

                if (containsProhibitedSticker) {
                    errorMessage += "Нельзя использовать стикеры 🎁, 💎 или ⭐️ в никнейме.";
                }

                await bot.sendMessage(chatId, errorMessage, { reply_to_message_id: msg.message_id });
            }
        }
    }

    if (text === 'сменить ник') {
        await bot.sendMessage(chatId, `Напишите новый ник, который не должен превышать 14 знаков.\nНапример: <code>Сменить ник (я владелец)</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
    }
}

async function userGameInfo(msg, bot, collection) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const user = await collection.findOne({ id: userId });

    if (['инфо', 'профиль'].includes(text.toLowerCase())) {
        const userGameId = user.gameId;
        const register_time = user.registerTime;
        const userGameBalance = user.balance;
        const ratesAll = user.rates.map(e => e.all);
        const ratesWin = user.rates.map(e => e.wins);
        const ratesLose = user.rates.map(e => e.loses);
        const userBankCard = user.bankCard[0].cardNumber;
        const cryptoCurAlt = user.crypto[0].altcoinidx;
        const userUc = user.uc;
        const userStatus = user.status[0].statusName;

        const balanceFuncE = formatNumberInScientificNotation(userGameBalance);
        const balanceFuncT = userGameBalance.toLocaleString('de-DE');
        const userDonateStatus = await donatedUsers(msg, collection);

        const cardText = chatId === userId ? `Карта 💳: |<code>${userBankCard}</code>|` : `Карта 💳: |<code>5444 **** **** ****</code>|`;

        await bot.sendMessage(chatId, `
<b>Игровой 🆔:</b> ${userGameId}
<b>Ник 👨:</b> ${userDonateStatus}
<b>Баланс 💸:</b> ${balanceFuncT}$ ${balanceFuncE}
<b>Uc: ${userUc}</b>
<b>Status: ${userStatus.toUpperCase()}</b>
${cardText}
<b>Криптовалюты 📊↓</b>
   <b>Alt Coin IDX:</b> ${cryptoCurAlt}

<b>Сыграно игр: ${ratesAll} \n    Выигрыши: ${ratesWin} \n    Проигрыши: ${ratesLose}</b>
<b>Время регистрации 📆:</b> ${register_time}
    `, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
    }
}

async function myId(msg, bot, collection) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id
    const user = await collection.findOne({ id: userId })

    const userDonateStatus = await donatedUsers(msg, collection)

    if (['айди', 'мой айди', 'my id', 'myid', 'id'].includes(text.toLowerCase())) {
        const userBotid = user.id
        const userGameId = user.gameId

        bot.sendMessage(chatId, `
${userDonateStatus}, Вот ваш 
<b>Телеграм айди:</b> <code>${userBotid}</code>
<b>Бот айди:</b> <code>${userGameId}</code>
        `, { parse_mode: 'HTML', reply_to_message_id: messageId })
    }
}

module.exports = {
    userBalance,
    userEditGameId,
    userGameInfo,
    userEditGameName,
    myId,
    dayBonusCollectingBtn,
};
