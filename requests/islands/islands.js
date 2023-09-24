const { donatedUsers } = require("../donate/donatedUsers");
const { formatNumberInScientificNotation } = require('../systems/systemRu');
const { mongoConnect } = require('../../mongoConnect');


function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
}

async function checkAndUpdateIslands(userId1) {
    const collectionIslands = await mongoConnect('islands')

    const island = await collectionIslands.findOne({ id: userId1 });
    const foods = parseInt(island.foods);
    const waters = parseInt(island.waters);
    const population = parseInt(island.population);
    const place = island.place;
    const workPopulation = island.workPopulation;

    // companies
    const airLines = parseInt(island.airLines);
    const restaurants = parseInt(island.restaurants);
    const shops = parseInt(island.shops);
    const boats = parseInt(island.boats);
    const carFactory = parseInt(island.carFactory);
    const allWorks = (airLines + restaurants + shops + boats + carFactory) * 6;

    // island workers profit
    const islandWorkersProfit = Math.floor(allWorks * 10);
    const islandWorkersBalance = Math.floor((islandWorkersProfit / 100) * 40);
    const islandOwnerBalance = Math.floor((islandWorkersProfit / 100) * 60);

    // island place
    const changedPopulation = Math.floor((foods + waters) / 20);
    const changedPlace = (changedPopulation / 5).toFixed(2);

    const returnedMessage = `
было: ${population.toLocaleString('de-DE')}
стало: ${changedPopulation.toLocaleString('de-DE')}

было: ${place} км²
стало: ${changedPlace} км²
в датабазу: ${changedPlace} км²

было работающих: ${workPopulation.toLocaleString('de-DE')}
стало работающих: ${allWorks.toLocaleString('de-DE')}

Общая зарплата: ${islandWorkersProfit.toLocaleString('de-DE')}$
Зарплата жителей: ${islandWorkersBalance.toLocaleString('de-DE')}$ (40%)
Зарплата меру острова: ${islandOwnerBalance.toLocaleString('de-DE')}$ (60%)
    `

    await collectionIslands.updateOne({ id: userId1 }, {
        $set: {
            place: parseInt(changedPlace),
            workPopulation: parseInt(allWorks),
            population: changedPopulation,
        }
    });

    return returnedMessage;
}

async function openIsland(msg, bot, collection) {
    const collectionIslands = await mongoConnect('islands')

    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const userIsland = await collectionIslands.findOne({ id: userId1 })
    const user = await collection.findOne({ id: userId1 })
    const userName = user.userName
    const generatedString = generateRandomString(7)
    const startNameIsland = `Смени имя острова_${generatedString}`

    const date = new Date()
    date.setDate(date.getDate() + 1);

    if (!userIsland) {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно открыли свой остров
<b>Название:</b> <i>${startNameIsland}</i>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        await collectionIslands.insertOne({
            id: userId1,
            name: startNameIsland,
            owner: userName,
            population: 10,
            workPopulation: 0,
            place: 2,
            balance: 1000,
            foods: 100,
            maxFoods: 5000,
            waters: 100,
            maxWaters: 5000,
            airLines: 0,
            restaurants: 0,
            shops: 0,
            boats: 0,
            carFactory: 0,
            lastProfitTime: date,
        })
        return;
    }

    const islandName = userIsland.name
    bot.sendMessage(chatId, `
${userDonateStatus}, у вас уже есть остров под 
<b>Названием:</b> <u>${islandName}</u>

<b>Напишите:</b> <code>мой остров</code> инфо об острове
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
}

/**
 * Retrieves information about a user's island and sends a message with the island details.
 * If the user does not have an island, a message is sent indicating that they need to open an island.
 * The function also updates the island's balance and other properties if it is time for the island to receive a profit.
 * @param {object} msg - The message object containing information about the user and chat.
 * @param {object} bot - The bot object used to send messages.
 * @param {object} collection - The collection object used to interact with the database.
 * @returns {Promise<void>}
 */
async function myIsland(msg, bot, collection) {
    const collectionIslands = await mongoConnect('islands')

    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const userDonateStatus = await donatedUsers(msg, collection);
    const island = await collectionIslands.findOne({ id: userId });

    if (!island) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас нет острова, чтобы открыть его вам нужно прописать команду открыть остров 
<b>Открытие острова бесплатно !</b> <code>открыть остров</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        });
        return;
    }

    const {
        name: islandName,
        owner: islandOwner,
        population: islandPopulation,
        workPopulation: islandWorkPopulation,
        maxFoods: islandMaxFoods,
        maxWaters: islandMaxWaters,
        place: islandPlace,
        lastProfitTime,
        balance,
        foods,
        waters,
        airLines,
        restaurants,
        shops,
        boats,
        carFactory,
    } = island;

    const lastProfitDate = new Date(lastProfitTime).getDate().toLocaleString();
    const currentDate = new Date().getDate().toLocaleString();
    const formattedLastProfitDate = new Date(lastProfitTime).toLocaleString();
    const nextProfitDate = new Date();
    nextProfitDate.setDate(nextProfitDate.getDate() + 1);

    const allWorks = (airLines + restaurants + shops + boats + carFactory) * 6;
    const islandWorkersProfit = Math.floor(allWorks * 10);
    const islandWorkersBalance = Math.floor((islandWorkersProfit / 100) * 40);
    const islandOwnerBalance = Math.floor((islandWorkersProfit / 100) * 60);

    let txtMessage = `<b>📅Время зарплаты:</b>\n  └<b>Дата:</b> <i>${formattedLastProfitDate}</i>`;
    let willUpdImg = 1

    let mathIslandFoods = islandPopulation * 2
    if (mathIslandFoods > foods || mathIslandFoods > waters) {
        if (lastProfitDate <= currentDate) {
            willUpdImg = 2
            txtMessage = `<b>Не возможно получить ЗП</b>\n  └<b>Причина:</b> <i>Не хватка пищи !</i>`
        }
    }

    if (lastProfitDate <= currentDate && willUpdImg === 1) {
        await collectionIslands.updateOne({ id: userId }, {
            $inc: {
                balance: islandOwnerBalance,
                foods: -islandPopulation * 2,
                waters: -islandPopulation * 2,
            },
        }).then(() => {
            // updating profit
        }).catch((err) => {
            console.log('error island add profit ' + err);
        });

        await collectionIslands.updateOne({ id: userId }, { $set: { lastProfitTime: nextProfitDate } });

        txtMessage = `<b>📅Время зарплаты:</b>\n  └<b>Вы успешно обновили следующую выдачу зарплаты ↓</b>\n  └<b>Новая дата:</b> <i>${nextProfitDate.toLocaleDateString()}</i>\n  └<b>Зарплата успешно получена:</b> <i>${islandOwnerBalance}</i>`;
        willUpdImg = 3
    }

    await checkAndUpdateIslands(userId);
    const newIslandBal = balance.toLocaleString('de-DE');
    const islandFoods = foods;
    const islandWaters = waters;
    const txtOfInfoIsland = `
${userDonateStatus}, вот информация за ваш остров🏝

<b>🏄‍♂Мер:</b> <i>${islandOwner}</i>
<b>😎Название:</b> <i>${islandName}</i>
<b>💰Казна:</b> <i>${newIslandBal}$</i>
<b>👫Жителей:</b> <i>${islandPopulation}</i>
    └<b>👨‍🌾Работающие:</b> <i>${islandWorkPopulation}</i>

<b>⚖️Зарплата:</b>
    └<b>Мера:</b> <i>${islandOwnerBalance.toLocaleString('de-DE')}</i>$ (60%)
    └<b>Работающих:</b> <i>${islandWorkersBalance.toLocaleString('de-DE')}</i>$ (40%)

<b>🙎‍♂Территория:</b> <i>${islandPlace}</i> км²

<b>🥑Пищи:</b>
    └<b>🌭Еды:</b> <i>${islandFoods} / ${islandMaxFoods}</i>
    └<b>💦Воды:</b> <i>${islandWaters} / ${islandMaxWaters}</i>

<b>👷‍♂Работы:</b>
    └<b>👨‍✈️Авиакомпании:</b> <i>${airLines} / 10</i>
    └<b>🏫Рестораны:</b> <i>${restaurants} / 10</i>
    └<b>🏪Магазины:</b> <i>${shops} / 10</i>
    └<b>🛥Кораблей:</b> <i>${boats} / 10</i>
    └<b>🚙Завод машин:</b> <i>${carFactory} / 10</i>

${txtMessage}

<b>😊Все команды острова🏝 можно узнать отправив команду!</b> <code>команды острова</code>
<b>💸Вы сами обновляете ежедневную зарплату.
Сделано чтобы острова хоть этим способом привлекали внимание 😜.
Напишите <code>остров инфо</code> чтобы узнать что это за функция</b>
    `

    // warn foods
    if (willUpdImg === 1) {
        bot.sendPhoto(chatId, 'https://th.bing.com/th/id/OIG.ThA5E_3NFpgSfzAiCSjK?pid=ImgGn', {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            caption: txtOfInfoIsland,
        }).then(async () => {
            // update successfull
        }).catch((err) => {
            console.log(err);
        });
    }
    // success
    else if (willUpdImg === 2) {
        bot.sendPhoto(chatId, 'https://th.bing.com/th/id/OIG.IFstvdD4MfSJei_iWp1H?pid=ImgGn', {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            caption: txtOfInfoIsland,
        }).then(async () => {
            // update successfull
        }).catch((err) => {
            console.log(err);
        });
    }
    // success upd time
    else if (willUpdImg === 3) {
        bot.sendPhoto(chatId, 'https://th.bing.com/th/id/OIG.mgtWLLSCtkqH1IdrXK6Z?pid=ImgGn&rs=1', {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            caption: txtOfInfoIsland,
        }).then(async () => {
            // update successfull
        }).catch((err) => {
            console.log(err);
        });
    }
}

async function islandCommands(msg, bot, collection) {
    const collectionIslands = await mongoConnect('islands')

    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const island = await collectionIslands.findOne({ id: userId1 })

    if (chatId !== userId1) {
        bot.sendMessage(chatId, `
${userDonateStatus}, команды островов очень много я посеветую отправить команду
<code>команды острова</code> в лс бота
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (!island) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас пока нету собственный остров чтобы увидеть данные об островах
сперва создайте остров написав команду <b><code>открыть остров</code></b>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    let islandsOptions = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Смена имени', switch_inline_query_current_chat: 'остров имя ' },
                    { text: 'Снять деньги', switch_inline_query_current_chat: 'остров казна снять' },
                ],
                [
                    { text: 'Купить еды', switch_inline_query_current_chat: '+остров еда ' },
                    { text: 'Купить воды', switch_inline_query_current_chat: '+остров вода ' },
                ],
                [
                    { text: 'Купить авикомп', switch_inline_query_current_chat: '+остров авиакомпания ' },
                    { text: 'Купить ресторан', switch_inline_query_current_chat: '+остров ресторан ' },
                ],
                [
                    { text: 'Купить магазин', switch_inline_query_current_chat: '+остров магазин ' },
                    { text: 'Купить корабль', switch_inline_query_current_chat: '+остров корабль ' },
                ],
                [
                    { text: 'Купить машиназавод', switch_inline_query_current_chat: '+остров машиназавод ' },
                ]
            ]
        }
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, 😃вот команды островов🏝

<b>😎Смена имени:</b> - <i>Изменяет имя острова который не совпадает других островов🏝</i>
<b>💰Пополнить казну:</b> - <i>Пополнение казны острова🏝</i>
<b>🛒Купить еды:</b> - <i>Покупка еды для жителей👫</i>
<b>🚰Купить воды:</b> - <i>Покупка воды для жителей👫</i>

<b>👷‍♂Работы:</b>
  └<b>🧑‍✈️Купить авиакомп:</b> - <i>Покупка авиакопании для жителей</i>
  └<b>🧑‍🍳Купить ресторан:</b> - <i>Покупка ресторанов для жителей</i>
  └<b>🏪Купить магазин:</b> - <i>Покупка магазинов для жителей</i>
  └<b>🛳Купить корабль:</b> - <i>Покупка кораблей для жителей</i>
  └<b>🏎Купить машиназавод:</b> - <i>Покупка завод машин для жителей</i>

<b>👷В работах будут работать по 10 жителей👬 в каждом виде работ</b>
<b>Место сама будет расширяться по количество жителей</b>
<b>Жители сами прибывают когда пищи много🥪</b>
<b>Пример: 200воды и 200еда = 20жителей = 4км²</b>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
        ...islandsOptions
    })
}

async function islandProduct(msg, bot, collection, lenProdToBuy, lenValProdToBuy) {
    const collectionIslands = await mongoConnect('islands')

    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const island = await collectionIslands.findOne({ id: userId1 })

    const parts = text.split(' ')
    let prodToBuy = parts[lenProdToBuy]
    let valueProdToBuy = parts[lenValProdToBuy]

    const dataMap = {
        'еда': { item: 'foods', name: 'еда', cost: 2, limit: 5000 },
        'вода': { item: 'waters', name: 'вода', cost: 2, limit: 5000 },
        'авиакомпания': { item: 'airLines', name: 'авиакомпания', cost: 25000, limit: 10 },
        'ресторан': { item: 'restaurants', name: 'ресторан', cost: 17000, limit: 10 },
        'магазин': { item: 'shops', name: 'магазин', cost: 13000, limit: 10 },
        'корабль': { item: 'boats', name: 'корабль', cost: 15000, limit: 10 },
        'машиназавод': { item: 'carFactory', name: 'машиназавод', cost: 20000, limit: 10 },
    }

    if (!prodToBuy || !(prodToBuy in dataMap)) {
        bot.sendMessage(chatId, `
${userDonateStatus}, не правильно введен продукт для покупки
<b>Пример:</b> <code>+остров [название продукта] [кол-во]</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }
    prodToBuy = parts[lenProdToBuy].toLowerCase()
    valueProdToBuy = parseInt(parts[lenValProdToBuy])

    const userBalance = user.balance

    if (prodToBuy in dataMap) {

        if (!island) {
            bot.sendMessage(chatId, `
${userDonateStatus}, у вас еще нету острова сначало откройте его прежде чем купить вещи для него
<code>открыть остров</code>
            `, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            })
            return;
        }

        const { item, name, cost, limit } = dataMap[prodToBuy]
        const copms = island[dataMap[prodToBuy].item]

        if (!valueProdToBuy || isNaN(valueProdToBuy) || valueProdToBuy <= 0) {
            bot.sendMessage(chatId, `
${userDonateStatus}, значение введена не правильно проверьте его и отправьте заново
<b>Пример:</b> <code>+остров ${name} [кол-во]</code>
            `, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            })
            return;
        }

        const finishedCost = Math.floor(cost * valueProdToBuy)

        if (valueProdToBuy + parseInt(copms) > limit) {
            bot.sendMessage(chatId, `
${userDonateStatus}, не возможно купить это здание
<b>Так как это количество превышает покупку лимит этого продукта</b>

<b>Название:</b> <i>${name}</i> - <b>макс кол-во</b> <i>${limit.toLocaleString('de-DE')}</i>
                `, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            })
            console.log(copms);
            return;
        }

        if (userBalance < finishedCost) {
            bot.sendMessage(chatId, `
${userDonateStatus}, у вас не хватает средств для покупки

<b>Название:</b> <i>${name}</i> - <b>кол-во:</b> <i>${valueProdToBuy.toLocaleString('de-DE')}</i>
Этот кол-во продукта стоит ${finishedCost.toLocaleString('de-DE')} ${formatNumberInScientificNotation(finishedCost)}

<b>Проверьте свой баланс и попробуйте заново</b>
            `, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            })
            return;
        }

        bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно сделали покупка продукта в остров

<b>Название:</b> <i>${name}</i> - <b>кол-во:</b> <i>${valueProdToBuy.toLocaleString('de-DE')}</i>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })

        const updateObj = {}
        updateObj[item] = valueProdToBuy

        await collectionIslands.updateOne({ id: userId1 }, { $inc: updateObj }).then(async () => {
            await checkAndUpdateIslands(userId1)
            //             bot.sendMessage(chatId, `
            // ${userDonateStatus}, обновлена
            // ${newMessage}
            //             `, {
            //                 parse_mode: 'HTML',
            //                 reply_to_message_id: messageId,
            //             })
        }).catch(err => {
            console.log(err);
        })
        await collection.updateOne({ id: userId1 }, { $inc: { balance: -finishedCost } })
    }
}

async function islandNewName(msg, bot, collection, lenNewName) {
    const collectionIslands = await mongoConnect('islands')

    const userId1 = msg.from.id
    const text = msg.text;
    const chatId = msg.chat.id;
    const messageId = msg.message_id;

    const userDonateStatus = await donatedUsers(msg, collection);
    const newName = text.slice(lenNewName + 1);
    const island = await collectionIslands.findOne({ id: userId1 })

    if (!island) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас пока нет собственного острова откройте
его по команде <code>открыть остров</code>
        `)
        return;
    }

    if (!newName) {
        bot.sendMessage(chatId, `
${userDonateStatus}, не правильно введена команда
<b>Пример:</b> <code>остров имя [новое имя]</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    };

    if (newName.length > 30) {
        bot.sendMessage(chatId, `
${userDonateStatus}, <b>не возможно поставить больше 30 символов попробуйте заново</b>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const willChangeName = await collectionIslands.findOne({ name: newName });

    if (willChangeName) {
        bot.sendMessage(chatId, `
${userDonateStatus}, это название острова уже существует 
Попробуйте придумать другое имя
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, Вы успешно сменили название острова
<b>Новая название:</b> <i>${newName}</i>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
    await collectionIslands.updateOne({ id: userId1 }, { $set: { name: newName.toString() } })
}

async function infoIslandProfit(msg, bot, collection) {
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)

    bot.sendMessage(chatId, `
${userDonateStatus}, инфо

<b>Вы когда пишите -</b> <i><code>мой остров</code></i> 
бот выдает вам информацию за ваш остров и не только инфу

<b>Бот проверяет что время зарплаты пришло или нет это можно заметить когда бот отправляет инфу за ваш остров</b>

<b>Как это происходит -</b> вы сами можете увидеть что время зарплаты если она пришла то вы можете получить зарплату она переводится в казну острова 
<b><i>Обновление времени зарплаты -</i></b> это значит что вы отправив команду мой остров не только получаете <b>ЗП</b> но и обновляете его время на следующую <b>ЗП</b> 

<b>А я пропустил ЗП (Например) 5 дней ?</b> - нечего страшно если напишите мой остров то вы получити свою зарплату, но только за 1 день 

<b>Это сделано чтобы острова хоть этим образом привлекали внимание на себя чтобы пользователи проверяли сови острова !</b>

<b>Еше можно узнать от картинки который бот отправит есть 3 вида картинки вы сами узнаете о них в протежении улучшении острова</b>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
}

async function takeOfProfitIsland(msg, bot, collection) {
    const collectionIslands = await mongoConnect('islands')

    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const island = await collectionIslands.findOne({ id: userId1 })

    if (!island) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас пока нет собственного острова откройте
его по команде <code>открыть остров</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const iBalance = island.balance
    if (iBalance === 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас на острове и так нету денег чтобы их снять !
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно сняли денег с острова
<b>Кол-во:</b> <i>${iBalance.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(iBalance)}</i>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
    await collection.updateOne({ id: userId1 }, { $inc: { balance: Math.floor(iBalance) } })
    await collectionIslands.updateOne({ id: userId1 }, { $set: { balance: 0 } })
}

module.exports = {
    openIsland,
    myIsland,
    islandCommands,
    islandProduct,
    islandNewName,
    infoIslandProfit,
    takeOfProfitIsland,
}