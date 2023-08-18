async function donateMain(msg, bot, collection) {
    const userId1 = msg.from.id
    const chatId = msg.message.chat.id
    const messageId = msg.message.message_id
    const user = await collection.findOne({ id: userId1 })

    const userId = user.id
    const userName = user.userName
    const userStatusName = user.status[0].statusName

    let purchase;

    if (userStatusName.toLowerCase() !== 'player') {
        purchase = `
Вы приобрели статус ${userStatusName}
        `
    }
    else {
        purchase = ''
    }

    let optionsDonate = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🎁', callback_data: 'donate_standart' }, { text: '💎', callback_data: 'donate_vip' }, { text: '⭐️', callback_data: 'donate_premium' }],
            ]
        }
    }
    await bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a> вот доступные донаты
${purchase}
1 UC = 0.5 Р

➖➖➖➖➖➖➖➖➖➖➖➖➖
    
<b>🎁STANDART</b> = <i>БЕСПЛАТНО 7 дней</i>
<b>💎VIP</b> = <i>99 UC - 30 дней</i>
<b>⭐️PREMIUM</b> = <i>300 UC - 30 дней</i>

➖➖➖➖➖➖➖➖➖➖➖➖➖
    `, {
        chat_id: chatId,
        message_id: messageId,
        ...optionsDonate,
        parse_mode: 'HTML',
    })
}

async function buyStandardStatus(userId, collection) {
    const purchaseDate = new Date();
    const sevenDaysLater = new Date(purchaseDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    await collection.updateOne({ id: userId }, {
        $set: {
            "status.0.statusName": 'standard',
            "status.0.purchaseDate": purchaseDate,
            "status.0.statusExpireDate": sevenDaysLater
        }
    });
}

async function buyVipStatus(userId, collection) {
    const purchaseDate = new Date();
    const thirtyDaysLater = new Date(purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    await collection.updateOne({ id: userId }, {
        $set: {
            "status.0.statusName": 'vip',
            "status.0.purchaseDate": purchaseDate,
            "status.0.statusExpireDate": thirtyDaysLater
        }
    });
}

async function buyPremiumStatus(userId, collection) {
    const purchaseDate = new Date();
    const thirtyDaysLater = new Date(purchaseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    await collection.updateOne({ id: userId }, {
        $set: {
            "status.0.statusName": 'premium',
            "status.0.purchaseDate": purchaseDate,
            "status.0.statusExpireDate": thirtyDaysLater
        }
    });
}

async function donateMenu(msg, bot, collection) {
    const text = msg.text
    const chatId = msg.chat.id
    const userId1 = msg.from.id
    const messageId = msg.message_id

    const user = await collection.findOne({ id: userId1 })
    const userStatusName = user.status[0].statusName

    let optionsDonate = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🎁', callback_data: 'donate_standart' }, { text: '💎', callback_data: 'donate_vip' }, { text: '⭐️', callback_data: 'donate_premium' }],
            ]
        }
    }

    let purchase;

    if (userStatusName.toLowerCase() !== 'player') {
        purchase = `
Вы приобрели статус ${userStatusName}
        `
    }
    else {
        purchase = ''
    }
    if (text.toLowerCase() === 'донат') {
        const userId = user.id
        const userName = user.userName
        let goBot = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Открыть лс', url: 'https://t.me/levouJS_bot' }],
                ]
            }
        }
        if (chatId === userId1) {

            await bot.sendMessage(chatId, `
<a href='tg://user?id=${userId}'>${userName}</a>, вот доступные донаты
${purchase}
1 UC = 0.5 Р

➖➖➖➖➖➖➖➖➖➖➖➖➖
        
<b>🎁STANDART</b> = <i>БЕСПЛАТНО 7 дней</i>
<b>💎VIP</b> = <i>99 UC - 30 дней</i>
<b>⭐️PREMIUM</b> = <i>300 UC - 30 дней</i>

➖➖➖➖➖➖➖➖➖➖➖➖➖
            `, { parse_mode: 'HTML', reply_to_message_id: messageId, ...optionsDonate })
        }
        else {
            bot.sendMessage(chatId, `
<a href='tg://user?id=${userId}'>${userName}</a> Я отправил вам донат меню в лс
            `, { parse_mode: 'HTML', reply_to_message_id: messageId, ...goBot })
        }
    }
}

async function donateBtns(msg, bot, collection) {
    const chatId = msg.message.chat.id
    const userId1 = msg.from.id
    const data = msg.data
    const messageId = msg.message.message_id

    const user = await collection.findOne({ id: userId1 })

    const userId = user.id
    const userName = user.userName
    const userStatusName = user.status[0].statusName
    const userStatusExpireDate = user.status[0].statusExpireDate

    if (data === 'donate_standart') {
        let optionsStandart = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'АКТИВИРОВАТЬ 🎁', callback_data: 'active_donate_standart' }],
                    [{ text: 'Назад', callback_data: 'donate_main' }],
                ]
            }
        }

        bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a> Вот данные за донат статус <b>STANDART 🎁</b>

➖➖➖➖➖➖➖➖➖➖➖➖➖➖

✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ

ОТКЛЮЧЕНИЕ РЕКЛАМЫ ❌
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ❌
ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ❌
СКИДКА НА ЛЮБУЮ КРОПТОВАЛЮТУ 5% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"🎁"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 1.000.000 (1е6) ✅

➖➖➖➖➖➖➖➖➖➖➖➖➖➖
        `, {
            chat_id: chatId,
            message_id: messageId,
            ...optionsStandart,
            parse_mode: 'HTML',
        })
    }
    if (data === 'donate_vip') {
        let optionsVip = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'АКТИВИРОВАТЬ 💎', callback_data: 'active_donate_vip' }],
                    [{ text: 'Назад', callback_data: 'donate_main' }],
                ]
            }
        }

        bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a> Вот данные за донат статус <b>VIP 💎</b>

➖➖➖➖➖➖➖➖➖➖➖➖➖➖

✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ

ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ❌
ОТКЛЮЧЕНИЕ РЕКЛАМЫ ✅
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ✅
СКИДКА НА ЛЮБУЮ КРОПТОВАЛЮТУ 7% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"💎"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 1.000.000.000 (1е9) ✅

➖➖➖➖➖➖➖➖➖➖➖➖➖➖
        `, {
            chat_id: chatId,
            message_id: messageId,
            ...optionsVip,
            parse_mode: 'HTML',
        })
    }
    if (data === 'donate_premium') {
        let optionsVip = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'АКТИВИРОВАТЬ ⭐️', callback_data: 'active_donate_premium' }],
                    [{ text: 'Назад', callback_data: 'donate_main' }],
                ]
            }
        }

        bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a> Вот данные за донат статус <b>PREMIUM ⭐️</b>

➖➖➖➖➖➖➖➖➖➖➖➖➖➖

✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ

ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ✅
ОТКЛЮЧЕНИЕ РЕКЛАМЫ ✅
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ✅
СКИДКА НА ЛЮБУЮ КРОПТОВАЛЮТУ 10% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"⭐️"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 1.000.000.000.000 (1е12) ✅

➖➖➖➖➖➖➖➖➖➖➖➖➖➖
        `, {
            chat_id: chatId,
            message_id: messageId,
            ...optionsVip,
            parse_mode: 'HTML',
        })
    }
    if (data === 'donate_main') {
        donateMain(msg, bot, collection)
    }

    let optionsDonateMain = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Назад', callback_data: 'donate_main' }],
            ]
        }
    }

    // STANDART
    if (data === 'active_donate_standart') {
        if (userStatusName === 'player' || userStatusName === 'standard') {
            if (userStatusName === 'standard' && userStatusExpireDate > new Date()) {
                // Пользователь уже купил статус и еще не истек срок его действия
                const remainingTime = userStatusExpireDate - new Date();
                const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

                bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a>,Вы уже купили статус <b>STANDART 🎁</b>.
Подождите до ${userStatusExpireDate.toLocaleString()} (еще ${remainingDays} дней), прежде чем вы сможете купить его снова.
                `, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    ...optionsDonateMain,
                });
            } else {
                await buyStandardStatus(userId, collection);
                bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a>,
Вы успешно активировали статус <b>STANDART 🎁</b>.

<b>Спасибо вам огромное что покупали наш товар</b>
                `, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                })
            }
        }
        else {
            bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a>, Ваш статус выше чем статус 
вы покупаете
            `, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                ...optionsDonateMain,
            })
        }
    }

    // VIP
    if (data === 'active_donate_vip') {
        if (user.uc >= 99) {
            if (userStatusName === 'player' || userStatusName === 'standard' || userStatusName === 'vip') {
                if (userStatusName === 'vip' && userStatusExpireDate > new Date()) {
                    // Пользователь уже купил статус и еще не истек срок его действия
                    const remainingTime = userStatusExpireDate - new Date();
                    const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

                    bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a>,Вы уже купили статус <b>VIP 💎</b>.
Подождите до ${userStatusExpireDate.toLocaleString()} (еще ${remainingDays} дней), прежде чем вы сможете купить его снова.
                    `, {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'HTML',
                        ...optionsDonateMain
                    });
                } else {
                    await buyVipStatus(userId, collection);
                    bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a>,
Вы успешно активировали статус <b>VIP 💎</b>.

<b>Спасибо вам огромное что покупали наш товар</b>
                    `, {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'HTML',
                    })
                    collection.updateOne({ id: userId }, { $inc: { uc: -99 } })
                }
            }
            else {
                bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a>, Ваш статус выше чем статус 
вы покупаете
                `, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    ...optionsDonateMain,
                })
            }
        }
        else {
            bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a>, У вас не достаточно UC для покупки 
Статуса <b>VIP 💎</b>
            `, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                ...optionsDonateMain,
            })
        }
    }

    // PREMIUM
    if (data === 'active_donate_premium') {
        if (user.uc >= 300) {
            if (userStatusName === 'player' || userStatusName === 'standard' || userStatusName === 'vip' || userStatusName === 'premium') {
                if (userStatusName === 'premium' && userStatusExpireDate > new Date()) {
                    // Пользователь уже купил статус и еще не истек срок его действия
                    const remainingTime = userStatusExpireDate - new Date();
                    const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

                    bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a>,Вы уже купили статус <b>PREMIUM ⭐️</b>.
Подождите до ${userStatusExpireDate.toLocaleString()} (еще ${remainingDays} дней), прежде чем вы сможете купить его снова.
                    `, {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'HTML',
                        ...optionsDonateMain
                    });
                } else {
                    await buyPremiumStatus(userId, collection);
                    bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a>,
Вы успешно активировали статус <b>PREMIUM ⭐️</b>.

<b>Спасибо вам огромное что покупали наш товар</b>
                    `, {
                        chat_id: chatId,
                        message_id: messageId,
                        parse_mode: 'HTML',
                    })
                    collection.updateOne({ id: userId }, { $inc: { uc: -300 } })
                }
            }
            else {
                bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a>, Ваш статус выше чем статус 
вы покупаете
                `, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    ...optionsDonateMain,
                })
            }
        }
        else {
            bot.editMessageText(`
<a href='tg://user?id=${userId}'>${userName}</a>, У вас не достаточно UC для покупки 
Статуса <b>PREMIUM ⭐️</b>
            `, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                ...optionsDonateMain,
            })
        }
    }
}

async function donateInfo(msg, bot, collection) {
    const chatId = msg.chat.id
    const userId1 = msg.from.id
    const text = msg.text
    const messageId = msg.message_id

    const user = await collection.findOne({ id: userId1 })

    const userId = user.id
    const userName = user.userName
    const userStatusName = user.status[0].statusName
    const userStatusExpireDate = user.status[0].statusExpireDate
    const purchaseDate = user.status[0].purchaseDate

    const remainingTime = userStatusExpireDate - new Date();
    const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));

    let userStatus

    if (userStatusName === 'standart') {
        userStatus = `
➖➖➖➖➖➖➖➖➖➖➖➖➖➖

✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ

ОТКЛЮЧЕНИЕ РЕКЛАМЫ ❌
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ❌
ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ❌
СКИДКА НА ЛЮБУЮ КРОПТОВАЛЮТУ 5% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"🎁"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 1.000.000 (1е6) ✅

➖➖➖➖➖➖➖➖➖➖➖➖➖➖

<b>Срок действия:</b> ${remainingDays} дней
<b>Был совершен в:</b> ${purchaseDate.toLocaleString()}
        `
    }
    else if (userStatusName === 'vip') {
        userStatus = `
➖➖➖➖➖➖➖➖➖➖➖➖➖➖

✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ

ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ❌
ОТКЛЮЧЕНИЕ РЕКЛАМЫ ✅
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ✅
СКИДКА НА ЛЮБУЮ КРОПТОВАЛЮТУ 5% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"💎"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 1.000.000.000 (1е9) ✅

➖➖➖➖➖➖➖➖➖➖➖➖➖➖

<b>Срок действия:</b> ${remainingDays} дней
<b>Был совершен в:</b> ${purchaseDate.toLocaleString()}
        `
    }
    else if (userStatusName === 'premium') {
        userStatus = `
➖➖➖➖➖➖➖➖➖➖➖➖➖➖

✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ

ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ✅
ОТКЛЮЧЕНИЕ РЕКЛАМЫ ✅
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ✅
СКИДКА НА ЛЮБУЮ КРОПТОВАЛЮТУ 5% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"⭐️"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 1.000.000.000.000 (1е12) ✅

➖➖➖➖➖➖➖➖➖➖➖➖➖➖

<b>Срок действия:</b> ${remainingDays} дней
<b>Был совершен в:</b> ${purchaseDate.toLocaleString()}
        `
    }
    else {
        userStatus = `У вас не приобретен донат статус`
    }

    if (text.toLowerCase() === 'мой статус') {
        bot.sendMessage(chatId, `
<a href='tg://user?id=${userId}'>${userName}</a>, Вот данные за ваш статус

<b>Статус:</b> ${userStatusName}
${userStatus}
        `, { parse_mode: 'HTML', reply_to_message_id: messageId, })
    }
}

module.exports = {
    donateMenu,
    donateBtns,
    donateInfo,
}