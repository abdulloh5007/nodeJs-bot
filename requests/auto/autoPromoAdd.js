require('dotenv').config();
const { formatNumberInScientificNotation } = require('../systems/systemRu');
const { donatedUsers } = require('../donate/donatedUsers');
const { mongoConnect, chatName } = require('../../mongoConnect');
const adminId = parseInt(process.env.ADMIN_ID_INT)

async function autoCreatePromoCodes(bot) {
    const collectionPromo = await mongoConnect('promo')

    const randomPromoName = generateRandomString(10);
    const randomActivation = Math.floor(Math.random() * 11)
    const randomAmount = generateRandomNumber(50000)
    function getRandomText(textOptions) {
        const randomIndex = Math.floor(Math.random() * textOptions.length);
        return textOptions[randomIndex];
    }

    const promoComents = ['Скоро зима🥶', 'Сегодня отличный день!🤩', 'Спасибо за отслеживание новостей🫡'];
    const randomText = getRandomText(promoComents);
    const finishedAmountForOne = Math.floor(randomAmount / randomActivation)

    let channelId = chatName
    await bot.sendMessage(channelId, `
<i>💾Новый промокод 🤖</i>

┌<i>📌Клик:</i> <code>промо ${randomPromoName}</code>
├<i>🔑Количество активаций:</i> <b>${randomActivation}</b>
└<i>💸Приз каждому по:</i> <b>${finishedAmountForOne.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(finishedAmountForOne)}</b>

<i>✉️Коментарии:</i> <b><u>${randomText}</u></b>
        `, {
        parse_mode: 'HTML',
    }).then(() => {

    }).catch(async err => {
        await bot.sendMessage(adminId, `Bot is not a member channel chat`)
        console.log('channel error ' + err);
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
    const finishedAmountForOne = Math.floor(randomAmount / randomActivation)
    
    function getRandomText(textOptions) {
        const randomIndex = Math.floor(Math.random() * textOptions.length);
        return textOptions[randomIndex];
    }

    const promoComents = ['Скоро зима🥶', 'Сегодня отличный день!🤩', 'Спасибо за отслеживание новостей🫡'];
    const randomText = getRandomText(promoComents);
    if (userId1 === adminId) {
        let channelId = chatName
        await bot.sendMessage(channelId, `
<i>💾Новый промокод 🤖</i>

┌<i>📌Клик:</i> <code>промо ${randomPromoName}</code>
├<i>🔑Количество активаций:</i> <b>${randomActivation}</b>
└<i>💸Приз каждому по:</i> <b>${finishedAmountForOne.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(finishedAmountForOne)}</b>

<i>✉️Коментарии:</i> <b><u>${randomText}</u></b>
        `, {
            parse_mode: 'HTML',
        }).then(() => {

        }).catch(async err => {
            await bot.sendMessage(adminId, `Bot is not a member of the channel chat`)
            console.log('channel error ' + err);
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
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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