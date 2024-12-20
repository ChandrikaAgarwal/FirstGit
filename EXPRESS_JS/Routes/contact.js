const express=require('express')
const path=require('path')
const rootDir=require('../util/path')
const contactRoute=express.Router()
contactRoute.get('/contact',(req,res,next)=>{
    res.sendFile(path.join(rootDir,'Views','contact.html'))
})

contactRoute.post('/contact',(req,res,next)=>{
    res.redirect('/success')
    // res.sendFile(path.join(rootDir,'Views','form_submit.html'))
})

module.exports=contactRoute;