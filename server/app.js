import express from 'express'
import cors from 'cors'
import qrcode from 'qrcode-terminal'
import pkg from 'whatsapp-web.js'

const app = express()
const { Client, LocalAuth } = pkg

app.use(cors())

app.use(express.json())

const client = new Client({
  authStrategy: new LocalAuth(),
})

// эту функцию нужно вынести в файл бота
const getChatId = async (chatName) => {
  let chats = await client.getChats()
  let chat = chats.find(chat => chat.name === chatName)
  return chat.id._serialized
}

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
  console.log('Client is ready!')
})

client.initialize()

// это нужно будет вынести в роутинг
app.post('/widget', async (req, res) => {
  const { message } = req.body
  let chatId = await getChatId('whatsapp-bot')
  client.sendMessage(chatId, message)
  res.status(201).json({
    message: 'success',
  })
})

app.listen(5000, () => {
  console.log(`🚀 Server has been started...`)
})
