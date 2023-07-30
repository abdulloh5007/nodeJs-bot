const { dayBonusOption } = require("../../options");

async function userBalance(msg, collection, bot) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const user = await collection.findOne({ id: userId });

    if (['б', 'баланс', 'счёт'].includes(text.toLowerCase())) {
        const balance = user.balance;
        const name = user.userName;
        await bot.sendMessage(chatId, `
игрок ${name}
вот ваш баланс ${balance}
                `, { parse_mode: 'HTML', ...dayBonusOption, reply_to_message_id: msg.message_id });
    }
}

async function userEditGameId(msg, bot, collection) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const match = text && text.match(/сменить айди\s+(\S+)/i);
    const user = collection.findOne({ id: userId });

    if (match && match[1]) {
        const newId = match[1].toUpperCase();
        if (newId.length === 8) {
            if (userId === adminId) {
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

    if (match && match[1]) {
        const newName = match[1];
        if (newName.length <= 14) {
            await bot.sendMessage(chatId, `Вы сменили ник на "${newName}"`, { reply_to_message_id: msg.message_id });
            collection.updateOne({ id: userId }, { $set: { userName: newName } });
            collection.updateOne({ id: userId }, { $set: { "bankCard.0.cardOwner": newName } })
        } else {
            await bot.sendMessage(chatId, `Длина ника не должна превышать 14 знаков.\nНапример: <code>Сменить ник B7777777</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
        }
    }
    if (text === 'сменить ник') {
        await bot.sendMessage(chatId, `Напиши мне новый ник, который не должен превышать 14 знаков.\nНапример: <code>Сменить ник (я владелец)</code>`, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
    }
}

async function userGameInfo(msg, bot, collection) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const user = await collection.findOne({ id: userId });

    if (['инфо', 'профиль'].includes(text.toLowerCase())) {
        const altCoinIdx = 107.7;
        const userGameId = user.gameId;
        const userGameName = user.userName;
        const register_time = user.registerTime;
        const userGameBalance = user.balance;
        const ratesAll = user.rates.map((e) => e.all);
        const ratesWin = user.rates.map((e) => e.wins);
        const ratesLose = user.rates.map((e) => e.loses);

        await bot.sendMessage(chatId, `
<b>Игровой 🆔:</b> ${userGameId}
<b>Ник 👨:</b> <a href='tg://user?id=${userId}'>${userGameName}</a>
<b>Баланс 💸: ${userGameBalance}$</b>

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

    if (['айди', 'мой айди', 'my id', 'myid', 'id'].includes(text.toLowerCase())) {
        const userBotid = user.id
        const userName = user.userName

        bot.sendMessage(chatId, `игрок <a href='tg://user?id=${userBotid}'>${userName}</a> Вот ваш <b>Телеграм айди:</b> <code>${userBotid}</code>`, { parse_mode: 'HTML', reply_to_message_id: messageId })
    }
}

module.exports = {
    userBalance,
    userEditGameId,
    userGameInfo,
    userEditGameName,
    myId,
};
