const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
// const mongoConnect=require('./util/database').mongoConnect
const mongoose=require('mongoose')
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
    User.findById('6820faac10c94eb1c1207f3d')  //app.use only registers a middleware, so for incoming requests we will execute this function
        .then(user => {
            req.user = user //storing the user in a request
            next();
        }).catch(err=>console.log(err))
    // next()
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

// app.use(errorController.get404);
// mongoConnect(() => {      
//         app.listen(3000)
// })
mongoose.connect('mongodb+srv://chandrika30:chandrika30@cluster0.f0j665r.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0')
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({ //adding a user when i start my server
                    name: 'Max',
                    email: 'max@test.com',
                    cart: {
                        items: []
                    }
            
                })
                user.save();
            }
        });
        console.log("connected to mongodb");
        app.listen(3000)
    })
    .catch(err=>console.log(err))