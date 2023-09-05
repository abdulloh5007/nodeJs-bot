const { donatedUsers } = require('../../donate/donatedUsers')
const { parseNumber, formatNumberInScientificNotation } = require('../../systems/systemRu')

require('dotenv').config()
const adminId = parseInt(process.env.ADMIN_ID_INT)

async function HouseAdd(msg, bot, collectionHouses) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const parts = text.split(' ')

    if (userId === adminId) {
        if (parts.length == 5) {

            const houseName = parts[1]
            const housePrice = parseInt(parseNumber(parts[2]))
            const houseSeason = parseInt(parts[3])
            const houseImg = parts[4]

            const existingHouseByName = await collectionHouses.findOne({ name: houseName });
            const existingHouseByImg = await collectionHouses.findOne({ img: houseImg });

            if (existingHouseByName || existingHouseByImg) {
                bot.sendMessage(chatId, 'Дом с таким названием или айди картиной уже существует.');
                return; // Прекращаем выполнение, так как дубликат найден
            }

            if (houseName.toLowerCase().length >= 3) {
                if (housePrice >= 1000) {
                    if (!!houseSeason) {
                        if (!!houseImg) {
                            collectionHouses.insertOne({
                                name: houseName,
                                price: housePrice,
                                season: houseSeason,
                                img: houseImg,
                                donate: false,
                            })
                            const txt = `
Успешно был добавлен дом
Название: ${houseName}
Цена: ${housePrice.toLocaleString('de-DE')} ${formatNumberInScientificNotation(housePrice)}
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


async function HouseDonateAdd(msg, bot, collectionHouses) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const parts = text.split(' ')

    if (userId === adminId) {
        if (parts.length == 5) {

            const houseName = parts[1]
            const housePrice = parseInt(parts[2])
            const houseSeason = parseInt(parts[3])
            const houseImg = parts[4]

            const existingHouseByName = await collectionHouses.findOne({ name: houseName });
            const existingHouseByImg = await collectionHouses.findOne({ img: houseImg });

            if (existingHouseByName || existingHouseByImg) {
                bot.sendMessage(chatId, 'Дом с таким названием или айди картиной уже существует.');
                return; // Прекращаем выполнение, так как дубликат найден
            }

            if (houseName.toLowerCase().length >= 3) {
                if (housePrice >= 1) {
                    if (!!houseSeason) {
                        if (!!houseImg) {
                            collectionHouses.insertOne({
                                name: houseName,
                                price: housePrice,
                                season: houseSeason,
                                img: houseImg,
                                donate: true,
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


async function donateHouses(msg, collection, bot, collectionHouses) {
    const text = msg.text;
    const chatId = msg.chat.id;

    const userStatus = await donatedUsers(msg, collection)

    let options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: `дома`, callback_data: `simpleHouses` }],
                // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
            ],
        },
    };
    const sortedHouses = await collectionHouses.find({ donate: true }).sort({ price: 1 }).toArray();
    const houseNamesString = sortedHouses.map((house, index) => `${index + 1}. ${house.name} - ${house.price.toLocaleString('de-DE')} UC`).join('\n');
    bot.sendMessage(chatId, `
${userStatus}, вот доступные дома (отсортированы по цене):

${houseNamesString}

<b>Введите <code>купить донатдом [номер]</code> дома - чтобы купить дом из списка</b>
            `, {
        parse_mode: 'HTML',
        ...options
    });
}

async function houses(msg, collection, bot, collectionHouses) {
    const text = msg.text;
    const chatId = msg.chat.id;

    const userStatus = await donatedUsers(msg, collection)
    let options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: `донат дома`, callback_data: `donateHouses` }],
                // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
            ],
        },
    };
    const sortedHouses = await collectionHouses.find({ donate: false }).sort({ price: 1 }).toArray();
    const houseNamesString = sortedHouses.map((house, index) => `${index + 1}. ${house.name} - ${house.price.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(house.price)}`).join('\n');
    bot.sendMessage(chatId, `
${userStatus}, вот доступные дома (отсортированы по цене):

${houseNamesString}

<b>Введите <code>купить дом [номер]</code> дома - чтобы купить дом из списка</b>
        `, {
        parse_mode: 'HTML',
        ...options
    });
}

async function findHouseByName(msg, collection, bot, collectionHouses) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    if (text.toLowerCase().startsWith('инфо дом')) {

        const parts = text.split(' ');
        const houseNameToSearch = parts[2] // Убираем префикс "дом "

        if (parts.length === 3) {
            const house = await collectionHouses.findOne({ name: houseNameToSearch });
            const userStatus = await donatedUsers(msg, collection)
            if (house) {
                const houseInfo = `
${userStatus}, вот доступные дома:

Название: ${house.name}
Цена: ${house.price.toLocaleString('de-DE')} ${formatNumberInScientificNotation(house.price)}
Сезон: ${house.season}
                `;

                bot.sendPhoto(chatId, house.img, { caption: houseInfo, parse_mode: 'HTML' });
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

    const parts = text.split(' ');
    const houseNumberToBuy = parseInt(parts[2]);

    if (!isNaN(houseNumberToBuy)) {
        const sortedHouses = await collectionHouses.find({ donate: false }).sort({ price: 1 }).toArray();

        if (houseNumberToBuy >= 1 && houseNumberToBuy <= sortedHouses.length) {
            const userBalance = user.balance
            const userHouse = user.properties[0].houses

            const selectedHouse = sortedHouses[houseNumberToBuy - 1];
            if (userHouse === '') {
                if (userBalance >= selectedHouse.price) {
                    const houseInfo = `
Вы успешно сделали покупку дом информацию о доме №${houseNumberToBuy}:

Название: ${selectedHouse.name}
Цена: ${selectedHouse.price.toLocaleString('de-DE')} $
Сезон: ${selectedHouse.season}
                        `;
                    bot.sendPhoto(chatId, selectedHouse.img, { caption: houseInfo, parse_mode: 'HTML' });
                    collection.updateOne({ id: userId }, { $set: { "properties.0.houses": selectedHouse.name } })

                    collection.updateOne({ id: userId }, { $inc: { balance: -selectedHouse.price } })
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

async function houseDonateBuy(msg, collection, bot, collectionHouses) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const user = await collection.findOne({ id: userId })

    const parts = text.split(' ');
    const houseNumberToBuy = parseInt(parts[2]);

    if (!isNaN(houseNumberToBuy)) {
        const sortedHouses = await collectionHouses.find({ donate: true }).sort({ price: 1 }).toArray();

        if (houseNumberToBuy >= 1 && houseNumberToBuy <= sortedHouses.length) {
            const userUc = user.uc
            const userHouse = user.properties[0].houses

            const selectedHouse = sortedHouses[houseNumberToBuy - 1];
            if (userHouse === '') {
                if (userUc >= selectedHouse.price) {
                    const houseInfo = `
Вы успешно совершили покупку донат дома информацию о доме №${houseNumberToBuy}:

Название: ${selectedHouse.name}
Цена: ${selectedHouse.price.toLocaleString('de-DE')} UC
Сезон: ${selectedHouse.season}
                        `;
                    bot.sendPhoto(chatId, selectedHouse.img, { caption: houseInfo, parse_mode: 'HTML' });
                    collection.updateOne({ id: userId }, { $set: { "properties.0.houses": selectedHouse.name } })

                    collection.updateOne({ id: userId }, { $inc: { uc: -selectedHouse.price } })
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

async function sellHouse(msg, bot, collection, collectionHouses) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    const user = await collection.findOne({ id: userId });

    const userHouse = user.properties[0].houses

    if (userHouse) {
        const houseToSell = await collection.findOne({ id: userId }, { "properties.0.houses": userHouse });
        const houseToSellName = houseToSell.properties[0].houses
        const house = await collectionHouses.findOne({ "name": houseToSellName })

        const houseToSellPrice = house.price
        const houseDonate = house.donate

        if (houseToSell) {
            if (houseDonate === true) {
                const sellPrice = houseToSellPrice * 1; // Пример: продажа за 90% от цены
                bot.sendMessage(chatId, `Вы успешно продали свой донат дом "${houseToSellName}" за ${sellPrice.toLocaleString('de-DE')} UC.`);

                collection.updateOne({ id: userId }, { $set: { "properties.0.houses": '' } });
                collection.updateOne({ id: userId }, { $inc: { uc: sellPrice } });
            }
            if (houseDonate === false) {
                const sellPrice = houseToSellPrice * 0.9; // Пример: продажа за 90% от цены
                bot.sendMessage(chatId, `Вы успешно продали дом "${houseToSellName}" за ${sellPrice.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(sellPrice)}.`);

                collection.updateOne({ id: userId }, { $set: { "properties.0.houses": '' } });
                collection.updateOne({ id: userId }, { $inc: { balance: sellPrice } });
            }

        } else {
            bot.sendMessage(chatId, 'У вас нет дома для продажи.');
        }
    } else {
        bot.sendMessage(chatId, 'У вас нет дома для продажи.');
    }
}

async function myHouseInfo(msg, collection, bot, collectionHouses) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    const user = await collection.findOne({ id: userId });

    const userStatus = await donatedUsers(msg, collection)
    const userHouseName = user.properties[0].houses;

    if (userHouseName) {
        const userHouse = await collection.findOne({ "properties.0.houses": userHouseName });
        const userHouseName2 = userHouse.properties[0].houses

        const house = await collectionHouses.findOne({ "name": userHouseName2 })
        const houseName = house.name
        const houseDonate = house.donate

        if (houseName !== '') {
            if (houseDonate === true) {
                const userHousePrice = house.price
                const userHouseSeason = house.season
                const userHouImg = house.img

                const houseInfo = `
${userStatus}, вот информация о вашем донат доме:

Название: ${userHouseName2}
Цена: ${userHousePrice.toLocaleString('de-DE')} UC
Сезон: ${userHouseSeason}
    `;
                bot.sendPhoto(chatId, userHouImg, { caption: houseInfo, parse_mode: 'HTML' });
            }
            else {
                const userHousePrice = house.price
                const userHouseSeason = house.season
                const userHouImg = house.img

                const houseInfo = `
${userStatus}, вот информация о вашем доме:

Название: ${userHouseName2}
Цена: ${userHousePrice.toLocaleString('de-DE')}$ ${userHousePrice > 1000 ? `${formatNumberInScientificNotation(userHousePrice)}` : ''}
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

async function changeHousePrice(msg, bot, collectionHouses) {
    const text = msg.text;
    const chatId = msg.chat.id;
    const userId = msg.from.id

    const parts = text.split(' ');

    if (parts.length === 4) {
        if (userId === adminId) {
            const houseNumber = parseInt(parts[2]);
            const newPrice = parseInt(parseNumber(parts[3]));

            if (!isNaN(houseNumber) && !isNaN(newPrice) && newPrice > 0) {
                const sortedHouses = await collectionHouses.find().sort({ price: 1 }).toArray();

                if (houseNumber >= 1 && houseNumber <= sortedHouses.length) {
                    const houseToUpdate = sortedHouses[houseNumber - 1];

                    bot.sendMessage(chatId, `Цена для дома "${houseToUpdate.name}" успешно изменена на ${newPrice.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(newPrice)}`);

                    // Обновляем цену в общем списке домов
                    await collectionHouses.updateOne({ _id: houseToUpdate._id }, { $set: { price: newPrice } });

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

async function changeHouseName(msg, bot, collectionHouses, collection) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const parts = text.split(' ');
    const userDonateStatus = await donatedUsers(msg, collection)

    if (parts.length >= 4) {
        if (userId === adminId) {
            const houseNumber = parseInt(parts[2]);
            const newHouseName = parts.slice(3).join(' ');

            if (!isNaN(houseNumber) && newHouseName) {
                const sortedHouses = await collectionHouses.find({ donate: false }).sort({ price: 1 }).toArray();

                if (houseNumber >= 1 && houseNumber <= sortedHouses.length) {
                    const houseToUpdate = sortedHouses[houseNumber - 1];

                    // Проверка, что имя дома не существует
                    const existingHouse = await collectionHouses.findOne({ name: newHouseName });
                    if (existingHouse) {
                        bot.sendMessage(chatId, `
${userDonateStatus}, Дом с именем <b>${newHouseName}</b> уже существует.`, {
                            parse_mode: 'HTML',
                            reply_to_message_id: messageId,
                        });
                    } else {
                        bot.sendMessage(chatId, `
${userDonateStatus}, Имя для стандартного дома ${houseToUpdate.name} успешно изменено на "${newHouseName}".`, {
                            parse_mode: 'HTML',
                            reply_to_message_id: messageId,
                        });
                        // Обновляем имя дома
                        await collectionHouses.updateOne({ _id: houseToUpdate._id }, { $set: { name: newHouseName } });
                    }
                } else {
                    bot.sendMessage(chatId, `
${userDonateStatus}, Неверный номер дома. Пожалуйста, используйте номер из списка доступных домов.`, {
                        parse_mode: 'HTML',
                        reply_to_message_id: messageId,
                    });
                }
            } else {
                bot.sendMessage(chatId, `
${userDonateStatus}, Введите корректный номер дома и новое имя.`, {
                    parse_mode: 'HTML',
                    reply_to_message_id: messageId,
                });
            }
        } else {
            bot.sendMessage(chatId, `
${userDonateStatus}, Вы не являетесь владельцем бота.`, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            });
        }
    } else {
        bot.sendMessage(chatId, `
${userDonateStatus}, Неверный формат команды. Используйте: <code>дом имя [номер дома] [новое имя]</code>.`, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        });
    }
}

async function btnHouses(msg, bot, collection, collectionHouses) {
    const data = msg.data
    const chatId = msg.message.chat.id;
    const messageId = msg.message.message_id

    if (data === 'donateHouses') {
        const userStatus = await donatedUsers(msg, collection)

        const sortedHouses = await collectionHouses.find({ donate: true }).sort({ price: 1 }).toArray();
        let options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `дома`, callback_data: `simpleHouses` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };
        const houseNamesString = sortedHouses.map((house, index) => `${index + 1}. ${house.name} - ${house.price.toLocaleString('de-DE')} UC`).join('\n');
        bot.editMessageText(`
${userStatus}, вот доступные донат дома (отсортированы по цене):

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
        const userStatus = await donatedUsers(msg, collection)
        let options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `донат дома`, callback_data: `donateHouses` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };
        const sortedHouses = await collectionHouses.find({ donate: false }).sort({ price: 1 }).toArray();
        const houseNamesString = sortedHouses.map((house, index) => `${index + 1}. ${house.name} - ${house.price.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(house.price)}`).join('\n');

        bot.editMessageText(`
${userStatus}, вот доступные дома (отсортированы по цене):

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