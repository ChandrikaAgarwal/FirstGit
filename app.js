require('dotenv').config()
const { Socket } = require('socket.io')
const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const http = require('http')
const cors=require('cors')
const app = express()
app.use(express.static('public'))
const server = http.createServer(app)
const authRoute = require('./Routes/authRoute')

const io = require('socket.io')(server, {
    cors: {
        origin: "*",
    },
});

app.get('/',(req, res)=> {
    res.send("Api is running")
})

io.on('connection', (socket) => {
    console.log("new client connected ", socket.id);
    
    socket.on('join-poll', (pollId) => {
        socket.join(pollId)
    })

    socket.on("vote", (data) => {
        io.to(data.pollId).emit('new-vote', data);
    })
    
    socket.on('comment', (data) => {
        io.to(data.pollId).emit('new-comment', data);
    })
    
    socket.on('disconnect', () => {
        console.log("client disconnected",socket.id);
        
    })
})
app.use(cors())
app.use(express.json())
app.use('/api/auth',authRoute)
mongoose.connect(process.env.CONNECT)
    .then(result => {
        console.log("connected to mongoDb");
        server.listen(process.env.PORT)||5000
    }).catch(err => console.log("error connecting to mongoDb ", err))