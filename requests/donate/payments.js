require('dotenv').config();
const provider = process.env.PROVIDER_TOKEN_TEST_CLICK

async function testPayment(msg, bot) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const invoice = {
        chat_id: userId, // Уникальный идентификатор целевого чата или имя пользователя целевого канала
        provider_token: provider, // токен выданный через бот @SberbankPaymentBot 
        start_parameter: 'get_access', //Уникальный параметр глубинных ссылок. Если оставить поле пустым, переадресованные копии отправленного сообщения будут иметь кнопку «Оплатить», позволяющую нескольким пользователям производить оплату непосредственно из пересылаемого сообщения, используя один и тот же счет. Если не пусто, перенаправленные копии отправленного сообщения будут иметь кнопку URL с глубокой ссылкой на бота (вместо кнопки оплаты) со значением, используемым в качестве начального параметра.
        title: 'InvoiceTitle', // Название продукта, 1-32 символа
        description: 'InvoiceDescription', // Описание продукта, 1-255 знаков
        currency: 'RUB', // Трехбуквенный код валюты ISO 4217
        payload: { // Полезные данные счета-фактуры, определенные ботом, 1–128 байт. Это не будет отображаться пользователю, используйте его для своих внутренних процессов.
            unique_id: `${userId}_${Number(new Date())}`,
            provider_token: provider
        }
    }
    try {
        await bot.sendInvoice({
            chat_id: chatId,
            title: 'test'
        })
    } catch (err) {
        console.log('ebanniy error:' + err);
    }
}

module.exports = {
    testPayment,
}