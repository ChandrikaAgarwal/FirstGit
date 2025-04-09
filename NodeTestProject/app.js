require('dotenv').config()
const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const sequelize = require('./util/database')
const User=require('./models/users')
const userRoute=require('./routes/userRouter')
const path = require('path')
const app = express()

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('public'))

app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname,'public','login.html'))
})

app.use('/',userRoute)
// sequelize.sync({force:true})
sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log("app is nrunning on ", process.env.API_URL);
    
        })
    }).catch(err => console.log(err))