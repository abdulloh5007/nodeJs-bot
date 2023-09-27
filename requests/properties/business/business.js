const { donatedUsers } = require('../../donate/donatedUsers');
const { formatNumberInScientificNotation } = require('../../systems/systemRu');
const { customChalk } = require('../../../customChalk');
const { mongoConnect } = require('../../../mongoConnect');
require('dotenv').config()

const adminId = parseInt(process.env.ADMIN_ID_INT)

async function addBusiness(msg, bot) {
    const collectionBusiness = await mongoConnect('businesses')

    const text = msg.text
    const chatId = msg.chat.id
    const userId = msg.from.id

    if (userId !== adminId) {
        bot.sendMessage(chatId, `
Вы не являетесь администратором бота
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }

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
    const collectionBusiness = await mongoConnect('businesses')

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

<i>Чтобы купить бизнес напишите:</i> <u><code>купить бизнес [номер]</code></u>
    `, { parse_mode: 'HTML', ...businessOptions })
}

async function buyBusiness(msg, bot, collection, glLength) {
    const collectionBusiness = await mongoConnect('businesses')
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

    await collection.updateOne({ id: userId1 }, { $set: { "business.0.name": selectedBusiness.name, "business.0.maxWorkers": selectedBusiness.maxWorkers, "business.0.workersProfit": selectedBusiness.workersProfit, "business.0.tax": selectedBusiness.tax, "business.0.have": true, "business.0.workers": 20 } })
    await collection.updateOne({ id: userId1 }, { $inc: { balance: -selectedBusiness.price } })
}

async function infoBusiness(msg, bot, collection) {
    const collectionBusiness = await mongoConnect('businesses')

    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userBusiness = user.business[0].name

    if (userBusiness === '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, У вас нет бизнеса

<i>Чтобы узнать:</i> <u><code>бизнесы</code></u>
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
    const speeds = user.business[0].speeds
    const workersProfitHour = workersProfit * workers
    const localedStringProfitWorkers = `${workersProfitHour.toLocaleString('de-DE')} ${formatNumberInScientificNotation(workersProfitHour)}`
    const endProfit = Math.floor(workersProfitHour * 2)
    const dayCount = Math.floor((endProfit - tax) / (workersProfitHour / 2))
    const dayCountTxt = dayCount !== 0 ? `<b>» У вас осталось ${dayCount} дня</b>` : '<b>» Ваш бизнес завтра будет закрыт 🧨</b>'

    let businessKb = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🚀Оплатить налоги', switch_inline_query_current_chat: 'бизнес налоги' },
                    { text: '💰Снять прибыль', switch_inline_query_current_chat: 'бизнес снять' }
                ],
                [
                    { text: '👨‍🔧Купить бработников', switch_inline_query_current_chat: 'купить бработников 5' },
                    { text: '🧨Продать бизнес', switch_inline_query_current_chat: 'продать бизнес' }
                ],
                [
                    { text: '🧰Купить ускоритель', switch_inline_query_current_chat: 'купить ббуст 1' },
                    { text: '⚡️Ускорить', switch_inline_query_current_chat: 'бизнес ускорить' },
                ]
            ]
        }
    }

    bot.sendPhoto(chatId, bPhoto, {
        parse_mode: 'HTML',
        caption: `
${userDonateStatus}, вот информация о вашем бизнесе 🏗

┌ <i>Название бизнеса:</i> <b>${userBusiness}</b>
├ <i>Кол-во работников:</i> <b>${workers}</b>
├ <i>Макс кол-во работников:</i> <b>${maxWorkers}</b>
└ <i>Прибыль в день:</i> <b>${workers >= 1 ? localedStringProfitWorkers : 0}</b>

<i>» Общий прибыль:</i> <b>${profit.toLocaleString('de-DE')} ${formatNumberInScientificNotation(profit)}</b>
<i>» Налоги:</i> <b>${tax.toLocaleString('de-DE')} ${formatNumberInScientificNotation(tax)}</b>
<i>» Ускорители:</i> <b>${speeds} ⚡️</b>

<i>» Прибыль от каждого работника будет состоять по:</i> <b>${workersProfit.toLocaleString('de-DE')} ${formatNumberInScientificNotation(workersProfit)}</b>

<i>» ❗️Если ваши налоги будут превышать <b>${endProfit.toLocaleString('de-DE')}</b> это означает 4 раза пропустить налоги</i>
${dayCountTxt}
        `,
        ...businessKb,
    })

    // <i>Чтобы узнать о работниках напишите:</i> <u><code>инфо бработники</code></u>
    // <i>Чтобы оплатить налоги напишите:</i> <u><code>бизнес налоги</code></u>
    // <i>Чтобы снять прибыль:</i> <u><code>бизнес снять</code></u>
}

async function workersInfo(msg, bot, collection) {
    const collectionBusiness = await mongoConnect('businesses')

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
┌ <i>Ваш бизнес:</i> <b>${userBusiness}</b>
├ <i>Стоимость работников:</i> <b>${workersPrice}</b>
└ <i>Прибыль работника:</i> <b>${workersProfit}</b>
        `
    }

    let workersOptions = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '👨‍🔧Купить бработников', switch_inline_query_current_chat: 'купить бработников ' }]
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
    const collectionBusiness = await mongoConnect('businesses')

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
    const userTax = user.business[0].tax

    const parts = text.split(' ')

    if (parts.length === glLength) {
        bot.sendMessage(chatId, `
${userDonateStatus}, введите количество бизнес работников чтобы купить

<u><code>купить бработников [кол-во]</code></u>
`, { parse_mode: 'HTML' })
        return;
    }

    if (userBname === '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не существует бизнеса чтобы купить для него бработников

<i>Напишите:</i> <u><code>бизнесы</code></u> чтобы узнать о бизнесах
        `, { parse_mode: 'HTML' })
        return;
    }

    const amountworkers = parts[glLength]
    const amountToBuyWorkersAndworkers = parseInt(amountworkers) + parseInt(userworkers)

    if (isNaN(amountworkers) || amountworkers <= 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, не возможно купить количество букв или отрицательное количество бработников

<i>Отправьте количество бработников в числовом формате</i>
        `, { parse_mode: 'HTML' })
        return;
    }

    if (amountToBuyWorkersAndworkers > usermaxWorkers) {
        bot.sendMessage(chatId, `
${userDonateStatus}, количество бработников который вы хотите купить, превышает 
максимальное кол-во работников бизнеса

<i>Напишите:</i> <u><code>мой бизнес</code></u>
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
<i>» ${userStatus.toUpperCase()}</i> <b>10% скидка от каждого работника</b>`
    }
    else if (userStatus === 'vip') {
        procent20 = Math.floor((workersProfit / 100) * 13)
        message = `
<i>» ${userStatus.toUpperCase()}</i> <b>7% скидка от каждого работника</b>`
    }
    else if (userStatus === 'standart') {
        procent20 = Math.floor((workersProfit / 100) * 15)
        message = `
<i>» ${userStatus.toUpperCase()}</i> <b>5% скидка от каждого работника</b>`
    }
    else {
        procent20 = 0
        message = ``
    }

    const workersPrice = Math.floor(workersProfit + procent20)
    const possibleBuyworkers = Math.floor(userBalance / workersPrice)
    const finishedToBuyworkers = workersPrice * amountworkers

    if (userBalance < finishedToBuyworkers) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не хватает средств для покупки ${amountworkers} 
бработников

<i>Вы можете купить:</i> <b>${possibleBuyworkers}</b>
        `, { parse_mode: 'HTML' })
        return;
    }

    if (userTax !== 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, сначало оплати налоги прежде чем купить новых
бработников
        `, {
            parse_mode: 'HTML',
        })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно купили ${amountworkers} бработников
<i>Сумма:</i> <b>${finishedToBuyworkers.toLocaleString('de-DE')} ${formatNumberInScientificNotation(finishedToBuyworkers)}</b>
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
        const endTax = Math.floor(addToProfit * 2)
        const daysCount = Math.floor((endTax - usertax) / (addToProfit / 2)) - 1

        if (usertax >= endTax) {
            try {
                await bot.sendMessage(el.id, `
${userDonateStatus}, <b>Ваш бизнес автоматически был закрыт так как вы не платили налоги 💣</i>
<b>Не скажи что мы не говорили</b>
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
${userDonateStatus}, <b>СКОРЕЕ ! ПИШИ</b> <code>бизнес налоги</code>
<b>А то после ${daysCount} дня твоего бизнеса не будет !</b>

<b>САМАЯ ГЛАВНАЯ НОВОСТЬ Я ПРИНЕС ТЕБЕ ЗАРПЛАТУ😉</b>
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
        collection.updateOne({ id: el.id }, { $inc: { "business.0.profit": parseInt(addToProfit), "business.0.tax": parseInt(Math.floor(addToProfit / 2)) } })
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
        const endTax = Math.floor(addToProfit * 2)
        const daysCount = Math.floor((endTax - usertax) / (addToProfit / 2)) - 1

        if (usertax >= endTax) {
            try {
                await bot.sendMessage(el.id, `
${userDonateStatus}, <b>Ваш бизнес автоматически был закрыт так как вы не платили налоги 💣</b>
<b>Не скажи что мы не говорили</b>
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
${userDonateStatus}, <b>СКОРЕЕ ! ПИШИ</b> <code>бизнес налоги</code>
<b>А то после ${daysCount} дня твоего бизнеса не будет !</b>

<b>САМАЯ ГЛАВНАЯ НОВОСТЬ Я ПРИНЕС ТЕБЕ ЗАРПЛАТУ😉</b>
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
        collection.updateOne({ id: el.id }, { $inc: { "business.0.profit": parseInt(addToProfit), "business.0.tax": parseInt(Math.floor(addToProfit / 2)) } })
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

<i>Напишите:</i> <code>бизнесы</code> чтобы узнать о бизнесах
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
<i>Сумму:</i> <b>${userprofit.toLocaleString('de-DE')} ${formatNumberInScientificNotation(userprofit)}</b>
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

<i>Напишите:</i> <code>бизнесы</code> чтобы узнать о бизнесах
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
<i>Сумму:</i> <b>${usertax.toLocaleString('de-DE')} ${formatNumberInScientificNotation(usertax)}</b>
    `, { parse_mode: "HTML" })
    await collection.updateOne({ id: userId1 }, { $inc: { balance: -usertax, "business.0.tax": -usertax } })
}

async function sellBusiness(msg, bot, collection) {
    const collectionBusiness = await mongoConnect('businesses')

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

<i>Напишите:</i> <code>бизнесы</code> чтобы узнать о бизнесах
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
<i>Стоимость продажи:</i> <b>${flooredBPrice.toLocaleString('de-DE')}</b>

${profitMsg}
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
    await collection.updateOne({ id: userId1 }, { $set: { "business.0.name": '', "business.0.profit": 0, "business.0.workers": 0 } })
    await collection.updateOne({ id: userId1 }, { $inc: { balance: incBalance } })
}

async function addBusinessSpeeds(msg, bot, collection, index) {
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const parts = text.split(' ')
    const buyAmount = parts[index]

    if (!buyAmount || isNaN(buyAmount)) {
        bot.sendMessage(chatId, `
${userDonateStatus}, не правильно введена кол-во ускорителей
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const user = await collection.findOne({ id: userId1 })
    const userUc = user.uc

    const amount = Math.floor(buyAmount * 30)

    if (amount > userUc) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не хватает донатных-валют <b>(UC)</b> 
<i>Для покупки ${buyAmount}</i>
<i>Вы можете купить ${Math.floor(userUc / 30)}</i>
<b>1 ускоритель⚡️ бизнеса стоит 30 UC</b>

<b>Почему бизнес ускорители так дорого стоит? Потому что вы использав ускоритель вы получаете только зарплату 1.3X больше и не получаете налоги!</b>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно приобрели ${buyAmount}⚡️ для своего бизнеса
<i>Стоимость:</i> <b>${amount.toLocaleString('de-DE')} UC</b>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
    await collection.updateOne({ id: userId1 }, { $inc: { "business.0.speeds": parseInt(buyAmount), uc: -amount } }).then(() => {

    }).catch(err => console.log('business bust err ' + err))
}

async function bustBusiness(msg, bot, collection) {
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const user = await collection.findOne({ id: userId1 })
    const bName = user.business[0].name
    const userDonateStatus = await donatedUsers(msg, collection)

    if (bName === '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас еше нету бизнеса для ускорение
<i>Купить бизнес:</i> <code>бизнесы</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const bBusts = user.business[0].speeds
    if (bBusts === 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас нету бизнес ускоритель
<i>чтобы купить:/i> <code>мой бизнес</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const collectionBusiness = await mongoConnect('businesses')
    const business = await collectionBusiness.findOne({ name: bName })
    const workersProfit = business.workersProfit

    const workers = user.business[0].workers
    const workersProfitHour = Math.floor((workersProfit * workers) * 1.3)

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно использовали бизнес ускоритель и получили зарплату
<i>Получена:</i> <b>${workersProfitHour.toLocaleString('de-DE')} ${formatNumberInScientificNotation(workersProfitHour)} 🪄[1.3X]</b>

<b>При этом не получили налоги!🎉</b>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
    await collection.updateOne({ id: userId1 }, { $inc: { "business.0.profit": workersProfitHour, "business.0.speeds": -1 } })
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
    addBusinessSpeeds,
    bustBusiness,
}