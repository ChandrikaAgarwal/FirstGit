require('dotenv').config();
const express = require('express');
const sequelize=require('./util/database')
const Expense=require('./models/expense')
const User=require('./models/user')
const expenseRoute=require('./routes/expenseRoute')
const userRoute=require('./routes/userRouter')
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

// app.use((req,res,next)=>{
//     User.findOne({where:{email}})
//     .then(user=>{
//         req.user=user;
//         next();
//     })
// })
app.use(userRoute)
app.use('/api/expenses',expenseRoute)

User.hasMany(Expense,{constraints:true, onDelete:'CASCADE'})
Expense.belongsTo(User,{constraints:true, onDelete:'CASCADE'})
sequelize.sync()
.then(()=>{
    app.listen(5000,()=>{
        console.log("Server running on  http://localhost:5000");
        
    })
}).catch(err=>console.log(err))

