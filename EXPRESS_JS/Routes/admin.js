const express=require('express')
const router=express.Router() //mini express router tied or pluggable into another express router
router.get('/add-product',(req,res,next)=>{
    // console.log('In another middleware');
    res.send('<form action="/admin/add-product" method="POST"><input type="text" name="title"></input><input type="number" name="size"></input><button type="submit">Add Product</button></form>')
})

router.post('/add-product',(req,res,next)=>{ //this middleware will execute not only for post but also for get request
    console.log(req.body)//new field added by express.
    res.redirect('/')
})


module.exports=router; //router object
