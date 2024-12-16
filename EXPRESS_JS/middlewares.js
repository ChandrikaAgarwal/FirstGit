const express=require('express')
const bodyParser=require('body-parser')
const app=express()


app.use(bodyParser.urlencoded({extended:false})) //registers a middleware
app.use('/add-product',(req,res,next)=>{
    // console.log('In another middleware');
    res.send('<form action="/product" method="POST"><input type="text" name="title"></input><button type="submit">Add Product</button></form>')
})

app.get('/product',(req,res,next)=>{ //this middleware will execute not only for post but also for get request
    console.log(req.body)//new field added by express.
    res.redirect('/')
})
app.use('/',(req,res,next)=>{
    // console.log('In another middleware');
    res.send('<h1>Hello from express</h1>')
    
})

app.listen(5000)