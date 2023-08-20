function parseNumber(input) {
    // Словарь для преобразования буквенных обозначений в числовые множители
    const multipliers = {
        'к': 1000, // Тысяча
        'м': 1000000, // Миллион
        'млр': 1000000000, // Миллиард
        'трл': 1000000000000, // Трилиард
        'e3': 1000,
        'e4': 10000,
        'e5': 100000,
        'e6': 1000000,
        'e7': 10000000,
        'e8': 100000000,
        'e9': 1000000000,
        'e10': 10000000000,
        'e11': 100000000000,
        'e12': 1000000000000,
        'е3': 1000,
        'е4': 10000,
        'е5': 100000,
        'е6': 1000000,
        'е7': 10000000,
        'е8': 100000000,
        'е9': 1000000000,
        'е10': 10000000000,
        'е11': 100000000000,
        'е12': 1000000000000,
    };

    // Удаляем пробелы и точки из числа
    input = input.replace(/[\s.]/g, '');

    // Преобразуем буквенные обозначения в числовые значения
    for (const [abbr, multiplier] of Object.entries(multipliers)) {
        if (input.endsWith(abbr)) {
            const number = parseInt(input.replace(new RegExp(abbr + '$', 'g'), ''));
            return number * multiplier;
        }
    }

    // Если нет соответствия в словаре, просто преобразуем в число и возвращаем результат
    return parseInt(input);
}

function formatNumberWithAbbreviations(number) {
    const SI_SYMBOL = ['', 'тыс', 'млн', 'млрд', 'трлн']; // Отображаемые сокращения

    // Находим порядок числа (тысячи, миллионы, миллиарды и т.д.)
    const order = Math.min(Math.floor(Math.log10(Math.abs(number)) / 3), SI_SYMBOL.length - 1);

    // Округляем число с учетом порядка
    const roundedNumber = (number / Math.pow(10, order * 3)).toFixed(3);

    // Убираем лишние нули после десятичной точки
    const formattedNumber = parseFloat(roundedNumber).toString();

    // Возвращаем число с соответствующим сокращением
    return formattedNumber + SI_SYMBOL[order];
}

function formatNumberInScientificNotation(number) {
    // Если число меньше 1000, то нет необходимости представлять в научной нотации
    if (Math.abs(number) < 1000) {
        return ''
    }

    // Находим порядок числа (тысячи, миллионы, миллиарды и т.д.)
    const order = Math.floor(Math.log10(Math.abs(number)) / 3) * 3;

    // Округляем число с учетом порядка
    const roundedNumber = (number / Math.pow(10, order)).toFixed(3);

    // Убираем лишние нули после десятичной точки
    const formattedNumber = parseFloat(roundedNumber).toString();

    // Возвращаем число в научной нотации
    return `(${formattedNumber + "e" + order})`;
}



module.exports = {
    parseNumber,
    formatNumberWithAbbreviations,
    formatNumberInScientificNotation,
}