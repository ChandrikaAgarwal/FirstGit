const express = require('express')
const monthlyControl = require('../controllers/monthlyController')
const router = express.Router()
const { jwtAuthMiddleware } = require('../jwtmiddleware')

router.get('/', jwtAuthMiddleware, monthlyControl.getAllExpenses)
router.get('/weekly', jwtAuthMiddleware, monthlyControl.getExpensesWeekly)
router.get('/monthReport', jwtAuthMiddleware, monthlyControl.getAllExpenses)
router.get('/yearReport', jwtAuthMiddleware, monthlyControl.getYearlyReport)
router.get('/downloadRep', jwtAuthMiddleware, monthlyControl.downloadReport)
router.get('/reportLinks',jwtAuthMiddleware,monthlyControl.getAllReports)
module.exports = router;