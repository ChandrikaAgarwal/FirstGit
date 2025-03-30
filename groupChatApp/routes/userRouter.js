const express = require('express')
const userControl = require('../controllers/userController')
const router = express.Router()

router.post('/', userControl.signupUser)
router.post('/users',userControl.getUser)

module.exports = router;