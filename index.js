const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');


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
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + 'form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
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
                await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
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

app.post('/web-data', async (req, res) => {
    const { queryId, products, promoCode } = req.body;

    if (!queryId) {
        return res.status(400).json({ error: 'queryId отсутствует' });
    }

    // Пересчитываем сумму на сервере
    let totalAmount = products.reduce((acc, item) => acc + item.price * item.quantity, 0);
    if (promoCode === "discount10") totalAmount *= 0.9;
    if (promoCode === "discount15") totalAmount *= 0.85;

    // Добавляем стоимость доставки
    const shippingCost = 500; // Доставка 5.00$ в копейках (500 копеек)
    totalAmount = Math.round(totalAmount * 100) + shippingCost;

    try {
        // Отправляем счёт (invoice) в Telegram
        const invoice = {
            chat_id: queryId,
            title: "Оплата заказа",
            description: `Ваш заказ на сумму ${totalAmount / 100}₽ (включая доставку)`,
            payload: JSON.stringify(products),
            provider_token: "ВАШ_PROVIDER_TOKEN", // Токен платёжного провайдера
            currency: "RUB",
            prices: [{ label: "Сумма", amount: totalAmount }],
            need_email: true
        };

        await bot.sendInvoice(invoice.chat_id, invoice.title, invoice.description, invoice.payload, invoice.provider_token, invoice.currency, invoice.prices);

        return res.status(200).json({ status: "ok" });
    } catch (error) {
        console.error("Ошибка при создании оплаты:", error);
        return res.status(500).json({ error: "Ошибка сервера" });
    }
});





const PORT = 8020;
app.listen(PORT, '0.0.0.0', () => console.log(`[SERVER] Сервер запущен на порту ${PORT}`));

