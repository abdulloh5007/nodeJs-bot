const { againGameOptions } = require("../../options");
const { donatedUsers } = require("../donate/donatedUsers");
const { parseNumber, formatNumberInScientificNotation } = require("../systems/systemRu");
const { gameWinStickers, gameLoseStickers } = require("./gameStickers");

async function kazino(msg, collection, bot, valueIndex) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const messageId = msg.message_id;

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId });
    const parts = text.split(' ');

    if (parts.length <= valueIndex) {
        bot.sendMessage(chatId, `
    ${userDonateStatus}, Не павильно введена команда 
Пример: <code>казино 10</code>
        `, { reply_to_message_id: messageId, parse_mode: 'HTML' })
        return;
    }

    const balance = user.balance;
    const value = parseInt(parseNumber(parts[valueIndex].toLowerCase()));

    if (value <= 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, Не возможно поставить отрицательное или нулевое количество ставки
            `, { reply_to_message_id: messageId, parse_mode: 'HTML' })
        return;
    }

    if (balance >= value) {
        const randomNum = Math.floor(Math.random() * 100);

        // Подсчет выигрышей и коэффициентов в зависимости от результата
        let winCoefficient = 0;
        let resultText = '';
        if (randomNum < 7) {
            winCoefficient = 5;
            resultText = 'Вы выиграли 5x';
        } else if (randomNum < 20) {
            winCoefficient = 3;
            resultText = 'Вы выиграли 3x';
        } else if (randomNum < 30) {
            winCoefficient = 2;
            resultText = 'Вы выиграли 2x';
        } else if (randomNum < 40) {
            winCoefficient = 1;
            resultText = 'Вы выиграли 1x';
        } else {
            resultText = 'Вы проиграли 0x';
        }

        const userStatus = await donatedUsers(msg, collection)
        const winAmount = value * winCoefficient;
        const newBalance = resultText.includes('выиграли') ? balance + winAmount : balance - value;

        // Отправка сообщения с результатом
        const resultMessage = `
<b>${userStatus}</b>
<b>${resultText} (${winCoefficient}x)</b>
<b>${winAmount.toLocaleString('de-DE')} ${winCoefficient > 0 ? gameWinStickers() : gameLoseStickers()}.</b>
                `;

        await bot.sendMessage(chatId, resultMessage, { reply_to_message_id: messageId, parse_mode: 'HTML', ...againGameOptions });

        // Обновление данных пользователя
        const ratesUpdate = { $inc: { "rates.0.all": 1 } };
        if (winCoefficient > 0) {
            ratesUpdate.$inc["rates.0.wins"] = 1;
        } else {
            ratesUpdate.$inc["rates.0.loses"] = 1;
        }

        collection.updateOne({ id: userId }, { $set: { balance: newBalance }, ...ratesUpdate });

    } else {
        await bot.sendMessage(chatId, '<b>У вас нехватает средств</b>', { reply_to_message_id: messageId, parse_mode: 'HTML' });
    }
}


module.exports = {
    kazino,
};
