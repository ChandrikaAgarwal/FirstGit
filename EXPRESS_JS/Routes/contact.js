const express=require('express')
const contactController=require('../controllers/contactUs')
const contactRoute=express.Router()
contactRoute.get('/contact',contactController.getContact)

contactRoute.post('/contact',contactController.postContact)

module.exports=contactRoute;