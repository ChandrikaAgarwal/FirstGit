const express = require('express')
const monthlyControl = require('../controllers/monthlyController')
const router = express.Router()
const { jwtAuthMiddleware } = require('../jwtmiddleware')

router.get('/', jwtAuthMiddleware, monthlyControl.getAllExpenses)
router.get('/weekly', jwtAuthMiddleware, monthlyControl.getExpensesWeekly)
router.get('/monthReport', jwtAuthMiddleware, monthlyControl.getAllExpenses)
router.get('/yearReport',jwtAuthMiddleware,monthlyControl.getYearlyReport)
module.exports = router;