const express = require('express')
const incomeControl = require('../controllers/incomeController')
const router = express.Router()
const { jwtAuthMiddleware } = require('../jwtmiddleware')

router.post('/', jwtAuthMiddleware, incomeControl.postAddIncome)
router.get('/', jwtAuthMiddleware, incomeControl.getIncome)
module.exports = router