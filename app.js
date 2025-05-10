const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoConnect=require('./util/database').mongoConnect
const app=express()
// const errorController=require('./controllers/error')
const User=require('./models/user')
app.set('view engine', 'ejs');
app.set('views','views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById('681eb092fa56f8401f50d3a2')  //app.use only registers a middleware, so for incoming requests we will execute this function
        .then(user => {
            req.user = new User(user.name,user.email,user.cart,user._id) //storing the user in a request
            next();
        }).catch(err=>console.log(err))
    // next()
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// app.use(errorController.get404);
mongoConnect(() => {      
        app.listen(3000)
})