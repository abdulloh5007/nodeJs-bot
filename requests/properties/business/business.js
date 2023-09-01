const { MongoClient } = require('mongodb');
const { donatedUsers } = require('../../donate/donatedUsers');
const { formatNumberInScientificNotation } = require('../../systems/systemRu');
require('dotenv').config()

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

    if (text.toLowerCase() === 'testadd business') {
        collectionBusiness.insertOne({
            bName: 'louis vuitton2',
            bPrice: 9000,
            bImg: 'AgACAgEAAxkBAAIfa2Twc2xXc5x-EBcRpEfDJo5N7U4kAAIvrDEbHVWBR0qAt37FpyCaAQADAgADcwADMAQ',
            bMaxWorkers: 150,
            bWorkersProfit: 230,
            bTax: 1200,
        })
        bot.sendMessage(chatId, `Успешно был добавлен бизнес`)
    }
}

async function listBusinesses(msg, bot, collection) {
    const db = client.db('bot');
    const collectionBusiness = db.collection('businesses')

    const text = msg.text
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const business = await collectionBusiness.find({}).sort({ bPrice: 1 }).toArray()
    const sortedBusinesses = business.map((e, i) => {
        return `
${i + 1}. ${e.bName} - ${e.bPrice.toLocaleString('de-DE')} ${formatNumberInScientificNotation(e.bPrice)}`
    })

    let businessOptions = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Купить', switch_inline_query_current_chat: 'купить бизнес ' }]
            ]
        }
    }

    if (text.toLowerCase() === 'бизнесы') {
        bot.sendMessage(chatId, `
${userDonateStatus}, вот доступные бизнесы

${sortedBusinesses}

<b>Чтобы купить бизнес напишите:</b> <code>купить бизнес [номер]</code>
        `, { parse_mode: 'HTML', ...businessOptions })
    }
}

async function buyBusiness(msg, bot, collection) {
    const db = client.db('bot');
    const collectionBusiness = db.collection('businesses')
    const business = await collectionBusiness.find({}).sort({ bPrice: 1 }).toArray()

    const text = msg.text
    const chatId = msg.chat.id
    const userId1 = msg.from.id

    const user = await collection.findOne({ id: userId1 })
    const userDonateStatus = await donatedUsers(msg, collection)
    const parts = text.split(' ')
    const txt = '@levouJS_bot купить бизнес'

    let glLength = 2
    if (text.toLowerCase().startsWith(txt.toLocaleLowerCase())) {
        glLength = 3
    }
    else if (text.toLowerCase().startsWith('купить бизнес')) {
        glLength = 2
    }
    else {
        return;
    }

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
    const userBusiness = user.business[0].bName

    if (userBusiness !== '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, У вас уже имеется бизнес под названием <u>${userBusiness}</u>
        `, { parse_mode: 'HTML' })
        return;
    }

    if (userBalance < selectedBusiness.bPrice) {
        bot.sendMessage(chatId, `
${userDonateStatus}, У вас недостаточно средств на счету для покупки данного бизнеса
        `, { parse_mode: 'HTML' })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно приобрели новый бизнес под названием ${selectedBusiness.bName}
    `, { parse_mode: "HTML" })

    await collection.updateOne({ id: userId1 }, { $set: { "business.0.bName": selectedBusiness.bName, "business.0.bMaxWorkers": selectedBusiness.bMaxWorkers, "business.0.bWorkersProfit": selectedBusiness.bWorkersProfit, "business.0.bTax": selectedBusiness.bTax, "business.0.bHave": true } })
    await collection.updateOne({ id: userId1 }, { $inc: { balance: -selectedBusiness.bPrice } })
}

async function infoBusiness(msg, bot, collection) {
    const db = client.db('bot');
    const collectionBusiness = db.collection('businesses')

    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userBusiness = user.business[0].bName

    if (text.toLowerCase() === 'мой бизнес') {

    }
    else {
        return;
    }

    if (userBusiness === '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, У вас нет бизнеса
        `, { parse_mode: 'HTML' })
        return;
    }

    const business = await collectionBusiness.findOne({ bName: userBusiness })
    const bPhoto = business.bImg
    const bMaxWorkers = business.bMaxWorkers
    const bWorkersProfit = business.bWorkersProfit
    const bTax = user.business[0].bTax

    const bProfit = user.business[0].bProfit
    const bWorkers = user.business[0].bWorkers
    const bWorkersProfitHour = bWorkersProfit * bWorkers
    const localedStringProfitWorkers = `${bWorkersProfitHour.toLocaleString('de-DE')} ${formatNumberInScientificNotation(bWorkersProfitHour)}`

    bot.sendPhoto(chatId, bPhoto, {
        parse_mode: 'HTML',
        caption: `
${userDonateStatus}, вот информация о вашем бизнесе

<b>Название бизнеса:</b> ${userBusiness}
<b>Кол-во работников:</b> ${bWorkers}
<b>Макс кол-во работников:</b> ${bMaxWorkers}
<b>Прибыль в день:</b> ${bWorkers >= 1 ? localedStringProfitWorkers : 0}

<b>Общий прибыль:</b> ${bProfit.toLocaleString('de-DE')} ${formatNumberInScientificNotation(bProfit)}
<b>Налоги:</b> ${bTax.toLocaleString('de-DE')} ${formatNumberInScientificNotation(bTax)}

<b>Прибыль от каждого работника будет состоять по:</b> ${bWorkersProfit.toLocaleString('de-DE')} ${formatNumberInScientificNotation(bWorkersProfit)}
<b>Чтобы узнать о работниках напишите:</b> <code>инфо бработники</code>
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
    const userBusiness = user.business[0].bName

    let haveB = true;
    if (userBusiness === '') {
        haveB = false;
    }

    const business = await collectionBusiness.findOne({ bName: userBusiness })
    const bWorkersProfit = haveB === true ? business.bWorkersProfit : null
    const procent20 = Math.floor((bWorkersProfit / 100) * 20)
    const bWorkersPrice = bWorkersProfit + procent20

    let messageB = `
У вас не существует базнеса
Хотите узнать существующих бизнесов то отправьте <code>бизнесы</code>
`;
    if (haveB === true) {
        messageB = `
<b>Ваш бизнес:</b> ${userBusiness}
<b>Стоимость работников:</b> ${bWorkersPrice}
<b>Прибыль работника:</b> ${bWorkersProfit}
        `
    }

    let bWorkersOptions = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Купить бработников', switch_inline_query_current_chat: 'купить бработников ' }]
            ]
        }
    }

    if (text.toLowerCase() === 'инфо бработники') {
        bot.sendMessage(chatId, `
${userDonateStatus}, работники каждого бизнеса не похожи друг другу

Цена работников увеличивается смотря на цену бизнеса 
Какой у вас лучший бизнес и там будут работать работники именно того бизнеса

${messageB}
        `, { parse_mode: 'HTML', ...bWorkersOptions })
    }
}

async function buyWorkers(msg, bot, collection) {
    const db = client.db('bot');
    const collectionBusiness = db.collection('businesses')

    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userBName = user.business[0].bName
    const userBalance = user.balance
    const userStatus = user.status[0].statusName
    const userBWorkers = user.business[0].bWorkers
    const userBMaxWorkers = user.business[0].bMaxWorkers

    const parts = text.split(' ')
    const txt = '@levouJS_bot купить бработников'

    let glLength = 2
    if (text.toLowerCase().startsWith(txt.toLocaleLowerCase())) {
        glLength = 3
    }
    else if (text.toLowerCase().startsWith('купить бработников')) {
    }
    else {
        return;
    }

    if (parts.length === glLength) {
        bot.sendMessage(chatId, `
${userDonateStatus}, введите количество бизнес работников чтобы купить

<code>купить бработников [кол-во]</code>
`, { parse_mode: 'HTML' })
        return;
    }

    if (userBName === '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не существует бизнеса чтобы купить для него бработников

<b>Напишите:</b> <code>бизнесы</code> чтобы узнать о бизнесах
        `, { parse_mode: 'HTML' })
        return;
    }

    const amountBWorkers = parts[glLength]
    const amountToBuyWorkersAndBWorkers = parseInt(amountBWorkers) + parseInt(userBWorkers)

    if (isNaN(amountBWorkers) || amountBWorkers < 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, не возможно купить количество букв или отрицательное количество бработников

<b>Отправьте количество бработников в числовом формате</b>
        `, { parse_mode: 'HTML' })
        return;
    }

    if (amountToBuyWorkersAndBWorkers > userBMaxWorkers) {
        bot.sendMessage(chatId, `
${userDonateStatus}, количество бработников который вы хотите купить, превышает 
максимальное кол-во работников бизнеса

<b>Напишите:</b> <code>мой бизнес</code>
Чтобы увидеть информацию о своем бизнесе
и максимальное количество работников бизнеса
        `, { parse_mode: 'HTML' })
        return;
    }

    const business = await collectionBusiness.findOne({ bName: userBName })
    const bWorkersProfit = business.bWorkersProfit
    let procent20 = Math.floor((bWorkersProfit / 100) * 20)

    let message;
    if (userStatus === 'premium') {
        procent20 = Math.floor((bWorkersProfit / 100) * 10)
        message = `
<i>${userStatus.toUpperCase()}</i> <b>10% скидка от каждого работника</b>`
    }
    else if (userStatus === 'vip') {
        procent20 = Math.floor((bWorkersProfit / 100) * 13)
        message = `
<i>${userStatus.toUpperCase()}</i> <b>7% скидка от каждого работника</b>`
    }
    else if (userStatus === 'standart') {
        procent20 = Math.floor((bWorkersProfit / 100) * 15)
        message = `
<i>${userStatus.toUpperCase()}</i> <b>5% скидка от каждого работника</b>`
    }

    const bWorkersPrice = Math.floor(bWorkersProfit + procent20)
    const possibleBuyBWorkers = Math.floor(userBalance / bWorkersPrice)
    const finishedToBuyBWorkers = bWorkersPrice * amountBWorkers

    if (userBalance < finishedToBuyBWorkers) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не хватает средств для покупки ${amountBWorkers} 
бработников

<b>Вы можете купить:</b> ${possibleBuyBWorkers}
        `, { parse_mode: 'HTML' })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно купили ${amountBWorkers} бработников
<b>Сумма:</b> ${finishedToBuyBWorkers.toLocaleString('de-DE')} ${formatNumberInScientificNotation(finishedToBuyBWorkers)}
${message}
    `, { parse_mode: 'HTML' })

    await collection.updateOne({ id: userId1 }, { $inc: { "business.0.bWorkers": parseInt(amountBWorkers), balance: -finishedToBuyBWorkers } })
}

async function addProfitEveryOneHour(collection) {
    const users = await collection.find({ "business.0.bHave": true }).toArray()

    for (let i = 0; i < users.length; i++) {
        const el = users[i];
        const userBWorkers = el.business[0].bWorkers
        const userBWorkersProfit = el.business[0].bWorkersProfit
        const addToProfit = userBWorkers * userBWorkersProfit
        const userBTax = el.business[0].bTax

        collection.updateOne({ id: el.id }, { $inc: { "business.0.bProfit": parseInt(addToProfit), "business.0.bTax": parseInt(Math.floor(userBTax / 2)) } })
    }
    return;
}

async function pulloffBusiness(msg, bot, collection) {
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userBProfit = user.business[0].bProfit
    const userBName = user.business[0].bName

    if (text.toLowerCase() === 'бизнес снять') {
    }
    else {
        return;
    }

    if (userBName === '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас нету бизнеса

<b>Напишите:</b> <code>бизнесы</code> чтобы узнать о бизнесах
        `, { parse_mode: 'HTML' })
        return;
    }

    if (userBProfit <= 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас и так нету денег для снятие с бизнеса
        `, { parse_mode: 'HTML' })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно сняли с бизнеса 
<b>Сумму:</b> ${userBProfit.toLocaleString('de-DE')} ${formatNumberInScientificNotation(userBProfit)}
    `, { parse_mode: 'HTML' })

    await collection.updateOne({ id: userId1 }, { $inc: { "business.0.bProfit": -userBProfit, balance: userBProfit } })
}

async function payTaxForBusiness(msg, bot, collection) {
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userBalance = user.balance
    const userBTax = user.business[0].bTax

    if (text.toLowerCase() === 'бизнес налоги') {
    } else { return }

    if (userBTax === 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас еще нету налогов бизнеса
        `, { parse_mode: "HTML" })
        return;
    }

    if (userBalance < userBTax) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не хватает средств для оплаты налогов бизнеса
        `, { parse_mode: "HTML" })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно оплатили налоги бизнеса
<b>Сумму:</b> ${userBTax.toLocaleString('de-DE')} ${formatNumberInScientificNotation(userBTax)}
    `, { parse_mode: "HTML" })
    await collection.updateOne({ id: userId1 }, { $inc: { balance: -userBTax, "business.0.bTax": -userBTax } })
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
}