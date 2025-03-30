const express = require('express')
const userControl = require('../controllers/userController')
const router = express.Router()

router.post('/',userControl.signupUser)

module.exports = router;