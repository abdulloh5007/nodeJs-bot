const { againGameOptions } = require("../../options");
const { parseNumber, formatNumberInScientificNotation } = require("../systems/systemRu");
const { gameWinStickers, gameLoseStickers } = require("./gameStickers");

async function kazino(msg, collection, bot) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const messageId = msg.message_id;
    const user = await collection.findOne({ id: userId });

    const parts = text && text.split(' ');
    const winChance = 40;

    if (parts && parts[0].toLowerCase() === 'казино' && parts.length === 2) {
        const balance = user.balance;
        const name = user.userName;
        const userIdG = user.id
        const value = parseInt(parseNumber(parts[1].toLowerCase()));

        // if (!isNaN(value)) {
        if (balance >= value) {
            if (value > 0) {
                const randomNum = Math.floor(Math.random() * 100);
                const winAmount = value * 2;
                const newBalance = balance + winAmount;
                const loseAmount = balance - value;
                
                if (randomNum < winChance) {
                    collection.updateOne({ id: userId }, { $inc: { balance: -value } })
                    await bot.sendMessage(chatId, `
<b>Пользователь <a href='tg://user?id=${userIdG}'>${name}</a></b>
<b>2x</b>
<b>Поздравляем! Вы выиграли ${winAmount.toLocaleString('de-DE')} ${gameWinStickers()}.</b>
                    `, { reply_to_message_id: messageId, parse_mode: 'HTML', ...againGameOptions });
                    collection.updateOne({ id: userId }, { $set: { balance: newBalance }, $inc: { "rates.0.all": 1, "rates.0.wins": 1 } });
                } else {
                    await bot.sendMessage(chatId, `
<b>Пользователь <a href='tg://user?id=${userIdG}'>${name}</a></b>
<b>0x</b>
<b>К сожалению, вы проиграли ${value.toLocaleString('de-DE')} ${gameLoseStickers()}.</b>
                    `, { reply_to_message_id: messageId, parse_mode: 'HTML', ...againGameOptions });
                    collection.updateOne({ id: userId }, { $set: { balance: loseAmount }, $inc: { "rates.0.all": 1, "rates.0.loses": 1 } });
                }
            }
            else {
                bot.sendMessage(chatId, 'Вы не можете поставить отрицательное или 0 денег для ставки')
            }
        } else {
            await bot.sendMessage(chatId, '<b>У вас нехватает средств</b>', { reply_to_message_id: messageId, parse_mode: 'HTML' });
        }
    }
}

module.exports = {
    kazino,
}
