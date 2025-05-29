const express=require('express')
const userControl=require('../controllers/userController')
const router=express.Router()

router.post('/', userControl.userSignUp)
router.post('/users', userControl.userLogin)

module.exports = router;