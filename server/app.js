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
const { Client, LocalAuth, Buttons, Chat, InterfaceController, GroupChat } = pkg

app.use(cors())

app.use(express.json())

// клиент для подключения сессии
const client = new Client({
  authStrategy: new LocalAuth(),
})

// const controller = new InterfaceController()

app.use('/api', authRouter)

// получает id чата по названию
// эту функцию нужно вынести в файл бота
const getChatId = async (chatName) => {
  // получение всех чатов
  let chats = await client.getChats()
  // console.log('###ALL CHATS', chats)
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

// обработка события нажатия кнопки ответа
client.on('message', async (msg) => {
  // обработка события нажатия кнопки ответа
  if (msg.type == 'buttons_response') {
    // номер телефона клиента
    // всё это дело можно хранить в объеке
    let phone = msg._data?.quotedMsg?.footer
    let contact = msg._data?.quotedMsg?.title
    // console.log(contact)
    // console.log('###phone', phone)
    // чек зареган ли юзер в ватсап
    let isRegistredUser = await client.getNumberId(phone)
    // let tmp = await client.isRegisteredUser(phone)
    // console.log(tmp)
    if (isRegistredUser) {
      console.log('User registred')
      // console.log(isRegistredUser)
      // нужно чекнуть есть ли с ним чат
      let chat = await getChatId(contact)
      // console.log(chat)
      // если чата нет, создаём новый
      if (!chat) {
        let newChat = await client.createGroup(phone, ['79203293513@c.us'])

        // let users = await client.getContacts()
        // console.log(users)

        // await newChat.addParticipants(['79203293513@c.us'])
        console.log(newChat)
      }
      // await InterfaceController.openChatWindow(chat)
    } else {
      console.log('User have not whatsapp :(')
    }
  }
})

// инициализация клиента
client.initialize()

// апи обработки сообщений
// вынести в роутинг
app.post('/message', auth, async (req, res) => {
  try {
    const { message } = req.body

    const user = await User.findOne({ _id: req.user.userId })

    let chatId = await getChatId('Widget')
    const btn = new Buttons(
      message,
      [{ body: 'Ответить' }],
      user.userName,
      user.userPhone
    )
    // отправка сообщения в чат
    client.sendMessage(chatId, btn)
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
