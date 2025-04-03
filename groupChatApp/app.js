require('dotenv').config()
const express = require('express')
const http=require('http')
const WebSocket=require('ws')
const cors = require('cors')
const bodyParser = require('body-parser')
const sequelize = require('./util/database')
const User = require('./models/users')
const Message=require('./models/messages')
const userRoute = require('./routes/userRouter')
const messageRoute=require('./routes/messageRoute')
const path=require('path')
const app = express()
const server=http.createServer(app)
const wss = new WebSocket.Server({ server })
app.set('wss', wss) //WebSocket instance ko Express app me store kiya
wss.on('connection', (ws) => {
    console.log("New WebSocket connection established");
    ws.on('message', (message) => {
        console.log(`message received:${message}`);
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message)
            }
        });
    });
    ws.on('close', () => {
        console.log("WebSocket connection closed");
    })
    
})
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('public'))
app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', "chat.html"));
})
app.use('/', userRoute)
app.use('/api/messages', messageRoute)

//associations
Message.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Message,{constraints:true,onDelete:'CASCADE'})
// sequelize.sync({force:true})
sequelize.sync()
    .then(() => {
        server.listen(process.env.PORT || 3000, () => {
        console.log("server running on", process.env.API_URL);
        
    })
    }).catch(err=>console.log(err))
   