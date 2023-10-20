const { mongoConnect } = require("../../mongoConnect");
const { againGameOptions } = require("../../options");
const { donatedUsers, adminDonatedUsers } = require("../donate/donatedUsers");
const { parseNumber, formatNumberInScientificNotation } = require("../systems/systemRu");
const { gameWinStickers, gameLoseStickers } = require("./gameStickers");


/**
 * Asynchronous function that handles the logic for a casino game.
 * @param {Object} msg - Message object containing information about the chat, text, sender, and message ID.
 * @param {Object} collection - MongoDB collection object used to interact with the database.
 * @param {Object} bot - Telegram bot object used to send messages.
 * @param {number} valueIndex - Index indicating the position of the value in the text input.
 */
async function kazino(msg, collection, bot, valueIndex) {
    const collectionAchievs = await mongoConnect('achievs');

    const chatId = msg.chat.id;
    const text = msg.text;
    const userId = msg.from.id;
    const messageId = msg.message_id;
    let isGameInProgress = true

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

    if (randomNum < 10) {
        winCoefficient = 5;
        resultText = 'Вы выиграли 5x';
    } else if (randomNum < 30) {
        winCoefficient = 2;
        resultText = 'Вы выиграли 2x';
    } else if (randomNum < 50) {
        winCoefficient = 1;
        resultText = 'Вы выиграли 1x';
    } else {
        resultText = 'Вы проиграли 0x';
    }

    await collection.updateOne({ id: userId }, { $inc: { balance: -value } })

    const userStatus = await donatedUsers(msg, collection);
    const winAmount = value * winCoefficient;

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
    try {
        await collection.updateOne({ id: userId }, { ...ratesUpdate });
        await collection.updateOne({ id: userId }, { $inc: { balance: winAmount } })
    } catch (error) {
        console.log(error);
    }

    const achiev = await collectionAchievs.findOne({ id: userId })
    const kazino = achiev.kazino[0].kazino
    const maxKazino = achiev.kazino[0].maxKazino
    const kazinoCost = achiev.kazino[0].cost
    if (kazino < maxKazino + 1) {
        await collectionAchievs.updateOne({ id: userId }, { $inc: { "kazino.0.kazino": 1 } })
    }

    if (kazino === maxKazino - 1) {
        bot.sendMessage(chatId, `
${userDonateStatus}, поздравляем вы выполнили достижения сыграть казино ${maxKazino} раз ✅
<b>Вам выдано ${kazinoCost} UC</b>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        await collection.updateOne({ id: userId }, { $inc: { uc: kazinoCost } })
    }

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
    let isGameInProgress = true

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
    let isGameInProgress = true

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
    let isGameInProgress = true

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
    const collectionAchievs = await mongoConnect('achievs');
    const collectionCars = await mongoConnect('cars');
    let isGameInProgress;

    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id
    const text = msg.text

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userCar = user.properties[0].cars
    const userCarSt = user.properties[0].carStatus
    const userCarGas = user.properties[0].carGasoline
    const userStatus = user.status[0].statusName
    const balance = user.balance
    const car = await collectionCars.findOne({ name: user.properties[0].cars })

    const parts = text.split(' ')

    if (parts.length <= valueIndex) {
        return bot.sendMessage(chatId, `
${userDonateStatus}, не правильно введена команда
<i>Пример:</i> <code>бгонка 1е3</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }

    const summ = parseInt(parseNumber(parts[valueIndex]))

    const riceKb = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🕹Сыграть заново', switch_inline_query_current_chat: 'бгонка 1е3' }]
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

    function getRandomNumber(min, max) {
        // Генерируем случайное число в диапазоне от min (включительно) до max (включительно)
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    const carSpeed = car.speed
    const botSpeed = userStatus === 'halloween' ? 20 : 50
    const successTxtHelloween = userStatus === 'halloween' ? `${userDonateStatus} ваш статус помог ускорить вашу машину !` : ''
    isGameInProgress = false;

    let inGameUserCarSpeed = getRandomNumber(70, carSpeed)
    let inGameBotCarSpeed = getRandomNumber(70, carSpeed + botSpeed)

    let resultText = `<i>Жаль</i> <b>Вы проиграли 0x</b> ${gameLoseStickers()}\n<b>-${summ}</b>\n\n<i>Машина бота обогнала вашу машину достигая скорости:</i> <b>${inGameBotCarSpeed} км/ч</b>\n<i>Ваша машина достигла:</i> <b>${inGameUserCarSpeed} км/ч</b>`;
    let winValue = 0;

    if (inGameUserCarSpeed >= inGameBotCarSpeed) {
        winValue = Math.floor(summ * 2);
        resultText = `<i>Поздравляем</i> <b>Вы выиграли 2x ${gameWinStickers()}</b>\n<b>+${winValue}</b>\n\n<i>Скорость вашей машины достигла до:</i> ${inGameUserCarSpeed} км/ч\n${successTxtHelloween}`;
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

    const achiev = await collectionAchievs.findOne({ id: userId1 })
    const botRacing = achiev.race[0].botRacing
    const maxBotRacing = achiev.race[0].maxBotRacing
    const raceCost = achiev.race[0].cost

    if (botRacing < maxBotRacing + 1) {
        await collectionAchievs.updateOne({ id: userId1 }, { $inc: { "race.0.botRacing": 1 } })
    }

    if (botRacing === maxBotRacing - 1) {
        bot.sendMessage(chatId, `
${userDonateStatus}, поздравляем вы выполнили достижение сыграть гонку с ботом ${maxBotRacing} раз ✅
<b>Вам выдано ${raceCost} UC</b>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        collection.updateOne({ id: userId1 }, { $inc: { uc: raceCost } })
    }

    setTimeout(() => {
        isGameInProgress = true;
    }, 5000); // Задержка в 2000 миллисекунд (2 секунды)
}

async function gameRiceWithUser(msg, bot, collection, valueIndex) {
    const text = msg.text.split(' ')
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id
    const secondUser = msg.reply_to_message

    const userDonateStatus = await donatedUsers(msg, collection)
    const user1 = await collection.findOne({ id: userId1 })

    if (text.length <= valueIndex) {
        return bot.sendMessage(chatId, `
${userDonateStatus}, не правильно введена команда
<i>Пример:</i> <code>гонка 1е3</code> ответом на сообщение пользователя
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }

    const summ = parseInt(parseNumber(text[valueIndex]))
    if (isNaN(summ)) {
        return bot.sendMessage(chatId, `
${userDonateStatus}, сумма введена не правильно
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }

    if (secondUser === undefined) {
        return bot.sendMessage(chatId, `
${userDonateStatus}, ответьте сообщением на пользователя
который вы хотите играть гонку
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }

    if (secondUser.from.id === userId1) {
        return bot.sendMessage(chatId, `
${userDonateStatus}, <b>не возможно играть гонку самим !</b>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }

    let riceOptsWithBot = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Играть с ботом', switch_inline_query_current_chat: 'бгонка 1е3' }]
            ]
        }
    }

    if (secondUser.from.is_bot === true) {
        return bot.sendMessage(chatId, `
${userDonateStatus}, не возможно играть гонку с ботом
если хотите играть гонку с ботом то ниже есть кнопка
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            ...riceOptsWithBot,
        })
    }

    const user2 = await collection.findOne({ id: secondUser.from.id })

    if (!user2) {
        return bot.sendMessage(chatId, `
${userDonateStatus}, игрок не найден 
<b>Попросите игрока чтобы он зарегистрировался в боте</b>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }

    const user1CarName = user1.properties[0].cars
    const user2CarName = user2.properties[0].cars

    if (user1CarName === '') {
        return bot.sendMessage(chatId, `
${userDonateStatus}, у вас нету машины для игры гонка
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }
    if (user2CarName === '') {
        return bot.sendMessage(chatId, `
${userDonateStatus}, у игрока который вы хотите играть гонку нету машины
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }

    const user2Bal = user2.balance
    const user1Bal = user1.balance

    if (summ > user1Bal) {
        return bot.sendMessage(chatId, `
${userDonateStatus}, у вас нехватает средств
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }

    if (summ > user2Bal) {
        return bot.sendMessage(chatId, `
${userDonateStatus}, у игрока который вы хотите играть гонку не хватает средств
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }

    const gameRiceBtns = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '✅Принять', callback_data: `riceWithUserAcc_${userId1}_${secondUser.from.id}_${summ}` }],
                [{ text: '❌Отклонить', callback_data: `riceWithUserRej_${userId1}_${secondUser.from.id}_${summ}` }]
            ]
        }
    }
    bot.sendMessage(chatId, `
${userDonateStatus}, этот игрока хочет сыграть гонку с вами вы можете 
<b>Принять или Отказать</b> нажав на кнопку ниже
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: secondUser.message_id,
        ...gameRiceBtns,
    })
}

async function gameRiceWithUserBtns(msg, bot, collection) {
    const collectionCars = await mongoConnect('cars');

    const data = msg.data
    const userId1 = msg.from.id
    const chatId = msg.message.chat.id
    const messageId = msg.message.message_id
    const [txt, user1Sender2, user2Accepter2, summ2] = data.split('_')
    const user1Sender = parseInt(user1Sender2)
    const user2Accepter = parseInt(user2Accepter2)
    const summ = parseInt(summ2)

    const firstUserDonateStatus = await adminDonatedUsers(user1Sender, collection)
    const secondUserDonateStatus = await adminDonatedUsers(user2Accepter, collection)

    const user1 = await collection.findOne({ id: user1Sender })
    const user2 = await collection.findOne({ id: user2Accepter })
    if (txt === 'riceWithUserRej') {
        if (userId1 === user2Accepter || userId1 === user1Sender) {
            bot.editMessageText(`
<b>Гонка отменена пользователем</b> ${userId1 === user1Sender ? firstUserDonateStatus : secondUserDonateStatus}
                    `, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
            })

            if (userId1 === user2Accepter) {
                try {
                    await bot.sendMessage(user1Sender, `
${secondUserDonateStatus}, этот пользователь отменил гонку который вы хотели играть с ним
                            `, {
                        parse_mode: 'HTML',
                    })
                } catch (error) {
                    // error message
                    console.log('error in game with user ' + error);
                }
            }
            return;
        }
        bot.answerCallbackQuery(msg.id, { show_alert: true, text: 'Это кнопка не для тебя' })
        return;
    }

    if (!user1 || !user2) {
        return bot.editMessageText(`Игра не найдена или была закончена`, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML'
        })
    }
    const user1CarName = user1.properties[0].cars
    const user2CarName = user2.properties[0].cars
    const user1Bal = user1.balance
    const user2Bal = user2.balance

    const user1CarGasoilne = user1.properties[0].carGasoline
    const user1CarStatus = user1.properties[0].carStatus
    const user2CarGasoilne = user2.properties[0].carGasoline
    const user2CarStatus = user2.properties[0].carStatus

    const user1Car = await collectionCars.findOne({ name: user1CarName })
    const user2Car = await collectionCars.findOne({ name: user2CarName })

    if (txt === 'riceWithUserAcc') {
        if (userId1 !== user2Accepter) {
            bot.answerCallbackQuery(msg.id, { show_alert: true, text: 'Это кнопка не для тебя', })
            return;
        }

        if (summ > user1Bal) {
            bot.editMessageText(`
${firstUserDonateStatus}, у него либо закончились деньги либо дал кому то
            `, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
            })

            try {
                await bot.sendMessage(user1Sender, `
${firstUserDonateStatus}, у вас не хватало средств для игры гонки с пользователем ${secondUserDonateStatus} поэтому игра автоматический была закончена
                `, {
                    parse_mode: 'HTML',
                })
            } catch (error) {
                console.log('error in game rice with user send money ' + error);
            }
            return;
        }

        if (summ > user2Bal) {
            bot.answerCallbackQuery(msg.id, {
                parse_mode: 'HTML',
                show_alert: true,
                text: `
у вас не хватает средств для принятие гонки
                `
            })
            return;
        }

        if (user1CarGasoilne <= 10 || user1CarStatus <= 10) {
            bot.editMessageText(`
${firstUserDonateStatus}, у него не хватает бензина и у него машина сломана
            `, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
            })

            try {
                await bot.sendMessage(user1Sender, `
${firstUserDonateStatus}, у вас не хватало бензина и ваша машина была сломана для игры гонки с пользователем ${secondUserDonateStatus} поэтому игра автоматический была закончена
                `, {
                    parse_mode: 'HTML',
                })
            } catch (error) {
                console.log('error in game rice with user send money ' + error);
            }
            return;
        }

        if (user2CarGasoilne <= 10 || user2CarStatus <= 10) {
            bot.answerCallbackQuery(msg.id, {
                parse_mode: 'HTML',
                show_alert: true,
                text: `
у вас не хватает бензина и ваша машина сломана
Чтобы принять гонку почините машину и заправьте
                `
            })
            return;
        }

        function getRandomNumber(min, max) {
            // Генерируем случайное число в диапазоне от min (включительно) до max (включительно)
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
        const user1FindedCarName = user1Car.name
        const user2FindedCarName = user2Car.name
        const user1FindedCarSpeed = user1Car.speed
        const user2FindedCarSpeed = user2Car.speed

        const winnerPrice = Math.floor(summ * 2)
        const user1RandomedSpeed = getRandomNumber(70, user1FindedCarSpeed)
        const user2RandomedSpeed = getRandomNumber(70, user2FindedCarSpeed)
        async function findLargerNumber(number1, number2) {
            if (number1 > number2) {
                try {
                    await bot.sendMessage(user1Sender, `
${firstUserDonateStatus}, выигрыш есть можно поесть !
<b>Вы получили ${winnerPrice.toLocaleString('de-DE')} ${formatNumberInScientificNotation(winnerPrice)} $</b>

<b>Вы выиграли в гонке с игроком ${secondUserDonateStatus}</b>
                    `, {
                        parse_mode: 'HTML',
                    })

                    await bot.sendMessage(user2Accepter, `
${secondUserDonateStatus}, не расстраиваемся повезёт следующий раз
<b>С вас отняли ${summ.toLocaleString('de-DE')} ${formatNumberInScientificNotation(summ)} $</b>

<b>Вы проиграли в гонке с игроком ${firstUserDonateStatus}</b>
                    `, {
                        parse_mode: 'HTML',
                    })

                    await collection.updateOne({ id: user1Sender }, { $inc: { balance: summ } })
                    await collection.updateOne({ id: user2Accepter }, { $inc: { balance: -summ } })
                } catch (error) {
                    console.log('error winner winner chicken dinner firstUser' + error);
                }
                return `${firstUserDonateStatus}`;
            } else {
                try {
                    await bot.sendMessage(user2Accepter, `
${secondUserDonateStatus}, выигрыш есть можно поесть !
<b>Вы получили ${winnerPrice.toLocaleString('de-DE')} ${formatNumberInScientificNotation(winnerPrice)} $</b>

<b>Вы выиграли в гонке с игроком ${firstUserDonateStatus}</b>
                    `, {
                        parse_mode: 'HTML',
                    })

                    await bot.sendMessage(user1Sender, `
${firstUserDonateStatus}, не расстраиваемся повезёт следующий раз
<b>С вас отняли ${summ.toLocaleString('de-DE')} ${formatNumberInScientificNotation(summ)} $</b>

<b>Вы проиграли в гонке с игроком ${secondUserDonateStatus}</b>
                    `, {
                        parse_mode: 'HTML',
                    })

                    await collection.updateOne({ id: user2Accepter }, { $inc: { balance: summ } })
                    await collection.updateOne({ id: user1Sender }, { $inc: { balance: -summ } })
                } catch (error) {
                    console.log('error winner winner chicken dinner seondUser' + error);
                }
                return `${secondUserDonateStatus}`;
            }
        }
        await collection.updateOne({ id: user2Accepter }, { $inc: { "properties.0.carStatus": -10, "properties.0.carGasoline": -10 } })
        await collection.updateOne({ id: user1Sender }, { $inc: { "properties.0.carStatus": -10, "properties.0.carGasoline": -10 } })
        const riceWinner = await findLargerNumber(user1RandomedSpeed, user2RandomedSpeed)

        bot.editMessageText(`
<b>Игра гонка успешно проведена между игроками</b>
${firstUserDonateStatus} и ${secondUserDonateStatus}

<i>У ${firstUserDonateStatus} машина достигла скорость:</i> <b>${user1RandomedSpeed} км/ч</b>
<i>A у ${secondUserDonateStatus} машина достигла скорость:</i> <b>${user2RandomedSpeed} км/ч</b>

<i>Победитель:</i> ${riceWinner}
        `, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
        })
        return;
    }
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
        'мастерская': { item: 'carStatus', need: userCarSt, cost: 30, txt: 'пошли в мастерскую и починили вашу машину 🛠', img: 'https://amastercar.ru/img/auto_service_new.jpg' },
        'заправить': { item: 'carGasoline', need: userCarGas, cost: 20, txt: 'заправили вашу машину 🛢', img: 'https://auto.24tv.ua/resources/photos/news/202006/21771a2f138da-a6a9-40a0-b446-f6830be35db7.jpg?1592310798000&fit=cover&w=720&h=405&q=65' },
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
                    [{ text: '🕹Сыграть гонку', switch_inline_query_current_chat: 'бгонка 1е3' }]
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
<i>За »</i> <b>${valueCost.toLocaleString('de-DE')} $ ${formatNumberInScientificNotation(valueCost)}</b>
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
    gameRiceWithUser,
    gameRiceWithUserBtns,
};