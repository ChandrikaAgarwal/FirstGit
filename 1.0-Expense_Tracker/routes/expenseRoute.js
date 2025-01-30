const express=require('express')
const expenseControl=require('../controllers/expenseController')
const router=express.Router()
const {jwtAuthMiddleware}=require('../jwtmiddleware')


router.post('/',jwtAuthMiddleware,expenseControl.postAddExpense)
router.get('/',jwtAuthMiddleware,expenseControl.getExpenses)
router.delete('/:id',jwtAuthMiddleware,expenseControl.deleteExpense)
router.get('/:id',jwtAuthMiddleware,expenseControl.getExpenseById)
router.put('/:id',jwtAuthMiddleware,expenseControl.updateExpense)

module.exports=router;