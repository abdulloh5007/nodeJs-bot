const { donatedUsers } = require("../donate/donatedUsers")
const { formatNumberInScientificNotation, parseNumber } = require("../systems/systemRu")

/**
 * Retrieves information about a user's deposit and sends a message with the details to a chat.
 * Includes options for deposit replenishment and withdrawal.
 * 
 * @param {object} msg - The message object containing information about the user and chat.
 * @param {object} bot - The bot object used to send messages.
 * @param {object} collection - The collection object used to query the database.
 * @returns {Promise<void>}
 */
async function userDepozit(msg, bot, collection) {
  const userId = msg.from.id;
  const chatId = msg.chat.id;
  const messageId = msg.message_id;

  const userDonateStatus = await donatedUsers(msg, collection);
  const user = await collection.findOne({ id: userId });
  const depozit = user.depozit[0];

  const depBalance = depozit.balance;
  const depLimit = depozit.limit;
  const depProcent = depozit.procent;
  const depDate = depozit.date;

  const findDepDate = depDate !== 0 ? `<i>⌛️Дата снятие: <b>${depDate.toLocaleString()}</b></i>\n` : '';

  const newDepDate = new Date().getDate();
  const dateDepDate = new Date(depDate).getDate();
  const findDepDateToBtn = depDate === 0 ? 999 : dateDepDate;

  const depOpts = {
    reply_markup: {
      inline_keyboard: [
        [
            { text: '⚖️Депозит пополнить', switch_inline_query_current_chat: 'депозит пополнить ' }, { text: '⚙️Дополнительный процент', switch_inline_query_current_chat: '+деп процент' }
            ],
        newDepDate >= findDepDateToBtn ? [{ text: '💰Снять', callback_data: `pull_money_depozit__${userId}` }] : []
      ]
    }
  };

  const message = `
${userDonateStatus}, информация о вашем депозите

<i>💳Ваш баланс в депозите:</i> <b>${depBalance.toLocaleString('de-DE')} ${formatNumberInScientificNotation(depBalance)}</b>
<i>📲Лимит:</i> <b>${depLimit.toLocaleString('de-DE')} ${formatNumberInScientificNotation(depLimit)}</b>
<i>💹Процент:</i> <b>${depProcent} %</b>
${findDepDate}
<b>〽️Процент будет повышаться смотря на ваш статус !</b> 🏆
<b>⏹Кнопка снять появиться когда придёт дата снятие</b> 🤖
  `;

  await bot.sendMessage(chatId, message, {
    parse_mode: 'HTML',
    reply_to_message_id: messageId,
    ...depOpts,
  });
}

async function depozitAddMoney(msg, bot, collection, glLength) {
    const userId1 = msg.from.id
    const chatId = msg.chat.id
    const messageId = msg.message_id
    const text = msg.text

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const userBalance = user.balance
    const depLimit = user.depozit[0].limit
    const depBalance = user.depozit[0].balance
    const depDate = user.depozit[0].date
    const testDate = new Date().getDate()
    const dateDepDate = new Date(depDate).getDate()

    const parts = text.split(' ')
    let depMoney = parts[glLength]
    const date = new Date()
    date.setDate(date.getDate() + 1);

    if (depMoney === undefined || isNaN(depMoney) || depMoney <= 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, не правильно введена сумма для депозита

<b>Пример:</b> <code>депозит пополнить [сумма]</code>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    depMoney = parseInt(parseNumber(parts[glLength]))

    if (userBalance < depMoney) {
        bot.sendMessage(chatId, `
${userDonateStatus}, у вас не хватает средств в балансе чтобы пополнить ваш депозит

<b>Ваш баланс:</b> ${userBalance.toLocaleString('de-DE')} ${formatNumberInScientificNotation(userBalance)}
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (parseInt(depBalance) + parseInt(depMoney) > depLimit) {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы неможете попонить <b>${depMoney.toLocaleString('de-DE')}</b>, это сумма превышает ваш лимит депозита
попробуйте пополнить меньше суммы
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (dateDepDate < testDate && depDate !== 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, вы не можете пополнить баланс депозита так как время уже вышло

<b>Надо сначало снять деньги потом заново поставить деньги!</b>
<b>Потом до окончании времени вы можете пополнить баланс депозита сколько захочете</b>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        return;
    }

    if (depBalance !== 0) {
        bot.sendMessage(chatId, `
${userDonateStatus}, 😁вы успешно добавили деньги <b>${depMoney.toLocaleString('de-DE')}</b> в свой депозит счет при этом не изменив время снятия депозита💳

<b>🤵Вы можете добавлять денег бесконечное количество раз до окончания времени снятия !</b>
        `, {
            parse_mode: 'HTML',
            reply_to_message_id: messageId,
        })
        await collection.updateOne({ id: userId1 }, {
            $inc: {
                "depozit.0.balance": depMoney,
                balance: -depMoney,
            }
        })
        return;
    }

    bot.sendMessage(chatId, `
${userDonateStatus}, 😎вы успешно положили в свой депозит <b>${depMoney.toLocaleString('de-DE')}</b>💳

<b>📆Дата снятие:</b> ${date.toLocaleString()}
    `, {
        parse_mode: 'HTML',
        reply_to_message_id: messageId,
    })
    await collection.updateOne({ id: userId1 }, {
        $inc: {
            "depozit.0.balance": depMoney,
            balance: -depMoney,
        }
    })
    await collection.updateOne({ id: userId1 }, { $set: { "depozit.0.date": date, } })
}

async function pullMoneyDepozit(msg, bot, collection) {
    const data = msg.data
    const userId1 = msg.from.id
    const chatId = msg.message.chat.id
    const messageId = msg.message.message_id

    const userDonateStatus = await donatedUsers(msg, collection)
    const user = await collection.findOne({ id: userId1 })
    const depBalance = user.depozit[0].balance
    const depProcent = user.depozit[0].procent
    const result = Math.floor((depBalance / 100) * depProcent);
    const finishedResult = parseInt(depBalance) + parseInt(result)

    const parts = data.split('__')

    if (parts[0] === 'pull_money_depozit') {
        if (parts[1] != userId1) {
            bot.answerCallbackQuery(msg.id, `Это кнопка не для тебя`)
            return;
        }

        if (depBalance <= 0) {
            bot.sendMessage(chatId, `
    ${userDonateStatus}, У вас и так нету денег на балансе депозита
            `, {
                parse_mode: 'HTML',
                reply_to_message_id: messageId,
            })
            return;
        }

        await bot.editMessageText(`
${userDonateStatus}, вы успешно сняли денег с депозита 

<b>Процент:</b> <i>${depProcent}%</i>
<b>Сумма снятие депозита:</b> <i>${finishedResult.toLocaleString('de-DE')} ${formatNumberInScientificNotation(finishedResult)}</i>
        `, {
            parse_mode: 'HTML',
            chat_id: chatId,
            message_id: messageId,
        })
        await collection.updateOne({ id: userId1 }, { $inc: { balance: Math.floor(finishedResult) } })
        await collection.updateOne({ id: userId1 }, {
            $set: {
                "depozit.0.balance": 0,
                "depozit.0.date": 0,
            }
        })
    }
}

module.exports = {
    userDepozit,
    depozitAddMoney,
    pullMoneyDepozit,
}