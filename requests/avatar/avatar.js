require('dotenv').config()
const adminId = parseInt(process.env.ADMIN_ID_INT)
const mongoDbUrl = process.env.MONGO_DB_URL
const { MongoClient } = require('mongodb');
const client = new MongoClient(mongoDbUrl);

async function connecting() {
    await client.connect()
}

const { donatedUsers } = require('../donate/donatedUsers')

async function avatarMenu(msg, bot) {
    const db = client.db('bot');
    const collection = db.collection('users');

    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userStatus = user.status[0].statusName

    let statusForAva = false
    if (userStatus === 'premium' || userStatus === 'vip') {
        statusForAva = true
    }

    let optionsForAva = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Поставить аву', switch_inline_query_current_chat: '+ава' }]
            ]
        }
    }

    if (statusForAva === false) {
        bot.sendMessage(chatId, `
${userDonateStatus}, не каждый может поставить аватарку на свой профиль
<b>Только с статусами:</b> <i>PREMIUM</i> или <i>VIP</i>
            `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }
    else {
        bot.sendMessage(chatId, `
${userDonateStatus}, нажмите кнопку нижу чтобы поставить аватару
Потом отправьте картину которую вы хотите поставить в аватарку

Инструкция
<code>+ава [юрл картинки]</code> вместо юрл поставьте свой юрл картины

<b>ЮРЛ КАРТИНЫ МОЖНО ПОЛУЧИТЬ ОТПРАВИВ КАРТИНУ БОТУ</b>
            `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
            ...optionsForAva,
        })
    }
}

async function addAvatar(msg, bot, glLength) {
    const db = client.db('bot');
    const collection = db.collection('users');

    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userStatus = user.status[0].statusName
    const parts = text.split(' ')

    if (userStatus !== 'premium' && userStatus !== 'vip') {
        bot.sendMessage(chatId, `
${userDonateStatus}, простите но вы не можете поставить автарку
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (parts.length !== glLength + 1) {
        bot.sendMessage(chatId, `
${userDonateStatus}, не правильно использовано команда
<b>Пример:</b> <code>+ава [юрл]</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (user.avatar[0].waiting !== '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы уже подали заявку на аватара дождитесь ответа
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, Ваша аватарка успешно отправлено администарицию
<u>Желаем терпение !</u>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })

    const testUser = `${parts[glLength]}_${userId1}`

    const userAva = testUser.split('_')
    const userWaitingId = userAva[1]
    const userWaitingUrl = userAva[0]

    let avaToCheck = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Принять', callback_data: `avatarAccept_${userWaitingId}` }],
                [{ text: 'Отклонить', callback_data: `avatarReject_${userWaitingId}` }]
            ]
        }
    }

    try {
        await bot.sendPhoto(adminId, userWaitingUrl, {
            parse_mode: 'HTML',
            caption: `Пользователь с айди <a href='tg://user?id=${userWaitingId}'>${user.userName}</a>`,
            ...avaToCheck,
        });
        await collection.updateOne({ id: userId1 }, {
            $set: {
                "avatar.0.waiting": testUser
            }
        })
    } catch (err) {
        if (err.response && err.response.status === 400) {
            console.log('Error to avatar send: ' + err);
        } else {
            bot.deleteMessage(chatId, messageId + 1)

            bot.sendMessage(chatId, `
${userDonateStatus}, проверьте юрл картинки
            `, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            })
            console.log('Error to avatar send: ' + err);
        }
    }
}

async function avaChekAdmins(msg, bot) {
    const db = client.db('bot');
    const collection = db.collection('users');

    const data = msg.data

    const [wait, waitId] = data.split('_')
    const waitIdInt = parseInt(waitId)
    const user = await collection.findOne({ id: waitIdInt })
    const chatId = msg.message.chat.id
    const messageId = msg.message.message_id

    const userDonateStatus = await donatedUsers(msg, collection)

    if (wait === 'avatarAccept') {
        const waitUrl = user.avatar[0].waiting.split('_')[0]
        bot.sendMessage(waitIdInt, `
<b>Ваша аватарка успешно проверено администратором</b> ✅
        `, {
            parse_mode: 'HTML',
        })
        bot.deleteMessage(chatId, messageId)
        bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно приняли заявку пользователя бота <a href='tg://user?id=${user.id}'>${user.userName}</a> ✅
        `, {
            parse_mode: 'HTML',
        })

        await collection.updateOne({ id: waitIdInt }, {
            $set: {
                "avatar.0.avaUrl": waitUrl,
                "avatar.0.waiting": '',
            }
        })
    }

    if (wait === 'avatarReject') {
        bot.sendMessage(waitIdInt, `
<b>Ваша аватарка отклонена администратором ❌</b>
        `, {
            parse_mode: 'HTML',
        })
        bot.deleteMessage(chatId, messageId)
        bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно отклонили заявку пользователя бота <a href='tg://user?id=${user.id}'>${user.userName}</a> ❌
        `, {
            parse_mode: 'HTML',
        })

        await collection.updateOne({ id: waitIdInt }, {
            $set: {
                "avatar.0.waiting": '',
            }
        })
    }
}

module.exports = {
    avatarMenu,
    addAvatar,
    avaChekAdmins,
}