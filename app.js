const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoConnect = require('./util/database').mongoConnect
const app = express()
// const errorController=require('./controllers/error')
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
// const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    // User.findByPk(1)  //app.use only registers a middleware, so for incoming requests we will execute this function
    //     .then(user => {
    //         req.user = user //storing the user in a request
    //         next();
    //     })
    next()
})

app.use('/admin', adminRoutes);
// app.use(shopRoutes);

// app.use(errorController.get404);




mongoConnect(() => {
    app.listen(3000)

})