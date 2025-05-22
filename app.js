require ('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const app = express()
const path=require('path')
app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signUp.html'));
})
mongoose.connect(process.env.CONNECT)
    .then(result => {
    console.log("connected to mongoDb");
    app.listen(process.env.PORT)
}).catch(err=>console.log("error connecting to mongoDb ",err))