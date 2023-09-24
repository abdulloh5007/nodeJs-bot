const { againGameOptions } = require("../../options");
const { donatedUsers } = require("../donate/donatedUsers");
const { parseNumber, formatNumberInScientificNotation } = require("../systems/systemRu");
const { gameWinStickers, gameLoseStickers } = require("./gameStickers");

let isGameInProgress = true; // Флаг для отслеживания текущей игры

/**
 * Asynchronous function that handles the logic for a casino game.
 * @param {Object} msg - Message object containing information about the chat, text, sender, and message ID.
 * @param {Object} collection - MongoDB collection object used to interact with the database.
 * @param {Object} bot - Telegram bot object used to send messages.
 * @param {number} valueIndex - Index indicating the position of the value in the text input.
 */
async function kazino(msg, collection, bot, valueIndex) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const messageId = msg.message_id;

    const userDonateStatus = await donatedUsers(msg, collection);
    const user = await collection.findOne({ id: userId });
    const parts = text.split(' ');

    if (parts.length <= valueIndex) {
        const errorMessage = `
${userDonateStatus}, Не правильно введена команда 
Пример: <code>казино 10</code>
    `;
        const options = { reply_to_message_id: messageId, parse_mode: 'HTML' };
        bot.sendMessage(chatId, errorMessage, options);
        return;
    }

    const balance = user.balance;
    const value = parseInt(parseNumber(parts[valueIndex].toLowerCase()));

    if (value <= 0 || isNaN(value)) {
        bot.sendMessage(chatId, `
${userDonateStatus}, ставка введена не правильно
    `, { reply_to_message_id: messageId, parse_mode: 'HTML' });
        return;
    }

    if (balance < value) {
        await bot.sendMessage(chatId, '<b>У вас нехватает средств</b>', { reply_to_message_id: messageId, parse_mode: 'HTML' });
        return;
    }

    if (isGameInProgress === false) {
        bot.sendMessage(chatId, `
${userDonateStatus}, Подождите 2 секунды перед началом следующей игры.`, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        });
        return;
    }

    isGameInProgress = false;
    const randomNum = Math.floor(Math.random() * 100);

    let winCoefficient = 0;
    let resultText = '';

    if (randomNum < 7) {
        winCoefficient = 5;
        resultText = 'Вы выиграли 5x';
    } else if (randomNum < 15) {
        winCoefficient = 3;
        resultText = 'Вы выиграли 3x';
    } else if (randomNum < 20) {
        winCoefficient = 2;
        resultText = 'Вы выиграли 2x';
    } else if (randomNum < 40) {
        winCoefficient = 1;
        resultText = 'Вы выиграли 1x';
    } else {
        resultText = 'Вы проиграли 0x';
    }

    const userStatus = await donatedUsers(msg, collection);
    const winAmount = value * winCoefficient;
    const newBalance = resultText.includes('выиграли') ? balance + winAmount : balance - value;

    const resultMessage = `
<b>${userStatus}</b>
<b>${resultText}</b>
<b>${winCoefficient >= 1 ? winAmount.toLocaleString('de-DE') : `-${value.toLocaleString('de-DE')}`} ${winCoefficient > 0 ? gameWinStickers() : gameLoseStickers()}.</b>
  `;

    await bot.sendMessage(chatId, resultMessage, { reply_to_message_id: messageId, parse_mode: 'HTML', ...againGameOptions });

    const ratesUpdate = { $inc: { "rates.0.all": 1 } };

    if (winCoefficient > 0) {
        ratesUpdate.$inc["rates.0.wins"] = 1;
    } else {
        ratesUpdate.$inc["rates.0.loses"] = 1;
    }

    collection.updateOne({ id: userId }, { $set: { balance: parseInt(newBalance) }, ...ratesUpdate });
    setTimeout(() => {
        isGameInProgress = true;
    }, 2000); // Задержка в 2000 миллисекунд (2 секунды)
}

/**
 * Handles the spinning of a game.
 * @param {object} msg - The message object containing information about the chat, text, user, and message ID.
 * @param {object} bot - The bot object with methods for sending messages and dice.
 * @param {object} collection - The collection object for accessing the database.
 * @param {number} valueIndex - The index of the value in the command text.
 */
async function gameSpin(msg, bot, collection, valueIndex) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const messageId = msg.message_id;

    const userDonateStatus = await donatedUsers(msg, collection);
    const user = await collection.findOne({ id: userId });
    const parts = text.split(' ');

    if (parts.length <= valueIndex) {
        const errorMessage = `
${userDonateStatus}, Не правильно введена команда 
Пример: <code>спин 10</code>
    `;
        bot.sendMessage(chatId, errorMessage, { reply_to_message_id: messageId, parse_mode: 'HTML' });
        return;
    }

    const balance = user.balance;
    const value = parseInt(parseNumber(parts[valueIndex].toLowerCase()));

    if (value <= 0 || isNaN(value)) {
        bot.sendMessage(chatId, `
${userDonateStatus}, ставка введена не правильно
    `, { reply_to_message_id: messageId, parse_mode: 'HTML' });
        return;
    }

    if (balance < value) {
        const errorMessage = '<b>У вас нехватает средств</b>';
        bot.sendMessage(chatId, errorMessage, { reply_to_message_id: messageId, parse_mode: 'HTML' });
        return;
    }

    if (isGameInProgress === false) {
        bot.sendMessage(chatId, `
${userDonateStatus}, Подождите 2 секунды перед началом следующей игры.`, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        });
        return;
    }

    isGameInProgress = false;
    const randomNum = Math.floor(Math.random() * 100);

    let winCoefficient = 0;
    let resultText = '';

    if (randomNum < 30) {
        winCoefficient = 2;
        resultText = 'Вы выиграли 2x';
    } else {
        resultText = 'Вы проиграли 0x';
    }

    const userStatus = await donatedUsers(msg, collection);
    const winAmount = value * winCoefficient;
    const newBalance = resultText.includes('выиграли') ? balance + winAmount : balance - value;
    const againGameOptions = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Играть еще раз', switch_inline_query_current_chat: 'спин ' }]
            ]
        }
    }

    const resultMessage = `
<b>${userStatus}</b>
<b>${resultText}</b>
<b>${winCoefficient === 2 ? winAmount.toLocaleString('de-DE') : `-${value.toLocaleString('de-DE')}`} ${winCoefficient > 0 ? gameWinStickers() : gameLoseStickers()}.</b>
  `;

    const opt = { emoji: '🎰', value: randomNum };

    bot.sendDice(chatId, opt).then(async () => {
        await bot.sendMessage(chatId, resultMessage, { reply_to_message_id: messageId, parse_mode: 'HTML', ...againGameOptions });
    });

    const ratesUpdate = { $inc: { "rates.0.all": 1 } };

    if (winCoefficient > 0) {
        ratesUpdate.$inc["rates.0.wins"] = 1;
    } else {
        ratesUpdate.$inc["rates.0.loses"] = 1;
    }

    collection.updateOne({ id: userId }, { $set: { balance: newBalance }, ...ratesUpdate });
    setTimeout(() => {
        isGameInProgress = true;
    }, 2000); // Задержка в 2000 миллисекунд (2 секунды)
}

/**
 * Handles the spinning of a game.
 * @param {object} msg - The message object containing information about the chat, text, user, and message ID.
 * @param {object} bot - The bot object with methods for sending messages and dice.
 * @param {object} collection - The collection object for accessing the database.
 * @param {number} valueIndex - The index of the value in the command text.
 */
async function gameBouling(msg, bot, collection, valueIndex) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const messageId = msg.message_id;

    const userDonateStatus = await donatedUsers(msg, collection);
    const user = await collection.findOne({ id: userId });
    const parts = text.split(' ');

    if (parts.length <= valueIndex) {
        const errorMessage = `
${userDonateStatus}, Не правильно введена команда 
Пример: <code>боул 10</code>
    `;
        bot.sendMessage(chatId, errorMessage, { reply_to_message_id: messageId, parse_mode: 'HTML' });
        return;
    }

    const balance = user.balance;
    const value = parseInt(parseNumber(parts[valueIndex].toLowerCase()));

    if (value <= 0 || isNaN(value)) {
        bot.sendMessage(chatId, `
${userDonateStatus}, ставка введена не правильно
    `, { reply_to_message_id: messageId, parse_mode: 'HTML' });
        return;
    }

    if (balance < value) {
        const errorMessage = '<b>У вас нехватает средств</b>';
        bot.sendMessage(chatId, errorMessage, { reply_to_message_id: messageId, parse_mode: 'HTML' });
        return;
    }

    if (isGameInProgress === false) {
        bot.sendMessage(chatId, `
${userDonateStatus}, Подождите 2 секунды перед началом следующей игры.`, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        });
        return;
    }

    isGameInProgress = false;
    const randomNum = Math.floor(Math.random() * 100);

    let winCoefficient = 0;
    let resultText = '';

    if (randomNum < 30) {
        winCoefficient = 2;
        resultText = 'Вы выиграли 2x';
    } else {
        resultText = 'Вы проиграли 0x';
    }

    const userStatus = await donatedUsers(msg, collection);
    const winAmount = value * winCoefficient;
    const newBalance = resultText.includes('выиграли') ? balance + winAmount : balance - value;
    const againGameOptions = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Играть еще раз', switch_inline_query_current_chat: 'боул ' }]
            ]
        }
    }

    const resultMessage = `
<b>${userStatus}</b>
<b>${resultText}</b>
<b>${winCoefficient === 2 ? winAmount.toLocaleString('de-DE') : `-${value.toLocaleString('de-DE')}`} ${winCoefficient > 0 ? gameWinStickers() : gameLoseStickers()}.</b>
  `;

    const opt = { emoji: '🎳', value: randomNum };

    bot.sendDice(chatId, opt).then(async () => {
        await bot.sendMessage(chatId, resultMessage, { reply_to_message_id: messageId, parse_mode: 'HTML', ...againGameOptions });
    });

    const ratesUpdate = { $inc: { "rates.0.all": 1 } };

    if (winCoefficient > 0) {
        ratesUpdate.$inc["rates.0.wins"] = 1;
    } else {
        ratesUpdate.$inc["rates.0.loses"] = 1;
    }

    collection.updateOne({ id: userId }, { $set: { balance: newBalance }, ...ratesUpdate });
    setTimeout(() => {
        isGameInProgress = true;
    }, 2000); // Задержка в 2000 миллисекунд (2 секунды)
}

/**
 * Handles the spinning of a game.
 * @param {object} msg - The message object containing information about the chat, text, user, and message ID.
 * @param {object} bot - The bot object with methods for sending messages and dice.
 * @param {object} collection - The collection object for accessing the database.
 * @param {number} valueIndex - The index of the value in the command text.
 */
async function gameFootball(msg, bot, collection, valueIndex) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const messageId = msg.message_id;

    const userDonateStatus = await donatedUsers(msg, collection);
    const user = await collection.findOne({ id: userId });
    const parts = text.split(' ');

    if (parts.length <= valueIndex) {
        const errorMessage = `
${userDonateStatus}, Не правильно введена команда 
Пример: <code>футбол 10</code>
    `;
        bot.sendMessage(chatId, errorMessage, { reply_to_message_id: messageId, parse_mode: 'HTML' });
        return;
    }

    const balance = user.balance;
    const value = parseInt(parseNumber(parts[valueIndex].toLowerCase()));

    if (value <= 0 || isNaN(value)) {
        bot.sendMessage(chatId, `
${userDonateStatus}, ставка введена не правильно
    `, { reply_to_message_id: messageId, parse_mode: 'HTML' });
        return;
    }

    if (balance < value) {
        const errorMessage = '<b>У вас нехватает средств</b>';
        bot.sendMessage(chatId, errorMessage, { reply_to_message_id: messageId, parse_mode: 'HTML' });
        return;
    }

    if (isGameInProgress === false) {
        bot.sendMessage(chatId, `
${userDonateStatus}, Подождите 2 секунды перед началом следующей игры.`, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        });
        return;
    }

    isGameInProgress = false;
    const randomNum = Math.floor(Math.random() * 20);

    let winCoefficient = 0;
    let resultText = '';
    let winValue;

    if (randomNum < 5) {
        winCoefficient = 2;
        resultText = 'Вы выиграли 2x';
        winValue = 5;
    } else {
        resultText = 'Вы проиграли 0x';
        winValue = 4;
    }

    const userStatus = await donatedUsers(msg, collection);
    const winAmount = value * winCoefficient;
    const newBalance = resultText.includes('выиграли') ? balance + winAmount : balance - value;
    const againGameOptions = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Играть еще раз', switch_inline_query_current_chat: 'футбол ' }]
            ]
        }
    }

    const resultMessage = `
<b>${userStatus}</b>
<b>${resultText}</b>
<b>${winCoefficient === 2 ? winAmount.toLocaleString('de-DE') : `-${value.toLocaleString('de-DE')}`} ${winCoefficient > 0 ? gameWinStickers() : gameLoseStickers()}.</b>
  `;

    const opt = { emoji: '⚽️', value: winValue };

    bot.sendDice(chatId, opt).then(async () => {
        await bot.sendMessage(chatId, resultMessage, { reply_to_message_id: messageId, parse_mode: 'HTML', ...againGameOptions });
    });

    const ratesUpdate = { $inc: { "rates.0.all": 1 } };

    if (winCoefficient > 0) {
        ratesUpdate.$inc["rates.0.wins"] = 1;
    } else {
        ratesUpdate.$inc["rates.0.loses"] = 1;
    }

    collection.updateOne({ id: userId }, { $set: { balance: newBalance }, ...ratesUpdate });
    setTimeout(() => {
        isGameInProgress = true;
    }, 2000); // Задержка в 2000 миллисекунд (2 секунды)
}


module.exports = {
    kazino,
    gameSpin,
    gameBouling,
    gameFootball,
};