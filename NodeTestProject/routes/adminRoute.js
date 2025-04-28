const express=require('express')
const router= express.Router()
const{jwtAuthMiddleware}=require('../jwtmiddleware')
const adminControl = require('../controllers/adminController')

router.post('/admin-login',adminControl.loginAdmin)
router.post('/api/setadmin-creds', jwtAuthMiddleware, adminControl.makeAdmin)
router.get('/api/users-recipes', jwtAuthMiddleware, adminControl.countUsersRecipes)
router.get('/admin/allrecipes',jwtAuthMiddleware,adminControl.getAllRecipes)
router.delete('/admin/delete-recipe', jwtAuthMiddleware, adminControl.deleteRecipe)
router.get('/admin/authors', jwtAuthMiddleware, adminControl.getAuthors)
router.post('/api/action', jwtAuthMiddleware, adminControl.actionOnUser)
module.exports = router;