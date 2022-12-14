import express from 'express'
import cors from 'cors'
import qrcode from 'qrcode-terminal'
import pkg from 'whatsapp-web.js'
import mongoose from 'mongoose'
import { MONGODB_URI } from './config.js'
import authRouter from './routes/auth.routes.js'
import auth from './middleware/auth.middleware.js'
import User from './models/User.js'
import { Server } from 'socket.io'
import { createServer } from 'http'
import onConnection from './socket_io/onConnection.js'

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
  return chat?.id?._serialized ?? 0
}

// генерауия qr кода
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true })
})

// событие коннекта
client.on('ready', () => {
  console.log('🚀 Client is ready!')
})

client.on('message', async (msg) => {
  // обработка события нажатия кнопки ответа
  if (msg.type === 'buttons_response') {
    // номер телефона клиента
    const widgetUser = {
      phone: msg._data?.quotedMsg?.footer,
      name: msg._data?.quotedMsg?.title,
    }
    const broker = msg._data?.id?.participant
    // чек зареган ли юзер в ватсап
    let isRegistredUser = await client.getNumberId(widgetUser.phone)

    if (isRegistredUser) {
      const groupParticipants = new Array(
        msg.to,
        broker,
        isRegistredUser._serialized
      )
      // нужно чекнуть есть ли с ним чат
      let chat = await getChatId(widgetUser.phone) // кастомная ф-я ретёрник ид чата по номеру
      // если чата нет, создаём новый
      if (!chat) {
        chat = await client.createGroup(widgetUser.phone, groupParticipants)
        // проверить отправку уведомления для нового чата
      }

      client.sendMessage(
        msg.from,
        `${msg._data?.notifyName} взял в работу ${widgetUser.name}`
      )
    } else {
      console.log('User have not whatsapp :(')
    }
  }
})

try {
  client.initialize()
  console.log('🚀 Initialized')
} catch (e) {
  console.log(e)
}

// апи обработки сообщений
// вынести в роутинг
app.post('/message', auth, async (req, res) => {
  try {
    const { message } = req.body
    const user = await User.findOne({ _id: req.user.userId })

    // если час с клиентом есть сообщения отправляем туда
    const chatIdWithClient = await getChatId(user.userPhone)

    if (chatIdWithClient) {
      client.sendMessage(chatIdWithClient, message)
      return res.status(201).json({
        message: 'success',
      })
    } else {
      let chatId = await getChatId('Widget')

      const btn = new Buttons(
        message,
        [
          {
            body: 'Ответить',
          },
        ],
        user.userName,
        user.userPhone
      )

      // отправка сообщения в чат
      client.sendMessage(chatId, btn)

      return res.status(201).json({
        message: 'success',
      })
    }
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

const server = createServer(app)

const io = new Server(server, {
  cors: '*',
  serveClient: false,
})

io.on('connection', (socket) => {
  console.log('user connected')

  client.on('message', async (msg) => {
    if (msg.type === 'chat') {
      socket.emit('message', msg.body)
    }
  })
})

server.listen(5000, () => {
  console.log(`🚀 Server has been started...`)
})
 