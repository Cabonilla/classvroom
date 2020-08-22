const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})

const myVideo = document.createElement('video')
var videoStreams = document.getElementById('video-grid').childElementCount

myVideo.muted = true
myVideo.setAttribute("id", "myVideoStream")
const peers = {}
function loginDiv() {
  const loginGrid = document.getElementById('login-grid')
  const myDiv = document.createElement('div')
  myDiv.setAttribute("class", "login-div")
  const n = (Math.random() * 0xfffff * 1000000).toString(16)
  // const name = prompt("name?")
  // myDiv.innerHTML = name
  loginGrid.append(myDiv)
  const randomColor = Math.floor(Math.random()*16777215).toString(16);
  myDiv.style.background = "#" + randomColor;
}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)
  $("#myVideoStream").draggable()
  $("#login-grid").draggable()
  // myPeer.on('call', call => {
  //   call.answer(stream)
  //   const video = document.createElement('video')
  //   call.on('stream', userVideoStream => {
  //     addVideoStream(video, userVideoStream)
  //   })
  // })

  myPeer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    video.setAttribute("class", "callVideo")
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
      $(".callVideo").draggable()
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream)    
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

socket.on('stats', function(data) {
  loginDiv()
  $(".login-div").text(data.numClients)
  console.log('Connected clients:', data.numClients)
})

socket.on('loadData', function(data) {
  canvas.loadFromJSON(data)
  console.log("laverne")
})

myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  video.setAttribute("class", "callVideo")
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
    $(".callVideo").draggable()
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}




$(window).mouseup(function() {
  var loadData = JSON.stringify(canvas)
  canvas.loadFromJSON(loadData)
  console.log(loadData)
  socket.emit('loadData', loadData)
})