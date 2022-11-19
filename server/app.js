import express from 'express'
import cors from 'cors'
import qrcode from 'qrcode-terminal'
import pkg from 'whatsapp-web.js'
import mongoose from 'mongoose'
import { MONGODB_URI } from './config.js'
import authRouter from './routes/auth.routes.js'
import auth from './middleware/auth.middleware.js'
import User from './models/User.js'

const app = express()
// объекты из библиотеки
const { Client, LocalAuth, Buttons } = pkg

app.use(cors())

app.use(express.json())

// клиент для подключения сессии
const client = new Client({
  authStrategy: new LocalAuth(),
})

app.use('/api', authRouter)

// получает id чата по названию
// эту функцию нужно вынести в файл бота
const getChatId = async (chatName) => {
  // получение всех чатов
  let chats = await client.getChats()
  let chat = chats.find((chat) => chat.name === chatName)
  return chat.id._serialized
}

// генерауия qr кода
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true })
})

// событие коннекта
client.on('ready', () => {
  console.log('🚀 Client is ready!')
})

// инициализация клиента
client.initialize()

// апи обработки сообщений
// вынести в роутинг
app.post('/message', auth, async (req, res) => {
  try {
    const { message } = req.body

    const user = await User.findOne({ _id: req.user.userId})

    let chatId = await getChatId('Widget')
    const btn = new Buttons(message, [{body: 'Ответить'}], user.userName, user.userPhone)
    // отправка сообщения в чат
    // client.sendMessage(chatId, `${user.userName} ${user.userPhone}`)
    client.sendMessage(chatId, btn)
    // client.sendMessage(chatId, message)
    res.status(201).json({
      message: 'success',
    })
  } catch (error) {
    res.status(500).json({
      message: 'Что-то пошло не так, попробуйте снова',
      type: 'error',
    })
  }
})

// connect to DB
try {
  mongoose.connect(MONGODB_URI)
  console.log('🚀 Connected')
} catch (e) {
  console.log(e)
}

app.listen(5000, () => {
  console.log(`🚀 Server has been started...`)
})
