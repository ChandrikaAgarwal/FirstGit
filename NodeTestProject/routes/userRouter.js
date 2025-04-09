const express = require('express')
const userControl = require('../controllers/userController')
const { jwtAuthMiddleware }=require('../jwtmiddleware')
const router = express.Router()

router.post('/', userControl.signupUser)
router.post('/users', userControl.getUser)
router.post('/edit-profile',jwtAuthMiddleware,userControl.editUser)
module.exports = router;