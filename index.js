const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const botToken = process.env.BOT_TOKEN
const mongoDbUrl = process.env.MONGO_DB_URL
const adminId = parseInt(process.env.ADMIN_ID)

const { MongoClient, ObjectId } = require('mongodb');
const client = new MongoClient(mongoDbUrl);

const { kazino } = require('./requests/games/games');
const { commandStart, commandHelp, commandHelpAsBtn, commandHelpInChats, deleteAllUsers, userInfoReplyToMessage, userMsg } = require('./requests/commands/commands');
const { userBalance, userEditGameId, userGameInfo, userEditGameName, myId, dayBonusCollectingBtn } = require('./requests/user/userInfo');
const { userMute, userUnMute, userUnMuteAll, userMuteId } = require('./requests/violations/userMute');
const { botInfo, deleteMessageBot, botVersionChange } = require('./requests/botInfo/botInfos');
const { giveMoney } = require('./requests/user/giveMoney');
const { extraditeMoney, takeMoney, takeAllMoney, extraditeUc, takeUc, takeAllUc, adminCommands, adminCommandsWithBtn, toBeAnAdministrtorBot, useKey, deleteGenKeys } = require('./requests/admin/adminCommands');
const { generateCardNumber, cardInfo, createUpdateCardPassword, setMoneyToCard, getMoneyFromOwnCard, infoAboutCards } = require('./requests/user/userBankCard');
const { cryptoCurrenceLaunch, updateCryptoToUp, updateCryptoToDown, cryptoStatus, cryptoShopWithBtn, shopCryptoCallback } = require('./requests/crypto/cryptoCurrence');
const { cryptoShop, buyCryptoCurrence, buyCryptoCurrenceBtn } = require('./requests/shop/cryptoShop');
const { tops, topWithBtns } = require('./requests/tops/tops');
const { referral, startWithRef } = require('./requests/referral/referral');
const { houses, HouseAdd, findHouseByName, houseBuy, myHouseInfo, changeHousePrice, sellHouse, donateHouses, houseDonateBuy, btnHouses, HouseDonateAdd, changeHouseName, } = require('./requests/properties/houses/houses');
const { donateMenu, donateBtns, donateInfo } = require('./requests/donate/donate');
const { checkAndUpdateDonations } = require('./requests/donate/donatedUsers');
const { createPromo, usingPromo, createDonatePromo } = require('./requests/promo/promo');

client.connect()
const db = client.db('bot');
const collection = db.collection('users');
const collectionBot = db.collection('botInfo')
const collectionCrypto = db.collection('crypto')
const collectionHouses = db.collection('houses')
const collectionAdmins = db.collection('administrators')
const collectionPromo = db.collection('promo')

const bot = new TelegramBot(botToken, { polling: true });

let isBotActive = true;

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

function turnOnBot() {
    isBotActive = true;
}

function turnOffBot() {
    isBotActive = false;
}


async function sendMsgWhenBotStarts() {
    const [botInn, botInnOwner] = await Promise.all([
        collectionBot.findOne({ id: adminId }),
        collection.findOne({ id: adminId })
    ]);

    const ownerGameId = botInnOwner.gameId;
    const updateUserBotInfo = await collection.countDocuments();
    await collectionBot.updateOne({}, { $set: { registeredUsers: updateUserBotInfo } });

    bot.sendMessage(adminId, `
<b>Игровой айди Владельца бота: <a href='tg://user?id=${botInnOwner.id}'>${ownerGameId}</a></b>
<b>Количество пользователей: ${updateUserBotInfo}</b>
<b>Последнее время запуска бота или обновление бота: ${botLastIncludedTime}</b>
<b>Версия: ${botInn.botVersion}</b>
        `, { parse_mode: 'HTML' });
}

// Использовать когда хотите что бы бот отправил сообщение когда его включали
// sendMsgWhenBotStarts()

async function hasUserStartedDialog(userId) {
    const user = await collection.findOne({ id: userId });
    return !!user; // Вернет true, если пользователь начал диалог с ботом
}

function start() {
    bot.setMyCommands([
        {
            command: '/help', description: 'Помощь'
        },
        {
            command: '/admin', description: 'Помощь'
        },
    ])

    // Обработчик события оповещения о входе нового участника
    bot.on('new_chat_members', async (msg) => {
        bot.sendMessage(msg.chat.id, 'Напиши в личку бота что бы иметь полный доступ к моим командам', { reply_to_message_id: msg.message_id })
    });

    // Обработчик события оповещения об уходе участника из чата
    bot.on('left_chat_member', async (msg) => {
        // deleteMessageBot(msg, bot);
        bot.sendMessage(msg.chat.id, 'Ну и ху* с ним', { reply_to_message_id: msg.message_id })
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

    bot.on('photo', msg => {
        const photo = msg.photo[0].file_id
        const userId = msg.from.id

        bot.sendMessage(userId, `<code>${photo}</code>`, { parse_mode: 'HTML' })
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
        const sendGiff = msg.animation
        const sendSticker = msg.sticker
        const voice = msg.voice
        const dice = msg.dice
        const video = msg.video
        const document = msg.document

        const user = await collection.findOne({ id: userId });

        if (pinned_message || new_chat_members || new_chat_title || new_chat_photo || left_chat_member || sendedPhoto || sendGiff || sendSticker || voice || dice || video || document) {
            return
        }

        if (!!user) {
            if (['бот включись', 'включись', 'bot on', 'on', '/on'].includes(text.toLowerCase())) {
                if (userId === adminId) {
                    turnOnBot()
                    bot.sendMessage(chatId, `
Бот успешно включён
                `)
                }
                else {
                    bot.sendMessage(chatId, `
Вы не являетесь владельцом бота чтобы включать ил отключать его
                    `)
                }
            }
            if (['бот отключись', 'отключись', 'bot off', 'off', '/off'].includes(text.toLowerCase())) {
                if (userId === adminId) {
                    turnOffBot()
                    bot.sendMessage(chatId, `
Бот успешно отключён
            `)
                }
            }
        }

        if (!isBotActive) {
            return; // Если бот не активен, просто игнорируем входящие сообщения
        }
        else {
            const userStartedDialog = await hasUserStartedDialog(userId);

            //start
            if (text.toLowerCase() === '/start' || text == '/start@levouJS_bot') {
                commandStart(msg, collection, bot)
                log('Успешно зарегистрирован')
            }

            //ref start
            else if (text.startsWith('/start ')) {
                startWithRef(msg, bot, collection)
            }

            else if (!userStartedDialog) {
                // Если пользователь не начал диалог с ботом, отправляем ему инструкцию
                await bot.sendMessage(chatId, `
Сначала зарегистрируйтесь, нажав на /start
                `, { reply_to_message_id: messageId });
        
                return; // Прерываем обработку сообщения
            }

            else if (!!user) {
                // crypto currencies
                cryptoCurrenceLaunch(msg, bot, collectionCrypto)
                updateCryptoToUp(msg, bot, collectionCrypto)
                cryptoShop(msg, bot, collectionCrypto, collection)
                updateCryptoToDown(msg, bot, collectionCrypto)
                cryptoStatus(msg, bot, collectionCrypto)
                buyCryptoCurrence(msg, bot, collection, collectionCrypto)
                cryptoShopWithBtn(msg, bot, collection, collectionCrypto)

                // help
                commandHelp(msg, collection, bot)

                // ref
                referral(msg, bot, collection)

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
                // botInfo2(msg, collectionBot, bot, collection)
                botVersionChange(msg, bot, collectionBot)

                // Give Money
                giveMoney(msg, bot, collection)

                // Func /msg
                userMsg(msg, collection, bot,)

                //delete All Users = это функцию можешь использовать когда обновляешь бота или добавляешь что-то новое в датабазу MONGODB
                deleteAllUsers(msg, collection, bot, ObjectId)

                //my ID
                myId(msg, bot, collection)

                //info ID
                userInfoReplyToMessage(msg, bot, collection)

                //Выдача отбор денег
                extraditeMoney(msg, collection, bot)
                takeMoney(msg, collection, bot)
                takeAllMoney(msg, collection, bot)

                // Выдача отбор UC
                extraditeUc(msg, collection, bot)
                takeUc(msg, collection, bot)
                takeAllUc(msg, collection, bot)

                // Пластик карты
                generateCardNumber(msg, bot, collection);
                cardInfo(msg, bot, collection)
                createUpdateCardPassword(msg, bot, collection)
                setMoneyToCard(msg, bot, collection)
                getMoneyFromOwnCard(msg, bot, collection)
                infoAboutCards(msg, bot, collection)

                // Tops
                tops(msg, bot, collection)

                //house
                houses(msg, collection, bot, collectionHouses)
                donateHouses(msg, collection, bot, collectionHouses)
                HouseAdd(msg, bot, collectionHouses)
                HouseDonateAdd(msg, bot, collectionHouses)
                findHouseByName(msg, collection, bot, collectionHouses)
                houseBuy(msg, collection, bot, collectionHouses)
                houseDonateBuy(msg, collection, bot, collectionHouses)
                myHouseInfo(msg, collection, bot, collectionHouses)
                changeHousePrice(msg, bot, collectionHouses)
                changeHouseName(msg, bot, collectionHouses)
                sellHouse(msg, bot, collection, collectionHouses)

                // donates
                donateMenu(msg, bot, collection)
                donateInfo(msg, bot, collection)
                // Вызывайте эту функцию регулярно, например, каждый день или час
                setInterval(() => {
                    checkAndUpdateDonations(collection, bot, msg);
                    log('ok')
                }, 12 * 60 * 60 * 1000 ); // 24 часа или 12 часа

                // admin commands
                adminCommands(msg, bot, collection)
                toBeAnAdministrtorBot(msg, bot, collection, collectionAdmins)
                useKey(msg, bot, collectionAdmins)
                deleteGenKeys(msg, bot, collectionAdmins)

                //promo
                createPromo(msg, bot, collection, collectionPromo)
                createDonatePromo(msg, bot, collection, collectionPromo)
                usingPromo(msg, bot, collection, collectionPromo)

                if (text == 'testEditingStatuses') {
                    bot.sendChatAction(chatId, 'typing')
                    await collection.updateMany({ _id: ObjectId }, {
                        $set: {
                            status: [{
                                statusName: 'player',
                                purchaseDate: 0,
                                statusExpireDate: 0,
                            }]
                        }
                    })
                    bot.sendMessage(chatId, 'Успешна обновлена датабаза')
                }
            }
            else {
//                 await bot.sendMessage(chatId, `
// Сначала зарегистрируйся нажав на /start
//                 `, { reply_to_message_id: messageId })
            }
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
            shopCryptoCallback(msg, bot, collectionCrypto, collection)
            topWithBtns(msg, bot, collection)
            btnHouses(msg, bot, collection, collectionHouses)
            dayBonusCollectingBtn(msg, collection, bot)

            //donat BTNS
            donateBtns(msg, bot, collection)

            //admin commands
            adminCommandsWithBtn(msg, bot, collection)
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
