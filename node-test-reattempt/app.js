const express = require('express');
const sequelize=require('./util/database')
const companyModel=require('./models/companyReview')
const companyRoute=require('./routes/companyRoute')
const cors=require('cors')
const bodyParser=require('body-parser')
const app=express();

app.use(cors())
app.use(bodyParser.json())
app.use(express.static('public'))

app.use('/api/company',companyRoute)

sequelize.sync()
.then(()=>{
    app.listen(3000,()=>{
        console.log("Server running on  http://localhost:3000");
        
    })
}).catch(err=>console.log(err))