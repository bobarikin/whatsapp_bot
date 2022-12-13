import userHandlers from './handlers/user.handlers.js'
import messageHandlers from './handlers/message.handlers.js'

export default function onConnection(io, socket) {
  //test
  console.log('user connected')

  // извлекаем идентификатор комнаты и имя пользователя
  const { roomId, userName } = socket.handshake.query
  console.log('roomId', roomId)

  // записываем их в объект сокета
  socket.roomId = roomId
  socket.userName = userName || 'userName'
  // console.log(socket);

  // присоединяемся к комнате
  socket.join(roomId)

  // регистрируем обработчики для пользователей
  userHandlers(io, socket)

  // рагистрируем обработчики для сообщений
  messageHandlers(io, socket)
}
