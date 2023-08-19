const { topOptions } = require("../../options");
const { donatedUsers } = require("../donate/donatedUsers");
const { formatNumberWithAbbreviations } = require("../systems/systemRu");

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
    let message = `Топ игроков по балансу:\n\n`;

    // Перебираем топ игроков и форматируем их имена и балансы соответственно.
    topPlayers.slice(0, 10).forEach((user, index) => {
        let positionText = "";
        switch (index) {
            case 0:
                positionText = "👑:";
                break;
            case 1:
                positionText = "🏆:";
                break;
            case 2:
                positionText = "🥉:";
                break;
            default:
                positionText = `${index + 1}.`;
        }

        const name = user.userName || "Неизвестный игрок";
        const balance = user.balance;

        // Добавляем данные игрока в сообщение.
        message += `${positionText} <a href='tg://user?id=${user.id}'>${name}</a>: ${balance > 0 ? formatNumberWithAbbreviations(balance) : balance} \n`;
    });

    // Добавляем позицию и баланс пользователя в сообщение.
    message += `\nВаше место: ${userPosition}. Ваш баланс: ${userIndex === -1 ? 0 : topPlayers[userIndex].balance > 0 ? formatNumberWithAbbreviations(topPlayers[userIndex].balance) : topPlayers[userIndex].balance} `;

    // Отправляем сообщение в чат.
    bot.editMessageText(message, {
        chat_id: chatId,
        message_id: replyId,
        parse_mode: 'HTML',
        ...topOptions,
    })
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
    let message = `Топ игроков по балансу на карте:\n\n`;

    // Перебираем топ игроков и форматируем их имена и балансы соответственно.
    topPlayers.slice(0, 10).forEach((user, index) => {
        let positionText = "";
        switch (index) {
            case 0:
                positionText = "👑:";
                break;
            case 1:
                positionText = "🏆:";
                break;
            case 2:
                positionText = "🥉:";
                break;
            default:
                positionText = `${index + 1}.`;
        }

        const name = user.userName || "Неизвестный игрок";
        const balance = user.bankCard[0].cardValue;

        // Добавляем данные игрока в сообщение.
        message += `${positionText} <a href='tg://user?id=${user.id}'>${name}</a>: ${balance > 0 ? formatNumberWithAbbreviations(balance) : balance} \n`;
    });

    // Добавляем позицию и баланс пользователя в сообщение.
    message += `\nВаше место: ${userPosition}. Ваш баланс на карте: ${userIndex === -1 ? 0 : topPlayers[userIndex].bankCard[0].cardValue > 0 ? formatNumberWithAbbreviations(topPlayers[userIndex].bankCard[0].cardValue) : topPlayers[userIndex].bankCard[0].cardValue} `;

    // Отправляем сообщение в чат.
    bot.editMessageText(message, {
        chat_id: chatId,
        message_id: replyId,
        parse_mode: 'HTML',
        ...topOptions,
    })
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
    let message = `Топ игроков по проведение игр:\n\n`;

    // Перебираем топ игроков и форматируем их имена и балансы соответственно.
    topPlayers.slice(0, 10).forEach((user, index) => {
        let positionText = "";
        switch (index) {
            case 0:
                positionText = "👑:";
                break;
            case 1:
                positionText = "🏆:";
                break;
            case 2:
                positionText = "🥉:";
                break;
            default:
                positionText = `${index + 1}.`;
        }

        const name = user.userName || "Неизвестный игрок";
        const rates = user.rates[0].all;

        // Добавляем данные игрока в сообщение.
        message += `${positionText} <a href='tg://user?id=${user.id}'>${name}</a>: ${rates} \n`;
    });

    // Добавляем позицию и баланс пользователя в сообщение.
    message += `\nВаше место: ${userPosition}. Ваши проведенные игры: ${userIndex === -1 ? 0 : topPlayers[userIndex].rates[0].all} `;

    // Отправляем сообщение в чат.
    bot.editMessageText(message, {
        chat_id: chatId,
        message_id: replyId,
        parse_mode: 'HTML',
        ...topOptions,
    })
}

async function topWithBtns(msg, bot, collection) {
    const data = msg.data

    if (data === 'top_balance') {
        getTopPlayersBalance(msg, bot, collection)
    }
    if(data === 'top_game'){
        getTopPlayersRates(msg, bot, collection)
    }
    if(data === 'top_card'){
        getTopPlayersCard(msg, bot, collection)
    }
}

async function tops(msg, bot, collection) {
    const text = msg.text
    const chatId = msg.chat.id

    const userStatus = await donatedUsers(msg, collection);

    if (text.toLowerCase() === 'топ') {
        bot.sendMessage(chatId, `
<b>${userStatus}</b>, Выберите категорю топа
        `, {
            parse_mode: "HTML",
            ...topOptions
        })
    }
}

module.exports = {
    tops,
    topWithBtns,
}