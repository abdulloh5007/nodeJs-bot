const { customChalk } = require('../../customChalk')
const { donatedUsers } = require('../donate/donatedUsers')

require('dotenv').config()
const adminId = parseInt(process.env.ADMIN_ID_INT)

async function addAddvert(msg, bot, collectionAddvert, collection, globLength, toSliceLength) {
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const parts = text.split(' ')

    const advertisingText = text.slice(toSliceLength.length + 1)
    const date = new Date()

    if (userId1 !== adminId) {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы не являетесь администратором бота
            `, { parse_mode: 'HTML' })
        return;
    }

    if (parts.length === globLength) {
        bot.sendMessage(chatId, `
${userDonateStatus}, реклама не должна быть пустым
            `, { parse_mode: 'HTML' })
        return;
    }

    try {
        // Попытка отправить сообщение
        await bot.sendMessage(chatId, `
${userDonateStatus}, Реклама успешна опубликована

Дата публикации: ${date.getDate()}.${(date.getMonth() + 1)}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}
Текст: ${advertisingText}
            `, { parse_mode: 'HTML' })

        await collectionAddvert.insertOne({
            addvertTime: date,
            addvertText: advertisingText,
            addvertEndTime: ''
        })

    } catch (error) {
        if (error.response && error.response.statusCode === 400) {
            bot.sendMessage(chatId, `
${userDonateStatus}, не правильно написаны коды проверьте их и отправьте заново
если не знаете коды то напишите <code>!коды рек</code>
                `, { parse_mode: 'HTML' })
        } else {
            bot.sendMessage(chatId, `Ошибка при публиковке рекламы: ${error.message}`, {
                parse_mode: 'HTML',
            });
        }
    }
    if (text.toLowerCase() === '!коды рек') {
        bot.sendMessage(chatId, `
Вот коды рекламы

BOLD = <b>Текст</b>
ITALIC = <i>Текст</i>
COPY = <code>Текст</code>
LINK = <a href="Ссылка">Текс ссылки</a>
        `, { parse_mode: 'Markdown' })
    }
}

async function addverts(msg, bot, collection, collectionAddvert) {
    const text = msg.text
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const addverts = await collectionAddvert.find({}, { sort: { addvertTime: -1 } }).toArray()

    let addvertOptions = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Добавить рек', switch_inline_query_current_chat: '!+рек ' }],
                addverts.length ? [{ text: 'Удалить рек', switch_inline_query_current_chat: '!-рек ' }] : []
            ]
        }
    }

    const sortedAddverts = addverts.map((e, i) => {
        const dateAddvert = new Date(e.addvertTime)

        return `

${i + 1}. <b>ДАТА:</b> ${dateAddvert.toLocaleDateString()}
    <b>ТЕКСТ:</b> ${e.addvertText}`
    })

    bot.sendMessage(chatId, `
${userDonateStatus}, вот активные рекламы отсортированы по дате
${sortedAddverts}
    `, { parse_mode: 'HTML', ...addvertOptions })
}

async function deleteAdd(msg, bot, collection, collectionAddvert, globLength) {
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const parts = text.split(' ')

    const numberToDel = parts[globLength]

    if (userId1 !== adminId) {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы не являетесь администратором бота
            `, { parse_mode: 'HTML' })
        return;
    }

    if (parts.length === globLength) {
        bot.sendMessage(chatId, `
${userDonateStatus}, напишите мне номер рекламы который вы хотите удалить

<b>номер можно увидеть из списка реклам</b> <code>рекламы</code>
            `, { parse_mode: 'HTML' })
        return;
    }

    if (isNaN(numberToDel)) {
        bot.sendMessage(chatId, `
${userDonateStatus}, для удаление рукламы выберите номер из списка реклам 
        `, { parse_mode: 'HTML' })
        return;
    }

    if (numberToDel < 1) {
        bot.sendMessage(chatId, `
        ${userDonateStatus}, номер который вы определили не найдено из списка реклам
        `, { parse_mode: 'HTML' })
        return;
    }

    const addverts = await collectionAddvert.find().sort({ addvertTime: -1 }).toArray()
    const addverToUpd = addverts[numberToDel - 1]

    await collectionAddvert.deleteOne({ _id: addverToUpd._id });
    bot.sendMessage(chatId, `
${userDonateStatus}, успешно удалена реклама под номером ${numberToDel}
    `, { parse_mode: 'HTML' })
}

async function deleteAllAddverts(msg, bot, collectionAddvert, collection) {
    const userId1 = msg.from.id;
    const chatId = msg.chat.id;
    const text = msg.text

    const userDonateStatus = await donatedUsers(msg, collection)

    if (userId1 === adminId) {
        try {
            await collectionAddvert.deleteMany({});
            bot.sendMessage(chatId, `
${userDonateStatus}, успешно удылены все рекламы
            `, { parse_mode: 'HTML' });
        } catch (error) {
            console.error(error);
            bot.sendMessage(chatId, `
${userDonateStatus}, Произошла ошибка при удалении всех реклам
            `, { parse_mode: 'HTML' });
        }
    } else {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы не являетесь администратором бота чтобы использовать эту команду
        `, { parse_mode: 'HTML' });
    }
}

module.exports = {
    addAddvert,
    addverts,
    deleteAdd,
    deleteAllAddverts,
}