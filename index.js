const express = require('express')
const app = express()
const http = require('http')
const path = require('path')
const server = http.createServer(app)
const homeRouter = require('./routes/home')
const { Server } = require('socket.io')
const io = new Server(server)
const { v4 } = require('uuid')

const data = []

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.set('view engine', 'ejs')
app.use('/socket', express.static(path.join(__dirname, 'node_modules', 'socket.io', 'client-dist')))
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')))
app.use('/', express.static(path.join(__dirname, 'public')))
app.use('/peerjs', express.static(path.join(__dirname, 'node_modules', 'peerjs', 'dist')))

app.use(homeRouter.path, homeRouter.router)

io.on('connection', (socket) => {
    let user = data.find(e => e.socket_id === socket.id)
    if(!user){
        const id = v4()
        data.push({id, socket_id: socket.id})
        socket.emit('ulandi', id)
    }
    user = data.find(e => e.socket_id === socket.id)

    socket.on('peer', id => {
        const user = data.findIndex(e => e.socket_id === socket.id)
        data[user]['peer_id'] = id
    })

    socket.on('call', id => {
        if(id === user.id){
            socket.emit('error', 'Siz o\'zingizga qo\'ng\' iroq qila olmaysiz')
        } else if(!data.some(e => e.id === id)){
            socket.emit('error', 'Bunday user topilmadi')
        } else {
            let friendId = data.find(e => e.id === id)
            socket.to(friendId.socket_id).emit('call', user.peer_id)
        }
    })


    socket.on('disconnect', (event) => {
        let d = data.findIndex(user => user.socket_id === socket.id)
        if(d > -1){
            data.splice(d, 1)
        }
    })
})

server.listen(80, () => console.log('Server listen loccalhost'))