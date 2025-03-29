require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const sequelize = require('./util/database')
const path=require('path')
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('public'))
// sequelize.sync({force:true})
sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
        console.log("server running on", process.env.API_URL);
        
    })
    }).catch(err=>console.log(err))
   