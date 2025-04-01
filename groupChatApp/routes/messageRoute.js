const express=require('express')
const router=express.Router()
const messageController = require('../controllers/messageController')
const { jwtAuthMiddleware } = require('../jwtmiddleware')

router.post('/', jwtAuthMiddleware, messageController.postAddMsg)
router.get('/', jwtAuthMiddleware, messageController.getAllMsgs)
// router.get('/newmsg',jwtAuthMiddleware,messageController.getNewMsg)
module.exports = router;