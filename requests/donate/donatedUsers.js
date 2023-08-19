
async function donatedUsers(msg, collection) {
    const userId1 = msg.from.id

    const user = await collection.findOne({ id: userId1 })
    const userStatusName = user.status[0].statusName
    const userId = user.id
    const userName = user.userName

    let userStatus;
    if (userStatusName === 'standart') {
        userStatus = `
<a href='tg://user?id=${userId}'>${userName} "🎁"</a>`
    }
    else if (userStatusName === 'vip') {
        userStatus = `
<a href='tg://user?id=${userId}'>${userName} "💎"</a>`
    }
    else if (userStatusName === 'premium') {
        userStatus = `
<a href='tg://user?id=${userId}'>${userName} "⭐️"</a>`
    }
    else {
        userStatus
        userStatus = `
<a href='tg://user?id=${userId}'>${userName}</a>`
    }
    return userStatus
}
async function checkAndUpdateDonations(collection, bot, msg) {
    const users = await collection.find().toArray();

    const currentDate = new Date();
    const donatedUser = await donatedUsers(msg, collection)
    
    for (const user of users) {
        const userExpireDate = user.status[0].statusExpireDate
        const userStatusName = user.status[0].statusName

        let sortedStName

        if (userStatusName === 'standart') {
            sortedStName = '🎁'
        }
        else if (userStatusName === 'vip') {
            sortedStName = '💎'
        }
        else if (userStatusName === 'premium') {
            sortedStName = '⭐️'
        }
        else {
            sortedStName = ''
        }

        if (userExpireDate && userExpireDate <= currentDate) {
            // Снимите донат и обновите статус пользователя
            bot.sendMessage(user.id, `
${donatedUser},
➖➖➖➖➖➖➖➖➖➖➖➖➖➖
<b>С вас был снят донат:</b> <i>${userStatusName.toUpperCase()} ${sortedStName}</i>
➖➖➖➖➖➖➖➖➖➖➖➖➖➖
            `, { parse_mode: 'HTML' })
            await collection.updateOne(
                { id: user.id },
                {
                    $set: { "status.0.statusName": "player", "status.0.statusExpireDate": 0, "status.0.purchaseDate": 0 },
                    // Дополнительные действия, если необходимы
                }
            );
        }
    }
}

module.exports = {
    donatedUsers,
    checkAndUpdateDonations,
}