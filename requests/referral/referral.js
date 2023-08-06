const { startOptions } = require("../../options");

const date = new Date()
const year = date.getFullYear()
const month = date.getMonth()
const day = date.getDate()
const hours = date.getHours()
const minutes = date.getMinutes()
const registerUserTime = `${day}-${month}-${year} ${hours}:${minutes}`

function generateRandomElementsOnlyUsers(letters, numbers) {
    const alphabet = letters;
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];

    let randomNumberString = '';
    for (let i = 0; i < numbers; i++) {
        randomNumberString += Math.floor(Math.random() * 10);
    }

    return randomLetter + randomNumberString;
}

// Пример использования функции
const onlyUsersId = generateRandomElementsOnlyUsers('BFNPRS', 7);

async function referral(msg, bot, collection) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    if (['ref', '!ref', 'реф', '!реф'].includes(text.toLowerCase())) {

        // Генерация уникального кода для реферальной ссылки (можно использовать хэш от userId)
        const referralCode = `ref_${userId}`;

        // Сохранение реферального кода в базе данных
        await collection.updateOne({ id: userId }, { $set: { "referral.0.code": referralCode } });
        const user = await collection.findOne({ id: userId })
        const refAmount = user.referral[0].amount

        // Отправка пользователю ссылки для приглашения
        const referralLink = `https://t.me/levouJS_bot?start=${referralCode}`;
        bot.sendMessage(chatId, `
Вот ваша ссылка для приглашения новых пользователей: ${referralLink}
Приглашая пользователей через реферальной ссылкой вы получаете за каждого регистрированного
пользователя по 1.000 $

<b>Ваши рефералы:</b> ${refAmount}
        `, { parse_mode: "HTML", reply_to_message_id: messageId });
    }
}

async function startWithRef(msg, bot, collection) {
    const userId = msg.from.id
    const text = msg.text
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const referralCode = text.split(' ')[1];

    // Проверка, что реферальный код верен
    const referringUser = await collection.findOne({ "referral.0.code": referralCode });
    if (!referringUser) {
        bot.sendMessage(chatId, 'Неверный реферальный код.');
        return;
    }
    else {
        const user = await collection.findOne({ id: userId })

        if (user) {
            const user = await collection.findOne({ id: userId })
            const register_time = user.registerTime

            await bot.sendMessage(chatId, `
Привет, <a href='tg://user?id=${userId}'>Игрок</a> \n
<b>Ты уже добавлен в базу</b>
<i>Дата ${register_time}</i>
            `, { parse_mode: 'HTML', ...startOptions, reply_to_message_id: msg.message_id })
        }
        else {
            // ЕСЛИ ВСЁ ТАКИ ХОЧЕШЬ ОТПРАВИТЬ СТИКЕР
            await collection.updateOne({ id: referringUser.id }, { $inc: { balance: 10000 } }); // Пример: выдача 10000 денег рефереру
            await collection.updateOne({ id: referringUser.id }, { $inc: { "referral.0.amount": 1 } })

            await bot.sendSticker(chatId, 'CAACAgIAAxkBAAEJuehkthTWSWEaOSTzdOjdX5T1rpuFEgACSQADQbVWDGATQ6Y8j8OALwQ')
                .then(() => {
                    bot.sendMessage(chatId, `
Вы успешно были зарегистрированы через реферальную ссылку

Привет, <a href='tg://user?id=${userId}'>Игрок</a> \n
Я-игровой бот для игры в различные игры.\n
Тебе выдан подарок 🎁 в размере 10.000€.\n
Так же ты можешь добавить меня в беседу для игры с друзьями.\n
Рекомендую скорее нажать на помощь "Помощь" |

+Вам в подарок было выдано пластик карта MasterCard
Напишите <code>карта инфо</code> чтобы узнать информацию о карте
            `, { parse_mode: 'HTML', ...startOptions, reply_to_message_id: msg.message_id })
                })
            const prefix = "5444";
            let cardNumber = prefix;
            for (let i = 0; i < 12; i++) {
                if (i % 4 === 0) {
                    cardNumber += " ";
                }
                cardNumber += Math.floor(Math.random() * 10).toString();
            }

            collection.insertOne({
                id: userId,
                gameId: onlyUsersId,
                userName: 'Игрок',
                balance: 1000,
                registerTime: registerUserTime,
                altcoinidx: 0,
                checkPayment: 'not',
                referral: [{
                    code: '',
                    amount: 0,
                }],
                crypto: [{
                    altcoinidx: 0
                }],
                rates: [{
                    wins: 0,
                    loses: 0,
                    all: 0
                }],
                userViolationsMute: [{
                    mute: false,
                    muteTime: "",
                    cause: "",
                }],
                bankCard: [{
                    cardHave: true,
                    cardNumber: cardNumber,
                    cardName: "mastercard",
                    cardOwner: 'Игрок',
                    cardValue: 0,
                    cardPassword: 0,
                    cardOwnerId: userId
                }]
            })

        }

    }

    // Проверка, что пользователь еще не зарегистрирован
    const user = await collection.findOne({ id: userId });
    if (user) {
        const register_time = user.registerTime
        await bot.sendMessage(chatId, `
Привет, <a href='tg://user?id=${userId}'>Игрок</a> \n
<b>Ты уже добавлен в базу</b>
<i>Дата ${register_time}</i>
        `, { parse_mode: 'HTML', ...startOptions, reply_to_message_id: messageId })
        return;
    }
}

module.exports = {
    referral,
    startWithRef,
}