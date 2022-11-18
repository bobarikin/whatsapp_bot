import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config.js'

function auth(req, res, next) {
  if (req.method === 'OPTIONS') {
    return next()
  }

  try {
    const token = req.headers.authorization.split(' ')[1]

    if (!token) {
      return res
        .status(401)
        .json({
          message: 'Нет авторизации',
        })
    }

    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (e) {
    res.status(401).json({ message: 'Нет авторизации' })
  }
}

export default auth
