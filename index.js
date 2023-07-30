const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const botToken = process.env.BOT_TOKEN
const mongoDbUrl = process.env.MONGO_DB_URL
const adminId = process.env.ADMIN_ID

const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(mongoDbUrl);

const { kazino } = require('./requests/games/games');
const { commandStart, commandHelp, commandHelpAsBtn, commandHelpInChats, userMsg, deleteAllUsers } = require('./requests/commands/commands');
const { userBalance, userEditGameId, userGameInfo, userEditGameName, myId } = require('./requests/user/userInfo');
const { userMute, userUnMute, userUnMuteAll, userMuteId } = require('./requests/violations/userMute');
const { botInfo, botInfo2, deleteMessageBot, isJoinNotification, handleJoinLeaveMessages } = require('./requests/botInfo/botInfos');
const { giveMoney } = require('./requests/user/giveMoney');
const { extraditeMoney, takeMoney } = require('./requests/admin/adminCommands');
const { generateCardNumber, cardInfo, createUpdateCardPassword, setMoneyToCard, getMoneyFromOwnCard, getMoneyFromCard } = require('./requests/user/userBankCard');

client.connect()
const db = client.db('bot');
const collection = db.collection('users');
const collectionBot = db.collection('botInfo')

const bot = new TelegramBot(botToken, { polling: true });

function log(e) {
    console.log(e)
}

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

    bot.on('new_chat_members', async msg => {
        if (msg.new_chat_members && msg.new_chat_members.length > 0) {
            const chatId = msg.chat.id;
            const messageType = msg.new_chat_members ? 'join' : msg.left_chat_member ? 'leave' : null;

            if (messageType === 'join' || messageType === 'leave') {
                // Удаляем сообщение о добавлении или удалении участника
                await bot.deleteMessage(chatId, msg.message_id);
            }
        }
    })

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

        const user = await collection.findOne({ id: userId });

        if (pinned_message || new_chat_members || new_chat_title || new_chat_photo || left_chat_member) {
            return
        }

        // start
        if (text.toLowerCase() === '/start' || text == '/start@levouJS_bot') {
            commandStart(msg, collection, bot)
            log('Успешно зарегистрирован')
        }

        else if (!!user) {
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

            // Give Money
            giveMoney(msg, bot, collection)

            // Func /msg
            userMsg(msg, bot)

            //delete All Users = это функцию можешь использовать когда обновляешь бота или добавляешь что-то новое в датабазу MONGODB
            deleteAllUsers(msg, collection, bot, ObjectId)

            //my ID
            myId(msg, bot, collection)

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
            commandHelpAsBtn(msg, userGameName, bot)

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
            const userGameName = user.userName
            commandHelpInChats(msg, userGameName, bot)
        }
        else {
            bot.sendMessage(chatId, `
Сначала зарегистрируйся нажав на /start
            `)
        }
    })



    // Обработчик всех входящих сообщений

    // bot.getMe().then((me) => {
    //     const botUserId = me.id;

    //     bot.on('new_chat_members', async (msg) => {
    //         const chatId = msg.chat.id;
    //         const newMembers = msg.new_chat_members;
    //         if (newMembers.some(member => member.id === botUserId)) {
    //             const instructionMessage = `Привет! Пожалуйста, сделайте меня администратором чата, чтобы я мог отправлять сообщения и выполнять свои функции. Для этого перейдите в настройки чата, найдите раздел "Администраторы" и добавьте меня в список администраторов. Спасибо!`;
    //             await bot.sendMessage(chatId, instructionMessage);
    //         }
    //     });
    // })
    // bot.onText(/.*/, async (msg) => {
    //     const chatId = msg.chat.id;
    //     const botInfo = await bot.getMe();
    //     const botId = botInfo.id;

    //     // Проверяем, является ли бот администратором в чате
    //     const admins = await bot.getChatAdministrators(chatId);
    //     const isBotAdmin = admins.some(admin => admin.user.id === botId);

    //     if (!isBotAdmin) {
    //         // Если бот не администратор, отправляем сообщение с просьбой назначить его администратором
    //         bot.sendMessage(chatId, 'Пожалуйста, назначьте меня администратором, чтобы я мог выполнять свои функции.');
    //     }
    // });


    // // Функция для снятия мута с игрока по его ID
    // async function unmutePlayer(chatId, playerId) {
    //     await bot.restrictChatMember(chatId, playerId, {
    //         can_send_messages: true,
    //         until_date: 0 // Установить until_date в 0, чтобы снять ограничение
    //     });
    // }

    // // Обработчик команды /unmute
    // bot.onText(/\/unmute (\d+)/, async (msg, match) => {
    //     const chatId = msg.chat.id;
    //     const playerId = match[1]; // Получаем ID игрока из команды
    //     await unmutePlayer(chatId, playerId); // Вызываем функцию снятия мута
    //     bot.sendMessage(chatId, 'Мут с игрока снят.'); // Отправляем сообщение о снятии мута
    // })
}

start()
collectionBot.updateOne({}, { $set: { botLastIncTime: botLastIncludedTime } })

log(`Бот запущён и работает </>`)

