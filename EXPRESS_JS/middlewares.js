const adminRoutes=require('./Routes/admin.js')
const shopRoutes=require('./Routes/shop.js')
const express=require('express')
const bodyParser=require('body-parser') //this is importing the router object
const shopRouter = require('./Routes/shop.js')
const app=express()

app.use(bodyParser.urlencoded({extended:false})) //registers a middleware
//outsourced routes
app.use("/admin",adminRoutes);
app.use(shopRouter)
app.use((req,res,next)=>{

res.status(404).send('<h1>Page not found</h1>')
});


app.listen(5000)