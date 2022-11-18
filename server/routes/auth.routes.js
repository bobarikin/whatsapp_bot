import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js'
import auth from '../middleware/auth.middleware.js'
import bcrypt from 'bcrypt'

const authRouter = express.Router()

// /api/message
// authRouter.post('/message', auth, async (req, res) => {
//   try {
//     const { message } = req.body
//   let chatId = await getChatId('whatsapp-bot')
//   client.sendMessage(chatId, message)
//   res.status(201).json({
//     message: 'success',
//   })
//   } catch (error) {
//     res.status(500).json({
//       message: 'Что-то пошло не так, попробуйте снова',
//       type: 'error',
//     })
//   }
// })

// /api/auth/signin
authRouter.post('/auth/signin', async (req, res) => {
  try {
    const { userName, userPhone, userPassword } = req.body

    const candidate = await User.findOne({ userPhone })

    // регистрируем нового пользователя
    if (!candidate) {
      const hashedPassword = await bcrypt.hash(userPassword, 12)

      const user = new User({
        userName,
        userPhone,
        userPassword: hashedPassword,
      })

      await user.save()

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: '3h',
      })

      return res.status(201).json({
        token,
        userId: user.id,
        message: 'Добро пожаловать',
      })
    }

    // авторизовываем существующего
    const isMatch = await bcrypt.compare(userPassword, candidate.userPassword)

    if (!isMatch) {
      return res.status(400).json({
        message: 'Неверный пароль',
      })
    }

    const token = jwt.sign({ userId: candidate.id }, JWT_SECRET, {
      expiresIn: '3h',
    })

    res.status(201).json({
      token,
      userId: candidate.id,
      message: 'Добро пожаловать',
    })
  } catch (error) {
    res.status(500).json({
      message: 'Что-то пошло не так, попробуйте снова',
      type: 'error',
    })
  }
})

export default authRouter
