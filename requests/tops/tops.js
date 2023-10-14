const { botUrl } = require("../../mongoConnect");
const { topOptions } = require("../../options");
const { donatedUsers } = require("../donate/donatedUsers");
const { formatNumberWithAbbreviations } = require("../systems/systemRu");

function getStatusSticker(status) {
    if (status === 'standart') {
        return '🎁'
    }
    else if (status === 'vip') {
        return '💎';
    } else if (status === 'premium') {
        return '⭐️';
    } else if (status === 'halloween') {
        return '🎃';
    }else {
        return '';
    }
}

function formatNumberWithEmojiStickers(number) {
    const emojiDigits = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

    const numberStr = String(number);
    let result = '';

    for (let i = 0; i < numberStr.length; i++) {
        const digit = numberStr.charAt(i);
        if (digit >= '0' && digit <= '9') {
            result += emojiDigits[digit];
        } else {
            result += digit; // Если символ не является цифрой, просто добавляем его как есть.
        }
    }

    return result;
}


async function getTopPlayersBalance(msg, bot, collection) {
    const chatId = msg.message.chat.id;
    const userId = msg.from.id;
    const replyId = msg.message.message_id

    // Получаем всех пользователей из базы данных и сортируем их по балансу в порядке убывания.
    const topPlayers = await collection.find().sort({ balance: -1 }).toArray();

    // Находим индекс (позицию) пользователя, отправившего сообщение, в отсортированном списке.
    const userIndex = topPlayers.findIndex((user) => user.id === userId);

    // Если пользователь не входит в топ 10, находим его позицию.
    const userPosition = userIndex === -1 ? await collection.countDocuments({ balance: { $gt: topPlayers[9].balance } }) + 1 : userIndex + 1;

    // Формируем отформатированное сообщение.
    let message = `<b>🔝 игроков по балансу</b>\n\n`;

    // Перебираем топ игроков и форматируем их имена и балансы соответственно.
    topPlayers.slice(0, 10).forEach((user, index) => {
        let positionText = "";
        switch (index) {
            case 0:
                positionText = "<i>👑»</i>";
                break;
            case 1:
                positionText = "<i>🏆»</i>";
                break;
            case 2:
                positionText = "<i>🎖»</i>";
                break;
            default:
                positionText = `<i>${formatNumberWithEmojiStickers(index + 1)}»</i>`;
        }

        const name = user.userName || "Неизвестный игрок";
        const balance = user.balance;
        const statusSticker = getStatusSticker(user.status[0].statusName);
        const botId = botUrl(name)

        // Добавляем данные игрока в сообщение.
        message += `${positionText} <i>${botId} ${statusSticker}</i> — <b>${balance > 0 ? formatNumberWithAbbreviations(balance) : balance}</b> \n`;
    });

    // Добавляем позицию и баланс пользователя в сообщение.
    message += `\n<i>Ваше место» ${formatNumberWithEmojiStickers(userPosition)}</i> — <b>${userIndex === -1 ? 0 : topPlayers[userIndex].balance > 0 ? formatNumberWithAbbreviations(topPlayers[userIndex].balance) : topPlayers[userIndex].balance}</b>`;

    try {
        // Отправляем сообщение в чат.
        await bot.editMessageText(message, {
            chat_id: chatId,
            message_id: replyId,
            parse_mode: 'HTML',
            ...topOptions,
            disable_web_page_preview: true,
        })
    } catch (error) {
       bot.answerCallbackQuery(msg.id, `Вы уже в этой категории топа`) 
    }
}

async function getTopPlayersCard(msg, bot, collection) {
    const chatId = msg.message.chat.id;
    const userId = msg.from.id;
    const replyId = msg.message.message_id

    // Получаем всех пользователей из базы данных и сортируем их по балансу в порядке убывания.
    const topPlayers = await collection.find().sort({ "bankCard.0.cardValue": -1 }).toArray();

    // Находим индекс (позицию) пользователя, отправившего сообщение, в отсортированном списке.
    const userIndex = topPlayers.findIndex((user) => user.id === userId);

    // Если пользователь не входит в топ 10, находим его позицию.
    const userPosition = userIndex === -1 ? await collection.countDocuments({ "bankCard.0.cardValue": { $gt: topPlayers[9].bankCard[0].cardValue } }) + 1 : userIndex + 1;

    // Формируем отформатированное сообщение.
    let message = `<b>🔝 игроков по балансу на карте</b>\n\n`;

    // Перебираем топ игроков и форматируем их имена и балансы соответственно.
    topPlayers.slice(0, 10).forEach((user, index) => {
        let positionText = "";
        switch (index) {
            case 0:
                positionText = "<i>👑»</i>";
                break;
            case 1:
                positionText = "<i>🏆»</i>";
                break;
            case 2:
                positionText = "<i>🎖»</i>";
                break;
            default:
                positionText = `<i>${formatNumberWithEmojiStickers(index + 1)}»</i>`;
        }

        const name = user.userName || "Неизвестный игрок";
        const balance = user.bankCard[0].cardValue;
        const statusSticker = getStatusSticker(user.status[0].statusName);
        const botId = botUrl(name)

        // Добавляем данные игрока в сообщение.
        message += `${positionText} <i>${botId} ${statusSticker}</i> — <b>${balance > 0 ? formatNumberWithAbbreviations(balance) : balance}</b> \n`;
    });

    // Добавляем позицию и баланс пользователя в сообщение.
    message += `\n<i>Ваше место» ${formatNumberWithEmojiStickers(userPosition)}</i> — <b>${userIndex === -1 ? 0 : topPlayers[userIndex].bankCard[0].cardValue > 0 ? formatNumberWithAbbreviations(topPlayers[userIndex].bankCard[0].cardValue) : topPlayers[userIndex].bankCard[0].cardValue}</b>`;

    try {
        // Отправляем сообщение в чат.
        await bot.editMessageText(message, {
            chat_id: chatId,
            message_id: replyId,
            parse_mode: 'HTML',
            ...topOptions,
            disable_web_page_preview: true,
        })
    } catch (error) {
       bot.answerCallbackQuery(msg.id, `Вы уже в этой категории топа`) 
    }
}

async function getTopPlayersRates(msg, bot, collection) {
    const chatId = msg.message.chat.id;
    const userId = msg.from.id;
    const replyId = msg.message.message_id

    // Получаем всех пользователей из базы данных и сортируем их по балансу в порядке убывания.
    const topPlayers = await collection.find().sort({ "rates.0.all": -1 }).toArray();

    // Находим индекс (позицию) пользователя, отправившего сообщение, в отсортированном списке.
    const userIndex = topPlayers.findIndex((user) => user.id === userId);

    // Если пользователь не входит в топ 10, находим его позицию.
    const userPosition = userIndex === -1 ? await collection.countDocuments({ "rates.0.all": { $gt: topPlayers[9].rates[0].all } }) + 1 : userIndex + 1;

    // Формируем отформатированное сообщение.
    let message = `<b>🔝 игроков по проведению игр</b>\n\n`;

    // Перебираем топ игроков и форматируем их имена и балансы соответственно.
    topPlayers.slice(0, 10).forEach((user, index) => {
        let positionText = "";
        switch (index) {
            case 0:
                positionText = "<i>👑»</i>";
                break;
            case 1:
                positionText = "<i>🏆»</i>";
                break;
            case 2:
                positionText = "<i>🎖»</i>";
                break;
            default:
                positionText = `<i>${formatNumberWithEmojiStickers(index + 1)}»</i>`;
        }

        const name = user.userName || "Неизвестный игрок";
        const rates = user.rates[0].all;
        const statusSticker = getStatusSticker(user.status[0].statusName);

        const botId = botUrl(name)

        // Добавляем данные игрока в сообщение.
        message += `${positionText} <i>${botId} ${statusSticker}</i> — <b>${rates}</b> \n`;
    });

    // Добавляем позицию и баланс пользователя в сообщение.
    message += `\n<i>Ваше место» ${formatNumberWithEmojiStickers(userPosition)}</i> — <b>${userIndex === -1 ? 0 : topPlayers[userIndex].rates[0].all}</b>`;

    try {
        // Отправляем сообщение в чат.
        await bot.editMessageText(message, {
            chat_id: chatId,
            message_id: replyId,
            parse_mode: 'HTML',
            ...topOptions,
            disable_web_page_preview: true,
        })
    } catch (error) {
       bot.answerCallbackQuery(msg.id, `Вы уже в этой категории топа`) 
    }
}

async function topWithBtns(msg, bot, collection) {
    const data = msg.data

    if (data === 'top_balance') {
        getTopPlayersBalance(msg, bot, collection)
    }
    else if (data === 'top_game') {
        getTopPlayersRates(msg, bot, collection)
    }
    else if (data === 'top_card') {
        getTopPlayersCard(msg, bot, collection)
    }
}

async function tops(msg, bot, collection) {
    const text = msg.text
    const chatId = msg.chat.id

    const userStatus = await donatedUsers(msg, collection);

    await bot.sendMessage(chatId, `
<b>${userStatus}</b>, Выберите категорю топа
        `, {
        parse_mode: "HTML",
        ...topOptions,
        disable_web_page_preview: true,
    })
}

module.exports = {
    tops,
    topWithBtns,
}