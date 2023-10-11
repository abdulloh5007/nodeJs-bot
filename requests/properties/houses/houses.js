const { donatedUsers } = require('../../donate/donatedUsers')
const { parseNumber, formatNumberInScientificNotation } = require('../../systems/systemRu')
const { formatRemainingTime } = require('../../user/bonusCollectBtn')
const { checkUserPerms } = require('../../userPermissions/userPremissionsBot')

let bonusCooldown = 24 * 60 * 60 * 1000;

require('dotenv').config()
const adminId = parseInt(process.env.ADMIN_ID_INT)

async function HouseAdd(msg, bot, collectionHouses) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id
    const checkPerms = await checkUserPerms(userId, 'addhouse')

    const parts = text.split(' ')

    if (userId === adminId || checkPerms === true) {
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
<i>Название:</i> <b>${houseName}</b>
<i>Цена:</i> <b>${housePrice.toLocaleString('de-DE')} ${formatNumberInScientificNotation(housePrice)}</b>
<i>Сезон:</i> <b>${houseSeason}</b>
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
<i>Название:</i> <b>${houseName}</b>
<i>Цена:</i> <b>${housePrice.toLocaleString('de-DE')} ${formatNumberInScientificNotation(housePrice)}</b>
<i>Сезон:</i> <b>${houseSeason}</b>
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
                [{ text: `Дома`, callback_data: `simpleHouses` }],
                // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
            ],
        },
    };
    const sortedHouses = await collectionHouses.find({ donate: true }).sort({ price: 1 }).toArray();
    const houseNamesString = sortedHouses.map((house, index) => `${index + 1}. ${house.name} - ${house.price.toLocaleString('de-DE')} UC`).join('\n');
    bot.sendMessage(chatId, `
${userStatus}, вот доступные дома (отсортированы по цене):

${houseNamesString}

<i>Введите <code>купить дом [номер]</code> дома - чтобы купить дом из списка</i>
            `, {
        parse_mode: 'HTML',
        ...options
    });
}

async function houses(msg, collection, bot, collectionHouses) {
    const text = msg.text;
    const chatId = msg.chat.id;

    const userStatus = await donatedUsers(msg, collection)
    const sortedHouses = await collectionHouses.find({ donate: false }).sort({ price: 1 }).toArray();
    const houseNamesString = sortedHouses.map((house, index) => `${index + 1}. ${house.name} - ${house.price.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(house.price)}`).join('\n');
    bot.sendMessage(chatId, `
${userStatus}, вот доступные дома (отсортированы по цене):

${houseNamesString}

<i>Введите <code>купить дом [номер]</code> дома - чтобы купить дом из списка</i>
        `, {
        parse_mode: 'HTML',
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

<i>Название:</i> <b>${house.name}</b>
<i>Цена:</i> <b>${house.price.toLocaleString('de-DE')} ${formatNumberInScientificNotation(house.price)}</b>
<i>Сезон:</i> <b>${house.season}</b>
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
Вы успешно совершили покупку дом информацию о доме №${houseNumberToBuy}:

<i>Название:</i> <b>${selectedHouse.name}</b>
<i>Цена:</i> <b>${selectedHouse.price.toLocaleString('de-DE')} $</b>
<i>Сезон:</i> <b>${selectedHouse.season}</b>
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

<i>Название:</i> <b>${selectedHouse.name}</b>
<i>Цена:</i> <b>${selectedHouse.price.toLocaleString('de-DE')} $</b>
<i>Сезон:</i> <b>${selectedHouse.season}</b>
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

                collection.updateOne({ id: userId }, { $set: { "properties.0.houses": '', "properties.0.lendHouse": 0 } });
                collection.updateOne({ id: userId }, { $inc: { uc: sellPrice } });
            }
            if (houseDonate === false) {
                const sellPrice = houseToSellPrice * 0.9; // Пример: продажа за 90% от цены
                bot.sendMessage(chatId, `Вы успешно продали дом "${houseToSellName}" за ${sellPrice.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(sellPrice)}.`);

                collection.updateOne({ id: userId }, { $set: { "properties.0.houses": '', "properties.0.lendHouse": 0 } });
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

        let houseKb = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🧨Продать дом', switch_inline_query_current_chat: 'продать дом' },
                        { text: '📝Дать в аренду', switch_inline_query_current_chat: 'дом аренда' },
                    ]
                ]
            }
        }

        const userLendHouse = user.properties[0].lendHouse
        const currentDate = Date.now()
        const remainingTime = bonusCooldown - (currentDate - userLendHouse) > 0 ? formatRemainingTime(bonusCooldown - (currentDate - userLendHouse)) : '<b>Можете дать в аренду</b>';


        if (userStatus === 'premium' || userStatus === 'vip') {
            bonusCooldown = 12 * 60 * 60 * 1000;
        }

        if (houseName !== '') {
            if (houseDonate === true) {
                const userHousePrice = house.price
                const userHouseSeason = house.season
                const userHouImg = house.img

                const houseInfo = `
${userStatus}, вот информация о вашем донат доме:

<i>Название:</i> <b>${userHouseName2}</b>
<i>Цена:</i> <b>${userHousePrice.toLocaleString('de-DE')} UC</b>
<i>Сезон:</i> <b>${userHouseSeason}</b>
    `;
                bot.sendPhoto(chatId, userHouImg, { caption: houseInfo, parse_mode: 'HTML', });
            }
            else {
                const userHousePrice = house.price
                const userHouseSeason = house.season
                const userHouImg = house.img

                const houseInfo = `
${userStatus}, вот информация о вашем доме:

<i>Название:</i> <b>${userHouseName2}</b>
<i>Цена:</i> <b>${userHousePrice.toLocaleString('de-DE')} UC</b>

<i>До новый аренды:</i> <b>${remainingTime}</b>
    `;
                bot.sendPhoto(chatId, userHouImg, { caption: houseInfo, parse_mode: 'HTML', ...houseKb, });
            }
        } else {
            bot.sendMessage(chatId, `У вас нету дома.`);
        }
    } else {
        bot.sendMessage(chatId, `У вас нет дома. Вы можете приобрести дом с помощью команды <code>купить дом [номер дома]</code>.`, { parse_mode: 'HTML' });
    }
}

async function changeHousePrice(msg, bot, collectionHouses) {
    const text = msg.text;
    const chatId = msg.chat.id;
    const userId = msg.from.id
    const checkPerms = await checkUserPerms(userId, 'changepricehouse')

    const parts = text.split(' ');

    if (parts.length === 4 || checkPerms === true) {
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
    const checkPerms = await checkUserPerms(userId, 'changenamehouse')

    const parts = text.split(' ');
    const userDonateStatus = await donatedUsers(msg, collection)

    if (parts.length >= 4) {
        if (userId === adminId || checkPerms === true) {
            const houseNumber = parseInt(parts[2]);
            const newHouseName = parts.slice(3).join(' ');

            if (isNaN(houseNumber) && newHouseName) {
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

    if (data === 'simpleHouses') {
        const userStatus = await donatedUsers(msg, collection)
        const sortedHouses = await collectionHouses.find({ donate: false }).sort({ price: 1 }).toArray();
        const houseNamesString = sortedHouses.map((house, index) => `${index + 1}. ${house.name} - ${house.price.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(house.price)}`).join('\n');

        bot.editMessageText(`
${userStatus}, вот доступные дома (отсортированы по цене):

${houseNamesString}

<i>Введите <code>купить дом [номер]</code> дома - чтобы купить дом из списка</i>
        `, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
        })
    }
}

async function houseDelete(msg, bot, collectionHouses, collection) {
    const text = msg.text
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id
    const checkPerms = await checkUserPerms(userId1, 'delhouse')

    const userDonateStatus = await donatedUsers(msg, collection)
    const parts = text.split(' ')

    if (userId1 !== adminId && checkPerms === false) {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы не являетесь администратором бота
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (parts.length < 2 || parts.length === 1) {
        bot.sendMessage(chatId, `
${userDonateStatus}, не правильный ввод команды 
<i>Пример:</i> <code>-дом [номер дома]</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (isNaN(parts[1]) || parts[1] < 1) {
        bot.sendMessage(chatId, `
${userDonateStatus}, Номер дома который вы хотите удалить не найдено
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const houseNum = parseInt(parts[1])
    const sortedHouses = await collectionHouses.find({ donate: false }).sort({ price: 1 }).toArray()

    const houseToUpdate = sortedHouses[houseNum - 1];
    try {
        await collectionHouses.deleteOne({ _id: houseToUpdate._id }).then(async () => {
            await bot.sendMessage(chatId, `
${userDonateStatus}, Успешно удалили дом
            `, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            })
        }).catch(async err => {
            await bot.sendMessage(chatId, `
${userDonateStatus}, Произошла ошибка при удалении дома
            `, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            })
        })
    } catch (err) {
        bot.sendMessage(chatId, `
${userDonateStatus}, произошла ошибка при удалении дома проверьте есть ли дом который вы указали в списке домов <code>дома</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
    }
}

async function lendHouse(msg, bot, collection, collectionHouses) {
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userHouse = user.properties[0].houses

    if (userHouse === '') {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас нету дома чтобы дать его в аренду
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    const house = await collectionHouses.findOne({ name: userHouse })
    const houseProfit = Math.floor(house.price / 40)
    const userLendHouse = user.properties[0].lendHouse
    const userStatus = user.status[0].statusName

    const currentDate = Date.now()

    if (userStatus === 'premium' || userStatus === 'vip') {
        bonusCooldown = 12 * 60 * 60 * 1000;
    }

    const remainingTime = formatRemainingTime(bonusCooldown - (currentDate - userLendHouse));

    if (currentDate - userLendHouse <= bonusCooldown && userLendHouse !== 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы уже поставили дом в аренду дождитесь до окончании аренды
<i>Подождите еще:</i> <b>${remainingTime}</b>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    await bot.sendMessage(chatId, `
${userDonateStatus}, вы успешно дали дом в аренду и заработали
<i>Заработали:</i> <b>${houseProfit.toLocaleString('de-DE')}</b>
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
    await collection.updateOne({ id: userId1 }, { $set: { "properties.0.lendHouse": currentDate } })
    await collection.updateOne({ id: userId1 }, { $inc: { balance: houseProfit } })
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
    houseDelete,
    lendHouse,
}