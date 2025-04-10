const express = require('express')
const router = express.Router()
const { jwtAuthMiddleware } = require('../jwtmiddleware')
const recipeControl = require('../controllers/recipeController')
const upload = require('../middlewares/multer')

router.post('/share-recipe',jwtAuthMiddleware,upload.array('files'),recipeControl.newRecipe)

module.exports = router;