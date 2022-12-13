// хранилище пользователей
const users = {}

export default function userHandlers(io, socket) {
  // извлекаем идентификатор комнаты и  имя пользователя из объекта сокета
  const { roomId, userName } = socket

  // инициализируем хранилище пользователей
  if (!users[roomId]) {
    users[roomId] = []
  }

  // утилита для обновления списка пользователей
  const updateUserList = () => {
    // сообщения получают только пользователи, находящиеся в комнате
    io.to(roomId).emit('user_list:update', users[roomId])
  }

  // обрабатываем подключение нового пользователя
  socket.on('user:add', async (user) => {
    // сообщаем другим пользователям об этом
    console.log('qqq', user)
    socket.to(roomId).emit('log', `User ${userName} connected`)
    // записываем идентификатор сокета пользователя
    user.socketId = socket.id
    // записываем пользователя в хранилище
    users[roomId].push(user)

    // обновляем список пользователей
    updateUserList()
    console.log('users with rooms', users)
  })

  // обрабатываем отключение пользователя
  socket.on('disconnect', () => {
    if (!users[roomId]) return

    // сообщаем об этом другим пользователям
    socket.to(roomId).emit('log', `User ${userName} disconnected`)

    // удаляем пользователя из хранилища
    users[roomId] = users[roomId].filter((u) => u.socketId !== socket.id)

    // обновляем список пользователей
    updateUserList()
  })
}
