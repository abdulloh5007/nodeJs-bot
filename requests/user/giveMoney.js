require('dotenv').config();

const { mongoConnect } = require('../../mongoConnect');
const { adminDonatedUsers, donatedUsers } = require("../donate/donatedUsers");
const { parseNumber, formatNumberInScientificNotation } = require("../systems/systemRu");

let giveCooldown = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

async function giveMoney(msg, bot) {
    const collection = await mongoConnect('users')

    const chatId = msg.chat.id;
    const text = msg.text;
    const currentTime = Date.now();

    const parts = text.split(' ');

    if (parts.length === 2 && msg.reply_to_message && msg.reply_to_message.from) {
        const userToAccept = msg.reply_to_message.from.id;
        const userToGive = msg.from.id;
        const amount = parseInt(parseNumber(parts[1]));
        const userDonateStatus = await donatedUsers(msg, collection)
        const adminDonateStatus = await adminDonatedUsers(userToAccept, collection)

        if (userToAccept === userToGive) {
            bot.sendMessage(chatId, 'Вы не можете дать деньги самому себе.');
            return;
        }

        const userGive = await collection.findOne({ id: userToGive });
        const userAccept = await collection.findOne({ id: userToAccept })
        const userToGiveBalance = userGive.balance;
        const userGivedMoney = userGive.limit[0].givedMoney;
        const userGiveMoneyLimit = userGive.limit[0].giveMoneyLimit;
        const beSuccessful = userGivedMoney + amount

        const lastLimitTime = userGive.limit[0].updateDayLimit || 0;

        if (beSuccessful <= userGiveMoneyLimit) {
            if (userToGiveBalance >= amount) {
                if (amount >= 1) {
                    if (!!userAccept) {
                        const successful = userToGiveBalance - amount;

                        bot.sendMessage(chatId, `
${userDonateStatus} дал пользователю ${adminDonateStatus}
<b>Сумму:</b> ${amount.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(amount)}`, { parse_mode: 'HTML' });
                        collection.updateOne({ id: userToGive }, { $set: { balance: successful } });
                        collection.updateOne({ id: userToGive }, { $inc: { "limit.0.givedMoney": amount } })
                        collection.updateOne({ id: userToAccept }, { $inc: { balance: amount } });
                    }
                    else {
                        bot.sendMessage(chatId, `
Этот пользователь еще не зарегистрирован
                            `)
                    }
                }
                else {
                    bot.sendMessage(chatId, `
${userDonateStatus}, вы не можете дать отрицательное или 0 количество сумму денег 
                        `, { parse_mode: 'HTML' });
                }
            } else {
                bot.sendMessage(chatId, 'Ошибка: не хватает средств');
            }
        }
        else {
            const userCanGive = userGiveMoneyLimit - userGivedMoney
            const remainingTime = formatRemainingTime(giveCooldown - (currentTime - lastLimitTime));
            bot.sendMessage(chatId, `
${userDonateStatus}, сумма передачи денег превышает ваш лимит
${userCanGive !== 0 ? `
<b>Вы можете дать:</b> ${userCanGive.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(userCanGive)}
` :
                    `
<b>Вы уже исчерпали дневной лимит ожидайте:</b> ${remainingTime}
`}
                `, { parse_mode: 'HTML' })
        }
    } else {
        bot.sendMessage(chatId, 'Ошибка: ответьте на сообщение кому бы вы хотели дать денег');
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
    giveMoney,
}
