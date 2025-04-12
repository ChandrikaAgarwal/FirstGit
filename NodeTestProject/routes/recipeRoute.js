const express = require('express')
const router = express.Router()
const { jwtAuthMiddleware } = require('../jwtmiddleware')
const recipeControl = require('../controllers/recipeController')
const upload = require('../middlewares/multer')

router.post('/share-recipe',jwtAuthMiddleware,upload.array('files'),recipeControl.newRecipe)
router.get('/api/allrecipes', jwtAuthMiddleware, recipeControl.getAllRecipes)
router.get('/api/myrecipes', jwtAuthMiddleware, recipeControl.getMyRecipes)
router.get('/api/search-results', jwtAuthMiddleware, recipeControl.getSearchResults)
router.get('/api/recipes/:recipeId', jwtAuthMiddleware, recipeControl.getThisRecipe)
router.post('/api/ratings',jwtAuthMiddleware,recipeControl.recipeRatings)
module.exports = router;