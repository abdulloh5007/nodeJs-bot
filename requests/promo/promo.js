const { donatedUsers } = require("../donate/donatedUsers")
const { parseNumber, formatNumberInScientificNotation } = require("../systems/systemRu")
require("dotenv").config()
const adminId = parseInt(process.env.ADMIN_ID_INT)

async function addingPromoIfNotExists(collectionPromo, promoData) {
    const exisitingPromo = await collectionPromo.findOne({ promoName: promoData.promoName })

    if (exisitingPromo) {
        return false
    }
    else {
        await collectionPromo.insertOne(promoData)
        return true
    }

}

async function createPromo(msg, bot, collection, collectionPromo) {
    const text = msg.text;
    const userId1 = msg.from.id;
    const chatId = msg.chat.id;

    const user = await collection.findOne({ id: userId1 });
    const userDonateStatus = await donatedUsers(msg, collection);
    const parts = text.split(' ');

    if (parts.length >= 4 && parts.length <= 8) {
        const promoName = parts[1];
        const promoActivision = parseInt(parts[2]);
        const promoMoney = parseInt(parseNumber(parts[3]));

        if (promoName.length >= 3 && promoName.length <= 16 &&
            !isNaN(promoActivision) && promoActivision >= 1 &&
            !isNaN(promoMoney) && promoMoney >= 10000) {

            const userBalance = user.balance;
            if (userBalance >= promoMoney) {
                const moneyForOnePlayer = promoMoney / promoActivision;

                if (moneyForOnePlayer >= 1000) {
                    const promoComment = parts.slice(4).join(' ') || '';
                    const floorMoneyForOnePlayer = Math.floor(moneyForOnePlayer);
                    const testingPromoComment = promoComment || '';

                    const commentWords = testingPromoComment.split(' ');
                    if (commentWords.length <= 4) {
                        let isValidComment = true;
                        for (const word of commentWords) {
                            if (word.length > 9) {
                                isValidComment = false;
                                break;
                            }
                        }
                        if (!isValidComment) {
                            bot.sendMessage(chatId, `
${userDonateStatus}, слова в комментариях должны состоять не более чем из 9 букв и не более чем из 4 слов
                                `, { parse_mode: 'HTML' });
                            return;
                        }
                    }

                    const res = await addingPromoIfNotExists(collectionPromo, {
                        promoName: promoName,
                        promoActivision: promoActivision,
                        promoMoney: promoMoney,
                        promoDonate: false,
                        promoComent: testingPromoComment,
                        promoUsedBy: [],
                    });

                    if (res === true) {
                        collection.updateOne({ id: userId1 }, { $inc: { balance: -promoMoney } });
                        bot.sendMessage(chatId, `
${userDonateStatus}, Вы успешно создали промокод
<b>Название:</b> <code>${promoName}</code>
<b>Количество активаций:</b> ${promoActivision}
<b>Сумма:</b> ${promoMoney.toLocaleString('de-DE')} ${formatNumberInScientificNotation(promoMoney)} 
<b>Каждому по:</b> ${floorMoneyForOnePlayer.toLocaleString('de-DE')} ${formatNumberInScientificNotation(floorMoneyForOnePlayer)}
<b>Коментарии:</b> ${testingPromoComment == '' ? 'Нету коментарии' : testingPromoComment}
                            `, { parse_mode: 'HTML' });
                    } else {
                        bot.sendMessage(chatId, `
${userDonateStatus}, не возможно создать промо
с таким названием промо уже существует
                            `, { parse_mode: 'HTML' });
                    }
                } else {
                    bot.sendMessage(chatId, `
${userDonateStatus}, не правильный количество активаций
сумма на 1 игрока должна состоять не менее 1.000 а у вас ${moneyForOnePlayer}
                        `, { parse_mode: 'HTML' });
                }
            } else {
                bot.sendMessage(chatId, `
${userDonateStatus}, не хватает средств
                    `, { parse_mode: 'HTML' });
            }
        } else {
            bot.sendMessage(chatId, `
${userDonateStatus}, не правильный ввод данных

<code>+промо [] [] []</code>
<b>+промо [название промо] [количество активаций] [сумма] [коментарии если есть]</b>
                `, { parse_mode: 'HTML' });
        }
    } else {
        bot.sendMessage(chatId, `
${userDonateStatus}, не правильный ввод команды

<code>+промо [] [] []</code>
<b>+промо [название промо] [количество активаций] [сумма] [коментарии если есть]</b>
            `, { parse_mode: 'HTML' });
    }
}

async function createDonatePromo(msg, bot, collection, collectionPromo) {
    const text = msg.text;
    const userId1 = msg.from.id;
    const chatId = msg.chat.id;

    const userDonateStatus = await donatedUsers(msg, collection);
    const parts = text.split(' ');

    if (userId1 === adminId) {
        if (parts.length >= 4 && parts.length <= 8) {
            const promoName = parts[1];
            const promoActivision = parseInt(parts[2]);
            const promoUc = parseInt(parseNumber(parts[3]));

            if (promoName.length >= 3 && promoName.length <= 16 &&
                !isNaN(promoActivision) && promoActivision >= 1 &&
                !isNaN(promoUc)) {

                const moneyForOnePlayer = promoUc / promoActivision;

                if (moneyForOnePlayer >= 1) {
                    const promoComment = parts.slice(4).join(' ') || '';
                    const floorMoneyForOnePlayer = Math.floor(moneyForOnePlayer);
                    const testingPromoComment = promoComment || 'Нету каментарий';

                    const res = await addingPromoIfNotExists(collectionPromo, {
                        promoName: promoName,
                        promoActivision: promoActivision,
                        promoMoney: promoUc,
                        promoDonate: true,
                        promoComent: testingPromoComment,
                        promoUsedBy: [],
                    });

                    if (res === true) {
                        bot.sendMessage(chatId, `
${userDonateStatus}, Вы успешно создали промокод
<b>Название:</b> <code>${promoName}</code>
<b>Количество активаций:</b> ${promoActivision}
<b>Сумма:</b> ${promoUc.toLocaleString('de-DE')} UC
<b>Каждому по:</b> ${floorMoneyForOnePlayer.toLocaleString('de-DE')} UC
<b>Коментарии:</b> ${testingPromoComment}
                            `, { parse_mode: 'HTML' });

                    } else {
                        bot.sendMessage(chatId, `
${userDonateStatus}, не возможно создать промо
с таким названием промо уже существует
                            `, { parse_mode: 'HTML' });
                    }
                } else {
                    bot.sendMessage(chatId, `
${userDonateStatus}, не правильный количество активаций
сумма на 1 игрока должна состоять не менее 1 а у вас ${moneyForOnePlayer}
                        `, { parse_mode: 'HTML' });
                }
            } else {
                bot.sendMessage(chatId, `
${userDonateStatus}, не правильный ввод данных
                    `, { parse_mode: 'HTML' });
            }
        } else {
            bot.sendMessage(chatId, `
${userDonateStatus}, не правильный ввод команды
            `, { parse_mode: 'HTML' });
        }
    } else {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы не можете создавать донат промо
            `, { parse_mode: 'HTML' });
    }
}

async function usingPromo(msg, bot, collection, collectionPromo) {
    const text = msg.text;
    const userId1 = msg.from.id;
    const chatId = msg.chat.id;

    const parts = text.split(' ');
    const userDonateStatus = await donatedUsers(msg, collection);
    const user = await collection.findOne({ id: userId1 });

    if (parts.length == 2) {
        const promo = await collectionPromo.findOne({ promoName: parts[1] });

        if (promo) {
            const promoName = promo.promoName;
            const promoActivision = promo.promoActivision;
            const promoUsedBy = promo.promoUsedBy;
            const promoMoney = promo.promoMoney;
            const userBalance = user.balance;

            const moneyForOnePlayer = promoMoney / promoActivision;
            if (!promoUsedBy.includes(user.id)) {
                if (promoActivision > 0) {
                    const promoDonated = promo.promoDonate;
                    const promoComment = promo.promoComent || 'Нету коментарий';

                    const floorMoneyForOnePlayer = Math.floor(moneyForOnePlayer);
                    const newBalanceIncrement = promoDonated ? { uc: floorMoneyForOnePlayer } : { balance: floorMoneyForOnePlayer };

                    await collectionPromo.updateOne(
                        { promoName: parts[1] },
                        {
                            $addToSet: { promoUsedBy: userId1 },
                            $set: {
                                promoActivision: promoActivision - 1,
                                promoMoney: promoMoney - moneyForOnePlayer
                            }
                        }
                    );

                    await collection.updateOne(
                        { id: userId1 },
                        { $inc: newBalanceIncrement }
                    );

                    bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно активировали 

<b>${promoDonated ? 'донат ' : ''}Промокод Название:</b> <i>${promoName}</i>
<b>И получили в свой счет:</b> <i>${floorMoneyForOnePlayer.toLocaleString('de-DE')}</i>

<b>Коментарии:</b> <u>${promoComment}</u>
                        `, { parse_mode: 'HTML' });
                } else {
                    bot.sendMessage(chatId, `
${userDonateStatus}, этот промокод уже активировали максимальное количество пользователей
                        `, {
                        parse_mode: 'HTML',
                    });
                }
            } else {
                bot.sendMessage(chatId, `
${userDonateStatus}, вы уже активировали этот промокод
                    `, { parse_mode: 'HTML' });
            }
        } else {
            bot.sendMessage(chatId, `
${userDonateStatus}, такого промокода не существует
                `, { parse_mode: 'HTML' });
        }
    } else {
        bot.sendMessage(chatId, `
${userDonateStatus}, не правильный ввод команды

<code>промо [название]</code>
            `, { parse_mode: 'HTML' });
    }
}

module.exports = {
    createPromo,
    usingPromo,
    createDonatePromo,
}