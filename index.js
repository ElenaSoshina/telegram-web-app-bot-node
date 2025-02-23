const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');


// Replace the value below with the Telegram token you receive from @BotFather
const token = '7527771820:AAHXWX0j9-kEw_QDnY45CaU1GukTgi81lFQ';
const webAppUrl = 'https://elenasoshina.github.io/telegram-web-app-react/';

// Create a bot that uses 'polling' to fetch new updates
console.log('[INFO] Запускаем Telegram бота...');
const bot = new TelegramBot(token, { polling: true });
console.log('[INFO] Бот запущен.');

const app = express();
app.use(express.json());

const corsOptions = {
    origin: 'https://elenasoshina.github.io',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url} - Тело запроса:`, req.body);
    next();
});

bot.on('message', async (msg) => {
    try {
        console.log('[BOT] Получено сообщение:', msg);
        const chatId = msg.chat.id;
        const text = msg.text;

        if (text === '/start') {
            console.log('[BOT] Отправка клавиатуры с формой...');
            await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
                reply_markup: {
                    keyboard: [
                        [{ text: 'Заполнить форму', web_app: { url: 'https://elenasoshina.github.io/telegram-web-app-react/#/form' } }]
                    ]
                }
            });

            console.log('[BOT] Отправка inline-кнопки для заказа...');
            await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Сделать заказ', web_app: { url: webAppUrl } }]
                    ]
                }
            });
        }

        if (msg?.web_app_data?.data) {
            console.log('[BOT] Получены данные от WebApp:', msg.web_app_data.data);
            try {
                const data = JSON.parse(msg.web_app_data.data);
                console.log('[BOT] Распарсенные данные:', data);

                await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
                await bot.sendMessage(chatId, `Ваша страна: ${data?.country}`);
                await bot.sendMessage(chatId, `Ваша улица: ${data?.street}`);

                setTimeout(async () => {
                    await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
                }, 3000);
            } catch (e) {
                console.error('[ERROR] Ошибка при обработке web_app_data:', e);
            }
        }
    } catch (error) {
        console.error('[ERROR] Ошибка в обработке сообщения:', error);
    }
});

app.use((req, res, next) => {
    const origin = req.headers.origin || 'unknown';
    const referer = req.headers.referer || 'no-referer';
    console.log(`[REQUEST LOG] Method=${req.method}, URL=${req.url}, Origin=${origin}, Referer=${referer}`);
    console.log(`[REQUEST HEADERS]`, req.headers);
    res.header("Access-Control-Allow-Origin", "*"); // Разрешаем любые источники
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Разрешаем методы
    res.header("Access-Control-Allow-Headers", "Content-Type"); // Разрешаем заголовки

    // Отвечаем на preflight-запросы
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.get('/web-data', (req, res) => {
    console.log('[SERVER] Проверка маршрута: /web-data доступен');
    res.status(200).json({ message: 'Маршрут работает!' });
});

console.log('[SERVER] Регистрируем маршрут POST /web-data')
app.post('/web-data', async (req, res) => {
    console.log('[SERVER] >>> Принят POST /web-data');
    console.log('[SERVER] Полный заголовок запроса:', req.headers);
    console.log('[SERVER] Полученные данные:', req.body);

    const { queryId, products = [], totalPrice } = req.body;

    if (!queryId) {
        console.error('[ERROR] >>> Отсутствует queryId в запросе!');
        return res.status(400).json({ error: 'Missing query ID' });
    }

    try {
        console.log(`[SERVER] >>> Обрабатываем WebApp Query (queryId: ${queryId})...`);

        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: `Поздравляю с покупкой! Вы приобрели товары на сумму ${totalPrice}: ${products.map(item => item.title).join(', ')}`
            }
        });

        console.log('[SERVER] >>> Запрос успешно обработан!');
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('[ERROR] >>> Ошибка при обработке запроса:', error);
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
});


const PORT = 8020;
app.listen(PORT, '0.0.0.0', () => console.log(`[SERVER] Сервер запущен на порту ${PORT}`));

