const { customChalk } = require("../../customChalk");
const { donatedUsers } = require("./donatedUsers");
const { donateStatuses, donateStatusesCheck, donateStatusBuy, donateInfoUserName, actived_donates, options_donate, actived_donate_menu } = require("./optionsDonate");

let imgDonateMenu = 'https://ibb.co/k3M3hB9'
let imgDonateDepozit = 'https://ibb.co/q1zpSw9'
let imgSuccessfullDonate = 'https://ibb.co/qsq6Jzb'
let imgErrorPayment = 'https://ibb.co/qmWrvbL'
let halloween = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLhlz7Tl63V6HPcVBveuqaIsh9C5jqbwbQ-g&usqp=CAU'

async function sendMessage(msg, text, options = {}, bot) {
    const chatId = msg.message.chat.id

    await bot.editMessageMedia({
        type: 'photo',
        media: imgDonateMenu,
        caption: text,
        parse_mode: 'HTML',
    }, {
        chat_id: chatId,
        message_id: msg.message.message_id,
        ...options,
    });
}

async function donateMain(msg, bot, collection) {
    const userId = msg.from.id;
    const user = await collection.findOne({ id: userId });
    const userStatusName = user.status[0].statusName;
    const userDonatedStatus = await donatedUsers(msg, collection);
    const purchase = userStatusName.toLowerCase() !== 'player' ? `<b>Вы приобрели статус:</b> <i>${userStatusName.toUpperCase()}</i>` : '';

    sendMessage(msg, `
${userDonatedStatus}, вот доступные донат статусы
${purchase}
${actived_donates}
`, options_donate, bot);
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

    let depOpts = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Дополнительный процент', switch_inline_query_current_chat: '+деп процент' }],
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
${actived_donates}
`

    const messageDepozit = `
${userDonatedStatus}, дополнительный процент добавляет в ваш депозит 1 процент
Каждый процент стоит по <b>50 (UC)</b>

<i>Ваш доп-ый процент будет остаться навсегда, даже купив сатутс ваши купленные проценты будут добавлены на новые проценты и лимиты !</i>
<i>Купив доп-ых процентов также вы увеличиваете лимит депозита и этот лимит тоже будет обновлен</i>

<b>Например вы купили статус VIP💎 ваш депозит будет изменен сперва на сдантартный лимит и депозит который имеет VIP потом прибавяться ваши купленные ранее дополнительные проценты и лимиты !</b>
    `

    if (data === 'donate_statuses') {
        bot.editMessageCaption(messageStatuses, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            ...options_donate
        })
        return;
    }
    if (data === 'donate_depozit') {
        bot.editMessageMedia({
            type: 'photo',
            media: imgDonateDepozit,
            caption: messageDepozit,
            parse_mode: 'HTML',
        }, {
            chat_id: chatId,
            message_id: messageId,
            ...depOpts
        })
    }
    if (data === 'donateMain_menu') {
        let optionsDonateWithOutBack = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🪄Статусы', callback_data: 'donate_statuses' }, { text: '⚙️Депозит', callback_data: 'donate_depozit' }],
                ]
            }
        }
        bot.editMessageMedia({
            type: 'photo',
            media: imgDonateMenu,
            caption: `
${userDonatedStatus}, вот доступные донаты
${actived_donate_menu}
        `,
            parse_mode: 'HTML',
        }, {
            chat_id: chatId,
            message_id: messageId,
            ...optionsDonateWithOutBack,
        })
    }
}

async function donateMenu(msg, bot, collection) {
    const chatId = msg.chat.id
    const userId1 = msg.from.id
    const messageId = msg.message_id
    const userDonatedStatus = await donatedUsers(msg, collection)

    let optionsDonate = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🪄Статусы', callback_data: 'donate_statuses' }, { text: '⚙️Депозит', callback_data: 'donate_depozit' }],
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
    const txt = `
${userDonatedStatus}, вот доступные донаты
${actived_donate_menu}
    `
    if (chatId === userId1) {
        await bot.sendPhoto(chatId, imgDonateMenu,
            {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
                ...optionsDonate,
                caption: txt,
            }
        )
    }
    else {
        try {
            await bot.sendMessage(chatId, `
${userDonatedStatus}, Я отправил вам донат меню в лс
                `, { parse_mode: 'HTML', reply_to_message_id: messageId, ...goBot })

            await bot.sendPhoto(userId1, imgDonateMenu,
                {
                    parse_mode: 'HTML',
                    ...optionsDonate,
                    caption: txt,
                }
            )
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

    if (data in donateStatuses) {
        const { txt, infoStatus, optionsTxt, img, callbackCheck } = donateStatuses[data]

        let statusOptions = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${optionsTxt}`, callback_data: `${callbackCheck}` }],
                    [{ text: 'Назад', callback_data: 'donate_main' }],
                ]
            }
        }
        bot.editMessageMedia({
            type: 'photo',
            media: img,
            caption: `
${userDonatedStatus}, ${infoStatus}
${txt}
            `,
            parse_mode: 'HTML',
        }, {
            chat_id: chatId,
            message_id: messageId,
            ...statusOptions,
        })
    }

    if (data === 'donate_main') {
        donateMain(msg, bot, collection)
    }

    let userStatusSticker;

    if (userStatusName === 'standart') {
        userStatusSticker = '🎁';
    } else if (userStatusName === 'vip') {
        userStatusSticker = '💎';
    } else if (userStatusName === 'premium') {
        userStatusSticker = '⭐️';
    } else if (userStatusName === 'halloween') {
        userStatusSticker = '🎃';
    } else {
        userStatusSticker = '';
    }

    if (data in donateStatusesCheck) {
        const { txt, optionsTxt, callbackBuy } = donateStatusesCheck[data]
        const remainingTime = userStatusExpireDate - new Date();
        const remainingDays = Math.ceil(remainingTime / (24 * 60 * 60 * 1000));
        const remainingHours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const remainingMinutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));

        let opts = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `${optionsTxt}`, callback_data: `${callbackBuy}` }],
                    [{ text: 'Назад', callback_data: 'donate_main' }]
                ]
            }
        }
        bot.editMessageCaption(`
${userDonatedStatus}, ${txt} ${userStatusName.toUpperCase()} ${userStatusSticker}
${userStatusName === 'player' ? '' : `
<b>Ваш статус активен и у вас есть еще время</b>
<i>${remainingDays} дней, ${remainingHours} часов, ${remainingMinutes} минут</i>
`}
<b>Если хотите купить не смотря на оставшееся время то нажмите <i>${optionsTxt}</i>, а если нет то <i>Назад</i></b>
            `, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            ...opts,
        })
        return;
    }

    if (data in donateStatusBuy) {
        const { txt, errTxt, name, days, cost, moneyLimit, depLimit, depProcent } = donateStatusBuy[data];
        
        const enoughUC = user.uc >= cost;
        if (enoughUC) {
            const userExtraDepLimit = parseInt(user.depozit[0].extraLimit) + parseInt(depLimit)
            const userExtraDepProcent = parseInt(user.depozit[0].extraProcent) + parseInt(depProcent)

            await buyStatus(userId, collection, name, days);
            await collection.updateOne({ id: userId }, { $inc: { uc: -cost } });
            await collection.updateOne({ id: userId }, { $set: { "limit.0.giveMoneyLimit": moneyLimit, "depozit.0.limit": userExtraDepLimit, "depozit.0.procent": userExtraDepProcent } })
            if (name === 'halloween') {
                await collection.updateOne({ id: userId }, { $set: { "avatar.0.avaUrl": halloween } })
            }
            else {
                await collection.updateOne({ id: userId }, { $set: { "avatar.0.avaUrl": '' } })
            }

            bot.editMessageMedia({
                type: 'photo',
                media: imgSuccessfullDonate,
                caption: `${userDonatedStatus}, ${txt}`,
                parse_mode: 'HTML',
            }, {
                chat_id: chatId,
                message_id: messageId,
            })
        } else {
            const optionsDonateMain = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Назад', callback_data: 'donate_main' }]
                    ]
                }
            }
            bot.editMessageMedia({
                type: 'photo',
                media: imgErrorPayment,
                caption: `
${userDonatedStatus}, ${errTxt}
                    `,
                parse_mode: 'HTML',
            }, {
                chat_id: chatId,
                message_id: messageId,
                ...optionsDonateMain,
            })
        }
    }
}

async function donateInfo(msg, bot, collection) {
    const chatId = msg.chat.id
    const userId1 = msg.from.id
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
    } else if (userStatusName === 'halloween') {
        userStatusSticker = '🎃';
    } else {
        userStatusSticker = '';
    }

    if (userStatusName in donateInfoUserName) {
        const { txt } = donateInfoUserName[userStatusName]
        userStatus = `
${txt}

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

async function buyDiffDepozit(msg, bot, collection) {
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const user = await collection.findOne({ id: userId1 })
    const userDepLimit = user.depozit[0].limit
    const userUc = user.uc
    const userDonateStatus = await donatedUsers(msg, collection)

    if (userUc < 50) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не хватает донат валюты <b>(UC)</b>
Для покупки дополнительных процентов на депозит
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const addToExtraLimit = Math.floor((userDepLimit / 20) + userDepLimit)
    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно купили дополнительный
<i>1 Процент для своего депозита</i>

<i>+Ваш лимит депозита увеличен !</i> 
  <b>Было: ${userDepLimit.toLocaleString('de-DE')}</b>
  <b>Стало: ${addToExtraLimit.toLocaleString('de-DE')}</b>

<b>❗️Если вы будете покупать статусы то ваш депозит измениться и будут добавлены к новому депозиту ваши дополнительные проценты и лимит</b>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
    await collection.updateOne({ id: userId1 }, { $inc: { uc: -50, "depozit.0.procent": 1, "depozit.0.extraProcent": 1, "depozit.0.limit": Math.floor(addToExtraLimit - userDepLimit), "depozit.0.extraLimit": Math.floor(addToExtraLimit - userDepLimit) } })
}

module.exports = {
    donateMenu,
    donateBtns,
    donateInfo,
    donateMenuStatuses,
    buyDiffDepozit,
}