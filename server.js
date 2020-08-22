const express = require('express')
const { ppid } = require('process')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

var numClients = 0;

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room })
})

io.on('connection', socket => {
  numClients++;
  io.emit('stats', { numClients: numClients })
  console.log('Connected clients:', numClients)

  socket.on('loadData', loadDataMsg)
  function loadDataMsg(data) {
    socket.broadcast.emit('loadData', data)

    console.log(data)
  }
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).broadcast.emit('user-connected', userId)


    
    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId)
      numClients--;
      io.emit('stats', { numClients: numClients })
      console.log('Connected clients:', numClients)
    })
  })
})

server.listen(3000)