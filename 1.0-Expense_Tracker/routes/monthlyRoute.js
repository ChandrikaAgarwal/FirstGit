const express = require('express')
const monthlyControl = require('../controllers/monthlyController')
const router = express.Router()
const { jwtAuthMiddleware } = require('../jwtmiddleware')

router.get('/', jwtAuthMiddleware, monthlyControl.getAllExpenses)

module.exports = router;