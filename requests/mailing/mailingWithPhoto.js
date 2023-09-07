const { customChalk } = require('../../customChalk')
const { donatedUsers } = require('../donate/donatedUsers')

require('dotenv').config()
const adminId = parseInt(process.env.ADMIN_ID_INT)

async function mailingWithPhoto(msg, bot, collection) {
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)
    const parts = text.split(' ')

    const users = await collection.find().toArray();
    if (userId1 !== adminId) {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы не являетесь администратором бота
            `, { parse_mode: 'HTML' })
        return;
    }

    if (parts.length === 1) {
        bot.sendMessage(chatId, `
${userDonateStatus}, текст рассылки не должно быть пустым
            `, { parse_mode: 'HTML' })
        return;
    }

    for (let i = 0; i < users.length; i++) {
        const el = users[i];

        try {
            let formattedText = text.slice(parts[0].length + 1);
            // Попытка отправить сообщение
            await bot.sendMessage(el.id, formattedText, { parse_mode: 'HTML' });
        } catch (error) {
            if (error.response && error.response.statusCode === 403) {
                console.log(customChalk.colorize(`Пользователь ${el.id} заблокировал бота`, { style: 'italic', background: 'bgRed' }));
            } else if (error.response && error.response.statusCode === 400) {
                console.log(customChalk.colorize(`Пользователя ${el.id} нет чата с ботом`, { style: 'italic', background: 'bgYellow' }))
            } else {
                console.log(customChalk.colorize(`Ошибка при отправке сообщения пользователю ${el.id}: ${error.message}`, { style: 'italic', background: 'bgRed' }));
            }
        }
    }

    if (text.toLowerCase() === '!коды рас') {
        bot.sendMessage(chatId, `
Вот коды рассылки

BOLD = <b>Текст</b>
ITALIC = <i>Текст</i>
COPY = <code>Текст</code>
LINK = <a href="Ссылка">Текс ссылки</a>
        `, { parse_mode: 'Markdown' })
    }
}