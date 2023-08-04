const { parseNumber } = require("../systems/systemRu");

async function giveMoney(msg, bot, collection) {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text.toLowerCase().startsWith('дать')) {
        const parts = text.split(' ');
        if (parts.length === 2) {
            if (msg.reply_to_message && msg.reply_to_message.from) {
                const userToAccept = msg.reply_to_message.from.id;
                const userToGive = msg.from.id;
                const amount = parseInt(parseNumber(parts[1]));

                // Проверяем, чтобы пользователь не давал деньги самому себе
                if (userToAccept === userToGive) {
                    bot.sendMessage(chatId, 'Вы не можете дать деньги самому себе.');
                    return;
                }

                const userAccept = await collection.findOne({ id: userToAccept })
                const userToAcceptName = userAccept.userName
                
                const userGive = await collection.findOne({ id: userToGive });
                const userToGiveBalance = userGive.balance;
                const userToGiveName = userAccept.userName


                if (userToGiveBalance >= amount) {
                    const successful = userToGiveBalance - amount;
                    bot.sendMessage(chatId, `
Игрок <a href='tg://user?id=${userToGive}'>${userToGiveName}</a> дал игроку <a href='tg://user?id=${userToAccept}'>${userToAcceptName}</a> сумму ${amount}`, { parse_mode: 'HTML' });
                    collection.updateOne({ id: userToGive }, { $set: { balance: successful } });
                    collection.updateOne({ id: userToAccept }, { $inc: { balance: amount } });
                } else {
                    bot.sendMessage(chatId, 'Ошибка: не хватает средств');
                }
            } else {
                bot.sendMessage(chatId, 'Ошибка: ответьте на сообщение кому бы вы хотели дать денег');
            }
        } else {
            bot.sendMessage(chatId, 'Ответьте на сообщение кому бы вы хотели дать денег, например: "дать [сумма]"', { parse_mode: 'HTML' });
        }
    }
}

module.exports = {
    giveMoney,
}
