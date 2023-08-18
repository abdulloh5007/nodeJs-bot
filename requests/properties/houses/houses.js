const { parseNumber, formatNumberInScientificNotation } = require('../../systems/systemRu')

require('dotenv').config()
const adminId = parseInt(process.env.ADMIN_ID_INT)

async function HouseAdd(msg, bot, collectionHouses) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const parts = text.split(' ')

    if (text.toLowerCase().startsWith('+дом')) {
        if (userId === adminId || userId === 1693414035 || userId === 5954575083) {
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
                                    houseDonate: false,
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
                bot.sendMessage(chatId, `Не правильно введены данные пример <code>+дом industries [цена] [сезон] [юрл или айди картины]</code>`, { parse_mode: 'HTML' })
            }
        }
        else {
            bot.sendMessage(chatId, 'Вы не являетесь владельцом бота')
        }
    }
}


async function HouseDonateAdd(msg, bot, collectionHouses) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const parts = text.split(' ')

    if (text.toLowerCase().startsWith('+донатдом')) {
        if (userId === adminId || userId === 1693414035 || userId == 5954575083) {
            if (parts.length == 5) {

                const houseName = parts[1]
                const housePrice = parseInt(parts[2])
                const houseSeason = parseInt(parts[3])
                const houseImg = parts[4]

                const existingHouseByName = await collectionHouses.findOne({ houseName: houseName });
                const existingHouseByImg = await collectionHouses.findOne({ houseImg: houseImg });

                if (existingHouseByName || existingHouseByImg) {
                    bot.sendMessage(chatId, 'Дом с таким названием или айди картиной уже существует.');
                    return; // Прекращаем выполнение, так как дубликат найден
                }

                if (houseName.toLowerCase().length >= 3) {
                    if (housePrice >= 1) {
                        if (!!houseSeason) {
                            if (!!houseImg) {
                                collectionHouses.insertOne({
                                    houseName: houseName,
                                    housePrice: housePrice,
                                    houseSeason: houseSeason,
                                    houseImg: houseImg,
                                    houseDonate: true,
                                })
                                const txt = `
Успешно был добавлен дом
Название: ${houseName}
Цена: ${housePrice.toLocaleString('de-DE')} UC
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
                        bot.sendMessage(chatId, 'Цена дома должна быть не минимум 1 UC')
                    }
                }
                else {
                    bot.sendMessage(chatId, `Имя дома должно состоять минимум из 3 букв, или вами придуманное имя уже существует`)
                }
            }
            else {
                bot.sendMessage(chatId, `Не правильно введены данные пример <code>+house industries [цена] [сезон] [юрл или айди картины]</code>`, { parse_mode: 'HTML' })
            }
        }
        else {
            bot.sendMessage(chatId, 'Вы не являетесь владельцом бота')
        }
    }
}


async function donateHouses(msg, collection, bot, collectionHouses) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    const user = await collection.findOne({ id: userId });

    if (text.toLowerCase() === 'донат дома') {
        const userBotId = user.id;
        const userBotName = user.userName;

        let options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `дома`, callback_data: `simpleHouses` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };
        const sortedHouses = await collectionHouses.find({ houseDonate: true }).sort({ housePrice: 1 }).toArray();
        const houseNamesString = sortedHouses.map((house, index) => `${index + 1}. ${house.houseName} - ${house.housePrice.toLocaleString('de-DE')} UC`).join('\n');
        bot.sendMessage(chatId, `
<a href='tg://user?id=${userBotId}'>${userBotName}</a>, вот доступные дома (отсортированы по цене):

${houseNamesString}

<b>Введите <code>купить донатдом [номер]</code> дома - чтобы купить дом из списка</b>
            `, {
            parse_mode: 'HTML',
            ...options
        });
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
        let options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `донат дома`, callback_data: `donateHouses` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };
        const sortedHouses = await collectionHouses.find({ houseDonate: false }).sort({ housePrice: 1 }).toArray();
        const houseNamesString = sortedHouses.map((house, index) => `${index + 1}. ${house.houseName} - ${house.housePrice.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(house.housePrice)})`).join('\n');
        bot.sendMessage(chatId, `
<a href='tg://user?id=${userBotId}'>${userBotName}</a>, вот доступные дома (отсортированы по цене):

${houseNamesString}

<b>Введите <code>купить дом [номер]</code> дома - чтобы купить дом из списка</b>
        `, {
            parse_mode: 'HTML',
            ...options
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
                const userHouse = user.properties[0].house

                const selectedHouse = sortedHouses[houseNumberToBuy - 1];
                if (userHouse === '') {
                    if (userBalance >= selectedHouse.housePrice) {
                        const houseInfo = `
Вы успешно сделали покупку дом информацию о доме №${houseNumberToBuy}:

Название: ${selectedHouse.houseName}
Цена: ${selectedHouse.housePrice.toLocaleString('de-DE')} $
Сезон: ${selectedHouse.houseSeason}
                        `;
                        bot.sendPhoto(chatId, selectedHouse.houseImg, { caption: houseInfo, parse_mode: 'HTML' });
                        collection.updateOne({ id: userId }, { $set: { "properties.0.house": selectedHouse.houseName } })

                        collection.findOne({ id: userId }, { $inc: -selectedHouse.housePrice })
                    } else {
                        bot.sendMessage(chatId, 'У вас не хватает средств для покупку этого дома')
                    }
                } else {
                    bot.sendMessage(chatId, `У вас уже имеется дом под названием <u>${userHouse}</u>`, { parse_mode: 'HTML' })
                }
            } else {
                bot.sendMessage(chatId, 'Неверный номер дома. Пожалуйста, используйте номер из списка доступных домов.');
            }
        } else {
            bot.sendMessage(chatId, 'Введите номер дома, который вы хотите купить.');
        }
    }
}

async function houseDonateBuy(msg, collection, bot, collectionHouses) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const user = await collection.findOne({ id: userId })

    if (text.toLowerCase().startsWith('купить донатдом')) {
        const parts = text.split(' ');
        const houseNumberToBuy = parseInt(parts[2]);

        if (!isNaN(houseNumberToBuy)) {
            const sortedHouses = await collectionHouses.find({ houseDonate: true }).sort({ housePrice: 1 }).toArray();

            if (houseNumberToBuy >= 1 && houseNumberToBuy <= sortedHouses.length) {
                const userUc = user.uc
                const userHouse = user.properties[0].house

                const selectedHouse = sortedHouses[houseNumberToBuy - 1];
                if (userHouse === '') {
                    if (userUc >= selectedHouse.housePrice) {
                        const houseInfo = `
Вы успешно совершили покупку донат дома информацию о доме №${houseNumberToBuy}:

Название: ${selectedHouse.houseName}
Цена: ${selectedHouse.housePrice.toLocaleString('de-DE')} UC
Сезон: ${selectedHouse.houseSeason}
                        `;
                        bot.sendPhoto(chatId, selectedHouse.houseImg, { caption: houseInfo, parse_mode: 'HTML' });
                        collection.updateOne({ id: userId }, { $set: { "properties.0.house": selectedHouse.houseName } })

                        collection.updateOne({ id: userId }, { $inc: { uc: -selectedHouse.housePrice } })
                    } else {
                        bot.sendMessage(chatId, 'У вас не хватает UC для покупку этого донатного дома')
                    }
                } else {
                    bot.sendMessage(chatId, `У вас уже имеется дом под названием <u>${userHouse}</u>`, { parse_mode: 'HTML' })
                }
            } else {
                bot.sendMessage(chatId, 'Неверный номер донат дома. Пожалуйста, используйте номер из списка доступных донат домов.');
            }
        } else {
            bot.sendMessage(chatId, 'Введите номер донат дома, который вы хотите купить.');
        }
    }
}

async function sellHouse(msg, bot, collection, collectionHouses) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    const user = await collection.findOne({ id: userId });

    if (text.toLowerCase() === 'продать дом') {
        const userHouse = user.properties[0].house

        if (userHouse) {
            const houseToSell = await collection.findOne({ id: userId }, { "properties.0.house": userHouse });
            const houseToSellName = houseToSell.properties[0].house
            const house = await collectionHouses.findOne({ "houseName": houseToSellName })

            const houseToSellPrice = house.housePrice
            const houseDonate = house.houseDonate

            if (houseToSell) {
                if (houseDonate === true) {
                    const sellPrice = houseToSellPrice * 1; // Пример: продажа за 90% от цены
                    bot.sendMessage(chatId, `Вы успешно продали свой донат дом "${houseToSellName}" за ${sellPrice.toLocaleString('de-DE')} UC.`);

                    collection.updateOne({ id: userId }, { $set: { "properties.0.house": '' } });
                    collection.updateOne({ id: userId }, { $inc: { uc: sellPrice } });
                }
                if (houseDonate === false) {
                    const sellPrice = houseToSellPrice * 0.9; // Пример: продажа за 90% от цены
                    bot.sendMessage(chatId, `Вы успешно продали дом "${houseToSellName}" за ${sellPrice.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(sellPrice)}).`);

                    collection.updateOne({ id: userId }, { $set: { "properties.0.house": '' } });
                    collection.updateOne({ id: userId }, { $inc: { balance: sellPrice } });
                }

            } else {
                bot.sendMessage(chatId, 'У вас нет дома для продажи.');
            }
        } else {
            bot.sendMessage(chatId, 'У вас нет дома для продажи.');
        }
    }
}

async function myHouseInfo(msg, collection, bot, collectionHouses) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    const user = await collection.findOne({ id: userId });

    if (text.toLowerCase() === 'мой дом') {
        const userBotName = user.userName;
        const userBotId = user.id;
        const userHouseName = user.properties[0].house;

        if (userHouseName) {
            const userHouse = await collection.findOne({ "properties.0.house": userHouseName });
            const userHouseName2 = userHouse.properties[0].house

            const house = await collectionHouses.findOne({ "houseName": userHouseName2 })
            const houseName = house.houseName
            const houseDonate = house.houseDonate

            if (houseName !== '') {
                if (houseDonate === true) {
                    const userHousePrice = house.housePrice
                    const userHouseSeason = house.houseSeason
                    const userHouImg = house.houseImg

                    const houseInfo = `
<a href='tg://user?id=${userBotId}'>${userBotName}</a>, вот информация о вашем донат доме:

Название: ${userHouseName2}
Цена: ${userHousePrice.toLocaleString('de-DE')} UC
Сезон: ${userHouseSeason}
    `;
                    bot.sendPhoto(chatId, userHouImg, { caption: houseInfo, parse_mode: 'HTML' });
                }
                else {
                    const userHousePrice = house.housePrice
                    const userHouseSeason = house.houseSeason
                    const userHouImg = house.houseImg

                    const houseInfo = `
<a href='tg://user?id=${userBotId}'>${userBotName}</a>, вот информация о вашем доме:

Название: ${userHouseName2}
Цена: ${userHousePrice.toLocaleString('de-DE')}$ ${userHousePrice > 1000 ? `(${formatNumberInScientificNotation(userHousePrice)})` : ''}
Сезон: ${userHouseSeason}
    `;
                    bot.sendPhoto(chatId, userHouImg, { caption: houseInfo, parse_mode: 'HTML' });
                }
            } else {
                bot.sendMessage(chatId, `У вас нету дома.`);
            }
        } else {
            bot.sendMessage(chatId, `У вас нет дома. Вы можете приобрести дом с помощью команды "<code>купить дом [номер дома]</code>".`, { parse_mode: 'HTML' });
        }
    }
}

async function changeHousePrice(msg, bot, collectionHouses) {
    const text = msg.text;
    const chatId = msg.chat.id;
    const userId = msg.from.id

    const parts = text.split(' ');

    if (text.toLowerCase().startsWith('дом цена')) {
        if (parts.length === 4) {
            if (userId === adminId) {
                const houseNumber = parseInt(parts[2]);
                const newPrice = parseInt(parseNumber(parts[3]));

                if (!isNaN(houseNumber) && !isNaN(newPrice) && newPrice > 0) {
                    const sortedHouses = await collectionHouses.find().sort({ housePrice: 1 }).toArray();

                    if (houseNumber >= 1 && houseNumber <= sortedHouses.length) {
                        const houseToUpdate = sortedHouses[houseNumber - 1];

                        bot.sendMessage(chatId, `Цена для дома "${houseToUpdate.houseName}" успешно изменена на ${newPrice.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(newPrice)})`);

                        // Обновляем цену в общем списке домов
                        await collectionHouses.updateOne({ _id: houseToUpdate._id }, { $set: { housePrice: newPrice } });

                    } else {
                        bot.sendMessage(chatId, 'Неверный номер дома. Пожалуйста, используйте номер из списка доступных домов.');
                    }
                } else {
                    bot.sendMessage(chatId, 'Введите корректный номер дома и новую цену.');
                }
            } else {
                bot.sendMessage(chatId, 'Вы не являетесь вледльцом бота.');
            }
        } else {
            bot.sendMessage(chatId, 'Неверный формат команды. Используйте: "дом цена [номер дома] [новая цена]".');
        }
    }
}

async function changeHouseName(msg, bot, collectionHouses) {
    const text = msg.text;
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const parts = text.split(' ');

    if (text.toLowerCase().startsWith('дом имя')) {
        if (parts.length >= 4) {
            if (userId === adminId) {
                const houseNumber = parseInt(parts[2]);
                const newHouseName = parts.slice(3).join(' ');

                if (!isNaN(houseNumber) && newHouseName) {
                    const sortedHouses = await collectionHouses.find({ houseDonate: false }).sort({ housePrice: 1 }).toArray();

                    if (houseNumber >= 1 && houseNumber <= sortedHouses.length) {
                        const houseToUpdate = sortedHouses[houseNumber - 1];

                        // Проверка, что имя дома не существует
                        const existingHouse = await collectionHouses.findOne({ houseName: newHouseName });
                        if (existingHouse) {
                            bot.sendMessage(chatId, `Дом с именем "${newHouseName}" уже существует.`);
                        } else {
                            bot.sendMessage(chatId, `Имя для стандартного дома "${houseToUpdate.houseName}" успешно изменено на "${newHouseName}".`);

                            // Обновляем имя дома
                            await collectionHouses.updateOne({ _id: houseToUpdate._id }, { $set: { houseName: newHouseName } });
                        }
                    } else {
                        bot.sendMessage(chatId, 'Неверный номер дома. Пожалуйста, используйте номер из списка доступных домов.');
                    }
                } else {
                    bot.sendMessage(chatId, 'Введите корректный номер дома и новое имя.');
                }
            } else {
                bot.sendMessage(chatId, 'Вы не являетесь владельцем бота.');
            }
        } else {
            bot.sendMessage(chatId, 'Неверный формат команды. Используйте: "дом имя [номер дома] [новое имя]".');
        }
    }
}

async function btnHouses(msg, bot, collection, collectionHouses) {
    const data = msg.data
    const chatId = msg.message.chat.id;
    const userId = msg.from.id;
    const user = await collection.findOne({ id: userId });
    const messageId = msg.message.message_id

    if (data === 'donateHouses') {
        const userBotId = user.id;
        const userBotName = user.userName;

        const sortedHouses = await collectionHouses.find({ houseDonate: true }).sort({ housePrice: 1 }).toArray();
        let options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `дома`, callback_data: `simpleHouses` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };
        const houseNamesString = sortedHouses.map((house, index) => `${index + 1}. ${house.houseName} - ${house.housePrice.toLocaleString('de-DE')} UC`).join('\n');
        bot.editMessageText(`
<a href='tg://user?id=${userBotId}'>${userBotName}</a>, вот доступные донат дома (отсортированы по цене):

${houseNamesString}

<b>Введите <code>купить донатдом [номер]</code> дома - чтобы купить дом из списка</b>
        `, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            ...options
        })
    }

    if (data === 'simpleHouses') {
        const userBotId = user.id;
        const userBotName = user.userName;
        let options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `донат дома`, callback_data: `donateHouses` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };
        const sortedHouses = await collectionHouses.find({ houseDonate: false }).sort({ housePrice: 1 }).toArray();
        const houseNamesString = sortedHouses.map((house, index) => `${index + 1}. ${house.houseName} - ${house.housePrice.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(house.housePrice)})`).join('\n');

        bot.editMessageText(`
<a href='tg://user?id=${userBotId}'>${userBotName}</a>, вот доступные дома (отсортированы по цене):

${houseNamesString}

<b>Введите <code>купить дом [номер]</code> дома - чтобы купить дом из списка</b>
        `, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            ...options
        })
    }
}

module.exports = {
    houses,
    donateHouses,
    HouseAdd,
    HouseDonateAdd,
    findHouseByName,
    houseBuy,
    houseDonateBuy,
    myHouseInfo,
    changeHousePrice,
    sellHouse,
    btnHouses,
    changeHouseName,
}