const { donatedUsers, adminDonatedUsers } = require('../donate/donatedUsers');
const { parseNumber, formatNumberInScientificNotation } = require('../systems/systemRu');

require('dotenv').config();
const adminIdInt = parseInt(process.env.ADMIN_ID_INT)
const { checkUserPerms } = require('../userPermissions/userPremissionsBot');

async function extraditeMoney(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const messageId = msg.message_id
    const parts = text && text.split(' ');
    const checkPerms = await checkUserPerms(userId, 'extraditemoney')

    const userIdToGet = msg.reply_to_message?.from?.id;
    const userToGet = userIdToGet ? await collection.findOne({ id: userIdToGet }) : null
    const userDonateStatus = await donatedUsers(msg, collection)
    const adminDonatStatus = await adminDonatedUsers(userIdToGet, collection)

    if (userId == adminIdInt || checkPerms === true) {
        if (parts.length == 2) {
            const sum = parseInt(parseNumber(parts[1]))

            if (!!userToGet) {
                if (sum > 0) {
                    bot.sendMessage(chatId, `
${userDonateStatus}, Вы успешно выдали игроку ${adminDonatStatus}
<b>Сумму:</b> <i>${sum.toLocaleString('de-DE')} ${formatNumberInScientificNotation(sum)}</i>
                        `, { parse_mode: "HTML" })

                    collection.updateOne({ id: userIdToGet }, { $inc: { balance: sum } })
                }
                else {
                    bot.sendMessage(chatId, 'Не возможно выдать отрицательную или 0 количество денег')
                }

            }
            else {
                bot.sendMessage(chatId, 'Этот пользователь не найден', { reply_to_message_id: messageId })
            }
        }
        else {
            bot.sendMessage(chatId, 'Ответь сообщением <code>выдать сумма</code> кому бы хотели выдать денег', { parse_mode: 'HTML' })
        }
    }
    else {
        bot.sendMessage(chatId, 'У вас нету прав на эту команду')
    }
}


async function extraditeUc(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const messageId = msg.message_id
    const parts = text && text.split(' ');
    const checkPerms = await checkUserPerms(userId, 'extraditeuc')

    const userIdToGet = msg.reply_to_message?.from?.id;
    const userToGet = userIdToGet ? await collection.findOne({ id: userIdToGet }) : null

    const userDonateStatus = await donatedUsers(msg, collection)
    const adminDonateStatus = await adminDonatedUsers(userIdToGet, collection)

    if (userId == adminIdInt || checkPerms === true) {
        if (parts.length == 3) {
            const sum = parseInt(parseNumber(parts[2]))

            if (!!userToGet) {
                if (sum > 0) {
                    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно выдали игроку ${adminDonateStatus}
Сумму: ${sum.toLocaleString('de-DE')} UC
                        `, { parse_mode: "HTML" })

                    collection.updateOne({ id: userIdToGet }, { $inc: { uc: sum } })
                }
                else {
                    bot.sendMessage(chatId, 'Не возможно выдать отрицательную или 0 количество UC')
                }

            }
            else {
                bot.sendMessage(chatId, 'Этот пользователь не найден', { reply_to_message_id: messageId })
            }
        }
        else {
            bot.sendMessage(chatId, 'Ответь сообщением <code>ус выдать сумма</code> кому бы хотели выдать UC', { parse_mode: 'HTML' })
        }
    }
    else {
        bot.sendMessage(chatId, 'Вы не являетесь администратором бота')
    }
}


async function takeMoney(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const messageId = msg.message_id
    const parts = text && text.split(' ');
    const checkPerms = await checkUserPerms(userId, 'pickmoney')

    const userIdToTake = msg.reply_to_message?.from?.id;
    const userToTake = userIdToTake ? await collection.findOne({ id: userIdToTake }) : null

    const userDonateStatus = await donatedUsers(msg, collection)
    const adminDonateStatus = await adminDonatedUsers(userIdToTake, collection)

    if (userId == adminIdInt || checkPerms === true) {
        if (parts.length == 2) {
            const sum = parseInt(parseNumber(parts[1]))

            if (!!userToTake) {
                const userToTakeBalance = userToTake.balance
                if (sum <= userToTakeBalance) {
                    if (sum > 0) {
                        const userNameToTake = userToTake.userName
                        bot.sendMessage(chatId, `
${userDonateStatus}, Вы успешно забрали от игрока ${adminDonateStatus}
Сумму: ${sum.toLocaleString('de-DE')} ${formatNumberInScientificNotation(userToTakeBalance)}
                            `, { parse_mode: "HTML" })

                        collection.updateOne({ id: userIdToTake }, { $inc: { balance: -sum } })
                    }
                    else {
                        bot.sendMessage(chatId, 'Не возможно забрать отрицательную или 0 количество денег', {
                            parse_mode: 'HTML',
                            reply_to_message_id: messageId,
                        })
                    }
                }
                else {
                    bot.sendMessage(chatId, `
У этого пользователя ${adminDonateStatus} меньше денег чем вы назначили чтобы забрать вы можете забрать у него
Сумму: ${userToTakeBalance.toLocaleString('de-DE')} ${formatNumberInScientificNotation(userToTakeBalance)}
                        `, {
                        parse_mode: 'HTML',
                        reply_to_message_id: messageId,
                    })
                }
            }
            else {
                bot.sendMessage(chatId, 'Этот пользователь не найден', { reply_to_message_id: messageId })
            }
        }
        else {
            bot.sendMessage(chatId, 'Ответь сообщением <code>забрать сумма</code> От кого бы хотели бы забрать денег', { parse_mode: 'HTML', reply_to_message_id: messageId })
        }
    }
    else {
        bot.sendMessage(chatId, 'Вы не являетесь администратором бота', { reply_to_message_id: messageId })
    }
}


async function takeUc(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const messageId = msg.message_id
    const parts = text && text.split(' ');
    const checkPerms = await checkUserPerms(userId, 'pickuc')

    const userIdToTake = msg.reply_to_message?.from?.id;
    const userToTake = userIdToTake ? await collection.findOne({ id: userIdToTake }) : null

    const userDonateStatus = await donatedUsers(msg, collection)
    const adminDonateStatus = await adminDonatedUsers(userToTake, collection)

    if (userId == adminIdInt || checkPerms === true) {
        if (parts.length == 3) {
            const sum = parseInt(parseNumber(parts[2]))

            if (!!userToTake) {
                const userToTakeBalance = userToTake.uc
                if (sum <= userToTakeBalance) {
                    if (sum > 0) {
                        bot.sendMessage(chatId, `
${userDonateStatus}, Вы успешно забрали от игрока ${adminDonateStatus}
Сумму: ${sum.toLocaleString('de-DE')} UC
                            `, { parse_mode: "HTML" })

                        collection.updateOne({ id: userIdToTake }, { $inc: { uc: -sum } })
                    }
                    else {
                        bot.sendMessage(chatId, 'Не возможно забрать отрицательную или 0 количество UC')
                    }
                }
                else {
                    bot.sendMessage(chatId, `
У этого пользователя ${adminDonateStatus} меньше UC чем вы назначили чтобы забрать вы можете забрать у него
Сумму: ${userToTakeBalance.toLocaleString('de-DE')} UC
                        `, {
                        parse_mode: 'HTML',
                        reply_to_message_id: messageId,
                    })
                }
            }
            else {
                bot.sendMessage(chatId, 'Этот пользователь не найден', { reply_to_message_id: messageId })
            }
        }
        else {
            bot.sendMessage(chatId, 'Ответь сообщением <code>ус забрать сумму</code> От кого бы хотели бы забрать UC', { parse_mode: 'HTML', reply_to_message_id: messageId })
        }
    }
    else {
        bot.sendMessage(chatId, 'Вы не являетесь администратором бота', { reply_to_message_id: messageId })
    }
}


async function takeAllMoney(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const messageId = msg.message_id
    const parts = text && text.split(' ');

    const userIdToTake = msg.reply_to_message?.from?.id;
    const userToTake = userIdToTake ? await collection.findOne({ id: userIdToTake }) : null

    const userDonateStatus = await donatedUsers(msg, collection)
    const adminDonateStatus = await adminDonatedUsers(userToTake, collection)

    if (userId == adminIdInt) {
        if (parts.length == 3) {
            if (!!userToTake) {
                const userToTakeBalance = userToTake.balance
                if (userToTakeBalance > 0) {
                    bot.sendMessage(chatId, `
${userDonateStatus}, Вы успешно забрали от игрока ${adminDonateStatus}
Сумму: все деньги
                        `, { parse_mode: "HTML" })

                    collection.updateOne({ id: userIdToTake }, { $inc: { balance: -userToTakeBalance } })

                }
                else {
                    bot.sendMessage(chatId, `У этого пользователя и так нету денег`, { reply_to_message_id: messageId })
                }
            }
            else {
                bot.sendMessage(chatId, 'Этот пользователь не найден', { reply_to_message_id: messageId })
            }
        }
        else {
            bot.sendMessage(chatId, 'Ответь сообщением <code>забрать все</code> от кого бы хотели бы забрать все деньги', { parse_mode: 'HTML', reply_to_message_id: messageId })
        }
    }
    else {
        bot.sendMessage(chatId, 'Вы не являетесь администратором бота', { reply_to_message_id: messageId })
    }
}

async function takeAllUc(msg, collection, bot) {
    const chatId = msg.chat.id
    const userId = msg.from.id
    const text = msg.text
    const messageId = msg.message_id
    const parts = text && text.split(' ');

    const userIdToTake = msg.reply_to_message?.from?.id;
    const userToTake = userIdToTake ? await collection.findOne({ id: userIdToTake }) : null

    const userDonateStatus = await donatedUsers(msg, collection)
    const adminDonateStatus = await adminDonatedUsers(userToTake, collection)

    if (userId == adminIdInt) {
        if (parts.length == 3) {
            if (!!userToTake) {
                const userToTakeBalance = userToTake.uc
                if (userToTakeBalance > 0) {
                    bot.sendMessage(chatId, `
${userDonateStatus}, Вы успешно забрали от игрока ${adminDonateStatus}
Сумму: все UC
                        `, { parse_mode: "HTML" })

                    collection.updateOne({ id: userIdToTake }, { $inc: { uc: -userToTakeBalance } })

                }
                else {
                    bot.sendMessage(chatId, `У этого пользователя и так нету UC`, { reply_to_message_id: messageId })
                }
            }
            else {
                bot.sendMessage(chatId, 'Этот пользователь не найден', { reply_to_message_id: messageId })
            }
        }
        else {
            bot.sendMessage(chatId, 'Ответье сообщением <code>забрать все ус</code> от кого бы хотели бы забрать все UC', { parse_mode: 'HTML', reply_to_message_id: messageId })
        }
    }
    else {
        bot.sendMessage(chatId, 'Вы не являетесь администратором бота', { reply_to_message_id: messageId })
    }
}

async function adminCommands(msg, bot, collection) {
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const userDonateStatus = await donatedUsers(msg, collection)

    if (userId1 === adminIdInt) {
        let optionsModeration = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Младший модератор', callback_data: `juniorModerator_${userId1}` }],
                    [{ text: 'Старший модератор', callback_data: `seniorModerator_${userId1}` }]
                ]
            }
        }
        bot.sendMessage(chatId, `
${userDonateStatus}, выберите один из статусов администраторов
            `, {
            parse_mode: 'HTML',
            ...optionsModeration
        })
    }
    else {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы не являетесь администратором бота
            `, { parse_mode: 'HTML' })
    }
}

async function adminCommandsWithBtn(msg, bot, collection) {
    const data = msg.data
    const userId1 = msg.from.id
    const chatId = msg.message.chat.id
    const messageId = msg.message.message_id

    const [clickData, clickUserId] = data.split('_')


    let optionsModeration = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Младший модератор', callback_data: `juniorModerator_${userId1}` }],
                [{ text: 'Старший модератор', callback_data: `seniorModerator_${userId1}` }]
            ]
        }
    }

    const userDonateStatus = await donatedUsers(msg, collection)

    if (clickData === 'juniorModerator') {
        if (userId1 === parseInt(clickUserId)) {
            bot.editMessageText(`
${userDonateStatus}, вот команды младших модераторов чата

➖➖➖➖➖➖➖➖➖➖➖➖➖

• <b>/mute [время] [причина]</b> - даёт мут пользователю чата
• <b>/unmute</b> - отбор мута от пользователя чата
• <b>/ban [время] [причина]</b> - даёт бан игроку в чатах
• <b>/unban</b> - отбор бана от пользователя чата
• <b>/info_id</b> - возможность увидеть данные пользователя

➖➖➖➖➖➖➖➖➖➖➖➖➖
            `, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                ...optionsModeration
            })
        }
        else {
            bot.answerCallbackQuery(msg.id, { text: 'Это кнопка не для тебя', show_alerts: false })
        }
    }

    if (clickData === 'seniorModerator') {
        if (userId1 === parseInt(clickUserId)) {
            bot.editMessageText(`
${userDonateStatus}, вот команды старших модераторов чата

➖➖➖➖➖➖➖➖➖➖➖➖➖

• <b>/mute [время] [причина]</b> - даёт мут пользователю в чатах
• <b>/unmute</b> - отбор мута от пользователя чата
• <b>/ban [время] [причина]</b> - даёт бан пользователю в чатах
• <b>/unban</b> - отбор бана от пользователя чата
• <b>/info_id</b> - возможность увидеть данные пользователя
• <b>/bot_info</b> - возможность увидеть информацию о боте

• <b>/mute_id [айди] [время] [причина]</b> - даёт мут по айди пользователя чата
• <b>/unmute_id [айди]</b> - отбор мута по айди от пользователя чата
• <b>/ban_id [айди] [время] [причина]</b> - дает бан по айди пользователя чата
• <b>/unban_id [айди]</b> - отбор бана по айди от пользователя чата

➖➖➖➖➖➖➖➖➖➖➖➖➖
            `, {
                chat_id: chatId,
                message_id: messageId,
                parse_mode: 'HTML',
                ...optionsModeration
            })
        }
        else {
            bot.answerCallbackQuery(msg.id, { text: 'Это кнопка не для тебя', show_alerts: false })
        }
    }
}

async function generateRandomKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 14; i++) {
        key += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return key;
}

async function useKey(msg, bot, collectionAdmins) {
    const collectionPermission = await mongoConnect('permissions')

    const text = msg.text
    const userId = msg.from.id;

    const parts = text.split(' ')

    const user = await collectionPermission.findOne({ id: userId })
    if (user) {
        bot.sendMessage(userId, `
Ты уже добавлен в датабазу как админ если хочешь узнать свои права админа то напиши <code>мои права</code>
        `, {
            parse_mode: 'HTML',
        })
        return;
    }

    const keyInfo = await collectionAdmins.findOne({ key: parts[1] });
    if (keyInfo === null) {
        return;
    }
    if (parts[1] === keyInfo.key) {
        if (!keyInfo.used) {
            // Если ключ не использован, помечаем его как использованный
            await collectionAdmins.updateOne({ key: parts[1] }, {
                $set: {
                    used: true,
                    usedBy: userId
                }
            });
            await collectionPermission.insertOne({
                id: userId,
                licenses: [{
                    extraditemoney: false,
                    extraditeuc: false,
                    pickmoney: false,
                    pickuc: false,
                    addhouse: false,
                    addcar: false,
                    delhouse: false,
                    delcar: false,
                    changenamehouse: false,
                    changenamecar: false,
                    changepricehouse: false,
                    changepricecar: false,
                }]
            })
            bot.sendMessage(userId, `Ключ успешно использован. вы стали администратором и у вас пока что нету разрешений`);
        } else if (keyInfo.usedBy === userId) {
            bot.sendMessage(userId, `Вы уже использовали этот ключ.`);
        } else {
            bot.sendMessage(userId, `Этот ключ уже использован другим пользователем.`);
        }
    }
    else {
        return;
    }
}

async function toBeAnAdministrtorBot(msg, bot, collection, collectionAdmins) {
    const userId1 = msg.from.id
    const chatId = msg.chat.id

    const user = await collection.findOne({ id: userId1 })
    const adminDonateStatus = await adminDonatedUsers(user.id, collection)
    const userToBeAnAdmin = user.toBeAnAdmin

    if (userToBeAnAdmin === false) {
        bot.sendMessage(chatId, `
Ты уже отправлял ключ администратора это возможность будет один раз
        `)
        return;
    }

    if (chatId === userId1) {

        const generatedKey = await generateRandomKey();

        await collectionAdmins.insertOne({
            key: generatedKey,
            used: false,
            usedBy: null
        });

        await collection.updateOne({ id: userId1 }, { $set: { toBeAnAdmin: false } })
        bot.sendMessage(userId1, `Выполняю ...`)
        bot.sendMessage(adminIdInt, `
${adminDonateStatus}, отправил запрос на ключ администратора

<b>Ключ:</b> <code>${generatedKey}</code>
        `, { parse_mode: 'HTML' });
    }
    else {
        return;
    }
}

async function deleteGenKeys(msg, bot, collectionAdmins) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id

    if (chatId === userId) {
        if (userId === adminIdInt) {
            // Удаление всех ключей из базы данных
            try {
                const collectionAdminsCount = await collectionAdmins.countDocuments()
                await collectionAdmins.deleteMany({});
                bot.sendMessage(userId, `Все ключи успешно удалены из базы данных. ${collectionAdminsCount}`);
            } catch (error) {
                console.error('Ошибка при удалении всех ключей из базы данных:', error);
                bot.sendMessage(userId, 'Произошла ошибка при удалении ключей из базы данных.');
            }
        }
    }
}


module.exports = {
    extraditeMoney,
    takeMoney,
    takeAllMoney,

    extraditeUc,
    takeUc,
    takeAllUc,

    adminCommandsWithBtn,
    adminCommands,
    toBeAnAdministrtorBot,
    useKey,
    deleteGenKeys,
}