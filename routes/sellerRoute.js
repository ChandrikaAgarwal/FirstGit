const express=require('express')
const { jwtAuthMiddleware } =require('../middlewares/jwtmiddleware')
const router=express.Router()
const sellerControl=require('../controllers/sellerController')

router.get("/fetch-sellers",jwtAuthMiddleware,sellerControl.getAllSellers)
router.post('/api/follow-user', jwtAuthMiddleware, sellerControl.followSeller)
router.post('/api/ratings',jwtAuthMiddleware,sellerControl.sellerRating)
module.exports=router