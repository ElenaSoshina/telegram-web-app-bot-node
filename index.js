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
app.use(cors({ origin: webAppUrl })); // Middleware for handling CORS

// Route to handle web data (Moved outside the bot handler)
app.post('/web-data', async (req, res) => {
  const { queryId, products = [], totalPrice } = req.body;

  try {
    await bot.answerWebAppQuery(queryId, {
      type: 'article',
      id: queryId,
      title: 'Успешная покупка',
      input_message_content: {
        message_text: 'Поздравляю с покупкой, Вы приобрели товар на сумму ' + totalPrice,
      },
    });
    return res.status(200).json({});
  } catch (e) {
    console.error('Error processing /web-data:', e);
    return res.status(500).json({});
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
app.listen(PORT, () => console.log('Server started on PORT ' + PORT));
