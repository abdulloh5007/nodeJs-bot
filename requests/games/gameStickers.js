function gameWinStickers() {
    const winStickers = ['👍', '🤩', '🥳', '😎', '🤑']

    // Получаем случайный индекс элемента в массиве
    const randomIndex = Math.floor(Math.random() * winStickers.length);

    // Получаем случайный элемент из массива
    const randomElement = winStickers[randomIndex];

    // Выводим случайный элемент в консоль

    return randomElement;
}

function gameLoseStickers() {
    const winStickers = ['👎', '😥', '😭', '🤧', '🤬']

    // Получаем случайный индекс элемента в массиве
    const randomIndex = Math.floor(Math.random() * winStickers.length);

    // Получаем случайный элемент из массива
    const randomElement = winStickers[randomIndex];

    // Выводим случайный элемент в консоль

    return randomElement;
}

module.exports = {
    gameWinStickers,
    gameLoseStickers
}