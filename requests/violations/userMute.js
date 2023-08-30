const { adminDonatedUsers } = require('../donate/donatedUsers');

require('dotenv').config();
const adminIdInt = parseInt(process.env.ADMIN_ID_INT)

const timeUnits = {
    s: 1000, // секунда (seconds)
    m: 60 * 1000, // минута (minutes)
    h: 60 * 60 * 1000, // час (hours)
    d: 24 * 60 * 60 * 1000, // день (days)
};

async function mutePlayer(chatId, userId, muteDuration, muteCause, bot, collection) {
    const user = await collection.findOne({ id: userId })

    const adminDonateStatus = await adminDonatedUsers(userId, collection)
    if (!!user) {
        const userName = user.userName;
        if (user.can_send_messages === false) {
            bot.sendMessage(chatId, `${adminDonateStatus} уже замучен.`, {
                parse_mode: 'HTML',
            });
            return;
        }

        await bot.restrictChatMember(chatId, userId, {
            can_send_messages: false,
            until_date: Date.now() + muteDuration,
        })
        collection.updateOne({ id: userId }, { $set: { "userViolationsMute.0.mute": true } })
        collection.updateOne({ id: userId }, { $set: { "userViolationsMute.0.muteTime": muteDuration } })
        collection.updateOne({ id: userId }, { $set: { "userViolationsMute.0.cause": muteCause } })
        const userViolationsMute = user.userViolationsMute[0].mute

        let timeString = '';
        for (const [unit, duration] of Object.entries(timeUnits)) {
            if (muteDuration >= duration && muteDuration % duration === 0) {
                const durationValue = muteDuration / duration;
                timeString = `${durationValue}${unit}`;
                break;
            }
        }

        setTimeout(async () => {
            await bot.restrictChatMember(chatId, userId, {
                can_send_messages: true,
                until_date: 0,
            });
            if (userViolationsMute === false) {
                await bot.sendMessage(chatId, `<a href='tg://user?id=${userId}'>${userName}</a>\nВремя мута истекло.`, {
                    parse_mode: 'HTML',
                });
            }

            collection.updateOne({ id: userId }, { $set: { "userViolationsMute.0.mute": false } })
            collection.updateOne({ id: userId }, { $set: { "userViolationsMute.0.muteTime": "0" } })
            collection.updateOne({ id: userId }, { $set: { "userViolationsMute.0.cause": "" } })

        }, muteDuration);

        const optMute = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Размутить', callback_data: 'optUnmuteId'}
                    ]
                ]
            }
        }
        bot.sendMessage(chatId, `Пользователь ${adminDonateStatus} замучен на ${timeString}.\nПричина: ${muteCause}`, {
            parse_mode: 'HTML',
            ...optMute,
        });
    }
    else {
        bot.sendMessage(chatId, `Ошибка ползователь не найден`, {
            parse_mode: 'HTML',
        });
    }
}

async function userMuteId(msg, collection, bot) {
    const chatId = msg.chat.id;
    const adminId = msg.from.id;
    const text = msg.text;

    if (text && text.match(/^\/muteid (\d+) (\d+[smhd]) (.+)/)) {
        const match = text.match(/^\/muteid (\d+) (\d+[smhd]) (.+)/);
        const userIdToMute = parseInt(match[1]);
        const muteDurationString = match[2];
        const muteCause = match[3];

        const admin = await collection.findOne({ id: adminId });

        if (!admin) {
            bot.sendMessage(chatId, 'Ошибка: вы не зарегистрированы в боте.');
            return;
        }

        const durationUnit = muteDurationString.slice(-1).toLowerCase();
        const durationValue = parseInt(muteDurationString.slice(0, -1));

        if (isNaN(durationValue) || !(durationUnit in timeUnits)) {
            bot.sendMessage(chatId, 'Ошибка: неверное значение длительности мута.');
            return;
        }

        const muteDuration = durationValue * timeUnits[durationUnit];
        const targetUser = await collection.findOne({ id: userIdToMute });

        if (!targetUser) {
            bot.sendMessage(chatId, 'Ошибка: пользователь не найден в базе данных.');
            return;
        }

        mutePlayer(chatId, userIdToMute, muteDuration, muteCause, bot, collection);
    }

}

async function userMute(msg, bot, collection) {
    const chatId = msg.chat.id;
    const senderId = msg.from.id;
    const text = msg.text;

    const parts = text && text.split(' ');

    if (text && text.startsWith('/mute ')) {
        if (parts.length >= 3) {
            if (senderId === adminIdInt) {
                const userIdToMute = msg.reply_to_message?.from?.id;

                if (userIdToMute) {
                    if (userIdToMute === senderId) {
                        bot.sendMessage(chatId, 'Ты владелец бота, не делай это как буду потом я без тебя. 😉');
                    } else {
                        const muteDurationString = parts[1];
                        const muteCause = parts.slice(2).join(' ');

                        const durationUnit = muteDurationString.slice(-1).toLowerCase();
                        const durationValue = parseInt(muteDurationString);

                        if (!isNaN(durationValue) && durationUnit in timeUnits) {
                            const muteDuration = durationValue * timeUnits[durationUnit];
                            mutePlayer(chatId, userIdToMute, muteDuration, muteCause, bot, collection);
                        } else {
                            bot.sendMessage(chatId, 'Ошибка: неверное значение длительности мута.', { parse_mode: 'HTML' });
                        }
                    }
                } else {
                    bot.sendMessage(chatId, 'Ошибка: не удалось определить пользователя для мута.');
                }
            } else {
                bot.sendMessage(chatId, 'Ошибка: у вас нет прав для выполнения этой команды.');
            }
        } else {
            bot.sendMessage(chatId, 'Ошибка: команда должна быть вида <code>/mute 10s причина</code>.', { parse_mode: 'HTML' });
        }
    }
}

async function userUnMute(msg, bot, collection) {
    const text = msg.text;
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userIdToUnMute = msg.reply_to_message?.from?.id;
    const user = await collection.findOne({ id: userIdToUnMute });

    if (text === '/unmute') {
        if (userId === adminIdInt) {

            if (!!user) {

                const userViolationMute = user.userViolationsMute[0].mute
                if (userViolationMute && userViolationMute === true) {
                    await bot.restrictChatMember(chatId, userIdToUnMute, {
                        can_send_messages: true,
                        until_date: 0,
                    });
                    bot.sendMessage(chatId, 'Мут с игрока снят.');
                } else {
                    bot.sendMessage(chatId, 'Ошибка: этот пользователь не замучен.');
                }
            } else {
                bot.sendMessage(chatId, 'Ошибка: не удалось определить пользователя для размута.\nВозможно этот человек ещё не регистрирован в боте');
            }
        } else {
            bot.sendMessage(chatId, 'Ошибка: у вас нет прав для выполнения этой команды.');
        }
    }
}

// Нужен только владельцу перед перезапуском объязательно испоьзуй эту команду чтобы бот когда перезапустился не стал лагать
async function userUnMuteAll(msg, bot, collection) {
    const text = msg.text;
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Поиск всех замученных пользователей
    const cursor = collection.find({ "userViolationsMute.0.mute": true });

    // Собираем айди замученных пользователей в массив
    const mutedUserIds = await cursor.map((doc) => doc.id).toArray();

    // Преобразуем массив айди в строку для вывода в чат
    const mutedUserIdsString = mutedUserIds.join(', ');

    // Выводим айди замученных пользователей в чат

    if (text === '/unmuteall') {
        if (userId === adminIdInt) {

            await mutedUserIds.forEach(async (e) => {
                const userIds = e;
                await bot.restrictChatMember(chatId, userIds, { can_send_messages: true, until_date: 0 });
            })
            bot.sendMessage(adminIdInt, `Все пользователи были размучены ${mutedUserIdsString}`)
        } else {
            bot.sendMessage(chatId, 'Ошибка: у вас нет прав для выполнения этой команды.');
        }
    }

}

module.exports = {
    userMute,
    userUnMute,
    userUnMuteAll,
    userMuteId,
};
