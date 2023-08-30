const customChalk = {
    colors: {
        reset: '\x1b[0m',
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m'
    },
    backgrounds: {
        bgBlack: '\x1b[40m',
        bgRed: '\x1b[41m',
        bgGreen: '\x1b[42m',
        bgYellow: '\x1b[43m',
        bgBlue: '\x1b[44m',
        bgMagenta: '\x1b[45m',
        bgCyan: '\x1b[46m',
        bgWhite: '\x1b[47m'
    },
    styles: {
        bold: '\x1b[1m',
        italic: '\x1b[3m',
        underline: '\x1b[4m'
    },
    colorize(text, options = {}) {
        const { color, style, background } = options;
        let formattedText = text;

        if (color) {
            const colorCode = this.colors[color] || this.colors.reset;
            formattedText = colorCode + formattedText;
        }

        if (background) {
            const backgroundCode = this.backgrounds[background] || '';
            formattedText = backgroundCode + formattedText;
        }

        if (style) {
            const styleCode = this.styles[style] || '';
            formattedText = styleCode + formattedText;
        }

        formattedText += this.colors.reset;
        return formattedText;
    }
};

module.exports = {
    customChalk
}