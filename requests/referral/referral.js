const { customChalk } = require("../../customChalk");
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
    const userId = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    // Генерация уникального кода для реферальной ссылки (можно использовать хэш от userId)
    const referralCode = `ref_${userId}`;

    // Сохранение реферального кода в базе данных
    await collection.updateOne({ id: userId }, { $set: { "referral.0.code": referralCode } });
    const user = await collection.findOne({ id: userId })
    const refAmount = user.referral[0].amount

    // Отправка пользователю ссылки для приглашения
    const referralLink = `https://t.me/levouJS_bot?start=${referralCode}`;
    bot.sendMessage(chatId, `
<b>Приглашая пользователей через реферальной ссылкой вы получаете за каждого регистрированного
пользователя по 1.000 $</b>

<u><b>Ваши рефералы:</b> <i>${refAmount}</i></u>

<b>Вот ваша ссылка для приглашения новых пользователей:</b> <i>${referralLink}</i>
    `, { parse_mode: "HTML", reply_to_message_id: messageId, disable_web_page_preview: true });
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
            return;

            //             await bot.sendMessage(chatId, `
            // Привет, <a href='tg://user?id=${userId}'>Игрок</a> \n
            // <b>Ты уже добавлен в базу</b>
            // <i>Дата ${register_time}</i>
            //             `, { parse_mode: 'HTML', ...startOptions, reply_to_message_id: msg.message_id })
        }
        else {
            // ЕСЛИ ВСЁ ТАКИ ХОЧЕШЬ ОТПРАВИТЬ СТИКЕР
            await collection.updateOne({ id: referringUser.id }, { $inc: { balance: 1000 } }); // Пример: выдача 1000 денег рефереру
            await collection.updateOne({ id: referringUser.id }, { $inc: { "referral.0.amount": 1 } })
            // console.log(referralCode);

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
                balance: 10000,
                uc: 0,
                registerTime: registerUserTime,
                altcoinidx: 0,
                checkPayment: 'not',
                lastBonusTime: 0,
                toBeAnAdmin: true,
                status: [{
                    statusName: 'player',
                    purchaseDate: 0,
                    statusExpireDate: 0,
                }],
                limit: [{
                    giveMoneyLimit: 5000000,
                    givedMoney: 0,
                    updateDayLimit: 0,
                    // promoMoneyLimit: 1000,
                    // promoMoney: 0,
                }],
                business: [{
                    bHave: false,
                    bName: "",
                    bWorkers: 0,
                    bMaxWorkers: 0,
                    bProfit: 0,
                    bWorkersProfit: 0,
                    bTax: 0,
                    lastUpdTime: 0,
                }],
                avatar: [{
                    waiting: '',
                    avaUrl: '',
                }],
                properties: [{
                    houses: '',
                    cars: '',
                }],
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
                ban: [{
                    ban: false,
                    cause: "",
                    banTime: 0,
                    unbanTime: 0,
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

            try {
                await bot.sendMessage(referringUser.id, `
<b>С вашей реферальной ссылке был зарегистрирован пользоватаель</b>
<b>Вам добавлены деньги в баланс !</b>
                `, { parse_mode: 'HTML' })
            } catch (err) {
                if (err.response && err.response.statusCode === 403) {
                    console.log(customChalk.colorize(`Пользователь ${referringUser.id} заблокировал бота`, { style: 'italic', background: 'bgRed' }));
                } else if (err.response && err.response.statusCode === 400) {
                    console.log(customChalk.colorize(`Пользователя ${referringUser.id} нет чата с ботом`, { style: 'italic', background: 'bgYellow' }))
                } else {
                    console.log(customChalk.colorize(`Ошибка при отправки сообщение рефа к рефферу: ${err.message}`, { style: 'italic', background: 'bgRed' }));
                }
            }
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