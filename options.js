module.exports = {
    startOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Помощь', callback_data: 'help' }],
                [{ text: 'Добавить бота в чат', url: 'https://telegram.me/levoujs_bot?startgroup=new' }]
            ]
        })
    },
    helpOption: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: '👜', callback_data: 'mainHelp' }, { text: '🤹‍♂', callback_data: 'gameHelp' }],
                [{ text: '🌇', callback_data: 'propertyHelp' }, { text: '🛡', callback_data: 'adminHelp' }],
                [{ text: '📓', callback_data: 'restHelp' }, { text: '☎️', callback_data: 'moderationHelp' }],
                [{ text: 'Добавить бота в чат', url: 'https://telegram.me/levoujs_bot?startgroup=new' }],
            ]
        })
    },
    backOption: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Назад', callback_data: 'back' }]
            ]
        })
    },
    avatarOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Поставить', callback_data: 'avatarPut' }, { text: 'Удалить', callback_data: 'avatarDel' }]
            ]
        })
    },
    againGameOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Играть еще раз', switch_inline_query_current_chat: 'казино ' }]
            ]
        })
    },
    dayBonusOption: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Получить бонус', callback_data: 'dayBonusCollect' }]
            ]
        })
    },
    topOptions: {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'Топ баланс', callback_data: 'top_balance' }],
                [{ text: 'Топ проведены игр', callback_data: 'top_game' }],
                [{ text: 'Топ баланса на карте', callback_data: 'top_card' }],
            ]
        })
    }
}