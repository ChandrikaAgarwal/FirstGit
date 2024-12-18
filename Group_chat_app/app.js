const bodyParser = require('body-parser')
const loginRouter=require('./Routes/login.js')
const msgRoute=require('./Routes/message.js')
const express=require('express')
const app=express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(loginRouter)
app.use(msgRoute)



app.listen(3000)
