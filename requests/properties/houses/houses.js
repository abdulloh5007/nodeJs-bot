const { parseNumber, formatNumberInScientificNotation } = require('../../systems/systemRu')

require('dotenv').config()
const adminId = parseInt(process.env.ADMIN_ID_INT)

async function HouseAdd(msg, bot, collectionHouses) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const parts = text.split(' ')

    if (text.toLowerCase().startsWith('+дом')) {
        if (userId === adminId) {
            if (parts.length == 5) {

                const houseName = parts[1]
                const housePrice = parseInt(parseNumber(parts[2]))
                const houseSeason = parseInt(parts[3])
                const houseImg = parts[4]

                const existingHouseByName = await collectionHouses.findOne({ houseName: houseName });
                const existingHouseByImg = await collectionHouses.findOne({ houseImg: houseImg });

                if (existingHouseByName || existingHouseByImg) {
                    bot.sendMessage(chatId, 'Дом с таким названием или айди картиной уже существует.');
                    return; // Прекращаем выполнение, так как дубликат найден
                }

                if (houseName.toLowerCase().length >= 3) {
                    if (housePrice >= 1000) {
                        if (!!houseSeason) {
                            if (!!houseImg) {
                                collectionHouses.insertOne({
                                    houseName: houseName,
                                    housePrice: housePrice,
                                    houseSeason: houseSeason,
                                    houseImg: houseImg,
                                })
                                const txt = `
Успешно был добавлен дом
Название: ${houseName}
Цена: ${housePrice.toLocaleString('de-DE')} (${formatNumberInScientificNotation(housePrice)})
Сезон: ${houseSeason}
`
                                bot.sendPhoto(chatId, houseImg, { caption: txt, parse_mode: 'HTML' })
                            }
                            else {
                                bot.sendMessage(chatId, 'Введите айди картины или это картина уже существует')
                            }
                        }
                        else {
                            bot.sendMessage(chatId, 'Введите сезон выхода дома')
                        }
                    }
                    else {
                        bot.sendMessage(chatId, 'Цена дома должна быть не минимум 1.000')
                    }
                }
                else {
                    bot.sendMessage(chatId, `Имя дома должно состоять минимум из 3 букв, или вами придуманное имя уже существует`)
                }
            }
            else {
                bot.sendMessage(chatId, `Не правильно введены данные пример <code>+house industries [цена] [сезон] [юрл или айди картины]</code>`)
            }
        }
        else {
            bot.sendMessage(chatId, 'Вы не являетесь владельцом бота')
        }
    }
}

async function houses(msg, collection, bot, collectionHouses) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    const user = await collection.findOne({ id: userId });

    if (text.toLowerCase() === 'дома') {
        const userBotId = user.id;
        const userBotName = user.userName;

        const sortedHouses = await collectionHouses.find().sort({ housePrice: 1 }).toArray();
        const houseNamesString = sortedHouses.map((house, index) => `${index + 1}. ${house.houseName} - ${house.housePrice.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(house.housePrice)})`).join('\n');

        bot.sendMessage(chatId, `
<a href='tg://user?id=${userBotId}'>${userBotName}</a>, вот доступные дома (отсортированы по цене):

${houseNamesString}
        `, {
            parse_mode: 'HTML'
        });
    }
}

async function findHouseByName(msg, collection, bot, collectionHouses) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    const user = await collection.findOne({ id: userId });
    const userBotId = user.id;
    const userBotName = user.userName;

    if (text.toLowerCase().startsWith('инфо дом')) {

        const parts = text.split(' ');
        const houseNameToSearch = parts[2] // Убираем префикс "дом "

        if (parts.length === 3) {
            const house = await collectionHouses.findOne({ houseName: houseNameToSearch });

            if (house) {
                const houseInfo = `
<a href='tg://user?id=${userBotId}'>${userBotName}</a>, вот доступные дома:

Название: ${house.houseName}
Цена: ${house.housePrice.toLocaleString('de-DE')} (${formatNumberInScientificNotation(house.housePrice)})
Сезон: ${house.houseSeason}
                `;

                bot.sendPhoto(chatId, house.houseImg, { caption: houseInfo, parse_mode: 'HTML' });
            } else {
                bot.sendMessage(chatId, `Дом с названием "${houseNameToSearch}" не найден.`);
            }
        } else {
            bot.sendMessage(chatId, 'Введите название дома');
        }
    }
}

async function houseBuy(msg, collection, bot, collectionHouses) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const user = await collection.findOne({ id: userId })

    if (text.toLowerCase().startsWith('купить дом')) {
        const parts = text.split(' ');
        const houseNumberToBuy = parseInt(parts[2]);

        if (!isNaN(houseNumberToBuy)) {
            const sortedHouses = await collectionHouses.find().sort({ housePrice: 1 }).toArray();

            if (houseNumberToBuy >= 1 && houseNumberToBuy <= sortedHouses.length) {
                const userBalance = user.balance
                const userHouse = user.properties[0].house[0].houseName

                const selectedHouse = sortedHouses[houseNumberToBuy - 1];
                if (userBalance >= selectedHouse.housePrice) {
                    if (userHouse === '') {
                        const houseInfo = `
Вы успешно сделали покупку дом информацию о доме №${houseNumberToBuy}:

Название: ${selectedHouse.houseName}
Цена: ${selectedHouse.housePrice.toLocaleString('de-DE')} $
Сезон: ${selectedHouse.houseSeason}
                        `;
                        bot.sendPhoto(chatId, selectedHouse.houseImg, { caption: houseInfo, parse_mode: 'HTML' });
                        collection.updateOne({ id: userId }, { $set: { "properties.0.house.0.houseName": selectedHouse.houseName } })
                        collection.updateOne({ id: userId }, { $set: { "properties.0.house.0.housePrice": selectedHouse.housePrice } })
                        collection.updateOne({ id: userId }, { $set: { "properties.0.house.0.houseSeason": selectedHouse.houseSeason } })
                        collection.updateOne({ id: userId }, { $set: { "properties.0.house.0.houseImg": selectedHouse.houseImg } })
                        collection.updateOne({ id: userId }, { $inc: { balance: -selectedHouse.housePrice } })
                    }
                    else {
                        bot.sendMessage(chatId, `У вас уже имеется дом под названием <u>${userHouse}</u>`, { parse_mode: 'HTML' })
                    }
                } else {
                    bot.sendMessage(chatId, 'У вас не хватает средств для покупку этого дома')
                }
            } else {
                bot.sendMessage(chatId, 'Неверный номер дома. Пожалуйста, используйте номер из списка доступных домов.');
            }
        } else {
            bot.sendMessage(chatId, 'Введите номер дома, который вы хотите купить.');
        }
    }
}

async function sellHouse(msg, bot, collection, collectionHouses) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    const user = await collection.findOne({ id: userId });

    if (text.toLowerCase() === 'продать дом') {
        const userHouse = user.properties[0].house[0].houseName;

        if (userHouse) {
            const houseToSell = await collectionHouses.findOne({ houseName: userHouse });

            if (houseToSell) {
                const sellPrice = houseToSell.housePrice * 0.9; // Пример: продажа за 90% от цены
                bot.sendMessage(chatId, `Вы успешно продали дом "${houseToSell.houseName}" за ${sellPrice.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(sellPrice)}).`);

                collection.updateOne({ id: userId }, { $set: { "properties.0.house.0.houseName": '' } });
                collection.updateOne({ id: userId }, { $set: { "properties.0.house.0.housePrice": 0 } });
                collection.updateOne({ id: userId }, { $set: { "properties.0.house.0.houseSeason": 0 } });
                collection.updateOne({ id: userId }, { $set: { "properties.0.house.0.houseImg": '' } });
                collection.updateOne({ id: userId }, { $inc: { balance: sellPrice } });

            } else {
                bot.sendMessage(chatId, 'У вас нет дома для продажи.');
            }
        } else {
            bot.sendMessage(chatId, 'У вас нет дома для продажи.');
        }
    }
}

async function myHouseInfo(msg, collection, bot) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    const user = await collection.findOne({ id: userId });

    if (text.toLowerCase() === 'мой дом') {
        const userBotName = user.userName;
        const userBotId = user.id
        const userHouseName = user.properties[0].house[0].houseName;

        if (userHouseName) {
            const house = await collection.findOne({ "properties.0.house.0.houseName": userHouseName });
            const userHouseName2 = house.properties[0].house[0].houseName

            if (userHouseName2 !== '') {
                const userHousePrice = house.properties[0].house[0].housePrice
                const userHouseSeason = house.properties[0].house[0].houseSeason
                const userHouImg = house.properties[0].house[0].houseImg

                const houseInfo = `
<a href='tg://user?id=${userBotId}'>${userBotName}</a>, вот информация о вашем доме:

Название: ${userHouseName2}
Цена: ${userHousePrice.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(userHousePrice)})
Сезон: ${userHouseSeason}
`;
                bot.sendPhoto(chatId, userHouImg, { caption: houseInfo, parse_mode: 'HTML' });
            } else {
                bot.sendMessage(chatId, `У вас нету дома.`);
            }
        } else {
            bot.sendMessage(chatId, 'У вас нет дома. Вы можете приобрести дом с помощью команды "купить дом".');
        }
    }
}

async function changeHousePrice(msg, bot, collectionHouses) {
    const text = msg.text;
    const chatId = msg.chat.id;

    const parts = text.split(' ');

    if (text.toLowerCase().startsWith('дом цена')) {
        if (parts.length === 4) {
            const houseNumber = parseInt(parts[2]);
            const newPrice = parseInt(parseNumber(parts[3]));

            if (!isNaN(houseNumber) && !isNaN(newPrice) && newPrice >= 0) {
                const sortedHouses = await collectionHouses.find().sort({ housePrice: 1 }).toArray();

                if (houseNumber >= 1 && houseNumber <= sortedHouses.length) {
                    const houseToUpdate = sortedHouses[houseNumber - 1];

                    bot.sendMessage(chatId, `Цена для дома "${houseToUpdate.houseName}" успешно изменена на ${newPrice.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(newPrice)})`);

                    await collectionHouses.updateOne({ _id: houseToUpdate._id }, { $set: { housePrice: newPrice } });
                } else {
                    bot.sendMessage(chatId, 'Неверный номер дома. Пожалуйста, используйте номер из списка доступных домов.');
                }
            } else {
                bot.sendMessage(chatId, 'Введите корректный номер дома и новую цену.');
            }
        } else {
            bot.sendMessage(chatId, 'Неверный формат команды. Используйте: "дом цена [номер дома] [новая цена]".');
        }
    }
}

async function deleteHouseByNumber(msg, bot, collectionHouses) {
    const text = msg.text;
    const chatId = msg.chat.id;

    const parts = text.split(' ');

    if (text.toLowerCase().startsWith('-дом')) {
        if (parts.length === 2) {
            const houseNumber = parseInt(parts[1]);

            if (!isNaN(houseNumber)) {
                const sortedHouses = await collectionHouses.find().sort({ housePrice: 1 }).toArray();

                if (houseNumber >= 1 && houseNumber <= sortedHouses.length) {
                    const houseToDelete = sortedHouses[houseNumber - 1];

                    await collectionHouses.deleteOne({ _id: houseToDelete._id });

                    bot.sendMessage(chatId, `Дом "${houseToDelete.houseName}" успешно удален из базы.`);
                } else {
                    bot.sendMessage(chatId, 'Неверный номер дома. Пожалуйста, используйте номер из списка доступных домов.');
                }
            } else {
                bot.sendMessage(chatId, 'Введите корректный номер дома для удаления.');
            }
        } else {
            bot.sendMessage(chatId, 'Неверный формат команды. Используйте: "-дом [номер дома]".');
        }
    }
}

module.exports = {
    houses,
    HouseAdd,
    findHouseByName,
    houseBuy,
    myHouseInfo,
    changeHousePrice,
    deleteHouseByNumber,
    sellHouse,
}