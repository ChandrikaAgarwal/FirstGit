require('dotenv').config();
const express = require('express');
const sequelize = require('./util/database')
const Expense = require('./models/expense')
const User = require('./models/user')
const Income = require('./models/income')
const Order = require('./models/orders')
const expenseRoute = require('./routes/expenseRoute')
const userRoute = require('./routes/userRouter')
const incomeRoute = require('./routes/incomeRoute')
const monthlyRoute = require('./routes/monthlyRoute')
const payRoute = require('./routes/paymentRoute')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const app = express();


app.use(cors())
app.use(bodyParser.json())
app.use(express.static('public'))

app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/expenses', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'expense.html'));
});

app.get('/monthly', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'monthly.html'));
});

app.get('/yearly', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'yearly.html'));
});

app.get('/create-payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'createPayment.html'));
})
app.use('/', userRoute)
app.use('/api/expenses', expenseRoute)
app.use('/api/income', incomeRoute)
app.use('/api/monthly', monthlyRoute)
app.use('/api/payment', payRoute)


User.hasMany(Expense, { constraints: true, onDelete: 'CASCADE' })
Expense.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Income, { constraints: true, onDelete: 'CASCADE' })
Income.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
Order.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Order, { constraints: true, onDelete: 'CASCADE' })

// sequelize.sync({force:true})
sequelize.sync()
    .then(() => {
        app.listen(5000, () => {
            console.log("Server running on  http://localhost:5000");

        })
    }).catch(err => console.log(err))

