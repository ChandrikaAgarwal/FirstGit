const express=require('express')
const expenseControl=require('../controllers/expenseController')
const router=express.Router()

router.post('/',expenseControl.postAddUser)
// router.get('/:userId',expenseControl.postAddUser)

module.exports=router;