const { dayBonusOption } = require("../../options");
const { formatNumberWithAbbreviations, formatNumberInScientificNotation } = require("../systems/systemRu");
require('dotenv').config();
const adminIdInt = parseInt(process.env.ADMIN_ID_INT)
const adminIdStr = process.env.ADMIN_ID

async function userChangeBFunc() {

}

async function userBalance(msg, collection, bot) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const user = await collection.findOne({ id: userId });

    if (['б', 'баланс', 'счёт', 'b', 'balance', 'balanc', 'balans'].includes(text.toLowerCase())) {
        // const balance = user.balance.toLocaleString('de-DE');
        const balance = user.balance
        const balanceFuncE = formatNumberInScientificNotation(balance)
        const balanceFuncT = balance.toLocaleString('de-DE')
        const name = user.userName;

        const userColId = user.id
        const txt = `
игрок <a href='tg://user?id=${userColId}'>${name}</a>, ваш баланс

🪙 | Монет: ${balanceFuncT} ${balance > 1000 ? `(${balanceFuncE})` : ''}
        `
        bot.sendMessage(chatId, txt, { reply_to_message_id: msg.message_id, ...dayBonusOption, parse_mode: 'HTML' })
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
        const userGameId = user.gameId;
        const userGameName = user.userName;
        const register_time = user.registerTime;
        const userGameBalance = user.balance;
        const ratesAll = user.rates.map((e) => e.all);
        const ratesWin = user.rates.map((e) => e.wins);
        const ratesLose = user.rates.map((e) => e.loses);
        const userBankCard = user.bankCard[0].cardNumber
        const cryptoCurAlt = user.crypto[0].altcoinidx

        const balanceFuncE = formatNumberInScientificNotation(userGameBalance)
        const balanceFuncT = userGameBalance.toLocaleString('de-DE')

        if (chatId == userId) {
            await bot.sendMessage(chatId, `
<b>Игровой 🆔:</b> ${userGameId}
<b>Ник 👨:</b> <a href='tg://user?id=${userId}'>${userGameName}</a>
<b>Баланс 💸: ${balanceFuncT}$ ${userGameBalance > 1000 ? `(${balanceFuncE})` : ''}</b>
<b>Карта 💳: |<code>${userBankCard}</code>|</b>
<b>Криптовалюты 📊↓</b>
   <b>Alt Coin IDX:</b> ${cryptoCurAlt}

<b>Сыграно игр: ${ratesAll} \n    Выигрыши: ${ratesWin} \n    Проигрыши: ${ratesLose}</b>
<b>Время регистрации 📆:</b> ${register_time}
        `, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
        }
        else {
            await bot.sendMessage(chatId, `
<b>Игровой 🆔:</b> ${userGameId}
<b>Ник 👨:</b> <a href='tg://user?id=${userId}'>${userGameName}</a>
<b>Баланс 💸: ${balanceFuncT}$ ${userGameBalance > 1000 ? `(${balanceFuncE})` : ''}</b>
<b>Карта 💳: |<code>5444 **** **** ****</code>|</b>
<b>Криптовалюты 📊↓</b>
   <b>Alt Coin IDX:</b> ${cryptoCurAlt}

<b>Сыграно игр: ${ratesAll} \n    Выигрыши: ${ratesWin} \n    Проигрыши: ${ratesLose}</b>
<b>Время регистрации 📆:</b> ${register_time}
        `, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
        }
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
