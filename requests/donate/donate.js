const { customChalk } = require("../../customChalk");
const { donatedUsers } = require("./donatedUsers")

async function sendMessage(msg, text, options = {}, bot) {
    const chatId = msg.message.chat.id

    await bot.editMessageText(text, {
        chat_id: chatId,
        message_id: msg.message.message_id,
        parse_mode: 'HTML',
        ...options
    });
}

async function donateMain(msg, bot, collection) {
    const userId = msg.from.id;
    const user = await collection.findOne({ id: userId });
    const userStatusName = user.status[0].statusName;
    const userDonatedStatus = await donatedUsers(msg, collection);
    const purchase = userStatusName.toLowerCase() !== 'player' ? `<b>Вы приобрели статус:</b> <i>${userStatusName.toUpperCase()}</i>` : '';

    const optionsDonate = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🎁', callback_data: 'donate_standart' }, { text: '💎', callback_data: 'donate_vip' }, { text: '⭐️', callback_data: 'donate_premium' }],
                [{ text: 'НАЗАД', callback_data: 'donateMain_menu' }]
            ]
        }
    };

    sendMessage(msg, `
${userDonatedStatus}, вот доступные донаты
${purchase}
1 UC = 0.5 Р

➖➖➖➖➖➖➖➖➖➖➖➖➖

<b>🎁STANDART</b> = <i>БЕСПЛАТНО 7 дней</i>
<b>💎VIP</b> = <i>99 UC - 30 дней</i>
<b>⭐️PREMIUM</b> = <i>300 UC - 30 дней</i>

➖➖➖➖➖➖➖➖➖➖➖➖➖
    `, optionsDonate, bot);
}

async function buyStatus(userId, collection, statusName, days) {
    const purchaseDate = new Date();
    const expireDate = new Date(purchaseDate.getTime() + days * 24 * 60 * 60 * 1000);

    await collection.updateOne({ id: userId }, {
        $set: {
            "status.0.statusName": statusName,
            "status.0.purchaseDate": purchaseDate,
            "status.0.statusExpireDate": expireDate
        }
    });
}

async function donateMenuStatuses(msg, bot, collection) {
    const userId1 = msg.from.id
    const chatId = msg.message.chat.id
    const messageId = msg.message.message_id
    const data = msg.data

    const user = await collection.findOne({ id: userId1 })
    const userStatusName = user.status[0].statusName
    const userDonatedStatus = await donatedUsers(msg, collection)

    let optionsDonate = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🎁', callback_data: 'donate_standart' }, { text: '💎', callback_data: 'donate_vip' }, { text: '⭐️', callback_data: 'donate_premium' }],
                [{ text: 'Назад', callback_data: 'donateMain_menu' }]
            ]
        }
    }

    let purchase;

    if (userStatusName.toLowerCase() !== 'player') {
        purchase = `
<b>Вы приобрели статус:</b> <i>${userStatusName.toUpperCase()}</i>
        `
    }
    else {
        purchase = ''
    }

    const messageStatuses = `
${userDonatedStatus}, вот доступные донаты
${purchase}
1 UC = 0.5 Р

➖➖➖➖➖➖➖➖➖➖➖➖➖
    
<b>🎁STANDART</b> = <i>БЕСПЛАТНО 7 дней</i>
<b>💎VIP</b> = <i>99 UC - 30 дней</i>
<b>⭐️PREMIUM</b> = <i>300 UC - 30 дней</i>

➖➖➖➖➖➖➖➖➖➖➖➖➖
    `

    if (data === 'donate_statuses') {
        bot.editMessageText(messageStatuses, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            ...optionsDonate
        })
    }
    if (data === 'donateMain_menu') {
        let optionsDonateWithOutBack = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'СТАТУСЫ', callback_data: 'donate_statuses' }],
                ]
            }
        }
        bot.editMessageText(`
${userDonatedStatus}, вот доступные донаты

1 UC = 0.5 Р

➖➖➖➖➖➖➖➖➖➖➖➖➖
        
СТАТУСЫ

➖➖➖➖➖➖➖➖➖➖➖➖➖
            `, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            ...optionsDonateWithOutBack,
        })
    }
}

async function donateMenu(msg, bot, collection) {
    const text = msg.text
    const chatId = msg.chat.id
    const userId1 = msg.from.id
    const messageId = msg.message_id
    const userDonatedStatus = await donatedUsers(msg, collection)

    let optionsDonate = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'СТАТУСЫ', callback_data: 'donate_statuses' }],
            ]
        }
    }

    let goBot = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Открыть лс', url: 'https://t.me/levouJS_bot' }],
            ]
        }
    }
    if (chatId === userId1) {

        await bot.sendMessage(chatId, `
${userDonatedStatus}, вот доступные донаты

1 UC = 0.5 Р

➖➖➖➖➖➖➖➖➖➖➖➖➖
        
СТАТУСЫ

➖➖➖➖➖➖➖➖➖➖➖➖➖
            `, { parse_mode: 'HTML', reply_to_message_id: messageId, ...optionsDonate })
    }
    else {
        //             // Проверка доступности ЛС с ботом
        //             const chat = await bot.getChat(userId1);
        //             if (!!chat.photo) {
        //                 bot.sendMessage(chatId, `
        // ${userDonatedStatus}, Я отправил вам донат меню в лс
        //                     `, { parse_mode: 'HTML', reply_to_message_id: messageId, ...goBot })

        //                 bot.sendMessage(userId1, `
        // ${userDonatedStatus}, вот доступные донаты

        // 1 UC = 0.5 Р

        // ➖➖➖➖➖➖➖➖➖➖➖➖➖

        // СТАТУСЫ
        // ДОНАТ МАШИНЫ
        // ДОНАТ ДОМА

        // ➖➖➖➖➖➖➖➖➖➖➖➖➖
        //                     `, { parse_mode: 'HTML', ...optionsDonate })
        //                 return;
        //             }
        //             else {
        //                 bot.sendMessage(chatId, `
        // ${userDonatedStatus}, Вы заблокировали бота не имев приватный чат с ботом вы не можете увидеть донаты
        //                 `, { parse_mode: 'HTML', reply_to_message_id: messageId, ...goBot })
        //             }


        try {
            await bot.sendMessage(chatId, `
${userDonatedStatus}, Я отправил вам донат меню в лс
                `, { parse_mode: 'HTML', reply_to_message_id: messageId, ...goBot })

            await bot.sendMessage(userId1, `
${userDonatedStatus}, вот доступные донаты

1 UC = 0.5 Р

➖➖➖➖➖➖➖➖➖➖➖➖➖

СТАТУСЫ
ДОНАТ МАШИНЫ
ДОНАТ ДОМА

➖➖➖➖➖➖➖➖➖➖➖➖➖
                `, { parse_mode: 'HTML', ...optionsDonate })
        } catch (err) {
            if (err.response && err.response.statusCode === 403) {
                bot.sendMessage(chatId, `
${userDonatedStatus}, разблокируйте меня чтобы я смог отправить его
                `, { parse_mode: 'HTML', reply_to_message_id: messageId, ...goBot })
            } else if (err.response && err.response.statusCode === 400) {
                bot.sendMessage(chatId, `
${userDonatedStatus}, у вас еще нету чата со мной перейдите в лс и нажмите старт
                `, { parse_mode: 'HTML', reply_to_message_id: messageId, ...goBot })
            } else {
                console.log(customChalk.colorize(`Ошибка при отправки сообщение доната: ${err.message}`, { style: 'italic', background: 'bgRed' }));
            }
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
    const userStatusName = user.status[0].statusName
    const userStatusExpireDate = user.status[0].statusExpireDate

    const userDonatedStatus = await donatedUsers(msg, collection)

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
${userDonatedStatus}, Вот данные за донат статус <b>STANDART 🎁</b>

➖➖➖➖➖➖➖➖➖➖➖➖➖➖

✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ

ОТКЛЮЧЕНИЕ РЕКЛАМЫ ❌
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ❌
ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ❌
ВОЗМОЖНОСТЬ ПОСТАВИТЬ НИК ДО 16 СИМВОЛОВ ❌
СКИДКА НА ЛЮБУЮ КРИПТОВАЛЮТУ 5% ✅
СКИДКА НА ЛЮБЫХ БРАБОТНИКОВ 5% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"🎁"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 3.000.000.000 (3е9) ✅

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
${userDonatedStatus}, Вот данные за донат статус <b>VIP 💎</b>

➖➖➖➖➖➖➖➖➖➖➖➖➖➖

✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ

ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ❌
ОТКЛЮЧЕНИЕ РЕКЛАМЫ ✅
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ✅
СКИДКА НА ЛЮБУЮ КРИПТОВАЛЮТУ 7% ✅
СКИДКА НА ЛЮБЫХ БРАБОТНИКОВ 7% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"💎"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 500.000.000.000 (500е9) ✅
ВОЗМОЖНОСТЬ ПОСТАВИТЬ НИК ДО 16 СИМВОЛОВ ✅

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
${userDonatedStatus}, Вот данные за донат статус <b>PREMIUM ⭐️</b>

➖➖➖➖➖➖➖➖➖➖➖➖➖➖

✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ

ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ✅
ОТКЛЮЧЕНИЕ РЕКЛАМЫ ✅
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ✅
СКИДКА НА ЛЮБУЮ КРИПТОВАЛЮТУ 10% ✅
СКИДКА НА ЛЮБЫХ БРАБОТНИКОВ 10% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"⭐️"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 50.000.000.000.000 (50е12) ✅
ВОЗМОЖНОСТЬ ПОСТАВИТЬ НИК ДО 16 СИМВОЛОВ ✅

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

    const dataMap = {
        'active_donate_standart': { statusName: 'standart', days: 7, cost: 0, moneyLimit: 3000000000 },
        'active_donate_vip': { statusName: 'vip', days: 30, cost: 99, moneyLimit: 500000000000 },
        'active_donate_premium': { statusName: 'premium', days: 30, cost: 300, moneyLimit: 50000000000000 }
    };

    if (data in dataMap) {
        const { statusName, days, cost, moneyLimit } = dataMap[data];
        const remainingTime = userStatusExpireDate - new Date();
        const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
        const remainingHours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

        let userStatusSticker;

        if (userStatusName === 'standart') {
            userStatusSticker = '🎁';
        } else if (userStatusName === 'vip') {
            userStatusSticker = '💎';
        } else if (userStatusName === 'premium') {
            userStatusSticker = '⭐️';
        } else {
            userStatusSticker = '';
        }

        if (userStatusName === 'premium') {
            // Пользователь уже имеет статус "premium"
            bot.editMessageText(`
${userDonatedStatus}, Вы уже имеете статус <b>${userStatusName.toUpperCase()} ${userStatusSticker}</b>.
<b>Подождите до:</b> <i>${userStatusExpireDate.toLocaleString()}</i>

<b>Еще ${remainingDays} дней, ${remainingHours} часов, ${remainingMinutes} минут</b>, прежде чем вы сможете купить другой статус.
            `, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                ...optionsDonateMain,
            });
        } else if (userStatusName === statusName) {
            // Пользователь уже имеет запрашиваемый статус
            // (но это не "premium")
            bot.editMessageText(`
${userDonatedStatus}, Вы уже купили статус <b>${statusName.toUpperCase()} ${userStatusSticker}</b>.
<b>Подождите до:</b> <i>${userStatusExpireDate.toLocaleString()}</i>

<b>Еще ${remainingDays} дней, ${remainingHours} часов, ${remainingMinutes} минут</b>, прежде чем вы сможете купить другой статус.
            `, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                ...optionsDonateMain,
            });
        } else if (userStatusName === 'vip' && statusName !== 'premium') {
            // Пользователь имеет статус "vip", но не "premium"
            bot.editMessageText(`
${userDonatedStatus}, Вы уже купили статус <b>${statusName.toUpperCase()} ${userStatusSticker}</b>.
<b>Подождите до:</b> <i>${userStatusExpireDate.toLocaleString()}</i>

<b>Еще ${remainingDays} дней, ${remainingHours} часов, ${remainingMinutes} минут</b>, прежде чем вы сможете купить другой статус.
            `, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                ...optionsDonateMain,
            });
        } else if (userStatusName === 'standart' && statusName === 'standart') {
            // Пользователь уже имеет статус "standart" и хочет купить "standart"
            bot.editMessageText(`
${userDonatedStatus}, Вы уже купили статус <b>${statusName.toUpperCase()} ${userStatusSticker}</b>.
<b>Подождите до:</b> <i>${userStatusExpireDate.toLocaleString()}</i>

<b>Еще ${remainingDays} дней, ${remainingHours} часов, ${remainingMinutes} минут</b>, прежде чем вы сможете купить другой статус.
            `, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                ...optionsDonateMain,
            });
        } else {
            const enoughUC = user.uc >= cost;
            if (enoughUC) {
                await buyStatus(userId, collection, statusName, days);
                collection.updateOne({ id: userId }, { $inc: { uc: -cost } });
                collection.updateOne({ id: userId }, { $set: { "limit.0.giveMoneyLimit": moneyLimit } })
                let activeStatusSticker;
                if (statusName === 'premium') {
                    activeStatusSticker = '⭐️';
                }
                else if (statusName === 'vip') {
                    activeStatusSticker = '💎';
                }
                else if (statusName === 'standart') {
                    activeStatusSticker = '🎁';
                }
                else {
                    activeStatusSticker = '';
                }

                bot.editMessageText(`
${userDonatedStatus},
Вы успешно активировали статус <b>${statusName.toUpperCase()} ${activeStatusSticker}</b>.

<b>Спасибо вам огромное что покупали наш товар</b>
                `, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                })
            } else {
                bot.editMessageText(`
${userDonatedStatus}, У вас не достаточно UC для покупки 
Статуса <b>${statusName.toUpperCase()} ${userStatusSticker}</b>.
                    `, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: 'HTML',
                    ...optionsDonateMain,
                })
            }
        }
    }
}

async function donateInfo(msg, bot, collection) {
    const chatId = msg.chat.id
    const userId1 = msg.from.id
    const text = msg.text
    const messageId = msg.message_id

    const user = await collection.findOne({ id: userId1 })

    const userStatusName = user.status[0].statusName
    const userStatusExpireDate = user.status[0].statusExpireDate
    const purchaseDate = user.status[0].purchaseDate

    const remainingTime = userStatusExpireDate - new Date();
    const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
    const remainingHours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

    let userStatus;

    let userStatusSticker;

    if (userStatusName === 'standart') {
        userStatusSticker = '🎁';
    } else if (userStatusName === 'vip') {
        userStatusSticker = '💎';
    } else if (userStatusName === 'premium') {
        userStatusSticker = '⭐️';
    } else {
        userStatusSticker = '';
    }

    if (userStatusName === 'standart') {
        userStatus = `
➖➖➖➖➖➖➖➖➖➖➖➖➖➖

✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ

ОТКЛЮЧЕНИЕ РЕКЛАМЫ ❌
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ❌
ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ❌
СКИДКА НА ЛЮБУЮ КРИПТОВАЛЮТУ 5% ✅
СКИДКА НА ЛЮБЫХ БРАБОТНИКОВ 5% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"🎁"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 3.000.000.000 (3е9) ✅

➖➖➖➖➖➖➖➖➖➖➖➖➖➖

<b>Срок действия:</b> ${remainingDays} дней, ${remainingHours} часов, ${remainingMinutes} минут
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
СКИДКА НА ЛЮБУЮ КРИПТОВАЛЮТУ 7% ✅
СКИДКА НА ЛЮБЫХ БРАБОТНИКОВ 7% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"💎"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 500.000.000.000 (500е9) ✅

➖➖➖➖➖➖➖➖➖➖➖➖➖➖

<b>Срок действия:</b> ${remainingDays} дней, ${remainingHours} часов, ${remainingMinutes} минут
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
СКИДКА НА ЛЮБУЮ КРИПТОВАЛЮТУ 10% ✅
СКИДКА НА ЛЮБЫХ БРАБОТНИКОВ 10% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"⭐️"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 50.000.000.000.000 (50е12) ✅

➖➖➖➖➖➖➖➖➖➖➖➖➖➖

<b>Срок действия:</b> ${remainingDays} дней, ${remainingHours} часов, ${remainingMinutes} минут
<b>Был совершен в:</b> ${purchaseDate.toLocaleString()}
        `
    }
    else {
        userStatus = `У вас не приобретен донат статус`
    }

    const userDonateStatues = await donatedUsers(msg, collection)
    bot.sendMessage(chatId, `
${userDonateStatues}, Вот данные за ваш статус

<b>Статус:</b> ${userStatusName.toUpperCase()} ${userStatusSticker}
${userStatus}
    `, { parse_mode: 'HTML', reply_to_message_id: messageId, })
}

module.exports = {
    donateMenu,
    donateBtns,
    donateInfo,
    donateMenuStatuses,
}