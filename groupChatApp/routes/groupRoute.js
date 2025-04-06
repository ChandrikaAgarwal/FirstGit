const express = require('express')
const router = express.Router()
const { jwtAuthMiddleware } = require('../jwtmiddleware')
const groupControl = require('../controllers/groupController')

router.post('/api/creategroup', jwtAuthMiddleware, groupControl.createGroup)
router.get('/api/creategroup', jwtAuthMiddleware, groupControl.getGroups)
router.post('/group/:groupId',jwtAuthMiddleware,groupControl.getUsersofGroup)
router.get('/api/group/:groupId', jwtAuthMiddleware, groupControl.getAllLoggedInusers)
module.exports = router;