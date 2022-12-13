// import Message from '../../models/message.model.js'
// import { removeFile } from '../../utils/file.js'
// import onError from '../../utils/onError.js'

// хранилище для сообщений
const messages = []

export default function messageHandlers(io, socket) {
  // извлекаем идентификатор комнаты
  const { roomId } = socket
  // console.log("messageHandlers", roomId);

  // утилита для обновления списка сообщений
  const updateMessageList = () => {
    io.to(roomId).emit('message_list:update', messages[roomId])
  }

  // обрабатываем получение сообщений
  // socket.on("message:get", async () => {
  //   try {
  //     // получаем сообщения по id комнаты
  //     console.log("message-get-roomId", roomId);
  //     const _messages = await Message.find({
  //       roomId,
  //     });
  //     // инициализируем хранилище сообщений
  //     messages[roomId] = _messages;
  //     console.log("messages-get", _messages);
  //     // обновляем список сообщений
  //     updateMessageList();
  //   } catch (e) {
  //     onError(e);
  //   }
  // });
  // обрабатываем создание нового сообщения
  socket.on('message:add', (message) => {
    // console.log(message);
    io.to(roomId).emit('message_list:update', message.subjectArr)
  })

  // подключение студентов к игре
  socket.on('message:connect', (text) => {
    // console.log("text", text);
    io.to(roomId).emit('text:student', text)
  })

  // список выбранных учеников для игры
  socket.on('message:selectStudents', (arr) => {
    io.to(roomId).emit('update:student', arr)
  })

  // размеры рамки и предметов
  socket.on('message:size', (mSize) => {
    // console.log("mSize", mSize);
    io.to(roomId).emit('update:size', mSize)
  })

  // размеры рамки
  socket.on('message:sizeBorder', (mBorder) => {
    io.to(roomId).emit('update:sizeBorder', mBorder)
  })

  // выбранные предметы (которые можно перемещать)
  socket.on('message:select', (message) => {
    // messages.push(message);
    // console.log(messages);
    io.to(roomId).emit('message_list:update', message)
  })

  // обрабатываем удаление сообщения
  socket.on('message:remove', (message) => {
    const { messageId, messageType, textOrPathToFile } = message

    Message.deleteOne({ messageId })
      .then(() => {
        if (messageType !== 'text') {
          removeFile(textOrPathToFile)
        }
      })
      .catch(onError)

    // удаляем сообщение
    messages[roomId] = messages[roomId].filter((m) => m.messageId !== messageId)

    // обновляем список сообщений
    updateMessageList()
  })
}
