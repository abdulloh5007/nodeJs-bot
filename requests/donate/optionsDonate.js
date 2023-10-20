const textHalloween = `
<b><u>Этот статус прийдет раз в год на 20 дней</u></b>

<b>Отключена реклама ✅
Хелоуинский аватар в профиле ✅
Отметка в профиле <i>"🎃"</i> ✅
Увеличен лимит передачи 400.000 (400е3) ✅
Увеличен процент в депозиет 13% ✅
Увеличен лимит пополнения депозита до 150.000 (150е3) ✅

Увеличена удача в гонке с ботом это возможность есть только в этом статусе ✅
    ↑команда "<code>бгонка 1е3</code>"
</b>
<i>Так что не пропусти его !</i>
    `

const textStandart = `
➖➖➖➖➖➖➖➖➖➖➖➖➖➖

<i>✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ</i>

<b>ОТКЛЮЧЕНИЕ РЕКЛАМЫ ❌
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ❌
ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ❌
ВОЗМОЖНОСТЬ ПОСТАВИТЬ НИК ДО 16 СИМВОЛОВ ❌
СОКРАЩЕНО ПОЛУЧЕНИЕ БОНУСА 2 РАЗА ❌
СКИДКА НА ЛЮБЫХ БРАБОТНИКОВ 5% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"🎁"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 300.000 (300е3) ✅
УВЕЛИЧЁН ПРОЦЕНТ В ДЕПОЗИТЕ ДО 12% ✅
УВЕЛИЧЁН ЛИМИТ ПОПОЛНЕНИЕ ДЕПОЗИТА ДО 100.000 (100е3) ✅</b>

➖➖➖➖➖➖➖➖➖➖➖➖➖➖
    `

const textVip = `
➖➖➖➖➖➖➖➖➖➖➖➖➖➖

<i>✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ</i>

<b>ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ❌
ОТКЛЮЧЕНИЕ РЕКЛАМЫ ✅
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ✅
СКИДКА НА ЛЮБЫХ БРАБОТНИКОВ 7% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"💎"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 600.000 (600е3) ✅
УВЕЛИЧЁН ПРОЦЕНТ В ДЕПОЗИТЕ ДО 15% ✅
УВЕЛИЧЁН ЛИМИТ ПОПОЛНЕНИЕ ДЕПОЗИТА ДО 200.000 (200е3) ✅
ВОЗМОЖНОСТЬ ПОСТАВИТЬ НИК ДО 16 СИМВОЛОВ ✅
СОКРАЩЕНО ПОЛУЧЕНИЕ БОНУСА 2 РАЗА ✅
СОКРАЩЕНО ВЫДАЧА ДОМА В АРЕНДУ 2 РАЗА ✅</b>

➖➖➖➖➖➖➖➖➖➖➖➖➖➖
    `

const textPremium = `
➖➖➖➖➖➖➖➖➖➖➖➖➖➖

<i>✅ - ИМЕЕТСЯ
❌ - НЕ ИМЕЕТСЯ</i>

<b>ВОЗМОЖНОСТЬ ПОСТАВИТЬ СВОЮ АВУ ✅
ОТКЛЮЧЕНИЕ РЕКЛАМЫ ✅
ЕЖЕДНЕВНЫЙ БОНУС УВЕЛИЧЁН НА 2X ✅
СКИДКА НА ЛЮБЫХ БРАБОТНИКОВ 10% ✅
ОТМЕТКА В ПРОФИЛЕ <b>"⭐️"</b> ✅
УВЕЛИЧЁН ЛИМИТ ПЕРЕДАЧИ НА 1.000.000 (1е16) ✅
УВЕЛИЧЁН ПРОЦЕНТ В ДЕПОЗИТЕ ДО 18% ✅
УВЕЛИЧЁН ЛИМИТ ПОПОЛНЕНИЕ ДЕПОЗИТА ДО 400.000 (400е3) ✅
ВОЗМОЖНОСТЬ ПОСТАВИТЬ НИК ДО 16 СИМВОЛОВ ✅
СОКРАЩЕНО ПОЛУЧЕНИЕ БОНУСА 2 РАЗА ✅
СОКРАЩЕНО ВЫДАЧА ДОМА В АРЕНДУ 2 РАЗА ✅</b>

➖➖➖➖➖➖➖➖➖➖➖➖➖➖
    `

const donateStatusesCheck = {
    'check_standart_status': {
        txt: 'вы точно хотите приобрести статус <b>STANDART 🎁</b> при этом имея сатус',
        optionsTxt: 'СОГЛАСИТЬСЯ 🎁',
        callbackBuy: 'active_standart_status'
    },
    'check_vip_status': {
        txt: 'вы точно хотите приобрести статус <b>VIP 💎</b> при этом имея сатус',
        optionsTxt: 'СОГЛАСИТЬСЯ 💎',
        callbackBuy: 'active_vip_status'
    },
    'check_premium_status': {
        txt: 'вы точно хотите приобрести статус <b>PREMIUM ⭐️</b> при этом имея сатус',
        optionsTxt: 'СОГЛАСИТЬСЯ ⭐️',
        callbackBuy: 'active_premium_status'
    },
    'check_halloween_status': {
        txt: 'вы точно хотите приобрести статус <b>HALLOWEEN 🎃</b> при этом имея сатус',
        optionsTxt: 'СОГЛАСИТЬСЯ 🎃',
        callbackBuy: 'active_halloween_status'
    },
}

const donateStatusBuy = {
    'active_standart_status': {
        name: 'standart',
        txt: `Вы успешно активировали статус <b>STANDART 🎁</b>.\n
<b>Спасибо вам огромное что покупали наш товар</b>`,
        errTxt: `У вас не достаточно UC для покупки 
<i>Статуса</i> <b>STANDART 🎁</b>.`,
        days: 7,
        cost: 0,
        moneyLimit: 300000,
        depLimit: 100000,
        depProcent: 12,
    },
    'active_vip_status': {
        name: 'vip',
        txt: `Вы успешно активировали статус <b>VIP 💎</b>.\n
<b>Спасибо вам огромное что покупали наш товар</b>`,
        errTxt: `У вас не достаточно UC для покупки 
<i>Статуса</i> <b>VIP 💎</b>.`,
        days: 30,
        cost: 99,
        moneyLimit: 600000,
        depLimit: 200000,
        depProcent: 15,
    },
    'active_premium_status': {
        name: 'premium',
        txt: `Вы успешно активировали статус <b>PREMIUM ⭐️</b>.\n
<b>Спасибо вам огромное что покупали наш товар</b>`,
        errTxt: `У вас не достаточно UC для покупки 
<i>Статуса</i> <b>PREMIUM ⭐️</b>.`,
        days: 7,
        cost: 300,
        moneyLimit: 1000000,
        depLimit: 400000,
        depProcent: 18,
    },
    'active_halloween_status': {
        name: 'halloween',
        txt: `Вы успешно активировали статус <b>HALLOWEEN 🎃</b>.\n
<b>Спасибо вам огромное что покупали наш товар</b>`,
        errTxt: `У вас не достаточно UC для покупки 
<i>Статуса</i> <b>HALLOWEEN 🎃</b>.`,
        days: 15,
        cost: 60,
        moneyLimit: 400000,
        depLimit: 150000,
        depProcent: 13,
    },
}

const donateStatuses = {
    'donate_standart': {
        name: 'standart',
        txt: textStandart,
        infoStatus: 'Вот данные за донат статус <b>STANDART 🎁</b>',
        callbackCheck: 'check_standart_status',
        callbackBuy: 'active_standart_status',
        optionsTxt: 'АКТИВИРОВАТЬ 🎁',
        img: 'https://ibb.co/zZ9jYFV',
    },
    'donate_vip': {
        name: 'vip',
        txt: textVip,
        infoStatus: 'Вот данные за донат статус <b>VIP 💎</b>',
        callbackCheck: 'check_vip_status',
        callbackBuy: 'active_vip_status',
        optionsTxt: 'АКТИВИРОВАТЬ 💎',
        img: 'https://ibb.co/DwmNPJX',
    },
    'donate_premium': {
        name: 'premium',
        txt: textPremium,
        infoStatus: 'Вот данные за донат статус <b>PREMIUM ⭐️</b>',
        callbackCheck: 'check_premium_status',
        callbackBuy: 'active_premium_status',
        optionsTxt: 'АКТИВИРОВАТЬ ⭐️',
        img: 'https://ibb.co/q53M2wG',
    },
    'donate_halloween': {
        name: 'halloween',
        txt: textHalloween,
        infoStatus: 'Вот данные за донат статус <b>HALLOWEEN 🎃</b>',
        callbackCheck: 'check_halloween_status',
        callbackBuy: 'active_halloween_status',
        optionsTxt: 'АКТИВИРОВАТЬ 🎃',
        img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLhlz7Tl63V6HPcVBveuqaIsh9C5jqbwbQ-g&usqp=CAU',
    },
}

const donateInfoUserName = {
    'standart': {
        txt: textStandart
    },
    'vip': {
        txt: textVip
    },
    'premium': {
        txt: textPremium
    },
    'halloween': {
        txt: `
<b>Отключена реклама ✅
Хелоуинский аватар в профиле ✅
Отметка в профиле <i>"🎃"</i> ✅
Увеличен лимит передачи 400.000 (400е3) ✅
Увеличен процент в депозиет 13% ✅
Увеличен лимит пополнения депозита до 150.000 (150е3) ✅

Увеличена удача в гонке с ботом, это возможность есть только в этом статусе ✅
    ↑команда "<code>бгонка 1е3</code>"</b>
        `
    }
}

const actived_donates = `
1 UC = 0.5 Р

➖➖➖➖➖➖➖➖➖➖➖➖➖
    
<b>🎁STANDART</b> = <i>БЕСПЛАТНО 7 дней</i>
<b>💎VIP</b> = <i>99 UC - 30 дней</i>
<b>⭐️PREMIUM</b> = <i>300 UC - 30 дней</i>
<b>🎃HALLOWEEN</b> = <i>60 UC - 15 дней</i>

➖➖➖➖➖➖➖➖➖➖➖➖➖
    `

const options_donate = {
    reply_markup: {
        inline_keyboard: [
            [{ text: '🎁', callback_data: 'donate_standart' }, { text: '💎', callback_data: 'donate_vip' }, { text: '⭐️', callback_data: 'donate_premium' }],
            [{ text: '🎃', callback_data: 'donate_halloween' }],
            [{ text: 'Назад', callback_data: 'donateMain_menu' }]
        ]
    }
};

const actived_donate_menu = `
1 UC = 0.5 Р

➖➖➖➖➖➖➖➖➖➖➖➖➖
        
🪄Статусы
⚙️Депозит

➖➖➖➖➖➖➖➖➖➖➖➖➖
    `

module.exports = {
    donateStatuses,
    donateStatusesCheck,
    donateStatusBuy,
    donateInfoUserName,
    actived_donates,
    options_donate,
    actived_donate_menu,
}
