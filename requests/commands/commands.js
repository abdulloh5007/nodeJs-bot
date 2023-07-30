const { startOptions, helpOption, backOption } = require("../../options")
require('dotenv').config();
const adminId = parseInt(process.env.ADMIN_ID)

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


async function commandStart(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const userName = msg.from.username
    const text = msg.text
    const user = await collection.findOne({ id: userId })

    if (user) {
        const user = await collection.findOne({ id: userId })
        const register_time = user.registerTime

        await bot.sendMessage(chatId, `
Привет, <a href='tg://user?id=${userId}'>${userName}</a> \n
<b>Ты уже добавлен в базу</b>
<i>Дата ${register_time}</i>
            `, { parse_mode: 'HTML', ...startOptions, reply_to_message_id: msg.message_id })
    }
    else {
        // ЕСЛИ ВСЁ ТАКИ ХОЧЕШЬ ОТПРАВИТЬ СТИКЕР
        await bot.sendSticker(chatId, 'CAACAgIAAxkBAAEJuehkthTWSWEaOSTzdOjdX5T1rpuFEgACSQADQbVWDGATQ6Y8j8OALwQ')
            .then(() => {
                bot.sendMessage(chatId, `
Привет, <a href='tg://user?id=${userId}'>${userName}</a> \n
Я-игровой бот для игры в различные игры.\n
Тебе выдан подарок 🎁 в размере 10.000€.\n
Так же ты можешь добавить меня в беседу для игры с друзьями.\n
Рекомендую скорее нажать на помощь "Помощь" |
        `, { parse_mode: 'HTML', ...startOptions, reply_to_message_id: msg.message_id })
            })
        collection.insertOne({
            id: userId,
            gameId: onlyUsersId,
            userName: userName,
            balance: 1000,
            registerTime: registerUserTime,
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
                cardHave: false,
                cardNumber: "",
                cardName: "",
                cardOwner: "",
                cardValue: 0,
                cardPassword: 0,
                cardOwnerId: 0
            }]
        })

    }

    // ЕСЛИ ХОЧЕШЬ ОТПРАВИТЬ ФОТО ВМЕСТО СТИКЕРА

    //         bot.sendPhoto(chatId, 'УРЛ ОТ ФОТО', { caption: `
    // Привет, <a href='tg://user?id=${userId}'>${userName}</a> \n
    // Я-игровой бот для игры в различные игры.\n
    // Тебе выдан подарок 🎁 в размере 10.000€.\n
    // Так же ты можешь добавить меня в беседу для игры с друзьями.\n
    // Рекомендую скорее нажать на помощь "Помощь" |
    //         `, parse_mode: 'HTML', ...startOptions })

}

async function commandHelpInChats(msg, userGameName, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id

    await bot.sendMessage(chatId, `
<a href='tg://user?id=${userId}'>${userGameName}</a>
🗂Разделы
👨‍🔬Ownner: @levou7 

👜 Основные✇ 
🌇 Имущество❃۬
🛡 Для ✄Админов
🤹‍♂ Игры✺
☎️ Модерация㋡
📓 Развлекательное❒

🗄 Беседа - официальные чаты и канал бота.
        `, { parse_mode: 'HTML', ...helpOption })
}

async function commandHelp(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const user = await collection.findOne({ id: userId })

    if (text && text.toLowerCase() === '/help' || text && text.toLowerCase() === 'помощь') {
        const userGameName = user.userName
        await bot.sendMessage(chatId, `
<a href='tg://user?id=${userId}'>${userGameName}</a>
🗂Разделы
👨‍🔬Ownner: @levou7 

👜 Основные✇ 
🌇 Имущество❃۬
🛡 Для ✄Админов
🤹‍♂ Игры✺
☎️ Модерация㋡
📓 Развлекательное❒

🗄 Беседа - официальные чаты и канал бота.
            `, { parse_mode: 'HTML', ...helpOption })
    }
}

async function commandHelpAsBtn(msg, userGameName, bot) {
    const data = msg.data
    const chatId = msg.message.chat.id
    const userId = msg.message.from.id

    const help = `
<a href='tg://user?id=${userId}'>${userGameName}</a>
🗂Разделы
👨‍🔬Ownner: @levou7 

👜 Основные✇ 
🌇 Имущество❃۬
🛡 Для ✄Админов
🤹‍♂ Игры✺
☎️ Модерация㋡
📓 Развлекательное❒

🗄 Беседа - официальные чаты и канал бота.
    `
    // ЭТО ФУНКЦИЯ ВЫЗЫВАЕТ КНОПКУ НАЗАД
    const willEditMessage = () => {
        bot.editMessageText(help, { parse_mode: 'HTML', chat_id: chatId, message_id: msg.message.message_id, ...helpOption })
    }
    // ЭТО ФУНКЦИЯ ВЫЗЫВАЕТ ИЗМЕНЕНИЕ СООБЩЕНИЙ
    const willChangHelpOption = (funcData, funcText) => {
        if (data === funcData) {
            const text = funcText
            bot.editMessageText(text, { chat_id: chatId, message_id: msg.message.message_id, ...backOption })
        }
    }

    if (data === 'help') {
        await bot.sendMessage(chatId, help, { parse_mode: 'HTML', ...helpOption })
    }
    willChangHelpOption('mainHelp', 'hello'/*Слово после нажатии кнопки */)
    willChangHelpOption('gameHelp', 'game')
    willChangHelpOption('propertyHelp', 'property')
    willChangHelpOption('adminHelp', 'admin')
    willChangHelpOption('restHelp', 'остальное')
    willChangHelpOption('moderationHelp', 'модерация')

    if (data === 'back') {
        willEditMessage()
    }
}

async function sendPrivateMessage(userId, text, bot, userIdReq) {
    await bot.sendMessage(userId, `
Вам пришло сообщение от владельца <a href='tg://user?id=${userIdReq}'>Владелец</a>
Текст: ${text}
    `, { parse_mode: "HTML" });
}

async function userMsg(msg, bot) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const userIdReq = msg.from.id

    const parts = text.split(' ')

    if (text.startsWith('/msg')) {
        const userIdToSend = parts[1]
        if (userIdToSend) {
            const message = text.split(' ').slice(2).join(' ');
            sendPrivateMessage(userIdToSend, message, bot, userIdReq);
            bot.sendMessage(chatId, `Сообщение отправлено пользователю с айди ${userIdToSend}.`);
        } else {
            bot.sendMessage(chatId, 'Ошибка: не удалось определить пользователя для отправки сообщения.');
        }
    }
}

async function deleteAllUsers(msg, collection, bot, ObjectId) {
    const chatId = adminId
    const text = msg.text
    const userId = msg.from.id

    if (text.toLowerCase() === 'удалить всех пользователей') {
        if (userId === adminId) {
            const user = await collection.find({ _id: ObjectId })
            const deletedUsers = await user.map((doc) => doc.id).toArray();
            const allUsers = await collection.countDocuments() - 1

            bot.sendMessage(chatId, `Успешно удалено ${allUsers}, но вы остаетесь\nХозяин <a href='tg://user?id=${adminId}'>Владелец</a>`, { parse_mode: 'HTML' })
            await deletedUsers.forEach(async (e) => {
                if(e != adminId){
                    await collection.deleteOne({ id: e })
                }
            })
        }
        else {
            bot.sendMessage(userId, 'Вы не являетесь администратором бота')
        }
    }
}

module.exports = {
    commandStart,
    commandHelp,
    commandHelpAsBtn,
    commandHelpInChats,
    userMsg,
    deleteAllUsers,
}