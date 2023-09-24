require('dotenv').config();
const { formatNumberInScientificNotation } = require('../systems/systemRu');
const { donatedUsers } = require('../donate/donatedUsers');
const adminId = parseInt(process.env.ADMIN_ID_INT)

async function autoCreatePromoCodes(bot) {
    const collectionPromo = await mongoConnect('promo')

    const randomPromoName = generateRandomString(10);
    const randomActivation = Math.floor(Math.random() * 11)
    const randomAmount = generateRandomNumber(30000)
    const promoComents = 'Спасибо что вы с нами'
    const finishedAmountForOne = Math.floor(randomAmount / randomActivation)

    let channelId = '@cty_channaldev'
    await bot.sendMessage(channelId, `
<b>Промокод от бота ↓</b>

<b>Название:</b> <code>${randomPromoName}</code>
<b>Количество использований:</b> ${randomActivation}
<b>Приз каждому по:</b> ${finishedAmountForOne.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(finishedAmountForOne)}

<b>Коментарии:</b> <u>${promoComents}</u>
        `, {
        parse_mode: 'HTML',
    }).then(() => {

    }).catch(err => {
        console.log('th ' + err);
    })
    await collectionPromo.insertOne({
        promoName: randomPromoName,
        promoActivision: parseInt(randomActivation),
        promoMoney: parseInt(Math.floor(randomAmount)),
        promoDonate: false,
        promoComent: promoComents,
        promoUsedBy: []
    })
}

async function autoDeleteAllPromocodes(bot) {
    const collectionPromo = await mongoConnect('promo')

    await collectionPromo.deleteMany({ _id: ObjectId }).then(() => {
        bot.sendMessage(adminId, `
Все промокоды успешно удалены автоматически
        `)
    })
}

async function manualDeleteAllPromocodes(bot) {
    const collectionPromo = await mongoConnect('promo')

    await collectionPromo.deleteMany({ _id: ObjectId }).then(() => {
        bot.sendMessage(adminId, `
Все промокоды успешно удалены в ручную
        `)
    })
}

async function manualCreatePromoCodes(msg, bot, collection) {
    const collectionPromo = await mongoConnect('promo')

    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const randomPromoName = generateRandomString(10);
    const randomActivation = Math.floor(Math.random() * 11) + 1
    const randomAmount = generateRandomNumber(30000)
    const promoComents = 'Спасибо что вы с нами'
    const finishedAmountForOne = Math.floor(randomAmount / randomActivation)

    if (userId1 === adminId) {
        let channelId = '@cty_channaldev'
        await bot.sendMessage(channelId, `
<b>Промокод от бота ↓</b>

<b>Название:</b> <code>${randomPromoName}</code>
<b>Количество использований:</b> ${randomActivation}
<b>Приз каждому по:</b> ${finishedAmountForOne.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(finishedAmountForOne)}

<b>Коментарии:</b> <u>${promoComents}</u>
        `, {
            parse_mode: 'HTML',
        }).then(() => {

        }).catch(err => {
            console.log('th ' + err);
        })
        await collectionPromo.insertOne({
            promoName: randomPromoName,
            promoActivision: parseInt(randomActivation),
            promoMoney: parseInt(randomAmount),
            promoDonate: false,
            promoComent: promoComents,
            promoUsedBy: []
        })
    }
    else {
        bot.sendMessage(chatId, `
${userDonateStatus}, Простите но вы не являетесь администратором бота
            `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }
}

function generateRandomNumber(num) {
    // Генерируем случайное число в заданном диапазоне
    return Math.floor(Math.random() * num);
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789♂♀♪♫☼►◄►¶∟▲▼';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
}

module.exports = {
    autoCreatePromoCodes,
    manualCreatePromoCodes,
    manualDeleteAllPromocodes,
    autoDeleteAllPromocodes,
}