require('dotenv').config();
const express = require('express');
const fs = require('fs')
const sequelize = require('./util/database')
const Expense = require('./models/expense')
const User = require('./models/user')
const Income = require('./models/income')
const Order = require('./models/orders')
const ForgotPassRequest = require('./models/forgotPasswordReq')
const Month = require('./models/monthly')
const FileUrl = require('./models/fileUrl')
const expenseRoute = require('./routes/expenseRoute')
const userRoute = require('./routes/userRouter')
const incomeRoute = require('./routes/incomeRoute')
const monthlyRoute = require('./routes/monthlyRoute')
const payRoute = require('./routes/paymentRoute')
const boardRoute = require('./routes/leaderBoardRoute')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const morgan = require('morgan')
const app = express();

const accessLogsStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' } //means append to append new data to file and not overwrite it
);
app.use(cors())
app.use(morgan('combined', { stream: accessLogsStream }))
app.use(bodyParser.json())
app.use(express.static('public'))  //iske baare mein bhi padh lena

app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/expenses', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'expense.html'));
});

app.get('/monthly', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'monthly.html'));
});

app.get('/weekly', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'weekly.html'));
});

app.get('/create-payment', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'createPayment.html'));
})

app.get('/premium', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'leaderBoard.html'));
})

app.get('/report', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'report.html'));
})

app.get('/password/resetpassword/form/:requestId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'resetPassword.html'));
})

app.use('/', userRoute)
app.use('/api/expenses', expenseRoute)
app.use('/api/income', incomeRoute)
app.use('/api/monthly', monthlyRoute)
app.use('/api/payment', payRoute)
app.use('/api/leader', boardRoute)


User.hasMany(Expense, { constraints: true, onDelete: 'CASCADE' })
Expense.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Income, { constraints: true, onDelete: 'CASCADE' })
Income.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
Order.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Order, { constraints: true, onDelete: 'CASCADE' })
ForgotPassRequest.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(ForgotPassRequest, { constraints: true, onDelete: 'CASCADE' })
Month.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(Month, { constraints: true, onDelete: 'CASCADE' })
FileUrl.belongsTo(User, { constraints: true, onDelete: 'CASCADE' })
User.hasMany(FileUrl, { constraints: true, onDelete: 'CASCADE' })


// sequelize.sync({force:true})
sequelize.sync()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log("Server running on  http://13.200.253.246:5000");

        })
    }).catch(err => console.log(err))

