const { mongoConnect } = require("../../mongoConnect");
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

async function gameRice(msg, bot, collection, valueIndex) {
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id
    const text = msg.text

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userCar = user.properties[0].cars
    const userCarSt = user.properties[0].carStatus
    const userCarGas = user.properties[0].carGasoline
    const balance = user.balance

    const parts = text.split(' ')
    const summ = parseInt(parseNumber(parts[valueIndex]))

    const riceKb = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🕹Сыграть заново', switch_inline_query_current_chat: 'гонка 1е3' }]
            ]
        }
    }

    if (userCar === '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас нету машины чтобы играть гонку
<code>купить машину 1</code> - покупка машины 
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (isNaN(summ) || summ <= 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, ставка введена не правильно
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            ...riceKb,
        })
        return;
    }

    if (summ > balance) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не хватает средств для данной ставки
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            ...riceKb,
        })
        return;
    }

    if (userCarGas <= 10) {
        const carGasKb = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🛢Пойти в заправку', switch_inline_query_current_chat: 'автомобиль заправить' }]
                ]
            }
        }
        bot.sendMessage(chatId, `
${userDonateStatus}, у вашей машины почти не осталось бензина 🛢
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            ...carGasKb,
        })
        return;
    }

    if (userCarSt <= 10) {
        const carStKb = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🛠Пойти в мастерскую', switch_inline_query_current_chat: 'автомобиль мастерская' }]
                ]
            }
        }
        bot.sendMessage(chatId, `
${userDonateStatus}, ваша машина почти сломана нужно пойти в мастерскую 🛠
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            ...carStKb,
        })
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

    let resultText = `<i>Жаль</i> <b>Вы проиграли 0x</b> ${gameLoseStickers()}\n<b>-${summ}</b>`;
    let winValue = 0;

    if (randomNum < 35) {
        winValue = Math.floor(summ * 2);
        resultText = `<i>Поздравляем</i> <b>Вы выиграли 2x ${gameWinStickers()}</b>\n<b>+${winValue}</b>`;
    }
    
    await collection.updateOne({ id: userId1 }, { $inc: { balance: -summ } })

    bot.sendMessage(chatId, `
${userDonateStatus}, вы сыграли гонку 🏎

${resultText}
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
        ...riceKb,
    })
    await collection.updateOne({ id: userId1 }, { $inc: { balance: winValue, "properties.0.carStatus": -10, "properties.0.carGasoline": -10 } })

    setTimeout(() => {
        isGameInProgress = true;
    }, 2000); // Задержка в 2000 миллисекунд (2 секунды)
}

async function gameRiceNeed(msg, bot, collection, valueIndex) {
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userCar = user.properties[0].cars
    const userCarSt = user.properties[0].carStatus
    const userCarGas = user.properties[0].carGasoline
    const balance = user.balance

    const parts = text.split(' ')
    let carSetting = parts[valueIndex]

    const datamap = {
        'мастерская': { item: 'carStatus', need: userCarSt, cost: 3, txt: 'пошли в мастерскую и починили вашу машину 🛠', img: 'https://amastercar.ru/img/auto_service_new.jpg' },
        'заправить': { item: 'carGasoline', need: userCarGas, cost: 2, txt: 'заправили вашу машину 🛢', img: 'https://auto.24tv.ua/resources/photos/news/202006/21771a2f138da-a6a9-40a0-b446-f6830be35db7.jpg?1592310798000&fit=cover&w=720&h=405&q=65' },
    }

    const carSettingKb = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🛠Пойти в мастерскую', switch_inline_query_current_chat: 'автомобиль мастерская' }, { text: '🛢Пойти в заправку', switch_inline_query_current_chat: 'автомобиль заправить' }]
            ]
        }
    }
    if (!carSetting || !(carSetting in datamap)) {
        bot.sendMessage(chatId, `
${userDonateStatus}, не правильно введена команда
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            ...carSettingKb,
        })
        return;
    }

    carSetting = parts[valueIndex].toLowerCase()

    if (carSetting in datamap) {
        if (userCar === '') {
            bot.sendMessage(chatId, `
${userDonateStatus}, у вас нету машины чтобы приобрести напишите
<code>купить машину 1</code> и номер машины из списка машин
            `, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            })
            return;
        }

        const { item, need, cost, txt, img } = datamap[carSetting]
        const riceKb = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🕹Сыграть гонку', switch_inline_query_current_chat: 'гонка 1е3' }]
                ]
            }
        }

        if (need > 10) {
            bot.sendMessage(chatId, `
${userDonateStatus}, у вас еше возможность сыграть несколько гонок 🏎
<i>Поиграем ?!</i>
            `, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
                ...riceKb,
            })
            return;
        }

        const findNeed = Math.floor(100 - need)
        const valueCost = Math.floor(cost * findNeed)

        if (valueCost > balance) {
            bot.sendMessage(chatId, `
${userDonateStatus}, вам необходимо ${valueCost.toLocaleString('de-DE')} нужно в баланс
            `, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            })
            return;
        }

        bot.sendPhoto(chatId, img, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            caption: `
${userDonateStatus}, вы успешно ${txt}
<i>За »</i> <b>${valueCost.toLocaleString('de-DE')} ${formatNumberInScientificNotation(valueCost)}</b>
            `
        })
        const updateObj = {}
        updateObj[`properties.0.${item}`] = findNeed

        await collection.updateOne({ id: userId1 }, { $inc: { balance: -valueCost } })
        await collection.updateOne({ id: userId1 }, { $inc: updateObj })
    }
}

module.exports = {
    kazino,
    gameSpin,
    gameBouling,
    gameFootball,
    gameRice,
    gameRiceNeed,
};