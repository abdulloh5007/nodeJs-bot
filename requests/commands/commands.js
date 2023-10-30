const { addingToDB } = require("../../mongoConnect");
const { startOptions, helpOption, backOption } = require("../../options");
const { donatedUsers } = require("../donate/donatedUsers");
const { formatNumberInScientificNotation } = require("../systems/systemRu");
require('dotenv').config();
const adminId = parseInt(process.env.ADMIN_ID)

const txtHelp = 
`<b>🥴Разделы</b>
<b>👨‍💻Ownner: <a href='https://t.me/Ctiv_50'>Владелец</a></b>
<b>📚Чат</b> - 
<b>🛰Канал</b> -

<i>🏞 Основные😉</i>
<i>🏘Дома(острова🏝)۬</i>
<i>⚡️Админ</i>
<i>🎯Игры</i>
<i>🤹Развлекательное</i>

🗄 Беседа - официальные чаты и канал бота.
`

async function commandStart(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
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

        await addingToDB(collection, userId)
    }

    // ЕСЛИ ХОЧЕШЬ ОТПРАВИТЬ ФОТО ВМЕСТО СТИКЕРА

    //         bot.sendPhoto(chatId, 'УРЛ ОТ ФОТО', { caption: `
    // Привет, <a href='tg://user?id=${userId}'>Игрок</a> \n
    // Я-игровой бот для игры в различные игры.\n
    // Тебе выдан подарок 🎁 в размере 10.000€.\n
    // Так же ты можешь добавить меня в беседу для игры с друзьями.\n
    // Рекомендую скорее нажать на помощь "Помощь" |
    //         `, parse_mode: 'HTML', ...startOptions })

}

async function commandHelp(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const user = await collection.findOne({ id: userId })
    const replyId = msg.message_id

    const userGameName = user.userName
    await bot.sendMessage(chatId, `
<a href='tg://user?id=${userId}'>${userGameName}</a>
${txtHelp}
    `, { parse_mode: 'HTML', ...helpOption, reply_to_message_id: replyId, disable_web_page_preview: true })

}

async function commandHelpAsBtn(msg, bot, userGameName, collection) {
    const data = msg.data
    const chatId = msg.message.chat.id
    const userId = msg.message.from.id
    const replyId = msg.message_id
    const userDonateStatus = await donatedUsers(msg, collection)

    const help = `
<a href='tg://user?id=${userId}'>${userGameName}</a>
${txtHelp}
    `
    // ЭТО ФУНКЦИЯ ВЫЗЫВАЕТ КНОПКУ НАЗАД
    const willEditMessage = () => {
        bot.editMessageText(help, { parse_mode: 'HTML', chat_id: chatId, message_id: msg.message.message_id, ...helpOption, reply_to_message_id: replyId, disable_web_page_preview: true })
    }
    // ЭТО ФУНКЦИЯ ВЫЗЫВАЕТ ИЗМЕНЕНИЕ СООБЩЕНИЙ
    const willChangHelpOption = (funcData, funcText) => {
        if (data === funcData) {
            const text = funcText
            bot.editMessageText(text, { parse_mode: 'HTML', chat_id: chatId, message_id: msg.message.message_id, ...backOption, reply_to_message_id: replyId })
        }
    }

    if (data === 'help') {
        await bot.sendMessage(chatId, help, { parse_mode: 'HTML', ...helpOption, reply_to_message_id: replyId, disable_web_page_preview: true })
    }

    const restHelp = `
${userDonateStatus}, вот остальные команды

💳• <i><code>инфо карта</code></i> - <b>Информация о картах</b>
🪪• <i><code>мой айди</code></i> - <b>Показ айди пользователя</b>

🏪• <i><code>магазин</code></i> - <b>Магазин криптовалют</b>
🗣• <i><code>!реф</code></i> - <b>Реферал</b>
🏵• <i><code>мой статус</code></i> - <b>Информация о статусе</b>
    `
    const property = `
🚦${userDonateStatus}, вот имущества которые существуют в боте🛸

🏠 <i><code>дома</code></i> - <b>Информация о домах</b>
🏆 <i><code>донат дома</code></i> - <b>Информация о донат домах</b>
🌇 <i><code>инфо дом [название дома]</code></i> - 🏠<b>Информация о доме</b>
<i><code>мой дом</code></i> - 🏡<b>Информация о своем доме или донат доме</b>
<i><code>купить дом [номер дома]</code></i> - 🏙<b>Приобретение дома</b>
<i><code>купить донатдом [номер дома]</code></i> - 🏝<b>Приобретение донат дома</b>
<i><code>продать дом</code></i> - 🏘<b>Продажа дома или донат дома</b>

💻 <i><code>бизнесы</code></i> - <b>Информация о бизнесах</b>
<i><code>купить бизнес [номер]</code></i> - <b>Покупка бизнеса</b>
📽 <i><code>инфо бработники</code></i> - <b>Информация о бизнес работниках</b>🤵

<i>🏝<code>команды острова</code></i> - <b>команды островов</b>
<i><code>открыть остров</code></i> - <b>Открытие собственного острова</b>
    `

    const moderation = `
В Разработке !
    `

    const game = `
😎• ${userDonateStatus}, вот доступные игры

🎰 <i><code>казино [сумма]</code></i> - <b>Игра казино 🎭</b>
🎰 <i><code>спин [сумма]</code></i> - <b>Игра спин 🎮</b>
🎳 <i><code>боул [сумма]</code></i> - <b>Игра боулинг 🎮</b>
⚽️ <i><code>футбол [сумма]</code></i> - <b>Игра футбол 🎮</b>
    `

    const main = `
🙋‍♂° ${userDonateStatus}, вот основные команды

💵• <i><code>б</code></i> - <b>Информация о счете</b>

🔁• <i><code>сменить ник [ник]</code></i> - <b>Смена ника</b>👨‍🎤
🆔• <i><code>Сменить айди [айди]</code></i> - <b>Смена айди только админам</b>👮‍♂
💸• <i><code>дать [сумма]</code></i> - <b>Передача денег</b>💁‍♂
❤️‍🔥• <i><code>донат</code></i> - <b>Донаты, сообщение отправить только в лс</b>
⌨• <i><code>+промо [название] [кол-во активации] [сумма] [комаентарии если есть]</code></i>😎
🎁• <i><code>конты</code></i> - <b>Контейнеры</b>
💳• <i><code>депозит</code></i> - <b>Информация о депозите</b>
💸• <i><code>депозит пополнить [сумма]</code></i> - <b>Положить деньги на баланс депозита</b>
    `
    const adminCommands = `
${userDonateStatus}, вот команды админов

🤖<i><code>bot give me a key administrator</code></i> - <b>Генерирует ключ администрации который приходит только владельцу</b>🤵
🗝<i><code>key [ключ]</code></i> - <b>Использовать ключ адмиистрации</b>
<i><code>.infoid</code></i> - <b>Инфо о пользователе, ответом на сообщение</b>👥
<i><code>manual promo</code></i> - <b>Добавление авто промокода в ручную</b>

🏢<i><code>+дом [имя] [стоимость] [сезон] [айди картины]</code></i> - <b>Добавление домов</b>🏗
🏬<i><code>+донатдом [имя] [стоимость] [сезон] [айди картины]</code></i> - <b>Добавление донат домов</b>🏗
<i><code>+машина [имя] [стоимость] [сезон] [айди картины]</code></i> - <b>Добавление машин</b>
<i><code>+донатмашина [имя] [стоимость] [сезон] [айди картины]</code></i> - <b>Добавление донат машин</b>

🏘<i><code>дом цена [номер дома] [новая цена]</code></i> - <b>Изменение цены дома</b>
🏚<i><code>дом имя [имя дома] [новая имя]</code></i> - <b>Изменение имя дома</b>

<i><code>машина цена [номер дома] [новая цена]</code></i> - <b>Изменение цены машины</b>
<i><code>машина имя [имя дома] [новая имя]</code></i> - <b>Изменение имя машины</b>

🎗<i><code>crypto status [true, false]</code></i> - <b>Статус крипты [продается, не продается]</b>
<i><code>крипта вниз [названия] [цена]</code></i> - <b>Действие вниз убывание</b>⬇️
<i><code>крипта вниз [названия] [цена]</code></i> - <b>Действие вниз увеличение</b>⬆️

🛜<i><code>botinfo</code></i> - <b>Информация о боте</b>
🔊<i><code>bot version [версия]</code></i> - <b>Новая версия боту</b>

📛<i><code>/ban_bot [время] [причина]</code></i> - <b>Ответом на сообщение, дает бан</b>

💸<i><code>выдать [сумма]</code></i> - <b>Выдача денег, ответом на сообщение</b>
🫳<i><code>забрать [сумма]</code></i> - <b>Отбор денег, ответом на сообщение</b>
<i><code>деньги забрать все</code></i> - <b>Отбор всех денег, ответом на сообщение</b>

🫱<i><code>ус выдать</code></i> - <b>Выдача ус, ответом на сообщение</b>
🫴<i><code>ус забрать</code></i> - <b>Отбор ус, ответом на сообщение</b>
🫳<i><code>ус забрать все</code></i> - <b>Отбор всех ус, ответом на сообщение</b>

📠<i><code>+дпромо [название] [кол-во активации] [сумма] [комаентарии если есть]</code></i>

🖼<b>Айди картины можно получить отправив картину боту в лс</b>
    `

    willChangHelpOption('mainHelp', main /*Слово после нажатии кнопки */)
    willChangHelpOption('gameHelp', game)
    willChangHelpOption('propertyHelp', property)
    willChangHelpOption('adminHelp', adminCommands)
    willChangHelpOption('restHelp', restHelp)

    if (data === 'back') {
        willEditMessage()
    }
}

async function userInfoReplyToMessage(msg, bot, collection) {
    const userIdToGet = msg.reply_to_message?.from?.id;
    const chatId = msg.chat.id
    const messageId = msg.message_id
    const text = msg.text
    const userId = msg.from.id

    const user = userIdToGet ? await collection.findOne({ id: userIdToGet }) : null

    if (userId === adminId) {
        if (!!user) {
            if (userIdToGet) {
                const userGameId = user.gameId;
                const userGameName = user.userName;
                const register_time = user.registerTime;
                const userGameBalance = user.balance;
                const ratesAll = user.rates.map((e) => e.all);
                const ratesWin = user.rates.map((e) => e.wins);
                const ratesLose = user.rates.map((e) => e.loses);
                const userBankCard = user.bankCard[0].cardNumber
                const cryptoCurAlt = user.crypto[0].altcoinidx
                const userUc = user.uc
                const userId2 = user.id
                const userStatus = user.status[0].statusName

                const userBanStatus = user.ban[0].ban
                let userBanInformation;

                if (userBanStatus === true) {
                    const userBanCause = user.ban[0].cause
                    const userBanTime = user.ban[0].banTime
                    const date = new Date(userBanTime)
                    userBanInformation = `
<b>Бан статус:</b> забанен
   <b>Причина:</b> ${userBanCause}
   <b>Время:</b> ${date.toLocaleString('')}
            `
                }
                else {
                    userBanInformation = `
<b>Бан статус:</b> не забанен
            `
                }

                if (chatId == userId) {
                    await bot.sendMessage(chatId, `
<b>Телеграм 🆔</b> <code><i>${user.id}</i></code>
<b>Игровой 🆔:</b> ${userGameId}
<b>Ник 👨:</b> <a href='tg://user?id=${userId2}'>${userGameName}</a>
<b>Баланс 💸: ${userGameBalance.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(userGameBalance)})</b>
<b>Uc: ${userUc}</b>
<b>Status: ${userStatus.toUpperCase()}</b>
<b>Карта: |<code>${userBankCard}</code>|</b>
${userBanInformation}
<b>Криптовалюты ↓</b>
   <b>Alt Coin IDX:</b> ${cryptoCurAlt}

<b>Сыграно игр: ${ratesAll} \n    Выигрыши: ${ratesWin} \n    Проигрыши: ${ratesLose}</b>
<b>Время регистрации 📆:</b> ${register_time}
                        `, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
                }
                else {
                    await bot.sendMessage(chatId, `
<b>Телеграм 🆔</b> <code><i>${user.id}</i></code>
<b>Игровой 🆔:</b> ${userGameId}
<b>Ник 👨:</b> <a href='tg://user?id=${userId2}'>${userGameName}</a>
<b>Баланс 💸: ${userGameBalance.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(userGameBalance)})</b>
<b>Uc: ${userUc}</b>
<b>Status: ${userStatus.toUpperCase()}</b>
<b>Карта: |<code>5444 **** **** ****</code>|</b>
${userBanInformation}
<b>Криптовалюты ↓</b>
   <b>Alt Coin IDX:</b> ${cryptoCurAlt}

<b>Сыграно игр: ${ratesAll} \n    Выигрыши: ${ratesWin} \n    Проигрыши: ${ratesLose}</b>
<b>Время регистрации 📆:</b> ${register_time}
                        `, { parse_mode: 'HTML', reply_to_message_id: msg.message_id });
                }
            }
            else {
                bot.sendMessage(chatId, 'Ответьте сообщением на пользователя который вы хотите увидеть данные')
            }
        }
        else {
            bot.sendMessage(chatId, 'Этот пользователь не регистрирован в боте')
        }
    }
    else {
        bot.sendMessage(chatId, 'Вы не являетесь администратором бота', { reply_to_message_id: messageId })
    }
}
async function userMsg(msg, collection, bot) {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;
    const messageId = msg.message_id

    const parts = text.split(' ');
    const sendedMessage = text.split(' ').slice(2).join(' ');

    if (text.toLowerCase().startsWith('/msg ')) {
        const userIdToGet = parseInt(parts[1]);

        if (parts.length >= 3) {
            const user = await collection.findOne({ id: userIdToGet });

            if (user) {
                const userIdToSend = await collection.findOne({ id: userId });
                const userSendName = userIdToSend.userName;

                if (userIdToGet) {
                    if (userId !== userIdToGet) {

                        bot.sendMessage(userIdToGet, `
Вам пришло сообщение от игрока: <a href='tg://user?id=${userId}'>${userSendName}</a>
Сообщение: ${sendedMessage}
                        `, { parse_mode: 'HTML' })
                            .then(() => {
                                bot.sendMessage(chatId, `Вы успешно отправили сообщение пользователю <a href='tg://user?id=${userIdToSend}'>${user.userName}</a>`, { reply_to_message_id: messageId, parse_mode: 'HTML' })
                            })
                            .catch((error) => {
                                if (error.response && error.response.statusCode === 403) {
                                    bot.sendMessage(chatId, 'Пользователь заблокировал бота');
                                } else {
                                    bot.sendMessage(chatId, 'Произошла ошибка при отправке сообщения');
                                }
                            });
                    }
                    else {
                        bot.sendMessage(chatId, 'Не возможно отправить сообщение самому себе')
                    }
                } else {
                    bot.sendMessage(chatId, `Не верный формат отправки сообщение пользователю пример <code>/msg [айди] привет как дела</code>`, { parse_mode: 'HTML' });
                }
            } else {
                bot.sendMessage(chatId, 'Этот пользователь не регистрирован в боте');
            }
        } else {
            bot.sendMessage(chatId, `Не верный формат отправки сообщение пользователю пример <code>/msg [айди] привет как дела</code> 2`, { parse_mode: 'HTML' });
        }
    }
}

async function deleteAllUsers(msg, collection, bot, ObjectId) {
    const chatId = adminId
    const text = msg.text
    const userId = msg.from.id

    if (userId === adminId) {
        const user = await collection.find({ _id: ObjectId })
        const deletedUsers = await user.map((doc) => doc.id).toArray();
        const allUsers = await collection.countDocuments() - 1

        bot.sendMessage(chatId, `Успешно удалено ${allUsers}, но вы остаетесь\nХозяин <a href='tg://user?id=${adminId}'>Владелец</a>`, { parse_mode: 'HTML' })
        await deletedUsers.forEach(async (e) => {
            if (e != adminId) {
                await collection.deleteOne({ id: e })
            }
        })
    }
    else {
        bot.sendMessage(userId, 'Вы не являетесь администратором бота')
    }
}

async function infoFromUGameId(msg, bot, collection) {
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const parts = text.split(' ')
    const userDonateStatus = await donatedUsers(msg, collection)

    if (!parts[1]) {
        bot.sendMessage(chatId, `
${userDonateStatus}, напишите мне игровой айди игрока чтобы я мог вам отправить
Информацию о пользователе
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }
    
    const user = await collection.findOne({ gameId: parts[1] })

    if (!user) {
        bot.sendMessage(chatId, `
${userDonateStatus}, этот пользователь не найден 
<b>Пример:</b> <i>A1234567</i>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const userName = user.userName
    const userId2 = user.id
    const userBalance = user.balance
    const userGameId = user.id
    const userUc = user.uc
    const userStatusName = user.status[0].statusName
    const userStatusExpire = user.status[0].statusExpireDate
    const dateExpire = new Date(userStatusExpire)

    const userStatus =  userStatusName != 'player' ? 
`<i>${userStatusName.toUpperCase()} ⌂</i>
  └<b>Время окончания:</b> ${dateExpire.toLocaleDateString()}` : '<b>PLAYER ☺</b>'
    const userRegTime = user.registerTime
    const userBanCause = user.ban[0].cause
    const userBanTime = user.ban[0].banTime
    const userBan = user.ban[0].ban == true ? 
`<b>Заблокирован √</b>
  └<b>Причина:</b> <i>${userBanCause}</i>
  └<b>Время:</b> <i>${userBanTime}</i>` : '<b>Не заблокирован ×</b>'

    bot.sendMessage(chatId, `
${userDonateStatus}, вот инфо о игроке <a href='tg://user?id=${userId2}'>${userName}</a>

<b>Ник:</b> <i>${userName}</i>
<b>Айди:</b> <i>${userGameId}</i>
<b>Баланс:</b> <i>${userBalance.toLocaleString('de-DE')} ${formatNumberInScientificNotation(userBalance)}</i>
<b>Uc:</b> <i>${userUc.toLocaleString('de-DE')}</i>
<b>Время регистрации:</b> <i>${userRegTime}</i>

<b>Статус:</b> ${userStatus}

<b>Бан:</b> ${userBan}

    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
}

async function userStatistics(msg, bot, collection){
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userCreatePromos = user.stats[0].createPromos
    const userCaseHouses = user.stats[0].openCaseHouses
    const userCaseCars = user.stats[0].openCaseCars

    bot.sendMessage(chatId, `
${userDonateStatus}, вот ваша статистика

Открыто контейнеров
  <i>Конт домов:</i> <b>${userCaseHouses}</b>
  <i>Конт машин:</i> <b>${userCaseCars}</b>

Создано промокодов
  <i>Кол-ва:</i> <b>${userCreatePromos}</b> 
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
}

module.exports = {
    commandStart,
    commandHelp,
    commandHelpAsBtn,
    userMsg,
    deleteAllUsers,
    userInfoReplyToMessage,
    infoFromUGameId,
    userStatistics,
}