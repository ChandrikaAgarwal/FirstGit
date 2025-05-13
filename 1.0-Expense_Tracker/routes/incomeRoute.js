const express = require('express')
const incomeControl = require('../controllers/incomeController')
const router = express.Router()
const { jwtAuthMiddleware } = require('../jwtmiddleware')

router.post('/', jwtAuthMiddleware, incomeControl.postAddIncome)
router.get('/', jwtAuthMiddleware, incomeControl.getIncome)
router.delete('/:id', jwtAuthMiddleware, incomeControl.deleteIncome)
router.get('/:id', jwtAuthMiddleware, incomeControl.getIncomebyId)
router.put('/:id', jwtAuthMiddleware, incomeControl.editIncome)
module.exports = router