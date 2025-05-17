const express = require('express')
const boardControl = require('../controllers/boardController')
const router = express.Router()
const { jwtAuthMiddleware } = require('../jwtmiddleware')

// router.get('/', jwtAuthMiddleware, boardControl.compareExpenses)

module.exports = router;