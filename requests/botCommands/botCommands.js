const botCommands1 = [
    "Помощь", 'start', '/start@levouJS_bot', '/start ref_',
    '@levouJS_bot открыть контейнер', '@levouJS_bot +ава', '@levouJS_bot купить бизнес', '@levouJS_bot купить бработников', '@levouJS_bot казино', 'calc', 'cl', 'кт', 'ава', '+ава', 'конты', 'контейнеры', 'conts', 'containers', 'открыть контейнер', 'бизнесы', 'купить бизнес', 'мой бизнес', 'инфо бработники', 'купить бработников', 'бизнес снять', 'бизнес налоги', '/help', '/help@levouJS_bot', 'ref', '!ref', 'реф', '!реф', 'б', 'баланс', 'b', 'balance', 'казино', 'инфо', 'профиль', 'сменить ник', 'дать', 'айди', 'мой айди', 'my id', 'myid', 'id', '.infoid', 'инфо карта', 'карта создать', 'моя карта', '+карта пароль', 'карта положить',
]

const botCommands = botCommands1.map((e) => {
    return e.toLowerCase()
})

module.exports = {
    botCommands,
}