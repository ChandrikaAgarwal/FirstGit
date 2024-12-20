const path=require('path')
const express=require('express')
const rootDir=require('../util/path')
const shopRouter=express.Router()
shopRouter.get('/',(req,res,next)=>{
    // console.log('In another middleware');
    res.sendFile(path.join(rootDir,'Views','shop.html'))
    //__dirname is a global variable made available by node js that holds the absolute path on our operating system 
    //to the project folder(EXPRESS_JS).
    
})
module.exports=shopRouter;