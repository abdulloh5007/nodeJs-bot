const { donatedUsers } = require('../../donate/donatedUsers')
const { parseNumber, formatNumberInScientificNotation } = require('../../systems/systemRu')

require('dotenv').config()
const adminId = parseInt(process.env.ADMIN_ID_INT)

async function CarAdd(msg, bot, collectionCars) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const parts = text.split(' ')

    if (text.toLowerCase().startsWith('+машина')) {
        if (userId === adminId || userId === 1693414035 || userId === 5954575083) {
            if (parts.length == 5) {

                const carName = parts[1]
                const carPrice = parseInt(parseNumber(parts[2]))
                const carSeason = parseInt(parts[3])
                const carImg = parts[4]

                const existingCarByName = await collectionCars.findOne({ carName: carName });
                const existingCarByImg = await collectionCars.findOne({ carImg: carImg });

                if (existingCarByName || existingCarByImg) {
                    bot.sendMessage(chatId, 'Машина с таким названием или айди картиной уже существует.');
                    return; // Прекращаем выполнение, так как дубликат найден
                }

                if (carName.toLowerCase().length >= 3) {
                    if (carPrice >= 1000) {
                        if (!!carSeason) {
                            if (!!carImg) {
                                collectionCars.insertOne({
                                    carName: carName,
                                    carPrice: carPrice,
                                    carSeason: carSeason,
                                    carImg: carImg,
                                    carDonate: false,
                                })
                                const txt = `
Успешно была добавлена машина 
Название: ${carName}
Цена: ${carPrice.toLocaleString('de-DE')} (${formatNumberInScientificNotation(carPrice)})
Сезон: ${carSeason}
`
                                bot.sendPhoto(chatId, carImg, { caption: txt, parse_mode: 'HTML' })
                            }
                            else {
                                bot.sendMessage(chatId, 'Введите айди картины или это картина уже существует')
                            }
                        }
                        else {
                            bot.sendMessage(chatId, 'Введите сезон выхода машины')
                        }
                    }
                    else {
                        bot.sendMessage(chatId, 'Цена машины должна быть минимум 1.000')
                    }
                }
                else {
                    bot.sendMessage(chatId, `Имя машины должна состоять минимум из 3 букв, или вами придуманное имя уже существует`)
                }
            }
            else {
                bot.sendMessage(chatId, `Не правильно введены данные пример <code>+машина car [цена] [сезон] [юрл или айди картины]</code>`, { parse_mode: 'HTML' })
            }
        }
        else {
            bot.sendMessage(chatId, 'Вы не являетесь владельцом бота')
        }
    }
}


async function CarDonateAdd(msg, bot, collectionCars) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const parts = text.split(' ')

    if (text.toLowerCase().startsWith('+донатмашина')) {
        if (userId === adminId || userId === 1693414035 || userId == 5954575083) {
            if (parts.length == 5) {

                const carName = parts[1]
                const carPrice = parseInt(parts[2])
                const carSeason = parseInt(parts[3])
                const carImg = parts[4]

                const existingCarByName = await collectionCars.findOne({ carName: carName });
                const existingCarByImg = await collectionCars.findOne({ carImg: carImg });

                if (existingCarByName || existingCarByImg) {
                    bot.sendMessage(chatId, 'Машина с таким названием или айди картиной уже существует.');
                    return; // Прекращаем выполнение, так как дубликат найден
                }

                if (carName.toLowerCase().length >= 3) {
                    if (carPrice >= 10) {
                        if (!!carSeason) {
                            if (!!carImg) {
                                collectionCars.insertOne({
                                    carName: carName,
                                    carPrice: carPrice,
                                    carSeason: carSeason,
                                    carImg: carImg,
                                    carDonate: true,
                                })
                                const txt = `
Успешно был добавлен донат машина
Название: ${carName}
Цена: ${carPrice.toLocaleString('de-DE')} UC
Сезон: ${carSeason}
`
                                bot.sendPhoto(chatId, carImg, { caption: txt, parse_mode: 'HTML' })
                            }
                            else {
                                bot.sendMessage(chatId, 'Введите айди картины или это картина уже существует')
                            }
                        }
                        else {
                            bot.sendMessage(chatId, 'Введите сезон выхода машины')
                        }
                    }
                    else {
                        bot.sendMessage(chatId, 'Цена машины должна быть минимум 10 UC')
                    }
                }
                else {
                    bot.sendMessage(chatId, `Имя машины должна состоять минимум из 3 букв, или вами придуманное имя уже существует`)
                }
            }
            else {
                bot.sendMessage(chatId, `Не правильно введены данные пример <code>+донатмашина car [цена] [сезон] [юрл или айди картины]</code>`, { parse_mode: 'HTML' })
            }
        }
        else {
            bot.sendMessage(chatId, 'Вы не являетесь владельцом бота')
        }
    }
}


async function donateCars(msg, collection, bot, collectionCars) {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text.toLowerCase() === 'донат машины') {
        const userStatus = await donatedUsers(msg, collection)

        let options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `машины`, callback_data: `simpleCars` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };
        const sortedCars = await collectionCars.find({ carDonate: true }).sort({ carPrice: 1 }).toArray();
        const carNamesString = sortedCars.map((car, index) => `${index + 1}. ${car.carName} - ${car.carPrice.toLocaleString('de-DE')} UC`).join('\n');
        bot.sendMessage(chatId, `
${userStatus}, вот доступные машины (отсортированы по цене):

${carNamesString}

<b>Введите <code>купить донатмашину [номер]</code> машины - чтобы купить машину из списка</b>
            `, {
            parse_mode: 'HTML',
            ...options
        });
    }
}

async function cars(msg, collection, bot, collectionCars) {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text.toLowerCase() === 'машины') {
        const userStatus = await donatedUsers(msg, collection)
        let options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `донат машины`, callback_data: `donateCars` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };
        const sortedCars = await collectionCars.find({ carDonate: false }).sort({ carPrice: 1 }).toArray();
        const carNamesString = sortedCars.map((car, index) => `${index + 1}. ${car.carName} - ${car.carPrice.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(car.carPrice)})`).join('\n');
        bot.sendMessage(chatId, `
${userStatus}, вот доступные машины (отсортированы по цене):

${carNamesString}

<b>Введите <code>купить машину [номер]</code> машины - чтобы купить машину из списка</b>
        `, {
            parse_mode: 'HTML',
            ...options
        });
    }
}

async function findCarByName(msg, collection, bot, collectionCars) {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text.toLowerCase().startsWith('инфо машина')) {

        const parts = text.split(' ');
        const carNameToSearch = parts[2] // Убираем префикс "дом "

        if (parts.length === 3) {
            const car = await collectionCars.findOne({ carName: carNameToSearch });
            const userStatus = await donatedUsers(msg, collection)
            if (car) {
                const carInfo = `
${userStatus}, вот доступные машины:

Название: ${car.carName}
Цена: ${car.carPrice.toLocaleString('de-DE')} (${formatNumberInScientificNotation(car.carPrice)})
Сезон: ${car.carSeason}
                `;

                bot.sendPhoto(chatId, car.carImg, { caption: carInfo, parse_mode: 'HTML' });
            } else {
                bot.sendMessage(chatId, `Машина с названием "${carNameToSearch}" не найдены.`);
            }
        } else {
            bot.sendMessage(chatId, 'Введите название машины');
        }
    }
}

async function carBuy(msg, collection, bot, collectionCars) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const user = await collection.findOne({ id: userId })

    if (text.toLowerCase().startsWith('купить машину')) {
        const parts = text.split(' ');
        const carNumberToBuy = parseInt(parts[2]);

        if (!isNaN(carNumberToBuy)) {
            const sortedCars = await collectionCars.find({ carDonate: false }).sort({ carPrice: 1 }).toArray();

            if (carNumberToBuy >= 1 && carNumberToBuy <= sortedCars.length) {
                const userBalance = user.balance
                const userCar = user.properties[0].car

                const selectedCar = sortedCars[carNumberToBuy - 1];
                if (userCar === '') {
                    if (userBalance >= selectedCar.carPrice) {
                        const carInfo = `
Вы успешно сделали покупку машину информацию о машине №${carNumberToBuy}:

Название: ${selectedCar.carName}
Цена: ${selectedCar.carPrice.toLocaleString('de-DE')} $
Сезон: ${selectedCar.carSeason}
                        `;
                        bot.sendPhoto(chatId, selectedCar.carImg, { caption: carInfo, parse_mode: 'HTML' });
                        collection.updateOne({ id: userId }, { $set: { "properties.0.car": selectedCar.carName } })

                        collection.updateOne({ id: userId }, { $inc: -selectedCar.carPrice })
                    } else {
                        bot.sendMessage(chatId, 'У вас не хватает средств для покупку этой машины')
                    }
                } else {
                    bot.sendMessage(chatId, `У вас уже имеется машина под названием <u>${userCar}</u>`, { parse_mode: 'HTML' })
                }
            } else {
                bot.sendMessage(chatId, 'Неверный номер машины. Пожалуйста, используйте номер из списка доступных машин.');
            }
        } else {
            bot.sendMessage(chatId, 'Введите номер машины, который вы хотите купить.');
        }
    }
}

async function carDonateBuy(msg, collection, bot, collectionCars) {
    const text = msg.text
    const userId = msg.from.id
    const chatId = msg.chat.id

    const user = await collection.findOne({ id: userId })

    if (text.toLowerCase().startsWith('купить донатмашину')) {
        const parts = text.split(' ');
        const carNumberToBuy = parseInt(parts[2]);

        if (!isNaN(carNumberToBuy)) {
            const sortedCars = await collectionCars.find({ carDonate: true }).sort({ carPrice: 1 }).toArray();

            if (carNumberToBuy >= 1 && carNumberToBuy <= sortedCars.length) {
                const userUc = user.uc
                const userCar = user.properties[0].car

                const selectedCar = sortedCars[carNumberToBuy - 1];
                if (userCar === '') {
                    if (userUc >= selectedCar.carPrice) {
                        const carInfo = `
Вы успешно совершили покупку донат машина информацию о машине №${carNumberToBuy}:

Название: ${selectedCar.carName}
Цена: ${selectedCar.carPrice.toLocaleString('de-DE')} UC
Сезон: ${selectedCar.carSeason}
                        `;
                        bot.sendPhoto(chatId, selectedCar.carImg, { caption: carInfo, parse_mode: 'HTML' });
                        collection.updateOne({ id: userId }, { $set: { "properties.0.car": selectedCar.carName } })

                        collection.updateOne({ id: userId }, { $inc: { uc: -selectedCar.carPrice } })
                    } else {
                        bot.sendMessage(chatId, 'У вас не хватает UC для покупку этой донатной машины')
                    }
                } else {
                    bot.sendMessage(chatId, `У вас уже имеется машина под названием <u>${userCar}</u>`, { parse_mode: 'HTML' })
                }
            } else {
                bot.sendMessage(chatId, 'Неверный номер донат машины. Пожалуйста, используйте номер из списка доступных донат машин.');
            }
        } else {
            bot.sendMessage(chatId, 'Введите номер донат машины, который вы хотите купить.');
        }
    }
}

async function sellCar(msg, bot, collection, collectionCars) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    const user = await collection.findOne({ id: userId });

    if (text.toLowerCase() === 'продать машину') {
        const userCar = user.properties[0].car

        if (userCar) {
            const carToSell = await collection.findOne({ id: userId }, { "properties.0.car": userCar });
            const carToSellName = carToSell.properties[0].car
            const car = await collectionCars.findOne({ "carName": carToSellName })

            const carToSellPrice = car.carPrice
            const carDonate = car.carDonate

            if (carToSell) {
                if (carDonate === true) {
                    const sellPrice = carToSellPrice * 1; // Пример: продажа за 90% от цены
                    bot.sendMessage(chatId, `Вы успешно продали свою донат машину "${carToSellName}" за ${sellPrice.toLocaleString('de-DE')} UC.`);

                    collection.updateOne({ id: userId }, { $set: { "properties.0.car": '' } });
                    collection.updateOne({ id: userId }, { $inc: { uc: sellPrice } });
                }
                if (carDonate === false) {
                    const sellPrice = carToSellPrice * 0.9; // Пример: продажа за 90% от цены
                    bot.sendMessage(chatId, `Вы успешно продали свою машину "${carToSellName}" за ${sellPrice.toLocaleString('de-DE')}$ ${formatNumberInScientificNotation(sellPrice)}.`);

                    collection.updateOne({ id: userId }, { $set: { "properties.0.car": '' } });
                    collection.updateOne({ id: userId }, { $inc: { balance: sellPrice } });
                }

            } else {
                bot.sendMessage(chatId, 'У вас нет машины для продажи.');
            }
        } else {
            bot.sendMessage(chatId, 'У вас нет машины для продажи.');
        }
    }
}

async function myCarInfo(msg, collection, bot, collectionCars) {
    const text = msg.text;
    const userId = msg.from.id;
    const chatId = msg.chat.id;

    const user = await collection.findOne({ id: userId });

    if (text.toLowerCase() === 'моя машина') {
        const userStatus = await donatedUsers(msg, collection)
        const userCarName = user.properties[0].car;

        if (userCarName) {
            const userCar = await collection.findOne({ "properties.0.car": userCarName });
            const userCarName2 = userCar.properties[0].car

            const car = await collectionCars.findOne({ "carName": userCarName2 })
            const carName = car.carName
            const carDonate = car.carDonate

            if (carName !== '') {
                if (carDonate === true) {
                    const userCarPrice = car.carPrice
                    const userCarSeason = car.carSeason
                    const userHouImg = car.carImg

                    const carInfo = `
${userStatus}, вот информация о вашей донат машине:

Название: ${userCarName2}
Цена: ${userCarPrice.toLocaleString('de-DE')} UC
Сезон: ${userCarSeason}
    `;
                    bot.sendPhoto(chatId, userHouImg, { caption: carInfo, parse_mode: 'HTML' });
                }
                else {
                    const userCarPrice = car.carPrice
                    const userCarSeason = car.carSeason
                    const userHouImg = car.carImg

                    const carInfo = `
${userStatus}, вот информация о вашей машине:

Название: ${userCarName2}
Цена: ${userCarPrice.toLocaleString('de-DE')}$ ${userCarPrice > 1000 ? `${formatNumberInScientificNotation(userCarPrice)}` : ''}
Сезон: ${userCarSeason}
    `;
                    bot.sendPhoto(chatId, userHouImg, { caption: carInfo, parse_mode: 'HTML' });
                }
            } else {
                bot.sendMessage(chatId, `У вас нет машины.`);
            }
        } else {
            bot.sendMessage(chatId, `У вас нет машины. Вы можете приобрести машину с помощью команды "<code>купить машину [номер машины]</code>".`, { parse_mode: 'HTML' });
        }
    }
}

async function changeCarPrice(msg, bot, collectionCars) {
    const text = msg.text;
    const chatId = msg.chat.id;
    const userId = msg.from.id

    const parts = text.split(' ');

    if (text.toLowerCase().startsWith('машина цена')) {
        if (parts.length === 4) {
            if (userId === adminId) {
                const carNumber = parseInt(parts[2]);
                const newPrice = parseInt(parseNumber(parts[3]));

                if (!isNaN(carNumber) && !isNaN(newPrice) && newPrice > 0) {
                    const sortedCars = await collectionCars.find().sort({ carPrice: 1 }).toArray();

                    if (carNumber >= 1 && carNumber <= sortedCars.length) {
                        const carToUpdate = sortedCars[carNumber - 1];

                        bot.sendMessage(chatId, `Цена для машины "${carToUpdate.carName}" успешно изменена на ${newPrice.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(newPrice)})`);

                        // Обновляем цену в общем списке домов
                        await collectionCars.updateOne({ _id: carToUpdate._id }, { $set: { carPrice: newPrice } });

                    } else {
                        bot.sendMessage(chatId, 'Неверный номер машины. Пожалуйста, используйте номер из списка доступных машин.');
                    }
                } else {
                    bot.sendMessage(chatId, 'Введите корректный номер машины и новую цену.');
                }
            } else {
                bot.sendMessage(chatId, 'Вы не являетесь вледельцом бота.');
            }
        } else {
            bot.sendMessage(chatId, 'Неверный формат команды. Используйте: "машина цена [номер машины] [новая цена]".');
        }
    }
}

async function changeCarName(msg, bot, collectionCars) {
    const text = msg.text;
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    const parts = text.split(' ');

    if (text.toLowerCase().startsWith('машина имя')) {
        if (parts.length >= 4) {
            if (userId === adminId) {
                const carNumber = parseInt(parts[2]);
                const newcarName = parts.slice(3).join(' ');

                if (!isNaN(carNumber) && newcarName) {
                    const sortedCars = await collectionCars.find({ carDonate: false }).sort({ carPrice: 1 }).toArray();

                    if (carNumber >= 1 && carNumber <= sortedCars.length) {
                        const carToUpdate = sortedCars[carNumber - 1];

                        // Проверка, что имя машина не существует
                        const existingcar = await collectionCars.findOne({ carName: newcarName });
                        if (existingcar) {
                            bot.sendMessage(chatId, `Машина с именем "${newcarName}" уже существует.`);
                        } else {
                            bot.sendMessage(chatId, `Имя для стандартной машины "${carToUpdate.carName}" успешно изменено на "${newcarName}".`);

                            // Обновляем имя машина
                            await collectionCars.updateOne({ _id: carToUpdate._id }, { $set: { carName: newcarName } });
                        }
                    } else {
                        bot.sendMessage(chatId, 'Неверный номер машины. Пожалуйста, используйте номер из списка доступных машин.');
                    }
                } else {
                    bot.sendMessage(chatId, 'Введите корректный номер машины и новое имя.');
                }
            } else {
                bot.sendMessage(chatId, 'Вы не являетесь владельцем бота.');
            }
        } else {
            bot.sendMessage(chatId, 'Неверный формат команды. Используйте: "машина имя [номер машины] [новое имя]".');
        }
    }
}

async function btnCars(msg, bot, collection, collectionCars) {
    const data = msg.data
    const chatId = msg.message.chat.id;
    const messageId = msg.message.message_id

    if (data === 'donateCars') {
        const userStatus = await donatedUsers(msg, collection)

        const sortedCars = await collectionCars.find({ carDonate: true }).sort({ carPrice: 1 }).toArray();
        let options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `машины`, callback_data: `simpleCars` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };
        const carNamesString = sortedCars.map((car, index) => `${index + 1}. ${car.carName} - ${car.carPrice.toLocaleString('de-DE')} UC`).join('\n');
        bot.editMessageText(`
${userStatus}, вот доступные донат машины (отсортированы по цене):

${carNamesString}

<b>Введите <code>купить донатмашину [номер]</code> машины - чтобы купить машину из списка</b>
        `, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            ...options
        })
    }

    if (data === 'simpleCars') {
        const userStatus = await donatedUsers(msg, collection)
        let options = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: `донат машины`, callback_data: `donateCars` }],
                    // Добавьте другие кнопки с уникальными идентификаторами и данными пользователя
                ],
            },
        };
        const sortedCars = await collectionCars.find({ carDonate: false }).sort({ carPrice: 1 }).toArray();
        const carNamesString = sortedCars.map((car, index) => `${index + 1}. ${car.carName} - ${car.carPrice.toLocaleString('de-DE')}$ (${formatNumberInScientificNotation(car.carPrice)})`).join('\n');

        bot.editMessageText(`
${userStatus}, вот доступные машины (отсортированы по цене):

${carNamesString}

<b>Введите <code>купить машину [номер]</code> машины - чтобы купить машину из списка</b>
        `, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'HTML',
            ...options
        })
    }
}

module.exports = {
    cars,
    donateCars,
    CarAdd,
    CarDonateAdd,
    findCarByName,
    carBuy,
    carDonateBuy,
    myCarInfo,
    changeCarPrice,
    sellCar,
    btnCars,
    changeCarName,
}