const express=require('express')
const formSubmit=express.Router()
const path=require('path')
const rootDir=require('../util/path')
formSubmit.get('/success',(req,res,next)=>{
    res.sendFile(path.join(rootDir,'Views','form_submit.html'))
})

module.exports=formSubmit;