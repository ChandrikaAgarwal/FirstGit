const express=require('express')
const router=express.Router()
const messageController = require('../controllers/messageController')
const { jwtAuthMiddleware } = require('../jwtmiddleware')

router.post('/', jwtAuthMiddleware, messageController.postAddMsg)
router.get('/', jwtAuthMiddleware, messageController.getAllMsgs)
router.post('/group/:groupId', jwtAuthMiddleware, messageController.createGrpMsg)
router.get('/group/:groupId', jwtAuthMiddleware, messageController.getAllGroupMsgs)
module.exports = router;