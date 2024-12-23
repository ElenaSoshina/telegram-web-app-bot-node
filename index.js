const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');


// Replace the value below with the Telegram token you receive from @BotFather
const token = '7527771820:AAHXWX0j9-kEw_QDnY45CaU1GukTgi81lFQ';
const webAppUrl = 'https://spiffy-macaron-2c257e.netlify.app';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json()); // Middleware for parsing JSON
const allowedOrigins = ['https://spiffy-macaron-2c257e.netlify.app'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // If credentials are needed
}));

// Route to handle web data (Moved outside the bot handler)
app.post('/web-data', async (req, res) => {
  console.log('Incoming /web-data request:', JSON.stringify(req.body, null, 2));

  const { queryId, products = [], totalPrice } = req.body;

  try {
    console.log('Attempting to answer web app query...');
    const response = await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успешная покупка',
      input_message_content: {
        message_text: `Поздравляю с покупкой! Вы приобрели товар на сумму ${totalPrice} ₽`,
      },
    });

    console.log('Telegram API response:', response);
    return res.status(200).json({ message: 'Success', totalPrice });
  } catch (error) {
    console.error('Error in bot.answerWebAppQuery:', error.message || error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Listen for any kind of message
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
      reply_markup: {
        keyboard: [
          [
            {
              text: 'Заполнить форму',
              web_app: { url: webAppUrl + '/form' },
            },
          ],
        ],
      },
    });

    await bot.sendMessage(chatId, 'Зайти в интернет-магазин по кнопке ниже', {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Сделать заказ',
              web_app: { url: webAppUrl },
            },
          ],
        ],
      },
    });
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg.web_app_data.data);
      console.log(data);

      await bot.sendMessage(chatId, 'Спасибо за обратную связь!');
      await bot.sendMessage(chatId, 'Ваша страна: ' + data.country);
      await bot.sendMessage(chatId, 'Ваша улица: ' + data.street);

      await bot.sendMessage(chatId, 'Всю информацию Вы получите в этом чате');
    } catch (e) {
      console.error('Error processing web_app_data:', e);
    }
  }
});

// Start the Express server
const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => console.log('Server started on PORT ' + PORT));
