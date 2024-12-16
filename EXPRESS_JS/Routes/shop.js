const express=require('express')
const shopRouter=express.Router()
shopRouter.get('/',(req,res,next)=>{
    // console.log('In another middleware');
    res.send('<h1>Hello from express</h1>')
    
})
module.exports=shopRouter;