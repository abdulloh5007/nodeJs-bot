const { mongoConnect } = require("../../../mongoConnect");
const { donatedUsers } = require("../../donate/donatedUsers");
const { generateRandomString } = require("../../islands/islands");

async function openYTAcc(msg, bot) {
    const collection = await mongoConnect('users');

    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userYTacc = user.youtube[0].have

    const myYTbtn = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '📱Мой канал', switch_inline_query_current_chat: 'мой ютуб' }]
            ]
        }
    }

    if (userYTacc === true) {
        const userYTaccName = user.youtube[0].name
        return bot.sendMessage(chatId, `
${userDonateStatus}, у вас уже есть ютуб канал
<i>Под именем:</i> <b>${userYTaccName}</b>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            ...myYTbtn,
        })
    }

    const nameYoutube = generateRandomString(9)
    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно открыли свой ютуб канал
<i>Под именем</i> <b>${nameYoutube}</b>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
        ...myYTbtn
    })
    await collection.updateOne({ id: userId1 }, {
        $set: {
            youtube: [{
                have: true,
                name: nameYoutube,
                owner: userId1,
                videos: 0,
                likes: 0,
                subscribed: [],
                subscribers: 0,
                profit: 10,
            }]
        }
    })
}

async function infoMyYTacc(msg, bot) {
    const collection = await mongoConnect('users');

    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userYThave = user.youtube[0].have

    const openYTaccBtn = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀Открыть ютуб', switch_inline_query_current_chat: 'открыть ютуб' }]
            ]
        }
    }

    if (userYThave === false) {
        return bot.sendMessage(chatId, `
${userDonateStatus}, у вас еще нет ютубу канала вы можете открыть его по командам ниже
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            ...openYTaccBtn,
        })
    }

    const uYTname = user.youtube[0].name
    const uYTowner = user.userName
    const uYTvideos = user.youtube[0].videos
    const uYTlikes = user.youtube[0].likes
    const uYTsubsbed = user.youtube[0].subscribed
    const uYTsubs = user.youtube[0].subscribers
    const uYTprofit = user.youtube[0].profit

    const YTinfoBtn = {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '🖍Сменить ник', switch_inline_query_current_chat: '+ник ютуб ' },
                    { text: '💸Снять прибыль', switch_inline_query_current_chat: 'ютуб прибыль' },
                ],
                [
                    { text: '📯Выложить видео', switch_inline_query_current_chat: 'ютуб видео' },
                ]
            ]
        }
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, ваш канал YOUTUBE📱

<i>📌Владелец:</i> <b>${uYTowner}</b>
<i>🪪Название:</i> <b>${uYTname}</b>

<i>🎬Видео:</i> <b>${uYTvideos}</b>
<i>❤️Лайки:</i> <b>${uYTlikes.toLocaleString('de-DE')}</b>

<i>👨‍👧‍👦Подписчики:</i> <b>${uYTsubs.toLocaleString('de-DE')}</b>
<i>💰Прибыль:</i> <b>${uYTprofit}</b>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
        ...YTinfoBtn,
    })
}

async function changeNameYT(msg, bot, len) {
    const collection = await mongoConnect('users');

    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const parts = text.split(' ')

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const uYThave = user.youtube[0].have

    const openYTaccBtn = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🚀Открыть ютуб', switch_inline_query_current_chat: 'открыть ютуб' }]
            ]
        }
    }

    if (uYThave === false) {
        return bot.sendMessage(chatId, `
${userDonateStatus}, у вас еще нет YOUTUBE канала
<b>Сначало откройте его</b>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            ...openYTaccBtn,
        })
    }

    const newNick = parts[len]

    if (newNick === undefined || newNick.length < 5) {
        return bot.sendMessage(chatId, `
${userDonateStatus}, не правильно введен новый ник
<b>Ник не должен быть меньше 5-знаков</b> 
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно сменили ник 
<i>своего YOUTUBE канала на:</i> <b>${newNick}</b>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })

    await collection.updateOne({ id: userId1 }, { $set: { "youtube.0.name": newNick } })
}

module.exports = {
    openYTAcc,
    infoMyYTacc,
    changeNameYT,
}