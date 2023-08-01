const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const botToken = process.env.BOT_TOKEN
const mongoDbUrl = process.env.MONGO_DB_URL
const adminId = process.env.ADMIN_ID

const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(mongoDbUrl);

const { kazino } = require('./requests/games/games');
const { commandStart, commandHelp, commandHelpAsBtn, commandHelpInChats, userMsg, deleteAllUsers, userInfoReplyToMessage } = require('./requests/commands/commands');
const { userBalance, userEditGameId, userGameInfo, userEditGameName, myId } = require('./requests/user/userInfo');
const { userMute, userUnMute, userUnMuteAll, userMuteId } = require('./requests/violations/userMute');
const { botInfo, botInfo2, deleteMessageBot, isJoinNotification, handleJoinLeaveMessages, botVersionChange } = require('./requests/botInfo/botInfos');
const { giveMoney } = require('./requests/user/giveMoney');
const { extraditeMoney, takeMoney } = require('./requests/admin/adminCommands');
const { generateCardNumber, cardInfo, createUpdateCardPassword, setMoneyToCard, getMoneyFromOwnCard, getMoneyFromCard, infoAboutCards } = require('./requests/user/userBankCard');
const { cryptoCurrenceLaunch, updateCryptoToUp, updateCryptoToDown, cryptoStatus } = require('./requests/crypto/cryptoCurrence');
const { cryptoShop, buyCryptoCurrence, buyCryptoCurrenceBtn } = require('./requests/shop/cryptoShop');

client.connect()
const db = client.db('bot');
const collection = db.collection('users');
const collectionBot = db.collection('botInfo')
const collectionCrypto = db.collection('crypto')

const bot = new TelegramBot(botToken, { polling: true });

function log(e) {
    console.log(e)
}

const userStates = {};

const date = new Date()
const year = date.getFullYear()
const month = date.getMonth()
const day = date.getDate()
const hours = date.getHours()
const minutes = date.getMinutes()
const botLastIncludedTime = `${day}-${month}-${year} ${hours}:${minutes}`

function start() {
    bot.setMyCommands([
        {
            command: '/help', description: 'Помощь'
        },
    ])

    // Обработчик события оповещения о входе нового участника
    bot.on('new_chat_members', async (msg) => {
        deleteMessageBot(msg, bot);
    });

    // Обработчик события оповещения об уходе участника из чата
    bot.on('left_chat_member', async (msg) => {
        deleteMessageBot(msg, bot);
    });

    // Обработчик события оповещения о новом фото чата
    bot.on('new_chat_photo', async (msg) => {
        deleteMessageBot(msg, bot);
    });

    // Обработчик события оповещения об удалении фото чата
    bot.on('delete_chat_photo', async (msg) => {
        deleteMessageBot(msg, bot);
    });

    // Обработчик события оповещения об изменении названия чата
    bot.on('new_chat_title', async (msg) => {
        deleteMessageBot(msg, bot);
    });

    // Обработчик события оповещения о закреплении сообщения в чате
    bot.on('pinned_message', async (msg) => {
        deleteMessageBot(msg, bot);
    })

    bot.on('message', async msg => {
        const userId = msg.from.id
        const text = msg.text
        const chatId = msg.chat.id
        const messageId = msg.message_id

        const pinned_message = msg.pinned_message
        const new_chat_title = msg.new_chat_title
        const new_chat_members = msg.new_chat_members
        const new_chat_photo = msg.new_chat_photo
        const left_chat_member = msg.left_chat_member
        const sendedPhoto = msg.photo

        const user = await collection.findOne({ id: userId });

        if (pinned_message || new_chat_members || new_chat_title || new_chat_photo || left_chat_member || sendedPhoto) {
            return
        }

        // start
        if (text.toLowerCase() === '/start' || text == '/start@levouJS_bot') {
            commandStart(msg, collection, bot)
            log('Успешно зарегистрирован')
        }

        else if (!!user) {
            // crypto currencies
            cryptoCurrenceLaunch(msg, bot, collectionCrypto)
            updateCryptoToUp(msg, bot, collectionCrypto)
            cryptoShop(msg, bot, collectionCrypto)
            updateCryptoToDown(msg, bot, collectionCrypto)
            cryptoStatus(msg, bot, collectionCrypto)
            buyCryptoCurrence(msg, bot, collection, collectionCrypto)
            
            // help
            commandHelp(msg, collection, bot)

            // balance
            userBalance(msg, collection, bot)

            // kazino
            kazino(msg, collection, bot)

            // info
            userGameInfo(msg, bot, collection)

            // Edit game ID
            userEditGameId(msg, bot, collection)

            //Edit game NAME
            userEditGameName(msg, bot, collection)

            // MUTE            
            userMute(msg, bot, collection)
            userUnMute(msg, bot, collection)
            userUnMuteAll(msg, bot, collection)
            userMuteId(msg, collection, bot)

            //Bot Info
            botInfo(msg, collectionBot, bot, collection)
            botInfo2(msg, collectionBot, bot, collection)
            botVersionChange(msg, bot, collectionBot)

            // Give Money
            giveMoney(msg, bot, collection)

            // Func /msg
            userMsg(msg, bot)

            //delete All Users = это функцию можешь использовать когда обновляешь бота или добавляешь что-то новое в датабазу MONGODB
            deleteAllUsers(msg, collection, bot, ObjectId)

            //my ID
            myId(msg, bot, collection)

            //info ID
            userInfoReplyToMessage(msg, bot, collection)

            //Выдача денег
            extraditeMoney(msg, collection, bot)
            takeMoney(msg, collection, bot)

            // Пластик карты
            generateCardNumber(msg, bot, collection);
            cardInfo(msg, bot, collection)
            createUpdateCardPassword(msg, bot, collection)
            setMoneyToCard(msg, bot, collection)
            getMoneyFromOwnCard(msg, bot, collection)
            getMoneyFromCard(msg, bot, collection)
            infoAboutCards(msg, bot, collection)

        }
        else {
            await bot.sendMessage(chatId, `
Сначала зарегистрируйся нажав на /start
            `, { reply_to_message_id: messageId })

        }
    })

    bot.on('callback_query', async msg => {
        const chatId = msg.message.chat.id
        const data = msg.data
        const userId = msg.from.id
        const user = await collection.findOne({ id: userId })

        if (!!user) {
            const userGameName = user.userName
            commandHelpAsBtn(msg, bot, userGameName)
            buyCryptoCurrenceBtn(msg, bot, collection)

            if (data === 'dayBonusCollect') {
                bot.answerCallbackQuery(msg.id, { text: "Вы нажали на кнопку! пока что в разработке", show_alert: true });
                bot.sendMessage(msg.message.chat.id, `в разработке`, { reply_to_message_id: msg.message.message_id })
            }
        }
        else {
            bot.sendMessage(chatId, `
Сначала зарегистрируйся нажав на /start
            `)
            log(user)
        }
    })

    bot.onText(/\/help/, async msg => {
        const userId = msg.from.id
        const chatId = msg.chat.id
        const user = await collection.findOne({ id: userId })

        if (!!user) {
            if (chatId != userId) {
                const userGameName = user.userName
                commandHelpInChats(msg, userGameName, bot)
            }
        }
        else {
            bot.sendMessage(chatId, `
Сначала зарегистрируйся нажав на /start
            `)
        }
    })
}

start()
collectionBot.updateOne({}, { $set: { botLastIncTime: botLastIncludedTime } })

log(`Бот запущён и работает </>`)

    // if (text === 'h') {
    //     const chatId = msg.chat.id;
    //     const userId = msg.from.id;

    //     const uniqueId = `${userId}_${Date.now()}`;

    //     // Сохраняем состояние пользователя и уникальный идентификатор в объекте userStates
    //     userStates[userId] = { state: 'waiting_for_button_click', uniqueId };

    //     const options = {
    //         reply_markup: {
    //             inline_keyboard: [
    //                 [{ text: 'Кнопка 1', callback_data: uniqueId }],
    //                 [{ text: 'Кнопка 2', callback_data: uniqueId }],
    //                 // Добавьте другие кнопки с уникальными идентификаторами
    //             ],
    //         },
    //     };

    //     bot.sendMessage(chatId, 'Выберите действие:', options);
    // }
    // bot.on('callback_query', (query) => {
    //     const userId = query.from.id;
    //     const userState = userStates[userId]?.state;

    //     if (userState === 'waiting_for_button_click') {
    //         const uniqueId = query.data;
    //         // Ваша логика обработки действия с уникальным идентификатором uniqueId
    //         bot.answerCallbackQuery(query.id, { text: 'Вы выбрали кнопку.' });
    //     } else {
    //         bot.answerCallbackQuery(query.id, { text: 'Это кнопка не для тебя.' });
    //     }
    // });
