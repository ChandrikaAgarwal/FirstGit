const Expense=require('../models/expense')
const User=require('../models/user')
const {jwtAuthMiddleware,generateToken}=require('../jwtmiddleware')

exports.postAddUser= async (req,res,next)=>{
    try{
        const email=req.body.email
        const password=req.body.password
        const user=await User.findOne({where:{email:email}})
        if (!user){
            const newUser= await User.create({
                email:email,
                password:password
        })  
        const token=generateToken({id:newUser.id, email:newUser.email})
        console.log("New User Created: ",newUser,"Token :",token);
        
        return res.status(200).json({message:"New user created ", userdetail:newUser})
        }
        
        if(user.password!==password){
            console.log("passowrd mismatch ", email);
            return res.status(500).json({message:"Password mismatch"})
            
        }
        const token=generateToken({id:user.id, email:user.email})
        console.log("Existing User:",user,"Token: ",token);
        return res.status(200).json({message:"New user created ", userdetail:user})
        // console.log("New user: ",newUser);
        
}catch(err){
    console.log(err);
    
        res.status(500).json({error:"Failed to create a new user",details:err})

}
}
exports.postAddExpense=async (req,res,next)=>{
    try{
       const amount=req.body.amount
       const description=req.body.description
       const category=req.body.category
       const user=await User.findByPk(req.user.id)
       if(!user){
        return res.status(404).json({message:"User not found"})
       }
       const newExpense=await user.createExpense({
        amount:amount,
        description:description,
        category:category
       })

       console.log("New Expense ",newExpense);
    //    res.redirect('http://localhost:5000')
       res.status(200).json({message:"New expense created ", expensedetail:newExpense})
       
    }catch(err){
        res.status(500).json({error:"Failed to create a new expense",details:err})
    }
};

exports.getExpenses= async (req,res,next)=>{
    try{
        console.log("Response ",res);
        const expenses=await Expense.findAll()
        res.status(200).json({expenses})
        
    }catch(err){
        res.status(500).json({message: "Error fetching expenses ",details:err})
    }
};

exports.deleteExpense=async(req,res,next)=>{
    try{
        const {id}=req.params
        await Expense.destroy({where:{id}})
        res.status(200).json({message:'Congratulations you cut on expenses!'})
    }catch(err){
        res.status(500).json({error: 'Failed to delete expense', details: err})
    }
};

exports.getExpenseById=async (req,res,next)=>{
    try{
        const {id}=req.params
        const expense=await Expense.findByPk(id)
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.status(200).json({ expense });
    }catch(err){
        res.status(500).json({ error: 'Failed to fetch expense', details: err.message });
    }
};

exports.updateExpense=async (req,res,next)=>{
    try{
        const {id}=req.params
        const {amount,description,category}=req.body
        const expense=await Expense.findByPk(id)
        .then(expense=>{
            return expense.destroy()
        }) 
        .then(result=>{
            console.log("Expense to be edited removed from db");
            
        })
        .catch(err=>console.log(err))
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
         // Update fields
         expense.amount = amount || expense.amount;
         expense.description = description || expense.description;
         expense.category = category || expense.category;
         await expense.save()
         res.status(200).json({message:'Updated expense',editexpense:expense})
    }catch(err){
        res.status(500).json({ error: 'Failed to edit expense', details: err.message });
    }
}