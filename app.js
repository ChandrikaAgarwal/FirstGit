require ('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const path = require('path')
const http = require('http')
const WebSocket=require('ws')
const bodyParser=require('body-parser')
app.use(express.static('public'))
app.use(bodyParser.json())
const userRoute = require('./routes/userRoute')
const bookRoute=require('./routes/bookRoute')
const sellerRoute=require('./routes/sellerRoute')
const jwt=require('jsonwebtoken')
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })
app.set("wss", wss)
wss.on('connection', (ws) => {
    console.log("New Websocket connection established");
    ws.isAlive = true;
    ws.on('pong', () => {
        ws.isAlive=true
    })
    ws.on('message', (message) => {
        console.log(`message recieved: ${message}`);
        const data = JSON.parse(message)
        if(data.type==='ping'){}
        if (data.type === 'auth') {
            const decoded = jwt.verify(data.token, process.env.JWT_SECRET)
            ws.userId = decoded.id
            console.log("AuthenticatedUser: ", ws.userId)
            ws.send(JSON.stringify({ event: 'auth-success' }))
        }
        const interval = setInterval(() => {
            wss.clients.forEach((ws) => {
                if (ws.isAlive === false) return ws.terminate();

                ws.isAlive = false;
                ws.ping(); // this triggers pong from client
            });
        }, 30000); 
        
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message)
            }
        })
    });
    ws.on('close', () => {
        console.log("Websocket connection closed");
        
    })
    
})
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signUp.html'));
})
app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
})
app.get('/books', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'book-listing.html'));
})
app.get('/sellBook', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'sellBook.html'));
})
app.get('/books/:bookId', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'bookDetailPage.html'));
})
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'chat.html'));
})
app.get('/chat/:bookId', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'buyerSellerchat.html'));
})
app.get('/our-sellers', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'sellerList.html'));
})
app.use('/',sellerRoute)
app.use('/', userRoute)
app.use('/',bookRoute)
mongoose.connect(process.env.CONNECT)
    .then(result => {
    console.log("connected to mongoDb");
    server.listen(process.env.PORT)
    }).catch(err => console.log("error connecting to mongoDb ", err))

