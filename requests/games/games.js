const { againGameOptions } = require("../../options");
const { gameWinStickers, gameLoseStickers } = require("./gameStickers");

async function kazino(msg, collection, bot) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const messageId = msg.message_id;
    const user = await collection.findOne({ id: userId });

    const parts = text && text.split(' ');
    const winChance = 30;

    if (parts && parts[0].toLowerCase() === 'казино' && parts.length === 2) {
        const balance = user.balance;
        const name = user.userName;
        const value = parseFloat(parts[1]);

        if (!isNaN(value)) {
            if (balance >= value) {
                const randomNum = Math.floor(Math.random() * 100);
                const winAmount = value * 2;
                const newBalance = balance + winAmount;
                const loseAmount = balance - value;

                if (randomNum < winChance) {
                    await bot.sendMessage(chatId, `<b>Игрок ${name}</b>\nПоздравляем! Вы выиграли ${winAmount} ${gameWinStickers()}.\nВаш новый баланс: ${newBalance}.`, { reply_to_message_id: messageId, parse_mode: 'HTML', ...againGameOptions });
                    collection.updateOne({ id: userId }, { $set: { balance: newBalance }, $inc: { "rates.0.all": 1, "rates.0.wins": 1 } });
                } else {
                    await bot.sendMessage(chatId, `<b style='color: red'>Игрок ${name}</b>\nК сожалению, вы проиграли ${value} ${gameLoseStickers()}\nВаш новый баланс: ${loseAmount}.`, { reply_to_message_id: messageId, parse_mode: 'HTML', ...againGameOptions });
                    collection.updateOne({ id: userId }, { $set: { balance: loseAmount }, $inc: { "rates.0.all": 1, "rates.0.loses": 1 } });
                }
            } else {
                await bot.sendMessage(chatId, '<b>У вас нехватает средств</b>', { reply_to_message_id: messageId, parse_mode: 'HTML' });
            }
        } else {
            await bot.sendMessage(chatId, `Введите только число`, { reply_to_message_id: messageId });
        }
    }
}

module.exports = {
    kazino,
}
