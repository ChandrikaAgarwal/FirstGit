const express=require('express')
const expenseControl=require('../controllers/expenseController')
const router=express.Router()

router.post('/',expenseControl.postAddExpense)
router.get('/',expenseControl.getExpenses)
router.delete('/:id',expenseControl.deleteExpense)
router.get('/:id',expenseControl.getExpenseById)
router.put('/:id',expenseControl.updateExpense)

module.exports=router;