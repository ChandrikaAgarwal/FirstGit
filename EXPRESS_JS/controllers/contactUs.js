const path=require('path')
const rootDir=require('../util/path')

exports.getContact=(req,res,next)=>{
    res.sendFile(path.join(rootDir,'Views','contact.html'))
}

exports.postContact=(req,res,next)=>{
    res.redirect('/success')
    // res.sendFile(path.join(rootDir,'Views','form_submit.html'))
}