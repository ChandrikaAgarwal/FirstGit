const express = require('express')
const userControl = require('../controllers/userController')
const { jwtAuthMiddleware }=require('../jwtmiddleware')
const router = express.Router()

router.post('/', userControl.signupUser)
router.post('/users', userControl.getUser)
router.post('/edit-profile', jwtAuthMiddleware, userControl.editUser)
router.get('/api/authors', jwtAuthMiddleware, userControl.getAuthors)
router.post('/api/create-collection', jwtAuthMiddleware, userControl.newCollection)
router.get('/api/getmycollections', jwtAuthMiddleware, userControl.getMyCollections)
router.get('/api/getcollectionrecipes/:collectionId',jwtAuthMiddleware,userControl.getRecipesInCollection)
module.exports = router;