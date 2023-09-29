const { customChalk } = require("../../customChalk");

async function adminDonatedUsers(userId1, collection) {
    const user = await collection.findOne({ id: userId1 })

    if (!!user) {
        const userStatusName = user.status[0].statusName
        const userId = user.id
        const userName = user.userName
        let userStatus;
        if (userStatusName === 'standart') {
            userStatus = `<a href='tg://user?id=${userId}'>${userName} "🎁"</a>`
        }
        else if (userStatusName === 'vip') {
            userStatus = `<a href='tg://user?id=${userId}'>${userName} "💎"</a>`
        }
        else if (userStatusName === 'premium') {
            userStatus = `<a href='tg://user?id=${userId}'>${userName} "⭐️"</a>`
        }
        else {
            userStatus
            userStatus = `<a href='tg://user?id=${userId}'>${userName}</a>`
        }
        return userStatus
    }
}

async function donatedUsers(msg, collection) {
    const userId1 = msg.from.id

    const user = await collection.findOne({ id: userId1 })
    const userStatusName = user.status[0].statusName
    const userId = user.id
    const userName = user.userName

    let userStatus;
    if (userStatusName === 'standart') {
        userStatus = `<i>STANDART 🎁</i> <a href='tg://user?id=${userId}'>${userName}</a>`
    }
    else if (userStatusName === 'vip') {
        userStatus = `<i>VIP 💎</i> <a href='tg://user?id=${userId}'>${userName}</a>`
    }
    else if (userStatusName === 'premium') {
        userStatus = `<i>PREMIUM ⭐️</i> <a href='tg://user?id=${userId}'>${userName}</a>`
    }
    else {
        userStatus = `<a href='tg://user?id=${userId}'>${userName}</a>`
    }
    return userStatus
}

async function checkAndUpdateDonations(collection) {
    const users = await collection.find().toArray();

    const currentDate = new Date();

    for (const user of users) {
        const userExpireDate = user.status[0].statusExpireDate
        const userStatusName = user.status[0].statusName
        const userExtraDepLimit = parseInt(user.depozit[0].extraLimit) + parseInt(50000)
        const userExtraDepProcent = parseInt(user.depozit[0].extraProcent) + parseInt(10)

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
            console.log(userStatusName);
            try {
                // Снимите донат и обновите статус пользователя
                await bot.sendMessage(user.id, `
➖➖➖➖➖➖➖➖➖➖➖➖➖➖
<b>С вас был снят донат:</b> <i>${userStatusName.toUpperCase()} ${sortedStName}</i>
➖➖➖➖➖➖➖➖➖➖➖➖➖➖
                `, { parse_mode: 'HTML' })
            }
            catch (err){
                if (err.response && err.response.statusCode === 403) {
                    console.log(customChalk.colorize(`сд Пользователь ${user.id} заблокировал бота`, { style: 'italic', background: 'bgRed' }));
                } else if (err.response && err.response.statusCode === 400) {
                    console.log(customChalk.colorize(`сд Пользователя ${user.id} нет чата с ботом`, { style: 'italic', background: 'bgYellow' }))
                } else {
                    console.log(customChalk.colorize(`Ошибка при снятие донат статуса: ${err.message}`, { style: 'italic', background: 'bgRed' }));
                }
            }
            await collection.updateOne(
                { id: user.id },
                {
                    $set: { "status.0.statusName": "player", "status.0.statusExpireDate": 0, "status.0.purchaseDate": 0, "limit.0.giveMoneyLimit": 50000, "limit.0.givedMoney": 0, "avatar.0.waiting": '', "avatar.0.avaUrl": '', "depozit.0.limit": userExtraDepLimit, "depozit.0.procent": userExtraDepProcent, },
                    // Дополнительные действия, если необходимы
                }
            );
        }
        else {
            console.log(`Пока что не кого снять донат ${userExpireDate}`);
        }
    }
}

module.exports = {
    donatedUsers,
    checkAndUpdateDonations,
    adminDonatedUsers,
}