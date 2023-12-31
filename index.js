const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');
const apiKey = process.env.OPENWEATHER_API_KEY;

const botToken = process.env.BOT_TOKEN
const mongoDbUrl = process.env.MONGO_DB_URL
const adminId = parseInt(process.env.ADMIN_ID)

const { MongoClient, ObjectId, Collection } = require('mongodb');
const client = new MongoClient(mongoDbUrl);

const {
    kazino,
    gameSpin,
    gameBouling,
    gameFootball,
    gameRice,
    gameRiceNeed,
    gameRiceWithUser,
    gameRiceWithUserBtns,
} = require('./requests/games/games');

const {
    commandStart,
    commandHelp,
    commandHelpAsBtn,
    deleteAllUsers,
    userInfoReplyToMessage,
    userMsg,
    infoFromUGameId,
    userStatistics,
} = require('./requests/commands/commands');

const {
    userBalance,
    userEditGameId,
    userGameInfo,
    userEditGameName,
    myId,
    dayBonusCollectingBtn,
} = require('./requests/user/userInfo');

const { userUnMuteAll } = require('./requests/violations/userMute');

const {
    botInfo,
    deleteMessageBot,
    botVersionChange,
} = require('./requests/botInfo/botInfos');

const { giveMoney } = require('./requests/user/giveMoney');

const {
    extraditeMoney,
    takeMoney,
    takeAllMoney,
    extraditeUc,
    takeUc,
    takeAllUc,
    adminCommands,
    adminCommandsWithBtn,
    toBeAnAdministrtorBot,
    useKey,
    deleteGenKeys,
    infoWithTgId,
} = require('./requests/admin/adminCommands');

const {
    generateCardNumber,
    cardInfo,
    createUpdateCardPassword,
    setMoneyToCard,
    getMoneyFromOwnCard,
    infoAboutCards,
} = require('./requests/user/userBankCard');

const { tops, topWithBtns } = require('./requests/tops/tops');

const { referral, startWithRef } = require('./requests/referral/referral');

const {
    houses,
    HouseAdd,
    findHouseByName,
    houseBuy,
    myHouseInfo,
    changeHousePrice,
    sellHouse,
    donateHouses,
    houseDonateBuy,
    btnHouses,
    HouseDonateAdd,
    changeHouseName,
    houseDelete,
    lendHouse,
} = require('./requests/properties/houses/houses');

const {
    donateMenu,
    donateBtns,
    donateInfo,
    donateMenuStatuses,
    buyDiffDepozit,
} = require('./requests/donate/donate');

const { checkAndUpdateDonations } = require('./requests/donate/donatedUsers');

const { createPromo, usingPromo, createDonatePromo } = require('./requests/promo/promo');

const { handleBan } = require('./requests/violations/userBan');

const {
    limitations,
    removeLimit,
    updateDayLimitAtUTC9,
} = require('./requests/user/userLimitation');

const {
    cars,
    donateCars,
    CarAdd,
    CarDonateAdd,
    findCarByName,
    carBuy,
    carDonateBuy,
    myCarInfo,
    changeCarPrice,
    changeCarName,
    sellCar,
    btnCars,
    carDelete,
} = require('./requests/properties/cars/cars');

const { customChalk } = require('./customChalk');

const { mailing, mailingWithButtons } = require('./requests/mailing/mailing');

const {
    addAddvert,
    addverts,
    deleteAdd,
    deleteAllAddverts,
} = require('./requests/advert/advertising');

const {
    addBusiness,
    listBusinesses,
    buyBusiness,
    infoBusiness,
    workersInfo,
    buyWorkers,
    addProfitEveryOneHour,
    pulloffBusiness,
    payTaxForBusiness,
    manualAddProfitEveryOneHour,
    sellBusiness,
    addBusinessSpeeds,
    bustBusiness,
} = require('./requests/properties/business/business');

const {
    addContainers,
    listPriceMoneyContainers,
    buyPriceMoneyContainer,
    donateContainers,
} = require('./requests/containers/containers');

const {
    autoCreatePromoCodes,
    manualCreatePromoCodes,
    manualDeleteAllPromocodes,
    autoDeleteAllPromocodes,
} = require('./requests/auto/autoPromoAdd');

const { avatarMenu, addAvatar, avaChekAdmins } = require('./requests/avatar/avatar');

const { calcInfo, calc } = require('./requests/calc/calc');

const { botCommands } = require('./requests/botCommands/botCommands');

const {
    userPermissionInfo,
    addPermsForUser,
    addPermsToCollection,
    userPermsInfo,
} = require('./requests/userPermissions/userPremissionsBot');
const { globalReset } = require('./requests/globalReset/globalReset');
const { userDepozit, depozitAddMoney, pullMoneyDepozit } = require('./requests/bank/depozit');
const { openIsland, myIsland, islandCommands, islandProduct, islandNewName, infoIslandProfit, takeOfProfitIsland, renderIslandsWithBtn } = require('./requests/islands/islands');
const { testPayment } = require('./requests/donate/payments');
const { botName, mongoDbCollectionName, addingToDB, mongoConnect } = require('./mongoConnect');
const { myAchievements } = require('./requests/achievements/achievements');
const { openYTAcc, infoMyYTacc, changeNameYT } = require('./requests/properties/accounts/youtube');

client.connect()
    .then(() => {
        console.log(customChalk.colorize('SUCCESSFULLY CONNECTED TO DATABASE', { style: 'italic', background: 'bgGreen' }));
    }).catch((error) => {
        console.log(customChalk.colorize(`ERROR CONNECTING TO DATABASE ${error}`, { style: 'italic', background: 'bgRed' }));
    })

const db = client.db(mongoDbCollectionName);
const collection = db.collection('users');
const collectionBot = db.collection('botInfo')
const collectionCrypto = db.collection('crypto')
const collectionHouses = db.collection('houses')
const collectionAdmins = db.collection('administrators')
const collectionPromo = db.collection('promo')
const collectionCars = db.collection('cars')
const collectionAddvert = db.collection('addvertising')

const bot = new TelegramBot(botToken, { polling: true });

function log(e) {
    console.log(e)
}
const botLastIncludedTime = new Date()

// async function sendMsgWhenBotStarts() {
//     const [botInn, botInnOwner] = await Promise.all([
//         collectionBot.findOne({ id: adminId }),
//         collection.findOne({ id: adminId })
//     ]);

//     const ownerGameId = botInnOwner.gameId;
//     const updateUserBotInfo = await collection.countDocuments();
//     await collectionBot.updateOne({}, { $set: { registeredUsers: updateUserBotInfo } });

//     bot.sendMessage(adminId, `
// <b>Игровой айди Владельца бота: <a href='tg://user?id=${botInnOwner.id}'>${ownerGameId}</a></b>
// <b>Количество пользователей: ${updateUserBotInfo}</b>
// <b>Последнее время запуска бота или обновление бота: ${botLastIncludedTime}</b>
// <b>Версия: ${botInn.botVersion}</b>
//         `, { parse_mode: 'HTML' });
// }
let lastSentMessageId = [];

function start() {
    bot.setMyCommands([
        {
            command: '/help', description: 'Помощь'
        },
        // {
        //     command: '/admin', description: 'Админ'
        // },
    ])

    bot.on('location', async msg => {
        // Пример использования функции для получения погоды по координатам
        const longitude = msg.location.longitude
        const latitude = msg.location.latitude
        const chatId = msg.chat.id

        async function getWeatherByCoordinates(latitude, longitude) {
            try {
                const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);

                // Обработка ответа от API и извлечение информации о погоде
                const weatherData = response.data;
                const temperature = weatherData.main.temp;
                const description = weatherData.weather[0].description;
                const main = weatherData.weather[0].main;
                const countryName = weatherData.name
                const speed = weatherData.wind.speed
                const gust = weatherData.wind.gust

                // Отправка сообщения с информацией о погоде
                const message = `
Температура: ${temperature}°C
Погодные условия: ${description}
Погодные условия: ${main}
Страна: ${countryName}
                `;

                return message;
            } catch (error) {
                console.error('Ошибка при запросе к OpenWeatherMap API:', error);
                return 'Произошла ошибка при получении погоды.';
            }
        }

        getWeatherByCoordinates(latitude, longitude)
            .then((weatherMessage) => {
                bot.sendMessage(chatId, weatherMessage);
                // Отправьте сообщение с информацией о погоде пользователю
            });
    })

    // Обработчик события оповещения о входе нового участника
    bot.on('new_chat_members', async (msg) => {
        bot.sendMessage(msg.chat.id, 'Напиши в личку бота что бы иметь полный доступ к моим командам', { reply_to_message_id: msg.message_id })
    });

    // Обработчик события оповещения об уходе участника из чата
    bot.on('left_chat_member', async (msg) => {
        // deleteMessageBot(msg, bot);
        // bot.sendMessage(msg.chat.id, 'Ну и ху* с ним', { reply_to_message_id: msg.message_id })
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

    bot.on('video', async msg => {
        const video = msg.video.file_id
        const userId = msg.from.id
        const messageId = msg.message_id

        bot.sendMessage(userId, `<code>${video}</code>`, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    })

    bot.on('voice', async msg => {
        const voice = msg.voice.file_id
        const userId = msg.from.id
        const messageId = msg.message_id

        bot.sendMessage(userId, `<code>${voice}</code>`, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    })

    bot.on('photo', msg => {
        const photo = msg.photo[0].file_id
        const userId = msg.from.id

        bot.sendMessage(userId, `<code>${photo}</code>`, { parse_mode: 'HTML' })
    })

    bot.on('message', async msg => {
        const text = msg.text
        const userId = msg.from.id
        const chatId = msg.chat.id
        const messageId = msg.message_id
        const me = await bot.getMe()

        const opt = { emoji: '⚽️' }

        if (text === 'бк') {
            bot.sendDice(chatId, opt)
            console.log(me);
        }
    })

    // bot.on('message', async msg => {
    //     const ce = msg.dice.value
    //     console.log(ce);
    // })

    bot.on('message', async msg => {
        const userId = msg.from.id
        const text = msg.text
        const chatId = msg.chat.id
        const messageId = msg.message_id

        if (!text) {
            return;
        }

        const user = await collection.findOne({ id: userId });


        //start
        if (text.toLowerCase() === '/start' || text == '/start@levouJS_bot') {
            commandStart(msg, collection, bot)
            log(customChalk.colorize(`Успешно зарегистрирован ${userId}`, { style: 'underline', background: 'bgGreen' }))
        }

        //ref start
        else if (text.toLowerCase().startsWith('/start ref_')) {
            startWithRef(msg, bot, collection)
            log(customChalk.colorize(`Успешно зарегистрирован через реф ${userId}`, { style: 'underline', background: 'bgGreen' }))
        }

        else if (!botCommands.includes(text.toLowerCase()) && !user) {
            return;
        }

        else if (!!user) {
            const userBanStatus = user.ban[0].ban
            if (userBanStatus === true) {
                if (botCommands.includes(text.toLowerCase())) {
                    if (chatId === userId) {
                        try {
                            await bot.sendMessage(user.id, `
Вы были забанены в боте
                        `, {
                                parse_mode: 'HTML',
                            })
                        }
                        catch (err) {
                            if (err.response.status === 403) {
                                console.log('пользователь заблокировал бота');
                            }
                            else {
                                console.log("err send ban status " + err);
                            }
                        }
                    }
                    else {
                        const dateBan = new Date(user.ban[0].banTime)
                        await bot.sendMessage(chatId, `
Вы были забанены в боте
<b>Причина:</b> ${user.ban[0].cause}
<b>Время бана:</b> ${dateBan.toLocaleDateString()}
<b>Время до:</b> ${user.ban[0].unbanTime === null ? 'Навсегда' : user.ban[0].unbanTime}
                        `, {
                            parse_mode: 'HTML',
                            reply_to_message_id: messageId,
                        })
                    }
                }
                return;
            }

            //
            const parts = text.split(' ')
            function SIQCCtxts(string) {
                return `${botName} ${string}`.toLowerCase()
            }

            //calc
            if (['calc', 'cl'].includes(text.toLowerCase())) {
                calcInfo(msg, bot)
            }

            else if (text.toLowerCase().startsWith('кт')) {
                calc(msg, bot)
            }

            // avatar
            else if (text.toLowerCase() === 'ава') {
                avatarMenu(msg, bot)
            }
            else if (text.toLowerCase().startsWith('+ава')) {
                let glLengthAvatarAdd = 1
                addAvatar(msg, bot, glLengthAvatarAdd)
            }
            else if (text.toLowerCase() === SIQCCtxts('+ава')) {
                let glLengthAvatarAdd = 2
                addAvatar(msg, bot, glLengthAvatarAdd)
            }

            // manual create
            else if (text.toLowerCase() === 'manualpromo' || text === 'mP') {
                manualCreatePromoCodes(msg, bot, collection)
                await bot.sendMessage(chatId, `Вот команды которые понадобяться 
<code>mBP</code>, <code>mUD</code>, <code>упдлимиты</code>
                `, { parse_mode: 'HTML' })
            }

            // CTY -> Ccntainers
            else if (text === 'addingContainer') {
                addContainers(msg)
            }
            else if (['конты', 'контейнеры', 'conts', 'containers'].includes(text.toLowerCase())) {
                listPriceMoneyContainers(msg, bot, collection)
            }
            else if (text.toLowerCase().startsWith('открыть контейнер')) {
                let glLengthBuyCont = 2
                buyPriceMoneyContainer(msg, bot, collection, glLengthBuyCont)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('открыть контейнер'))) {
                let glLengthBuyCont = 3
                buyPriceMoneyContainer(msg, bot, collection, glLengthBuyCont)
            }

            // businesses
            else if (text.toLowerCase() === 'testadd business') {
                addBusiness(msg, bot)
            }
            else if (text.toLowerCase() === 'бизнесы') {
                listBusinesses(msg, bot, collection)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('купить бизнес'))) {
                let glLengthBuyB = 3
                buyBusiness(msg, bot, collection, glLengthBuyB)
            }
            else if (text.toLowerCase().startsWith('купить бизнес')) {
                let glLengthBuyB = 2
                buyBusiness(msg, bot, collection, glLengthBuyB)
            }
            else if (text.toLowerCase() === 'мой бизнес') {
                infoBusiness(msg, bot, collection)
            }
            else if (text.toLowerCase() === 'инфо бработники') {
                workersInfo(msg, bot, collection)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('купить бработников'))) {
                let glLengthBWorkers = 3
                buyWorkers(msg, bot, collection, glLengthBWorkers)
            }
            else if (text.toLowerCase().startsWith('купить бработников')) {
                let glLengthBWorkers = 2
                buyWorkers(msg, bot, collection, glLengthBWorkers)
            }
            else if (text.toLowerCase() === 'бизнес снять' || text.toLowerCase() === SIQCCtxts('бизнес снять')) {
                pulloffBusiness(msg, bot, collection)
            }
            else if (text.toLowerCase() === 'бизнес налоги' || text.toLowerCase() === SIQCCtxts('бизнес налоги')) {
                payTaxForBusiness(msg, bot, collection)
            }
            else if (text.toLowerCase() === 'продать бизнес' || text.toLowerCase() === SIQCCtxts('продать бизнес')) {
                sellBusiness(msg, bot, collection)
            }
            else if (text === 'mBP') {
                manualAddProfitEveryOneHour(msg, bot, collection)
            }
            else if (text.toLowerCase().startsWith('купить ббуст')) {
                addBusinessSpeeds(msg, bot, collection, 2)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('купить ббуст'))) {
                addBusinessSpeeds(msg, bot, collection, 3)
            }
            if (text.toLowerCase() === 'бизнес ускорить' || text.toLowerCase() === SIQCCtxts('бизнес ускорить')) {
                bustBusiness(msg, bot, collection)
            }

            //addvert
            if (text.toLowerCase().startsWith(SIQCCtxts('+рек'))) {
                let globLength = 2
                let toSliceLength = parts[0] + " " + parts[1]
                addAddvert(msg, bot, collectionAddvert, collection, globLength, toSliceLength)
            }
            else if (['+add', '+рек', '+реклама'].includes(parts[0].toLowerCase())) {
                let globLength = 1
                let toSliceLength = parts[0]
                addAddvert(msg, bot, collectionAddvert, collection, globLength, toSliceLength)
            }
            else if (['рекламы', 'adds', 'рекы'].includes(text.toLowerCase())) {
                addverts(msg, bot, collection, collectionAddvert)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('-рек'))) {
                let globLengthAdd = 2
                deleteAdd(msg, bot, collection, collectionAddvert, globLengthAdd)
            }
            else if (['-add', '-рек', '-реклама'].includes(parts[0].toLowerCase())) {
                let globLengthAdd = 1
                deleteAdd(msg, bot, collection, collectionAddvert, globLengthAdd)
            }
            else if (['!add -all', 'рек -все'].includes(text.toLowerCase())) {
                deleteAllAddverts(msg, bot, collectionAddvert, collection)
            }

            // help
            else if (text.toLowerCase() === '/help' || text.toLowerCase() === 'помощь' || text === '/help@levouJS_bot') {
                commandHelp(msg, collection, bot)
            }

            // ref
            else if (['ref', '!ref', 'реф', '!реф'].includes(text.toLowerCase())) {
                referral(msg, bot, collection)
            }

            // balance
            else if (['б', 'баланс', 'b', 'balance'].includes(text.toLowerCase())) {
                userBalance(msg, collection, bot, collectionAddvert)
            }

            // games
            if (text.toLowerCase().startsWith(SIQCCtxts('казино'))) {
                let valueIndex = 2
                kazino(msg, collection, bot, valueIndex)
            }
            else if (text.toLowerCase().startsWith('казино')) {
                let valueIndex = 1
                kazino(msg, collection, bot, valueIndex)
            }
            else if (text.toLowerCase().startsWith('бгонка')) {
                gameRice(msg, bot, collection, 1)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('бгонка'))) {
                gameRice(msg, bot, collection, 2)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('спин'))) {
                let valueIndex = 2
                gameSpin(msg, bot, collection, valueIndex)
            }
            else if (text.toLowerCase().startsWith('спин')) {
                let valueIndex = 1
                gameSpin(msg, bot, collection, valueIndex)
            }
            else if (text.toLowerCase().startsWith('гонка')) {
                gameRiceWithUser(msg, bot, collection, 1)
            }

            // car settings
            if (text.toLowerCase().startsWith('автомобиль')) {
                gameRiceNeed(msg, bot, collection, 1)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('автомобиль'))) {
                gameRiceNeed(msg, bot, collection, 2)
            }

            // info
            if (['инфо', 'профиль'].includes(text.toLowerCase())) {
                userGameInfo(msg, bot, collection)
            }

            // Edit game ID
            else if (text.toLowerCase().startsWith('сменить айди')) {
                userEditGameId(msg, bot, collection)
            }

            //Edit game NAME
            else if (text.toLowerCase().startsWith('сменить ник')) {
                userEditGameName(msg, bot, collection)
            }

            // MUTE  
            else if (text === '/unmuteall') {
                userUnMuteAll(msg, bot, collection)
            }

            // BAN
            else if (text.toLowerCase().startsWith('/ban_bot')) {
                handleBan(msg, bot, collection)
            }

            //Bot Info
            if (text.toLowerCase() === 'botinfo') {
                botInfo(msg, collectionBot, bot, collection)
            }
            else if (text.toLowerCase().startsWith('botversion')) {
                botVersionChange(msg, bot, collectionBot, collection)
            }

            // Give Money
            if (text.toLowerCase().startsWith('дать')) {
                giveMoney(msg, bot);
            }

            // Func /msg
            // userMsg(msg, collection, bot,)

            //delete All Users = это функцию можешь использовать когда обновляешь бота или добавляешь что-то новое в датабазу MONGODB
            if (text.toLowerCase() === 'удалить всех пользователей' || text.toLowerCase() === 'увп') {
                deleteAllUsers(msg, collection, bot, ObjectId)
            }

            //my ID
            if (['айди', 'мой айди', 'my id', 'myid', 'id'].includes(text.toLowerCase())) {
                myId(msg, bot, collection)
            }

            //info ID
            if (text.toLowerCase() == '.info') {
                userInfoReplyToMessage(msg, bot, collection)
            }

            //Выдача отбор денег
            if (text.toLowerCase().startsWith('выдать')) {
                extraditeMoney(msg, collection, bot)
            }
            else if (text.toLowerCase().startsWith('забрать')) {
                takeMoney(msg, collection, bot)
            }
            else if (text.toLowerCase() === 'деньги забрать все') {
                takeAllMoney(msg, collection, bot)
            }

            // Выдача отбор UC
            if (text.toLowerCase().startsWith('uc выдать') || text.toLowerCase().startsWith('ус выдать')) {
                extraditeUc(msg, collection, bot)
            }
            else if (text.toLowerCase().startsWith('ус забрать') || text.toLowerCase().startsWith('uc забрать')) {
                takeUc(msg, collection, bot)
            }
            else if (text.toLowerCase() === 'uc забрать все' || text.toLowerCase() === 'ус забрать все') {
                takeAllUc(msg, collection, bot)
            }

            // Пластик карты
            if (text.toLowerCase() == 'инфо карта') {
                infoAboutCards(msg, bot);
            }
            else if (text.toLowerCase() === 'карта создать') {
                generateCardNumber(msg, bot, collection);
            }
            else if (text.toLowerCase() === 'моя карта') {
                cardInfo(msg, bot);
            }
            else if (text.toLowerCase().startsWith('+карта пароль')) {
                createUpdateCardPassword(msg, bot);
            }
            else if (text.toLowerCase().startsWith('карта положить') || text.toLowerCase().startsWith('карта пополнить')) {
                setMoneyToCard(msg, bot, collection);
            }
            else if (text.toLowerCase().startsWith('карта снять')) {
                getMoneyFromOwnCard(msg, bot, collection);
            }

            // Tops
            if (text.toLowerCase() === 'топ') {
                tops(msg, bot, collection)
            }

            //house
            if (text.toLowerCase() === 'дома') {
                houses(msg, collection, bot, collectionHouses)
            }
            else if (text.toLowerCase() === 'донат дома') {
                donateHouses(msg, collection, bot, collectionHouses)
            }
            else if (text.toLowerCase().startsWith('+дом')) {
                HouseAdd(msg, bot, collectionHouses)
            }
            else if (text.toLowerCase().startsWith('+донатдом')) {
                HouseDonateAdd(msg, bot, collectionHouses)
            }
            else if (text.toLowerCase().startsWith('купить дом')) {
                houseBuy(msg, collection, bot, collectionHouses)
            }
            else if (text.toLowerCase().startsWith('купить донатдом')) {
                houseDonateBuy(msg, collection, bot, collectionHouses)
            }
            else if (text.toLowerCase() === 'мой дом') {
                myHouseInfo(msg, collection, bot, collectionHouses)
            }
            else if (text.toLowerCase().startsWith('дом цена')) {
                changeHousePrice(msg, bot, collectionHouses)
            }
            else if (text.toLowerCase().startsWith('дом имя')) {
                changeHouseName(msg, bot, collectionHouses, collection)
            }
            else if (text.toLowerCase() === 'продать дом' || text.toLowerCase() === SIQCCtxts('продать дом')) {
                sellHouse(msg, bot, collection, collectionHouses)
            }
            else if (text.toLocaleLowerCase().startsWith('-дом')) {
                houseDelete(msg, bot, collectionHouses, collection)
            }
            else if (text.toLowerCase() === 'дом аренда' || text.toLowerCase() === SIQCCtxts('дом аренда')) {
                lendHouse(msg, bot, collection, collectionHouses)
            }

            // cars
            if (text.toLowerCase() === 'машины') {
                cars(msg, collection, bot, collectionCars)
            }
            else if (text.toLowerCase() === 'донат машины') {
                donateCars(msg, collection, bot, collectionCars)
            }
            else if (text.toLowerCase().startsWith('+машина')) {
                CarAdd(msg, bot, collectionCars)
            }
            else if (text.toLowerCase().startsWith('+донатмашина')) {
                CarDonateAdd(msg, bot, collectionCars)
            }
            else if (text.toLowerCase().startsWith('купить машину')) {
                carBuy(msg, collection, bot, collectionCars)
            }
            else if (text.toLowerCase().startsWith('купить донатмашину')) {
                carDonateBuy(msg, collection, bot, collectionCars)
            }
            else if (text.toLowerCase() === 'моя машина') {
                myCarInfo(msg, collection, bot, collectionCars)
            }
            else if (text.toLowerCase().startsWith('машина цена')) {
                changeCarPrice(msg, bot, collectionCars)
            }
            else if (text.toLowerCase().startsWith('машина имя')) {
                changeCarName(msg, bot, collectionCars)
            }
            else if (text.toLowerCase() === 'продать машину' || text.toLowerCase() === SIQCCtxts('продать машину')) {
                sellCar(msg, bot, collection, collectionCars)
            }
            else if (text.toLowerCase().startsWith('-машина')) {
                carDelete(msg, bot, collectionCars, collection)
            }

            // donates
            if (text.toLowerCase() === 'донат') {
                donateMenu(msg, bot, collection)
            }
            else if (text.toLowerCase() === 'мой статус') {
                donateInfo(msg, bot, collection)
            }

            // admin commands
            if (['/admin', 'admin', 'админ', 'команды админа'].includes(text.toLowerCase())) {
                adminCommands(msg, bot, collection)
            }
            else if (text.toLowerCase() === 'bot give me a key administrator') {
                toBeAnAdministrtorBot(msg, bot, collection, collectionAdmins)
            }
            else if (text.toLowerCase().startsWith('key')) {
                useKey(msg, bot, collectionAdmins)
            }
            else if (text.toLowerCase() === 'delete generated admin keys') {
                deleteGenKeys(msg, bot, collectionAdmins)
            }

            //promo
            if (text.toLowerCase().startsWith('+промо')) {
                createPromo(msg, bot, collection, collectionPromo)
            }
            else if (text.toLowerCase().startsWith('+дпромо')) {
                createDonatePromo(msg, bot, collection, collectionPromo)
            }
            else if (text.toLowerCase().startsWith('промо')) {
                usingPromo(msg, bot, collection, collectionPromo)
            }
            else if (text.toLowerCase() === 'del all promo') {
                manualDeleteAllPromocodes(bot)
            }

            // Лимиты
            if (text.toLowerCase() === 'лимит') {
                limitations(msg, bot, collection)
            }
            else if (text.toLowerCase() === 'упдлимиты' || text.toLowerCase() === 'upd limit') {
                removeLimit(msg, bot, collection, ObjectId)
            }

            // Рассылка
            if (['!рас', '!mail', '!рассылка'].includes(parts[0].toLowerCase())) {
                mailing(msg, bot, collection)
            }
            else if (text.toLowerCase().startsWith('!крас')) {
                mailingWithButtons(msg, bot, collection)
            }

            // user permissions
            if (text.toLowerCase() === 'мои права') {
                userPermissionInfo(msg, bot, collection)
            }
            else if (text.toLowerCase() === '+права') {
                addPermsForUser(msg, bot, collection)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('права'))) {
                addPermsToCollection(msg, bot, collection)
            }
            else if (text.toLowerCase() === 'разрешения') {
                userPermsInfo(msg, bot, collection)
            }

            // manual update donates
            else if (text === 'mUD') {
                checkAndUpdateDonations(collection)
            }

            // global reset
            if (text.toLowerCase() === 'gl reset' || text.toLowerCase() === 'обнул') {
                globalReset(msg, bot, collection)
            }

            // depozit
            if (text.toLowerCase() === 'депозит') {
                userDepozit(msg, bot, collection)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('депозит пополнить'))) {
                depozitAddMoney(msg, bot, collection, 3)
            }
            else if (text.toLowerCase().startsWith('депозит пополнить')) {
                depozitAddMoney(msg, bot, collection, 2)
            }
            else if (text.toLowerCase() === '+деп процент' || text.toLowerCase() === SIQCCtxts('+деп процент')) {
                buyDiffDepozit(msg, bot, collection)
            }

            // islands
            if (text.toLowerCase() === SIQCCtxts('открыть остров')) {
                openIsland(msg, bot, collection)
            }
            else if (text.toLowerCase() === 'открыть остров' || text.toLowerCase() === 'создать остров') {
                openIsland(msg, bot, collection)
            }
            else if (text.toLowerCase() === 'мой остров') {
                myIsland(msg, bot, collection)
            }
            else if (text.toLowerCase() === 'команды острова' || text.toLowerCase() === SIQCCtxts('команды острова')) {
                islandCommands(msg, bot, collection)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('+остров'))) {
                islandProduct(msg, bot, collection, 2, 3)
            }
            else if (text.toLowerCase().startsWith('+остров')) {
                islandProduct(msg, bot, collection, 1, 2)
            }
            else if (text.toLowerCase().startsWith('остров имя')) {
                islandNewName(msg, bot, collection, 10)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('остров имя'))) {
                islandNewName(msg, bot, collection, 23)
            }
            else if (text.toLowerCase() === 'остров инфо') {
                infoIslandProfit(msg, bot, collection)
            }
            else if (text.toLowerCase() === 'остров казна снять') {
                takeOfProfitIsland(msg, bot, collection)
            }
            else if (text.toLowerCase() === SIQCCtxts('остров казна снять')) {
                takeOfProfitIsland(msg, bot, collection)
            }

            // info from user game id
            if (text.toLowerCase().startsWith('.info_id')) {
                infoFromUGameId(msg, bot, collection)
            }
            else if (text.toLowerCase().startsWith('/info_id')) {
                infoWithTgId(msg, bot, collection)
            }

            if (text.toLowerCase() === 'donatepay') {
                testPayment(msg, bot)
            }

            if (text.toLowerCase() === 'стата') {
                userStatistics(msg, bot, collection)
            }
            else if (text.toLowerCase() === 'достижения') {
                myAchievements(msg, bot, collection)
            }

            if (text.toLowerCase() === SIQCCtxts('открыть ютуб')) {
                openYTAcc(msg, bot)
            }
            else if (text.toLowerCase() === 'открыть ютуб') {
                openYTAcc(msg, bot)
            }
            else if (text.toLowerCase() === 'мой ютуб') {
                infoMyYTacc(msg, bot)
            }
            else if (text.toLowerCase() === SIQCCtxts('мой ютуб')) {
                infoMyYTacc(msg, bot)
            }
            else if (text.toLowerCase().startsWith('+ник ютуб')) {
                changeNameYT(msg, bot, 2)
            }
            else if (text.toLowerCase().startsWith(SIQCCtxts('+ник ютуб'))) {
                changeNameYT(msg, bot, 3)
            }

            // Обработчик предварительного запроса по оплате.
            bot.on('pre_checkout_query', (query) => {
                bot.answerPreCheckoutQuery(query.id, true);
            });

            // Обработчик успешной оплаты.
            bot.on('successful_payment', (msg) => {
                bot.sendMessage(msg.chat.id, 'SuccessfulPayment');
            });
            // ----------------------------------------------------------------
            // if (text.toLowerCase().startsWith('asdf')) {
            //     bot.sendMessage(chatId, `это эмоджи ${text}`)
            // }
            if (text.toLowerCase() === 'test') {
                const width = 300;
                const height = 200;

                // new Jimp(width, height, (err, image) => {
                //     if (err) {
                //         console.error(err);
                //         return;
                //     }

                //     Jimp.read('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSAjEAS2zJ_0rhf7IZP0TAUwpPSZjfU_bXK1w&usqp=CAU', async (backgroundErr, background) => {
                //         if (backgroundErr) {
                //             console.error(backgroundErr);
                //             return;
                //         }

                //         const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

                //         image.composite(background, 0, 0, {
                //             mode: Jimp.BLEND_SOURCE_OVER,
                //             opacityDest: 1,
                //             opacitySource: 1,
                //         }); // Устанавливаем фоновое изображение
                //         image.print(font, 10, 10, 'hello'); // Добавляем текст

                //         image.getBuffer(Jimp.MIME_PNG, (bufferErr, buffer) => {
                //             if (bufferErr) {
                //                 console.error(bufferErr);
                //                 return;
                //             }

                //             bot.sendPhoto(chatId, buffer);
                //         });
                //     });
                // });
            }
            if (text === 'hellsadasd') {
                const collectionAchievs = await mongoConnect('achievs');
                const user = await collection.find({ _id: ObjectId })
                const deletedUsers = await user.map((doc) => doc.id).toArray();

                await deletedUsers.forEach(async (e) => {
                    const newAdded = await collectionAchievs.findOne({ id: e })
                    if (newAdded !== null) {
                        return console.log('уже добавлен ' + e);
                    }
                    await collectionAchievs.insertOne({
                        id: e,
                        race: [{
                            botRacing: 0,
                            maxBotRacing: 50,
                            cost: 5,
                        }],
                        kazino: [{
                            kazino: 0,
                            maxKazino: 100,
                            cost: 5,
                        }],
                        case: [{
                            openCase: 0,
                            maxOpenCase: 10,
                            cost: 10,
                        }],
                        car: [{
                            buyCar: false,
                            cost: 5,
                        }],
                        house: [{
                            buyHouse: false,
                            cost: 5,
                        }],
                        island: [{
                            openIsland: false,
                            cost: 5,
                        }],
                        business: [{
                            buyBusiness: false,
                            cost: 10,
                        }]
                    })
                })
            }

            // add test user
            if (text === 'newUser') {
                await addingToDB(collection, 888)
            }

            if (text == 'testEditingStatuses') {
                bot.sendChatAction(chatId, 'typing')
                await collection.updateMany({ _id: ObjectId }, {
                    $unset: {
                        "properties.0.test": 0
                    }
                });
                bot.sendMessage(chatId, 'Успешна обновлена датабаза')
            }
            if (text === 'renameUpdHauses') {
                await collection.updateMany({ _id: ObjectId }, {
                    $rename: {

                    }
                })
            }
            if (text === 'addnewValue') {
                await collectionCars.updateOne({ name: '' }, {
                    $set: {
                        speed: 0
                    }
                })
                bot.sendMessage(chatId, `res`)
            }
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
            commandHelpAsBtn(msg, bot, userGameName, collection)
            // shopCryptoCallback(msg, bot, collectionCrypto, collection)
            topWithBtns(msg, bot, collection)

            // avatar
            avaChekAdmins(msg, bot)

            // conts 
            donateContainers(msg, bot, collection)

            // crypto currence
            // payTransactions(msg, bot, collection)

            btnHouses(msg, bot, collection, collectionHouses)
            btnCars(msg, bot, collection, collectionCars)

            dayBonusCollectingBtn(msg, collection, bot)

            //donat BTNS
            donateBtns(msg, bot, collection)
            donateMenuStatuses(msg, bot, collection)

            //admin commands
            adminCommandsWithBtn(msg, bot, collection)

            //depozit
            pullMoneyDepozit(msg, bot, collection)

            // render islands
            if (data.startsWith('renderIslands')) {
                renderIslandsWithBtn(msg, bot, collection)
            }

            // game rice with user
            if (data.startsWith('riceWithUserAcc') || data.startsWith('riceWithUserRej')) {
                gameRiceWithUserBtns(msg, bot, collection)
            }
        }
        else {
            bot.sendMessage(chatId, `
Сначала зарегистрируйся нажав на /start
            `)
            log(user)
        }
    })
}

// Обновление лимита и добавление прибыля на бизнесы будут изменятся каждый день в 9 утра

cron.schedule('0 9 * * *', () => {
    updateDayLimitAtUTC9(bot, collection).catch(err => {
        console.error('Ошибка при обновлении лимита:', err);
    });
    log(customChalk.colorize('Успешно изменены лимиты', { style: 'bold', background: 'bgRed' }))
});

cron.schedule('0 9 * * *', () => {
    // auto create promo
    autoCreatePromoCodes(bot)

    autoDeleteAllPromocodes(bot).catch(err => {
        console.error('Ошибка при удалении промокодов:', err);
    })
});

cron.schedule('0 0 */3 * *', () => {
    console.log('Добавление прибыли на бизнесы...');
    addProfitEveryOneHour(collection).catch(err => {
        console.error('Ошибка при добавлении прибыли на бизнесы:', err);
    });
})

// Вызывайте эту функцию регулярно, например, каждый день или час
cron.schedule('0 */12 * * *', () => {
    checkAndUpdateDonations(collection);
}) // 24 часа или 12 часа или 6

if (process.argv.includes('abdullohTOP')) {
    // collectionBot.updateOne({}, { $set: { botLastIncTime: botLastIncludedTime } })
    // пароль для кода
}
else {
    console.log('неправильно введена пароль кода');
}

start()
log(customChalk.colorize(`Бот запущён и работает </>`, { style: 'bold', background: 'bgBlue' }))