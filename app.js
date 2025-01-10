const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize=require('./util/database')
const Product=require('./models/product') //we have to relate both the models where we have synced all the daTa to the db.
const User=require('./models/user')
const Cart=require('./models/cart')
const CartItem=require('./models/cart-item')

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req,res,next)=>{
    User.findByPk(1)  //app.use only registers a middleware, so for incoming requests we will execute this function
    .then(user=>{
        req.user=user //storing the user in a request
        next();
    })
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);
Product.belongsTo(User,{constraints:true, onDelete:'CASCADE'}) //this is for user who created /owns the product and not the purchase
//CASCADE means that if the user is deleted the product related to the user is also deleted.
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User); //this is optional 
Cart.belongsToMany(Product,{through:CartItem}); //many to many relation
Product.belongsToMany(Cart,{through:CartItem}); //many to many relation

//now sync will not only create models but also relations in our database as we define them here
sequelize
// .sync({force:true})
.sync()
.then(result=>{ 
    return User.findByPk(1)
    // console.log(result);
    
})
.then(user=>{
    if(!user){
    return User.create({name:'Max',email:'test@gmail.com'})
    }
    return user; //when we return a value in a then block it is automatically wrapped into a new peomise
})
.then(user=>{
    // console.log(user);
    return user.createCart();
    // app.listen(3000 )
})
.then(cart=>{
    app.listen(3000)
})
.catch(err=>{
    console.log(err);
    
})

