const express = require('express')
const http= require('http')
const path = require('path')
const socketio = require('socket.io')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')
const {generateMessage} = require('./utils/messages')
const app = express()
const server = http.createServer(app)
const port = process.env.PORT 
const io = socketio(server)

// let count = 0

// io.on('connection',(socket)=>{
//     socket.emit('countUpdate',count)
//     socket.on('incremet',()=>{
    
//         io.emit('countUpdate',++count)
//     })
// })


io.on('connection',(socket)=>{
    socket.on('join',({username,room},callback)=>{
        const {error,user} = addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }

        socket.join(room)
        socket.emit('message',generateMessage(`Welcome ${username}`,username))
        socket.broadcast.to(room).emit('message',generateMessage(`${username} has joined`))

        io.to(room).emit('roomData',{
            room,
            users : getUsersInRoom(room)
        })
        callback()
    })

    socket.on('messageSend',(message,callback)=>{
        const {username,room} = getUser(socket.id)

        io.to(room).emit('message',generateMessage(message,username))
        callback()
    })
    socket.on('sendlocation', ({latitude,longitude},callback) =>{
        const {username,room} = getUser(socket.id)

        io.to(room).emit('LocationSend',generateMessage(`https://www.google.com/maps?q=${latitude},${longitude}`,username))
        callback()
    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('a user has left the chat'))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users : getUsersInRoom(user.room)
            })
        }
    })
})


app.use(express.static(path.join(__dirname, '../public')))



server.listen(port,()=>console.log(`Server is running on port ${port}`))
