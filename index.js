const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const fs = require("fs");
const https = require("https");

// Загружаем SSL-сертификат
const options = {
    key: fs.readFileSync("/app/server.key"),  // полный путь внутри контейнера
    cert: fs.readFileSync("/app/server.cert")
};

// Replace the value below with the Telegram token you receive from @BotFather
const token = '7527771820:AAHXWX0j9-kEw_QDnY45CaU1GukTgi81lFQ';
const webAppUrl = 'https://elenasoshina.github.io/telegram-web-app-react/#/';

// Create a bot that uses 'polling' to fetch new updates
console.log('[INFO] Запускаем Telegram бота...');
const bot = new TelegramBot(token, { polling: true });
console.log('[INFO] Бот запущен!!!');

const app = express();
app.use(express.json());

const corsOptions = {
    origin: 'https://elenasoshina.github.io',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        console.log('[INFO] Запускаем Telegram бота...');
        // await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
        //     reply_markup: {
        //         keyboard: [
        //             [{text: 'Заполнить форму', web_app: {url: webAppUrl + 'form'}}]
        //         ]
        //     }
        // })

        await bot.sendMessage(chatId, 'Welcome to Urban Pulse! We\'re excited to have you here. Click on \'Catalog\' to check out our newest arrivals and exclusive offers."\n' +
            '\n' +
            'Feel free to adjust the wording to best match your brand\'s tone and personality.', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Catalog', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            console.log(data)
            await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
            await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
            await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате ');
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
});

// app.post('/web-data', async (req, res) => {
//     console.log('[DEBUG] Получены данные:', req.body);
//
//     const { queryId, products = [], totalPrice } = req.body;
//
//     if (!queryId) {
//         console.error('[ERROR] queryId отсутствует!');
//         return res.status(400).json({ error: 'queryId отсутствует' });
//     }
//
//     try {
//         console.log(`[DEBUG] Отправляем ответ пользователю... queryId=${queryId}`);
//
//         const response = await bot.answerWebAppQuery(queryId, {
//             type: 'article',
//             id: queryId,
//             title: 'Успешная покупка',
//             input_message_content: {
//                 message_text: `Поздравляю с покупкой! Вы приобрели: ${products.map(item => item.title).join(', ')} на сумму ${totalPrice}₽`
//             }
//         });
//
//         console.log('[DEBUG] Ответ от Telegram:', response);
//         return res.status(200).json({ status: 'ok' });
//
//     } catch (error) {
//         console.error('[ERROR] Ошибка в bot.answerWebAppQuery:', error);
//         return res.status(500).json({ error: 'Ошибка сервера' });
//     }
// });

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.post('/send-message', async (req, res) => {
    const { chatId, text } = req.body;

    if (!chatId || !text) {
        return res.status(400).json({ error: 'chatId или text отсутствует' });
    }

    try {
        await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
        return res.status(200).json({ status: "ok" });
    } catch (error) {
        console.error("Ошибка при отправке сообщения:", error);
        return res.status(500).json({ error: "Ошибка сервера!" });
    }
});

const PORT = 8020;
https.createServer(options, app).listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER] HTTPS сервер запущен на порту ${PORT}`);
});

