require('dotenv').config()
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (msg.document) {
        bot.getFileLink(msg.document.file_id).then((fileLink) => {
            bot.sendMessage(chatId, 'Получен файл, начинаю поиск');

            const tags = new Set();

            require('https').get(fileLink, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    const lines = data.split('\n');
                    lines.forEach((line) => {
                        const parts = line.split(';');
                        if (parts.length === 4) {
                            if (parts[2].startsWith('@'))
                                tags.add(parts[2]);
                        }
                    });

                    const uniqueTags = Array.from(tags).join('\n');
                    if (uniqueTags)
                        bot.sendMessage(chatId, `Результат поиска:\n${uniqueTags}`);
                    else
                        bot.sendMessage(chatId, `Ничего не найдено. Проверьте прявильность отправленого файла`);
                });
            });
        });
    }
});