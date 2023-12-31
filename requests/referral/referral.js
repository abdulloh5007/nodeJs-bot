const { customChalk } = require("../../customChalk");
const { addingToDB } = require("../../mongoConnect");
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
    const referralLink = `https://t.me/tesLevouJs_bot?start=${referralCode}`;
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
<i>😉Хай! <a href='tg://user?id=${userId}'>Игрок</a></i>

<b>Я 🙈Игровой бот много функциональный🚀, тут различные игры есть🎯. Тут весело играть покорай топы🏆</b>

<b>🎁Тебе выдан подарок в размере 5000$ 😝</b>
<b>💳+Плюс вам в подарок была выдана пластик карта «MasterCard»🏦</b>
<b>😊Так же ты можешь добавить меня в беседу для игры с друзьями🎎.⚡️</b>

<i>😄Рекомендую нажать на помощь или написать: «Помощь»📺•</i>
<i>😎И не забудь☆написать: инфо карта, чтобы узнать информацию о карте, приятной игры! 🙃</i>
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

            await addingToDB(collection, userId)

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