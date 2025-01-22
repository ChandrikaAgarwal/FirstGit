const express = require('express');
const sequelize=require('./util/database')
const expenseModel=require('./models/expense')
const expenseRoute=require('./routes/expenseRoute')
const bodyParser=require('body-parser')
const cors=require('cors')
const path=require('path')
const app=express();


app.use(cors())
app.use(bodyParser.json())
app.use(express.static('public'))
app.get('/expenses', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'expense.html'));
});
app.use('/api/expenses',expenseRoute)
sequelize.sync()
.then(()=>{
    app.listen(5000,()=>{
        console.log("Server running on  http://localhost:5000");
        
    })
}).catch(err=>console.log(err))

