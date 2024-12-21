const express=require('express')
const formSubmit=express.Router()
const successController=require('../controllers/success')
formSubmit.get('/success',successController.successController)

module.exports=formSubmit;