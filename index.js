const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');


// Replace the value below with the Telegram token you receive from @BotFather
const token = '7527771820:AAHXWX0j9-kEw_QDnY45CaU1GukTgi81lFQ';
const webAppUrl = 'https://elenasoshina.github.io/telegram-web-app-react/';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const app = express();



app.use(express.json()); // Middleware for parsing JSON
const corsOptions = {
    origin: '*', // Replace '*' with specific origins for better security
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));
// Route to handle web data (Moved outside the bot handler)
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        // await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
        //     reply_markup: {
        //         keyboard: [
        //             [{text: 'Заполнить форму', web_app: {url: webAppUrl}}]
        //         ]
        //     }
        // })

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

app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    
    if (!queryId) {
        return res.status(400).json({ error: 'Missing query ID' });
    }
    
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        console.log('Query processed successfully!');
        return res.status(200).json({})
    } catch (error) {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Не удалось приобрести товар',
            input_message_content: {
                message_text: 'Произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз.'
            }
        })
        return res.status(500).json({})
    }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))
