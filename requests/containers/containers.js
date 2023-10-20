require('dotenv').config();
const { formatNumberInScientificNotation } = require('../systems/systemRu');
const { donatedUsers } = require('../donate/donatedUsers');
const { mongoConnect } = require('../../mongoConnect');

async function addContainers(msg) {
    const collectionContainers = await mongoConnect('containers')

    const text = msg.text

    await collectionContainers.insertOne({
        cName: 'CTY -> Donate Cars',
        cPrice: 2000,
        cPriceType: 'uc',
        cType: 'cars',
        cInfo: `С этого контейнера будет выпадать рандомно машины`,
        cImg: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-RiPE1nqnrJgy8IvsrrquWDO6wngqpGjzYQ&usqp=CAU',
    }).then(() => {
        console.log('ok');
    }).catch((err) => {
        console.log('ошибка при добавлении кейсов ' + err);
    })
}

async function listPriceMoneyContainers(msg, bot, collection) {
    const collectionContainers = await mongoConnect('containers')

    const text = msg.text
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)

    if (['конты', 'контейнеры', 'conts', 'containers'].includes(text.toLowerCase())) {
        const containers = await collectionContainers.find({ cPriceType: 'uc' }).sort({ cPrice: 1 }).toArray()

        let sortedContainers = 'В данный момент контейнеров не существует';
        if (containers.length) {
            sortedContainers = containers.map((e, i) => {
                return `
${i + 1}. <b>${e.cName}</b> - <i>${e.cPrice.toLocaleString('de-DE')} ${formatNumberInScientificNotation(e.cPrice)}</i>
    <u>${e.cInfo}</u>
                `
            })
        }

        let caseOptions = {
            reply_markup: {
                inline_keyboard: [
                    // [{ text: 'донат контейнеры', callback_data: 'donateContainers' }],
                    [{ text: 'открыть контейнер', switch_inline_query_current_chat: 'Открыть контейнер ' }]
                ]
            }
        }

        bot.sendMessage(chatId, `
${userDonateStatus}, вот контейнеры

${sortedContainers}
        `, {
            parse_mode: 'HTML',
            ...caseOptions,
        })
    }
}

async function buyPriceMoneyContainer(msg, bot, collection, glLength) {
    const collectionAchievs = await mongoConnect('achievs');
    const collectionContainers = await mongoConnect('containers')

    const text = msg.text
    const chatId = msg.chat.id
    const userId1 = msg.from.id
    const messageId = msg.message_id

    const user = await collection.findOne({ id: userId1 })
    const userBalance = user.balance
    const userDonateStatus = await donatedUsers(msg, collection)

    const parts = text.split(' ')

    if (parts.length === glLength) {
        bot.sendMessage(chatId, `
${userDonateStatus}, введите номер контейнера из списка контейнеров

<i><code>контейнеры</code></i>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const cont = await collectionContainers.find({ cPriceType: 'uc' }).sort({ cPrice: 1 }).toArray()

    let sortedCont = 'В данный момент нету контейнеров !'
    if (cont.length === 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, ${sortedCont}
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (isNaN(parts[glLength]) || parts[glLength] <= 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, введите номер контейнера !
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const contNumToOpen = parts[glLength]
    const selectedCont = cont[contNumToOpen - 1]

    if (selectedCont === undefined) {
        bot.sendMessage(chatId, `
${userDonateStatus}, нет контейнера с таким номером !
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (userBalance < selectedCont.cPrice) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не хватает средст для открытия этого контейнера
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const contType = selectedCont.cType
    const img = selectedCont.cImg
    const price = selectedCont.cPrice
    contPriseType(msg, contType, collection, userId1, bot, chatId, img, price)

    const achiev = await collectionAchievs.findOne({ id: userId1 })
    const openCase = achiev.case[0].openCase
    const maxOpenCase = achiev.case[0].maxOpenCase
    const caseCost = achiev.case[0].cost

    if (openCase < maxOpenCase + 1) {
        await collectionAchievs.updateOne({ id: userId1 }, { $inc: { 'case.0.openCase': 1 } })
    }

    if (openCase === maxOpenCase - 1) {
        bot.sendMessage(chatId, `
${userDonateStatus}, поздравляем вы выполнили достижение открыть кейс ${maxOpenCase} раза ✅
<b>Вам выдано ${caseCost} UC</b> 
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }
}

async function contPriseType(msg, contType, collection, userId1, bot, chatId, img, price) {
    const contPrise = await mongoConnect(contType)
    const user = await collection.findOne({ id: userId1 })
    const userPriseType = user.properties[0][contType]

    const prise = await contPrise.find({ donate: false }).sort({ price: 1 }).toArray()
    const rundomiseNumber = prise.length

    const randomPrise = Math.floor(Math.random() * parseInt(rundomiseNumber)) + 1
    const randomedPrise = prise[randomPrise - 1]

    const userDonateStatus = await donatedUsers(msg, collection)

    if (!randomedPrise) {
        bot.sendMessage(chatId, `
${userDonateStatus}, нет существует такое имущества
        `, {
            parse_mode: 'HTML',
        })
        return;
    }

    let beReturnedMsg = `
${userDonateStatus}, вы открыли контейнер 🎉

<b>Поздравляем вам выпало имущество <u>${randomedPrise.name}</u></b>
У вас уже было имущетсво, поэтому мы его продали 🫡
и начисли денег в ваш баланс 🥳
    `;

    let contOpt = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Открыть еще', switch_inline_query_current_chat: 'Открыть контейнер ' }]
            ]
        }
    }

    if (userPriseType === '') {
        beReturnedMsg = `
${userDonateStatus}, вы открыли контейнер 🎉

<b>Поздравляем вам выпало имущество <u>${randomedPrise.name}</u></b> 🎁
<b>Вы можете увидеть его цену или информацию написав</b> <code>дома</code> или <code>мой дом</code> 
        `
        const updateObj = {};
        updateObj[`properties.0.${contType}`] = randomedPrise.name;

        await collection.updateOne({ id: userId1 }, { $set: updateObj });
        await collection.updateOne({ id: userId1 }, { $inc: { balance: -price } })

        bot.sendPhoto(chatId, img, {
            caption: `${beReturnedMsg}`,
            parse_mode: 'HTML',
            ...contOpt,
        })
        return;
    }

    bot.sendPhoto(chatId, img, {
        caption: `${beReturnedMsg}`,
        parse_mode: 'HTML',
        ...contOpt,
    })
    const newContPrise = await contPrise.findOne({ name: randomedPrise.name })
    const prisePrice = newContPrise.price * 0.9

    const collectionAchievs = await mongoConnect('achievs');
    const achiev = await collectionAchievs.findOne({ id: userId1 })

    await collection.updateOne({ id: userId1 }, { $inc: { balance: -price } })
    await collection.updateOne({ id: userId1 }, { $inc: { balance: prisePrice } })
    if (contType === 'houses') {
        await collection.updateOne({ id: userId1 }, { $inc: { "stats.0.openCaseHouses": 1 } })
        const buyHouse = achiev.house[0].buyHouse
        const houseCost = achiev.house[0].cost

        if (buyHouse === false) {
            await collectionAchievs.updateOne({ id: userId1 }, { $set: { 'house.0.buyHouse': true } }).then(async (el) => {
                if (el.modifiedCount === 1) {
                    bot.sendMessage(chatId, `
${userDonateStatus}, поздравляем вы выполнили достижения купить дом ✅
<b>Вам выдано ${houseCost} UC</b>
                        `, {
                        parse_mode: 'HTML',
                    })
                    await collection.updateOne({ id: userId1 }, { $inc: { uc: houseCost } })
                }
            })
        }
    }
    else if (contType === 'cars') {
        await collection.updateOne({ id: userId1 }, { $inc: { "stats.0.openCaseCars": 1 } })
        const buyCar = achiev.car[0].buyCar
        const carCost = achiev.car[0].cost

        if (buyCar === false) {
            await collectionAchievs.updateOne({ id: userId1 }, { $set: { 'car.0.buyCar': true } }).then(async (el) => {
                if (el.modifiedCount === 1) {
                    bot.sendMessage(chatId, `
${userDonateStatus}, поздравляем вы выполнили достижения купить машину ✅
<b>Вам выдано ${carCost} UC</b>
                        `, {
                        parse_mode: 'HTML',
                    })
                    await collection.updateOne({ id: userId1 }, { $inc: { uc: carCost } })
                }
            })
        }
    }
}

async function donateContainers(msg, bot, collection) {
    const data = msg.data
    const msgId = msg.id

    const collectionContainers = await mongoConnect('containers')

    const chatId = msg.message.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)

    if (data === 'donateContainers') {

        const containers = await collectionContainers.find({ cPriceType: 'uc' }).sort({ cPrice: 1 }).toArray()

        let sortedContainers = `\nВ данный момент контейнеров не существует`;
        if (containers.length) {
            sortedContainers = containers.map((e, i) => {
                return `
${i + 1}. <b>${e.cName}</b> - <i>${e.cPrice.toLocaleString('de-DE')} ${formatNumberInScientificNotation(e.cPrice)}</i>
    <u>${e.cInfo}</u>
                `
            })
        }

        let caseOptions = {
            reply_markup: {
                inline_keyboard: [
                    // [{ text: 'донат контейнеры', callback_data: 'donateContainers' }],
                    [{ text: 'открыть контейнер', switch_inline_query_current_chat: 'Открыть контейнер ' }]
                ]
            }
        }

        bot.sendMessage(chatId, `
${userDonateStatus}, вот контейнеры
${sortedContainers}
        `, {
            parse_mode: 'HTML',
            ...caseOptions,
        })
    }
}

module.exports = {
    addContainers,
    listPriceMoneyContainers,
    buyPriceMoneyContainer,
    donateContainers,
}