require('dotenv').config();
const mongoDbUrl = process.env.MONGO_DB_URL
const { MongoClient } = require('mongodb');
const { donatedUsers, adminDonatedUsers } = require('../donate/donatedUsers');
const client = new MongoClient(mongoDbUrl);
const adminId = parseInt(process.env.ADMIN_ID_INT)


async function connecting() {
    await client.connect();
}

async function userPermissionInfo(msg, bot, collection) {
    const db = client.db('bot');
    const collectionPermission = db.collection('permissions');

    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const userPerm = await collectionPermission.findOne({ id: userId1 })

    if (userId1 !== userPerm.id) {
        bot.sendMessage(chatId, `
${userDonateStatus}, чтобы узнать свои права сканало надо стать администратором бота!
генерируй свой ключ написав боту <code>bot give me a key administrator</code> потом напишу Создателю бота чтобы он дал генерированный ключ <b>ВНИМАНИЕ!</b> <u>КЛЮЧ не бесплатный</u>

Потом используй свой ключ с командой <code>key [ключ]</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const mappedPerms = userPerm.licenses.map((e) => {
        return e;
    })

    bot.sendMessage(chatId, `
${userDonateStatus}, ваши права

${JSON.stringify(mappedPerms, null, 2)}
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
}

const permsData = [
    'extraditemoney', 'extraditeuc', 'pickmoney', 'pickuc', 'addhouse', 'addcar', 'delhouse', 'delcar', 'changenamehouse', 'changenamecar', 'changepricehouse', 'changepricecar'
]

const perms = [];
for (let i = 0; i < permsData.length; i += 4) {
    const row = [];
    for (let j = i; j < i + 4 && j < permsData.length; j++) {
        row.push({ text: `${j + 1}`, switch_inline_query_current_chat: `права ${permsData[j]} true` });
    }
    perms.push(row);
}

async function addPermsForUser(msg, bot, collection) {
    const db = client.db('bot');
    const collectionPermission = db.collection('permissions');

    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id
    const replyToUser = msg.reply_to_message

    const userDonateStatus = await donatedUsers(msg, collection)
    
    if (!replyToUser) {
        bot.sendMessage(chatId, `
        ${userDonateStatus}, отьветье пользователя тому кому вы хотите прибавить права
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }
    
    const userPerm = await collectionPermission.findOne({ id: replyToUser.from.id })
    const adminDonateStatus = await adminDonatedUsers(userPerm.id, collection)

    if (userId1 !== adminId) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас нет доступа к этой команде
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (replyToUser.from.id !== userPerm.id) {
        bot.sendMessage(chatId, `
${userDonateStatus}, это пользователь еще не стал админом
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    let permOpt = {
        reply_markup: {
            inline_keyboard: perms
        }
    }

    bot.sendMessage(chatId, `
${userDonateStatus} добавление правы ${adminDonateStatus}
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
        ...permOpt
    })
}

async function addPermsToCollection(msg, bot, collection) {
    const db = client.db('bot');
    const collectionPermission = db.collection('permissions');

    const text = msg.text.toLowerCase();
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id
    const replyToUser = msg.reply_to_message
    const parts = text.split(' ')

    const userDonateStatus = await donatedUsers(msg, collection)

    if (!replyToUser) {
        bot.sendMessage(chatId, `
${userDonateStatus}, ответьте сообщением на пользователя
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const replyToUserId = replyToUser.from.id
    const userPerm = await collectionPermission.findOne({ id: replyToUserId })
    const adminDonateStatus = await adminDonatedUsers(userPerm.id, collection)

    if (userId1 !== adminId) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас нет доступа к этой команде
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (replyToUserId !== userPerm.id) {
        bot.sendMessage(chatId, `
${userDonateStatus}, это пользователь еще не стал админом
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    let permsTrueOrFalse = false;
    if (parts[3].toLowerCase() != 'true' && parts[3].toLowerCase() != 'false') {
        bot.sendMessage(chatId, `
${userDonateStatus}, можно только true или false
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }
    parts[3].toLowerCase() === 'true' ? permsTrueOrFalse = true : false

    for (const perm of permsData) {
        const searchString = `права ${perm} ${parts[3].toLowerCase()}`;
        if (!permsData.includes(parts[2].toLowerCase())) {
            bot.sendMessage(chatId, `
${userDonateStatus}, название разрешений можно использовать только из списка прав
            `, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            });
            return;
        }

        if (text.includes(searchString)) {
            // Обработка сообщения о включении права
            bot.sendMessage(chatId, `Права администратора <b><u>${perm}</u></b> успешно ${permsTrueOrFalse === true ? 'включено' : 'отключено'} для ${adminDonateStatus}`, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            });
            const updateObj = {};
            updateObj[`licenses.0.${perm}`] = permsTrueOrFalse;

            await collectionPermission.updateOne({ id: replyToUserId }, {
                $set: updateObj
            });
            return;
        }
    }
}

async function checkUserPerms(userId, perm) {
    const db = client.db('bot');
    const collectionPermission = db.collection('permissions');

    const userPerm = await collectionPermission.findOne({ id: userId })
    if (!userPerm) {
        console.log('не найдено');
        return;
    }
    const userPerms = userPerm.licenses[0][perm]
    let globalTrueOrFalse = userPerms
    return globalTrueOrFalse
}

module.exports = {
    userPermissionInfo,
    addPermsForUser,
    addPermsToCollection,
    checkUserPerms,
}