const TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const cors = require('cors')

// replace the value below with the Telegram token you receive from @BotFather
const token  = '7527771820:AAHXWX0j9-kEw_QDnY45CaU1GukTgi81lFQ'
const webAppUrl = 'https://spiffy-macaron-2c257e.netlify.app'

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
const app = express()
app.use(express.json()) // middleware для парсинга json
app.use(cors({ origin: webAppUrl })); // middleware для кросдоменных имен


// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text

  // send a message to the chat acknowledging receipt of their message
  if (text === '/start') {
    await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
      reply_markup: {
        keyboard: [
          [{ text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'
          }}]
        ]
        
      }
    });
    
    await bot.sendMessage(chatId, 'Зайти в интернет-магазин по кнопке ниже', {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Сделать заказ', web_app: {url: webAppUrl
          }}]
        ]

      }
    });
  }
  
  if (msg?.web_app_data?.data) {
    
    try{
      
      const data = JSON.parse(msg?.web_app_data?.data)
      console.log(data)
      
      await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
      await bot.sendMessage(chatId, 'Ваша страна:' + data?.country)
      await bot.sendMessage(chatId, 'Ваша улица:' + data?.street)
      
      setTimeout(async () => {
        await bot.sendMessage(chatId, 'Всю информациию Вы получите в этом чате')
      })

    } catch (e) {
      console.log(e)
    }
    
  }
  
  app.post('/web-data', async (req, res) => {
    const {queryId, products=[], totalPrice} = req.body
    
    try {
      await bot.answerWebAppQuery(queryId, {
        type: 'article',
        id: queryId,
        title: 'Успешная покупка',
        input_message_content: {
          message_text: 'Поздравляю с покупкой, Вы приобрели товар на сумму ' + totalPrice
        }
      })
      return res.status(200).json({})
    } catch (e) {
      // await bot.answerWebAppQuery(queryId, {
      //   type: 'article',
      //   id: queryId,
      //   title: 'Не удалось приобрести товар',
      //   input_message_content: {
      //     message_text: 'Не удалось приобрести товар'
      //   }
      // })
      return res.status(500).json({})
    }
    
    
  })
  
});

const PORT = 8080
app.listen(PORT, () => console.log('server started on PORT ' + PORT))


