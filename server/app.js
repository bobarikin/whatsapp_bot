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
const { Client, LocalAuth, Buttons } = pkg

app.use(cors())

app.use(express.json())

const client = new Client({
  authStrategy: new LocalAuth(),
})

app.use('/api', authRouter)

// эту функцию нужно вынести в файл бота
const getChatId = async (chatName) => {
  let chats = await client.getChats()
  let chat = chats.find((chat) => chat.name === chatName)
  return chat.id._serialized
}

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
  console.log('🚀 Client is ready!')
})

client.initialize()

// это нужно будет вынести в роутинг
// app.post('/widget', async (req, res) => {
//   const { message } = req.body
//   let chatId = await getChatId('whatsapp-bot')
//   client.sendMessage(chatId, message)
//   res.status(201).json({
//     message: 'success',
//   })
// })

app.post('/message', auth, async (req, res) => {
  try {
    const { message } = req.body

    const user = await User.findOne({ _id: req.user.userId})

    const btn = new Buttons('body')

    let chatId = await getChatId('whatsapp-bot')
    client.sendMessage(chatId, `${user.userName} ${user.userPhone}`)
    // client.sendMessage(chatId, btn)
    client.sendMessage(chatId, message)
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
