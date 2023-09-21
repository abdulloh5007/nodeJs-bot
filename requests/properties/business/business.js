const { MongoClient } = require('mongodb');
const { donatedUsers } = require('../../donate/donatedUsers');
const { formatNumberInScientificNotation } = require('../../systems/systemRu');
const { customChalk } = require('../../../customChalk');
require('dotenv').config()

const adminId = parseInt(process.env.ADMIN_ID_INT)
const mongoDbUrl = process.env.MONGO_DB_URL
const client = new MongoClient(mongoDbUrl);

async function connecting() {
    await client.connect()
}

async function addBusiness(msg, bot) {
    const db = client.db('bot');
    const collectionBusiness = db.collection('businesses')

    const text = msg.text
    const chatId = msg.chat.id

    collectionBusiness.insertOne({
        name: 'Samsung 📱',
        price: 1500000,
        img: 'https://www.ixbt.com/img/n1/news/2023/0/2/Samsung_Electronics_large_large_large.jpg',
        maxWorkers: 130,
        workersProfit: 1600,
        tax: 0,
    })
    bot.sendMessage(chatId, `Успешно был добавлен бизнес`)
}

async function listBusinesses(msg, bot, collection) {
    const db = client.db('bot');
    const collectionBusiness = db.collection('businesses')

    const text = msg.text
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const business = await collectionBusiness.find({}).sort({ price: 1 }).toArray()
    const sortedBusinesses = business.map((e, i) => {
        return `
${i + 1}. ${e.name} - ${e.price.toLocaleString('de-DE')} ${formatNumberInScientificNotation(e.price)}`
    })

    let businessOptions = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Купить', switch_inline_query_current_chat: 'купить бизнес ' }]
            ]
        }
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вот доступные бизнесы

${sortedBusinesses}

<b>Чтобы купить бизнес напишите:</b> <code>купить бизнес [номер]</code>
    `, { parse_mode: 'HTML', ...businessOptions })
}

async function buyBusiness(msg, bot, collection, glLength) {
    const db = client.db('bot');
    const collectionBusiness = db.collection('businesses')
    const business = await collectionBusiness.find({}).sort({ price: 1 }).toArray()

    const text = msg.text
    const chatId = msg.chat.id
    const userId1 = msg.from.id

    const user = await collection.findOne({ id: userId1 })
    const userDonateStatus = await donatedUsers(msg, collection)
    const parts = text.split(' ')

    if (parts.length === glLength) {
        bot.sendMessage(chatId, `
${userDonateStatus}, введите номер бизнеса который вы хотите купить
        `, { parse_mode: 'HTML' })
        return;
    }

    if (parts[glLength] < 1) {
        bot.sendMessage(chatId, `
${userDonateStatus}, номер бизнеса не должно состоять меньше 1
        `, { parse_mode: 'HTML' })
        return;
    }

    const bNumToBuy = parts[glLength]
    const selectedBusiness = business[bNumToBuy - 1]
    const userBalance = user.balance
    const userBusiness = user.business[0].name

    if (userBusiness !== '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, У вас уже имеется бизнес под названием <u>${userBusiness}</u>
        `, { parse_mode: 'HTML' })
        return;
    }

    if (!selectedBusiness) {
        bot.sendMessage(chatId, `
${userDonateStatus}, такого бизнеса не существует напишите <code>бизнесы</code>
чтобы узнать о бизнесах
        `, {
            parse_mode: 'HTML',
        })
        return;
    }

    if (userBalance < selectedBusiness.price) {
        bot.sendMessage(chatId, `
${userDonateStatus}, У вас недостаточно средств на счету для покупки данного бизнеса
        `, { parse_mode: 'HTML' })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно приобрели новый бизнес под названием ${selectedBusiness.name}
    `, { parse_mode: "HTML" })

    await collection.updateOne({ id: userId1 }, { $set: { "business.0.name": selectedBusiness.name, "business.0.maxWorkers": selectedBusiness.maxWorkers, "business.0.workersProfit": selectedBusiness.workersProfit, "business.0.tax": selectedBusiness.tax, "business.0.have": true } })
    await collection.updateOne({ id: userId1 }, { $inc: { balance: -selectedBusiness.price } })
}

async function infoBusiness(msg, bot, collection) {
    const db = client.db('bot');
    const collectionBusiness = db.collection('businesses')

    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userBusiness = user.business[0].name

    if (userBusiness === '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, У вас нет бизнеса

<b>Чтобы узнать:</b> <code>бизнесы</code>
        `, { parse_mode: 'HTML' })
        return;
    }

    const business = await collectionBusiness.findOne({ name: userBusiness })
    const bPhoto = business.img
    const maxWorkers = business.maxWorkers
    const workersProfit = business.workersProfit
    const tax = user.business[0].tax

    const profit = user.business[0].profit
    const workers = user.business[0].workers
    const workersProfitHour = workersProfit * workers
    const localedStringProfitWorkers = `${workersProfitHour.toLocaleString('de-DE')} ${formatNumberInScientificNotation(workersProfitHour)}`
    const endProfit = Math.floor(workersProfitHour * 3)

    bot.sendPhoto(chatId, bPhoto, {
        parse_mode: 'HTML',
        caption: `
${userDonateStatus}, вот информация о вашем бизнесе

<b>Название бизнеса:</b> ${userBusiness}
<b>Кол-во работников:</b> ${workers}
<b>Макс кол-во работников:</b> ${maxWorkers}
<b>Прибыль в день:</b> ${workers >= 1 ? localedStringProfitWorkers : 0}

<b>Общий прибыль:</b> ${profit.toLocaleString('de-DE')} ${formatNumberInScientificNotation(profit)}
<b>Налоги:</b> ${tax.toLocaleString('de-DE')} ${formatNumberInScientificNotation(tax)}

<b>Прибыль от каждого работника будет состоять по:</b> ${workersProfit.toLocaleString('de-DE')} ${formatNumberInScientificNotation(workersProfit)}
<b>Чтобы узнать о работниках напишите:</b> <code>инфо бработники</code>
<b>Чтобы оплатить налоги напишите:</b> <code>бизнес налоги</code>

<b>❗️Если ваши налоги будут превышать ${endProfit.toLocaleString('de-DE')} это означает 3 раза пропустить налоги</b>
        `
    })
}

async function workersInfo(msg, bot, collection) {
    const db = client.db('bot');
    const collectionBusiness = db.collection('businesses')

    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const user = await collection.findOne({ id: userId1 })
    const userDonateStatus = await donatedUsers(msg, collection)
    const userBusiness = user.business[0].name

    let messageB = `
У вас не существует базнеса
Хотите узнать существующих бизнесов то отправьте <code>бизнесы</code>
`;
    let haveB = true;
    if (userBusiness === '') {
        haveB = false;
    }

    const business = await collectionBusiness.findOne({ name: userBusiness })
    const workersProfit = haveB === true ? business.workersProfit : null
    const procent20 = Math.floor((workersProfit / 100) * 20)
    const workersPrice = workersProfit + procent20

    if (haveB === true) {
        messageB = `
<b>Ваш бизнес:</b> ${userBusiness}
<b>Стоимость работников:</b> ${workersPrice}
<b>Прибыль работника:</b> ${workersProfit}
        `
    }

    let workersOptions = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Купить бработников', switch_inline_query_current_chat: 'купить бработников ' }]
            ]
        }
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, работники каждого бизнеса не похожи друг другу

Цена работников увеличивается смотря на цену бизнеса 
Какой у вас лучший бизнес и там будут работать работники именно того бизнеса
${messageB}
    `, { parse_mode: 'HTML', ...workersOptions })
}

async function buyWorkers(msg, bot, collection, glLength) {
    const db = client.db('bot');
    const collectionBusiness = db.collection('businesses')

    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userBname = user.business[0].name
    const userBalance = user.balance
    const userStatus = user.status[0].statusName
    const userworkers = user.business[0].workers
    const usermaxWorkers = user.business[0].maxWorkers

    const parts = text.split(' ')

    if (parts.length === glLength) {
        bot.sendMessage(chatId, `
${userDonateStatus}, введите количество бизнес работников чтобы купить

<code>купить бработников [кол-во]</code>
`, { parse_mode: 'HTML' })
        return;
    }

    if (userBname === '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не существует бизнеса чтобы купить для него бработников

<b>Напишите:</b> <code>бизнесы</code> чтобы узнать о бизнесах
        `, { parse_mode: 'HTML' })
        return;
    }

    const amountworkers = parts[glLength]
    const amountToBuyWorkersAndworkers = parseInt(amountworkers) + parseInt(userworkers)

    if (isNaN(amountworkers) || amountworkers <= 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, не возможно купить количество букв или отрицательное количество бработников

<b>Отправьте количество бработников в числовом формате</b>
        `, { parse_mode: 'HTML' })
        return;
    }

    if (amountToBuyWorkersAndworkers > usermaxWorkers) {
        bot.sendMessage(chatId, `
${userDonateStatus}, количество бработников который вы хотите купить, превышает 
максимальное кол-во работников бизнеса

<b>Напишите:</b> <code>мой бизнес</code>
Чтобы увидеть информацию о своем бизнесе
и максимальное количество работников бизнеса
        `, { parse_mode: 'HTML' })
        return;
    }

    const business = await collectionBusiness.findOne({ name: userBname })
    const workersProfit = business.workersProfit
    let procent20 = Math.floor((workersProfit / 100) * 20)

    let message;
    if (userStatus === 'premium') {
        procent20 = Math.floor((workersProfit / 100) * 10)
        message = `
<i>${userStatus.toUpperCase()}</i> <b>10% скидка от каждого работника</b>`
    }
    else if (userStatus === 'vip') {
        procent20 = Math.floor((workersProfit / 100) * 13)
        message = `
<i>${userStatus.toUpperCase()}</i> <b>7% скидка от каждого работника</b>`
    }
    else if (userStatus === 'standart') {
        procent20 = Math.floor((workersProfit / 100) * 15)
        message = `
<i>${userStatus.toUpperCase()}</i> <b>5% скидка от каждого работника</b>`
    }

    const workersPrice = Math.floor(workersProfit + procent20)
    const possibleBuyworkers = Math.floor(userBalance / workersPrice)
    const finishedToBuyworkers = workersPrice * amountworkers

    if (userBalance < finishedToBuyworkers) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не хватает средств для покупки ${amountworkers} 
бработников

<b>Вы можете купить:</b> ${possibleBuyworkers}
        `, { parse_mode: 'HTML' })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно купили ${amountworkers} бработников
<b>Сумма:</b> ${finishedToBuyworkers.toLocaleString('de-DE')} ${formatNumberInScientificNotation(finishedToBuyworkers)}
${message}
    `, { parse_mode: 'HTML' })

    await collection.updateOne({ id: userId1 }, { $inc: { "business.0.workers": parseInt(amountworkers), balance: -finishedToBuyworkers } })
}

async function addProfitEveryOneHour(collection) {
    const users = await collection.find({ "business.0.have": true }).toArray()
    const userDonateStatus = await donatedUsers(msg, collection)

    for (let i = 0; i < users.length; i++) {
        const el = users[i];
        const userworkers = el.business[0].workers
        const userworkersProfit = el.business[0].workersProfit
        const addToProfit = userworkers * userworkersProfit
        const usertax = el.business[0].tax
        const endTax = Math.floor(addToProfit * 3)

        if (usertax >= endTax) {
            try {
                await bot.sendMessage(el.id, `
${userDonateStatus}, <b>Ваш бизнес автоматически был закрыт так как вы не платили налоги</b>
                `, {
                    parse_mode: 'HTML',
                })
            } catch (err) {
                if (err.response && err.response.statusCode === 403) {
                    console.log(customChalk.colorize(`Ошибка при отправки сообщение обновлении бизнеса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
                } else if (err.response && err.response.statusCode === 400) {
                    console.log(customChalk.colorize(`Ошибка при отправки сообщение обновлении бизнеса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
                } else {
                    console.log(customChalk.colorize(`Ошибка при отправки сообщение обновлении бизнеса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
                }
            }
            await collection.updateOne({ id: el.id }, {
                $set: {
                    "business.0.have": false,
                    "business.0.name": '',
                    "business.0.workers": 0,
                    "business.0.maxWorkers": 0,
                    "business.0.profit": 0,
                    "business.0.workersProfit": 0,
                    "business.0.tax": 0,
                    "business.0.lastUpdTime": 0,
                }
            })
            return;
        }

        try {
            await bot.sendMessage(el.id, `
${userDonateStatus}, <b>Вам успешно были добавлены зарплаты бизнеса</b>
<b>Не забывайте оплатить налоги а то после 3 раза ваш бизнес автоматически будет закрыт❗️</b>
            `, {
                parse_mode: 'HTML',
            })
        } catch (err) {
            if (err.response && err.response.statusCode === 403) {
                console.log(customChalk.colorize(`Ошибка при отправки сообщение обновлении бизнеса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
            } else if (err.response && err.response.statusCode === 400) {
                console.log(customChalk.colorize(`Ошибка при отправки сообщение обновлении бизнеса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
            } else {
                console.log(customChalk.colorize(`Ошибка при отправки сообщение обновлении бизнеса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
            }
        }
        collection.updateOne({ id: el.id }, { $inc: { "business.0.profit": parseInt(addToProfit), "business.0.tax": parseInt(Math.floor(usertax / 2)) } })
    }
    return;
}

async function manualAddProfitEveryOneHour(msg, bot, collection) {
    const users = await collection.find({ "business.0.have": true }).toArray()
    const userDonateStatus = await donatedUsers(msg, collection)

    for (let i = 0; i < users.length; i++) {
        const el = users[i];
        const userworkers = el.business[0].workers
        const userworkersProfit = el.business[0].workersProfit
        const addToProfit = userworkers * userworkersProfit
        const usertax = el.business[0].tax
        const endTax = Math.floor(addToProfit * 3)

        if (usertax >= endTax) {
            try {
                await bot.sendMessage(el.id, `
${userDonateStatus}, <b>Ваш бизнес автоматически был закрыт так как вы не платили налоги</b>
                `, {
                    parse_mode: 'HTML',
                })
            } catch (err) {
                if (err.response && err.response.statusCode === 403) {
                    console.log(customChalk.colorize(`Ошибка при отправки сообщение обновлении бизнеса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
                } else if (err.response && err.response.statusCode === 400) {
                    console.log(customChalk.colorize(`Ошибка при отправки сообщение обновлении бизнеса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
                } else {
                    console.log(customChalk.colorize(`Ошибка при отправки сообщение обновлении бизнеса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
                }
            }
            await collection.updateOne({ id: el.id }, {
                $set: {
                    "business.0.have": false,
                    "business.0.name": '',
                    "business.0.workers": 0,
                    "business.0.maxWorkers": 0,
                    "business.0.profit": 0,
                    "business.0.workersProfit": 0,
                    "business.0.tax": 0,
                    "business.0.lastUpdTime": 0,
                }
            })
            return;
        }

        try {
            await bot.sendMessage(el.id, `
${userDonateStatus}, <b>Вам успешно были добавлены зарплаты бизнеса</b>
<b>Не забывайте оплатить налоги а то после 3 раза ваш бизнес автоматически будет закрыт❗️</b>
            `, {
                parse_mode: 'HTML',
            })
        } catch (err) {
            if (err.response && err.response.statusCode === 403) {
                console.log(customChalk.colorize(`Ошибка при отправки сообщение обновлении бизнеса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
            } else if (err.response && err.response.statusCode === 400) {
                console.log(customChalk.colorize(`Ошибка при отправки сообщение обновлении бизнеса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
            } else {
                console.log(customChalk.colorize(`Ошибка при отправки сообщение обновлении бизнеса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
            }
        }
        collection.updateOne({ id: el.id }, { $inc: { "business.0.profit": parseInt(addToProfit), "business.0.tax": parseInt(Math.floor(usertax / 2)) } })
    }
    return;
}

async function pulloffBusiness(msg, bot, collection) {
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userprofit = user.business[0].profit
    const username = user.business[0].name

    if (username === '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас нету бизнеса

<b>Напишите:</b> <code>бизнесы</code> чтобы узнать о бизнесах
        `, { parse_mode: 'HTML' })
        return;
    }

    if (userprofit <= 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас и так нету денег для снятие с бизнеса
        `, { parse_mode: 'HTML' })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно сняли с бизнеса 
<b>Сумму:</b> ${userprofit.toLocaleString('de-DE')} ${formatNumberInScientificNotation(userprofit)}
    `, { parse_mode: 'HTML' })

    await collection.updateOne({ id: userId1 }, { $inc: { "business.0.profit": -userprofit, balance: userprofit } })
}

async function payTaxForBusiness(msg, bot, collection) {
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userBalance = user.balance
    const usertax = user.business[0].tax
    const username = user.business[0].name

    if (username === '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас нету бизнеса

<b>Напишите:</b> <code>бизнесы</code> чтобы узнать о бизнесах
        `, { parse_mode: 'HTML' })
        return;
    }

    if (usertax === 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас еще нету налогов бизнеса
        `, { parse_mode: "HTML" })
        return;
    }

    if (userBalance < usertax) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не хватает средств для оплаты налогов бизнеса
        `, { parse_mode: "HTML" })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно оплатили налоги бизнеса
<b>Сумму:</b> ${usertax.toLocaleString('de-DE')} ${formatNumberInScientificNotation(usertax)}
    `, { parse_mode: "HTML" })
    await collection.updateOne({ id: userId1 }, { $inc: { balance: -usertax, "business.0.tax": -usertax } })
}

async function sellBusiness(msg, bot, collection) {
    const db = client.db('bot');
    const collectionBusiness = db.collection('businesses')

    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const user = await collection.findOne({ id: userId1 })
    const userDonateStatus = await donatedUsers(msg, collection)
    const username = user.business[0].name
    const usertax = user.business[0].tax
    const userprofit = user.business[0].profit

    if (username === '') {
        bot.sendMessage(chatId, `
        ${userDonateStatus}, у вас нету бизнеса
        
        <b>Напишите:</b> <code>бизнесы</code> чтобы узнать о бизнесах
        `, { parse_mode: 'HTML' })
        return;
    }

    const business = await collectionBusiness.findOne({ name: username })
    const bPriceToSell = business.price * 0.8

    if (usertax > 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, прежде чем продать свой бизнес вам нужно оплатить его налоги !
Отправьте команду <code>бизнес налоги</code> чтобы оплатить их
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        });
        return;
    }

    const flooredBPrice = Math.floor(bPriceToSell)
    let incBalance = flooredBPrice + userprofit
    let profitMsg = `Деньги которые были у вас в прибыле: ${userprofit.toLocaleString('de-DE')}
успешно переведены в основной счет`

    if (userprofit === 0) {
        profitMsg = 'У вас небыло денег в балансе бизнеса поэтому вы забираете только деньги которые стоил ваш бизнес'
        incBalance = flooredBPrice
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно продали свой бизнес <u>${username}</u>
Стоимость продажи: ${flooredBPrice.toLocaleString('de-DE')}$

${profitMsg}
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
    await collection.updateOne({ id: userId1 }, { $set: { "business.0.name": '', "business.0.profit": 0, "business.0.workers": 0 } })
    await collection.updateOne({ id: userId1 }, { $inc: { balance: incBalance } })
}

module.exports = {
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
}