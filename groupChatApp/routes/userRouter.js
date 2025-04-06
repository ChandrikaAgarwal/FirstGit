const express = require('express')
const userControl = require('../controllers/userController')
const { jwtAuthMiddleware }=require('../jwtmiddleware')
const router = express.Router()

router.post('/', userControl.signupUser)
router.post('/users',userControl.getUser)
router.get('/api/users', jwtAuthMiddleware, userControl.getLoggedInUsers)
router.post('/logout', jwtAuthMiddleware, userControl.userLogout)
router.get('/users/allusers',jwtAuthMiddleware,userControl.getAllUsers)
module.exports = router;