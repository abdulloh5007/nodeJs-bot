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
<i>Название:</i> <b>${startNameIsland}</b>
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
<i>Названием:</i> <u>${islandName}</u>

<i>Напишите:</i> <code>мой остров</code> инфо об острове
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
<i>Открытие острова бесплатно !</i> <code>открыть остров</code>
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

    let txtMessage = `<i>» 📅Время зарплаты:</i>\n  <i>» Дата:</i> <b>${formattedLastProfitDate}</b>`;
    let willUpdImg = 1

    let mathIslandFoods = islandPopulation * 2
    if (mathIslandFoods > foods || mathIslandFoods > waters) {
        if (lastProfitDate <= currentDate) {
            willUpdImg = 2
            txtMessage = `<i>» Не возможно получить ЗП</i>\n  <i>» Причина:</i> <b>Не хватка пищи !</b>`
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

        txtMessage = `<i>» 📅Время зарплаты:</i>\n  <b>Вы успешно обновили следующую выдачу зарплаты ↓</b>\n  <i>» Новая дата:</i> <b>${nextProfitDate.toLocaleDateString()}</b>\n  <i>» Зарплата успешно получена:</i> <b>${islandOwnerBalance}</b>`;
        willUpdImg = 3
    }

    await checkAndUpdateIslands(userId);
    const newIslandBal = balance.toLocaleString('de-DE');
    const islandFoods = foods;
    const islandWaters = waters;
    const txtOfInfoIsland = `
${userDonateStatus}, вот информация за ваш остров🏝

┌ <i>🏄‍♂Мер:</i> <i>${islandOwner}</i>
├ <i>😎Название:</i> <i>${islandName}</i>
├ <i>💰Казна:</i> <i>${newIslandBal}$</i>
└ <i>👫Жителей:</i> <i>${islandPopulation}</i>
    <i>» 👨‍🌾Работающие:</i> <i>${islandWorkPopulation}</i>

<i>» ⚖️Зарплата:</i>
    <i>» Мера:</i> <b>${islandOwnerBalance.toLocaleString('de-DE')}</b>$ (60%)
    <i>» Работающих:</i> <b>${islandWorkersBalance.toLocaleString('de-DE')}</b>$ (40%)

<i>» 🙎‍♂Территория:</i> <b>${islandPlace}</b> км²

<i>» 🥑Пищи:</i>
    <i>» 🌭Еды:</i> <b>${islandFoods} / ${islandMaxFoods}</b>
    <i>» 💦Воды:</i> <b>${islandWaters} / ${islandMaxWaters}</b>

<i>» 👷‍♂Работы:</i>
    <i>» 👨‍✈️Авиакомпании:</i> <b>${airLines} / 10</b>
    <i>» 🏫Рестораны:</i> <b>${restaurants} / 10</b>
    <i>» 🏪Магазины:</i> <b>${shops} / 10</b>
    <i>» 🛥Кораблей:</i> <b>${boats} / 10</b>
    <i>» 🚙Завод машин:</i> <b>${carFactory} / 10</b>

${txtMessage}

<b>😊Все команды острова🏝 можно узнать отправив команду!</b> <code>команды острова</code>
<b>💸Вы сами обновляете ежедневную зарплату.
Сделано чтобы острова хоть этим способом привлекали внимание 😜.</b>

<b>Напишите:</b> <code>остров инфо</code> чтобы узнать что это за функция
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
                    { text: '🚀Смена имени', switch_inline_query_current_chat: 'остров имя ' },
                    { text: '💰Снять деньги', switch_inline_query_current_chat: 'остров казна снять' },
                ],
                [
                    { text: '🌭Купить еды', switch_inline_query_current_chat: '+остров еда ' },
                    { text: '🚰Купить воды', switch_inline_query_current_chat: '+остров вода ' },
                ],
                [
                    { text: '✈️Купить авикомп', switch_inline_query_current_chat: '+остров авиакомпания ' },
                    { text: '🏢Купить ресторан', switch_inline_query_current_chat: '+остров ресторан ' },
                ],
                [
                    { text: '🏫Купить магазин', switch_inline_query_current_chat: '+остров магазин ' },
                    { text: '🛳Купить корабль', switch_inline_query_current_chat: '+остров корабль ' },
                ],
                [
                    { text: '🚘Купить машиназавод', switch_inline_query_current_chat: '+остров машиназавод ' },
                ]
            ]
        }
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, 😃вот команды островов🏝

┌ <i>😎Смена имени:</i> - <i>Изменяет имя острова который не совпадает других островов🏝</i>
├ <i>💰Пополнить казну:</i> - <i>Пополнение казны острова🏝</i>
├ <i>🛒Купить еды:</i> - <i>Покупка еды для жителей👫</i>
└ <i>🚰Купить воды:</i> - <i>Покупка воды для жителей👫</i>

<i>» 👷‍♂Работы:</i>
  <i>» 🧑‍✈️Купить авиакомп:</i> - <b>Покупка авиакопании для жителей</b>
  <i>» 🧑‍🍳Купить ресторан:</i> - <b>Покупка ресторанов для жителей</b>
  <i>» 🏪Купить магазин:</i> - <b>Покупка магазинов для жителей</b>
  <i>» 🛳Купить корабль:</i> - <b>Покупка кораблей для жителей</b>
  <i>» 🏎Купить машиназавод:</i> - <b>Покупка завод машин для жителей</b>

<i>» 📚Инструкция:</i>
  <b>» 👷В работах будут работать по 10 жителей👬 в каждом виде работ</b>
  <b>» Место сама будет расширяться по количество жителей</b>
  <b>» Жители сами прибывают когда пищи много🥪</b>
  <b>» Пример: 200воды и 200еда = 20жителей = 4км²</b>
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
<i>Пример:</i> <code>+остров ${name} [кол-во]</code>
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
<i>Так как это количество превышает покупку лимит этого продукта</i>

<i>Название:</i> <b>${name}</b> - <i>макс кол-во</i> <b>${limit.toLocaleString('de-DE')}</b>
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

<i>Название:</i> <b>${name}</b> - <i>кол-во:</i> <b>${valueProdToBuy.toLocaleString('de-DE')}</b>
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

<i>Название:</i> <b>${name}</b> - <i>кол-во:</i> <b>${valueProdToBuy.toLocaleString('de-DE')}</b>
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
<i>Пример:</i> <code>остров имя [новое имя]</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    };

    if (newName.length > 20) {
        bot.sendMessage(chatId, `
${userDonateStatus}, <b>не возможно поставить больше 20 символов попробуйте заново</b>
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
<i>Новая название:</i> <b>${newName}</b>
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
${userDonateStatus}, инфо 📖

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
<i>Кол-во:</i> <b>${iBalance.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(iBalance)}</b>
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