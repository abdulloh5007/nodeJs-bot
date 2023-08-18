async function donatedUsers(msg, bot, collection) {
    const chatId = msg.chat.id
    const userId1 = msg.from.id
    const text = msg.text

    const user = await collection.findOne({ id: userId1 })
    const userStatusName = user.status[0].statusName
    const userId = user.id
    const userName = user.userName

    let userStatus;
    if (userStatusName === 'vip') {
        userStatus = `
<a hre='tg://user?id=${userId}'>${userName} ""</a>
        `
    }
}