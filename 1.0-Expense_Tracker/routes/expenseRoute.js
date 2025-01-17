const express=require('express')
const expenseControl=require('../controllers/expenseController')
const router=express.Router()

router.post('/expenses',expenseControl.postAddExpense)
router.get('/expenses',expenseControl.getExpenses)
router.delete('/expenses/:id',expenseControl.deleteExpense)
router.get('/expenses/:id',expenseControl.getExpenseById)
router.put('/expenses/:id',expenseControl.updateExpense)

module.exports=router;