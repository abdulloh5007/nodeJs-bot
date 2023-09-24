require('dotenv').config();
const { donatedUsers } = require('../donate/donatedUsers');
const math = require('mathjs');
const { mongoConnect } = require('../../mongoConnect');

async function calcInfo(msg, bot) {
    const collection = await mongoConnect('users')

    const text = msg.text
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)

    bot.sendMessage(chatId, `
${userDonateStatus}, отправьте мне <code>кт 100 / 10 * 10 - 10 + 10 + 10e3</code>
только <b><u>e</u></b> должен быть английким буквом
Чтобы я вычислил
        `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
}

async function calc(msg, bot) {
    const collection = await mongoConnect('users')

    const text = msg.text
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)

    const expression = text.substring(3); // Удалить "кт " из сообщения
    const result = calculateExpression(expression);
    bot.sendMessage(chatId, `
${userDonateStatus}, ваш ответ
${result}
        `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    }) // Вывести результат в консоль
}



function calculateExpression(expression) {
    try {
        const result = math.evaluate(expression);
        return result.toLocaleString('de-DE'); // Преобразовать результат в строку и вернуть его
    } catch (error) {
        return 'Ошибка в выражении';
    }
}

module.exports = {
    calcInfo,
    calc,
}