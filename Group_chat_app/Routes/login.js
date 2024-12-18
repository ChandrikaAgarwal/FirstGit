const express=require('express')
const router=express.Router()
const file=require('fs')
router.get('/login',(req,res,next)=>{
    res.send('<form action="/login" method="POST"><input type="text" name="username" placeholder="username"></input><button type="submit">Login</button></form>')
    
})
router.post('/login',(req,res,next)=>{
    let username=Object.values(req.body).join('')
    let value=username+":"
    file.appendFile('./message.txt',value,(err)=>{
        if(err){
            console.error("Error writing to file ",err)
        }
    })
    res.send(
    `<script>
        localStorage.setItem('username','${username}')
      console.log("username stored: "+localStorage.getItem('username'));
       window.location.href="/"
    </script>
    `)
    
    
})
module.exports=router;