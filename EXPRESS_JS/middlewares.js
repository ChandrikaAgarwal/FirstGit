const adminRoutes=require('./Routes/admin.js')
const path=require('path')
const shopRouter = require('./Routes/shop.js')
const contactRouter=require('./Routes/contact.js')
const formSubmitRoute=require('./Routes/form_submit.js')
const express=require('express')
const bodyParser=require('body-parser') //this is importing the router object
const app=express()

app.use(bodyParser.urlencoded({extended:false})) //registers a middleware
app.use(express.static(path.join(__dirname,'public')));
//outsourced routes
app.use("/admin",adminRoutes);
app.use(shopRouter)
app.use(contactRouter)
app.use(formSubmitRoute)
app.use((req,res,next)=>{

res.status(404).sendFile(path.join(__dirname,'Views','404.html'))
});


app.listen(5000)