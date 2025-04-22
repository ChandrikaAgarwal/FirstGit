const express=require('express')
const router= express.Router()
const{jwtAuthMiddleware}=require('../jwtmiddleware')
const adminControl = require('../controllers/adminController')
router.get('/api/users-recipes', jwtAuthMiddleware, adminControl.countUsersRecipes)
router.delete('/admin/delete-recipe',jwtAuthMiddleware,adminControl.deleteRecipe)
module.exports = router;