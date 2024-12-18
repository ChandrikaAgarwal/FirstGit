const express=require('express')
const msgrouter=express.Router()
const file=require('fs')
msgrouter.use(express.urlencoded({extended:true}))
msgrouter.get('/',(req,res,next)=>{
    let message="No chats exist"
    res.send(`<p>${message}</p><form action="/" method="POST" ><input type="text" name="message" placeholder="Write your message"></input><button type="submit">Send</button></form>`)
})

msgrouter.post('/',(req,res,next)=>{
   let value=req.body.message+"\n"
   file.appendFile('./message.txt',value,(err)=>{
    if (err){
        console.error("Error writing the file ",err)
        res.statusCode=500;
    }
   })
   file.readFile('./message.txt',(err,data)=>{
    let message=''
    if(!err && data){
        message=data.toString()
        console.log(message);
        
    }
    res.send(`<p>${message}</p><form action="/" method="POST" ><input type="text" name="message" placeholder="Write your message"></input><button type="submit">Send</button></form>`)
})
})

module.exports=msgrouter;