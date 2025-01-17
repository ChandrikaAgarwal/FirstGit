const express=require('express')
const userControl=require('../controllers/userController')
const userRouter=express.Router()

userRouter.post('/appointments',userControl.postAddUser)
userRouter.get('/appointments',userControl.getUsers)
userRouter.delete('/appointments/:id',userControl.deleteUser)
userRouter.get('/appointments/:id',userControl.getUserById)
userRouter.put('/appointments/:id',userControl.updateUser)

module.exports=userRouter;