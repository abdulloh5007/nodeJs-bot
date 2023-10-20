const { mongoConnect } = require("../../mongoConnect");
const { donatedUsers } = require("../donate/donatedUsers");


async function myAchievements(msg, bot, collection) {
    const collectionAchievs = await mongoConnect('achievs');
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const achievs = await collectionAchievs.findOne({ id: userId1 })
    const userDonateStatus = await donatedUsers(msg, collection)

    const riceBot = achievs.race[0].botRacing
    const riceBotCost = achievs.race[0].cost
    const maxRiceBot = achievs.race[0].maxBotRacing

    const kazino = achievs.kazino[0].kazino
    const kazinoCost = achievs.kazino[0].cost
    const maxKazino = achievs.kazino[0].maxKazino

    const openCase = achievs.case[0].openCase
    const openCaseCost = achievs.case[0].cost
    const maxOpenCase = achievs.case[0].maxOpenCase

    const car = achievs.car[0].buyCar === false ? 'Не куплено' : 'Куплено'
    const carCost = achievs.car[0].cost

    const house = achievs.house[0].buyHouse === false ? 'Не куплено' : 'Куплено'
    const houseCost = achievs.house[0].cost

    const island = achievs.island[0].openIsland === false ? 'Не открыто' : 'Открыто'
    const islandCost = achievs.island[0].cost

    const business = achievs.business[0].buyBusiness === false ? 'Не куплено' : 'Куплено'
    const businessCost = achievs.business[0].cost

    function getSticker(min, max) {
        if (min >= max) {
            return '✅'
        }
        return '☑️'
    }
    function getTF(elem) {
    if (elem.toLowerCase() === 'куплено' || elem.toLowerCase() === 'открыто') {
            return '✅'
        }
        return '☑️'
    }

    return bot.sendMessage(chatId, `
${userDonateStatus}, вот ваши достижения
<b>Всего: 7</b>

○<i>Сыграть гонку с ботом</i>
<b>└${riceBot} / ${maxRiceBot}</b> → <i>${riceBotCost} UC</i> ${getSticker(riceBot, maxRiceBot)}

○<i>Сыграть казино</i>
<b>└${kazino} / ${maxKazino}</b> → <i>${kazinoCost} UC</i> ${getSticker(kazino, maxKazino)}

○<i>Открыть кейс</i>
<b>└${openCase} / ${maxOpenCase}</b> → <i>${openCaseCost} UC</i> ${getSticker(openCase, maxOpenCase)}

○<i>Купить машину</i>
<b>└${car}</b> → <i>${carCost} UC</i> ${getTF(car)}

○<i>Купить дом</i>
<b>└${house}</b> → <i>${houseCost} UC</i> ${getTF(house)}

○<i>Купить бизнес</i>
<b>└${business}</b> → <i>${businessCost} UC</i> ${getTF(business)}

○<i>Открыть остров</i>
<b>└${island}</b> → <i>${islandCost} UC</i> ${getTF(island)}
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
}

module.exports = {
    myAchievements,
}