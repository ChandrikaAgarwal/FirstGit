const express=require('express')
const companyControl=require('../controllers/companyController')
const router=express.Router()

router.post('/',companyControl.postAddReview)
router.get('/:name',companyControl.getCompanyReview)
module.exports=router;