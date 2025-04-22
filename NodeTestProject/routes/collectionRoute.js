const express = require('express')
const collectionControl = require('../controllers/collectionController')
const { jwtAuthMiddleware }=require('../jwtmiddleware')
const router = express.Router()

router.post('/api/create-collection', jwtAuthMiddleware, collectionControl.newCollection)
router.get('/api/getmycollections', jwtAuthMiddleware, collectionControl.getMyCollections)
router.get('/api/getcollectionrecipes/:collectionId', jwtAuthMiddleware, collectionControl.getRecipesInCollection)

module.exports = router;