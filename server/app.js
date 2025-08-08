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
const pollRoute = require('./Routes/pollRoute')
const commentRoute = require('./Routes/commentRoute')
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
    },
});
app.set('io',io)
app.get('/',(req, res)=> {
    res.send("Api is running")
})
const onlineUsers=new Map()
io.on('connection', (socket) => {
    console.log("new client connected ", socket.id);
    
    socket.on('join-poll', (pollId) => {
        socket.join(pollId)
    })

    socket.on("register", (userId) => {
        onlineUsers.set(userId, socket.id);
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
// app.use((req, res, next) => {
//     req.io = io;
//     next();
// });

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoute)
app.use('/api', pollRoute)
app.use('/api/comment', commentRoute);

mongoose.connect(process.env.CONNECT)
    .then(result => {
        console.log("connected to mongoDb");
        server.listen(process.env.PORT)||5000
    }).catch(err => console.log("error connecting to mongoDb ", err))