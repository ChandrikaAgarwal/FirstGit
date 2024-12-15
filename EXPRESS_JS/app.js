// const http=require('http')
const express=require('express')
const app=express()
app.use((req,res, next)=>{
    console.log('IN the middleware');
    next();
})
app.use((req,res, next)=>{
    console.log('IN another middleware');
    res.send('<h1>Hello from express</h1>');//allows us to send a response with the attached body of type any.
})  //this callback will be executed for every incoming request

// const server=http.createServer(app)
// server.listen(3000) 
app.listen(3000)
