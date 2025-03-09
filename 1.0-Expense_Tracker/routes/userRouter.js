const express = require('express')
const userControl = require('../controllers/userController')
const router = express.Router()

router.post('/', userControl.postAddUser)
router.post('/users', userControl.getUser)
router.post('/password/forgotpassword',userControl.forgotPassword)
router.get('/password/resetpassword/:reqId',userControl.checkActiveStatus)
router.put('/password/updatepassword/:reqId',userControl.updatePassword)
module.exports = router;