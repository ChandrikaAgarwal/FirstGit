const Expense=require('../models/expense')
const User=require('../models/user')
const Income=require('../models/income')
const {jwtAuthMiddleware,generateToken}=require('../jwtmiddleware')
const { Op } = require("sequelize");
async function finduserIncome(userId){
    const lastIncome=await Income.findOne({where:{userId},
        order: [['createdAt', 'DESC']],
        limit: 1
    });
return lastIncome
}

exports.postAddUser= async (req,res,next)=>{

    console.log("request body!! ",req.body );
    
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
        
        return res.status(200).json({message:"New user created ", userdetail:newUser,token:token})
        }
        
        if(user.password!==password){
            console.log("passowrd mismatch ", email);
            return res.status(401).json({message:"Password mismatch"})
            
        }
        const token=generateToken({id:user.id, email:user.email})
        console.log("Existing User:",user,"Token: ",token);
        return res.status(200).json({message: "Login successful",existinguser:user, token})
        // console.log("New user: ",newUser);
        
}catch(err){
    console.log(err);
    
        res.status(500).json({error:"Failed to create a new user",details:err})

}
}
exports.postAddExpense=async (req,res,next)=>{
  
    try{
    
       let savings=[]
       let latestsaving=0
       const preExpenses=await Expense.findAll({
        where:{userId:req.user.id},
        order:[['createdAt','DESC']],
        limit:1
        })
       const userIncome=await finduserIncome(req.user.id)
       console.log(userIncome);
       
       if(preExpenses.length===0){
        savings.push(userIncome.amount)
        latestsaving=savings.at(-1)
    }else{
        savings.push(preExpenses[0].currentsaving)
        latestsaving=userIncome.totalsaving
    }
       const amount=req.body.amount
       const description=req.body.description
       const category=req.body.category
       const createdAt=req.body.createdAt || new Date();
       latestsaving=latestsaving-amount
       const user=await User.findByPk(req.user.id)
       if(!user){
        return res.status(404).json({message:"User not found"})
       }
       const newExpense=await user.createExpense({
        amount:amount,
        description:description,
        category:category,
        currentsaving:latestsaving,
        createdAt:createdAt
       })

       console.log("New Expense ",newExpense);
       savings.push(newExpense.currentsaving)
       latestsaving=newExpense.currentsaving
       userIncome.totalsaving=latestsaving
       await userIncome.save()
       console.log("incomes table updated");
       
       console.log("savings on expensee!! ",savings);
       console.log("latest saving !!",latestsaving);
       
           
       res.status(200).json({message:"New expense created ", expensedetail:newExpense})
       
    }catch(err){
        res.status(500).json({error:"Failed to create a new expense",details:err})
    }
};

exports.getExpenses= async (req,res,next)=>{
    try{
        // const {date}=req.query
        const userid=req.user.id
        console.log("Response ",res);
        // if (!date) {
        //     return res.status(400).json({ error: "Date is required" });
        // }
        const expenses=await Expense.findAll(
            {where:{
                userId:userid,
                // [Op.between]: [`${date} 00:00:00`, `${date} 23:59:59`]  //data for whole day
            }
        })
        res.status(200).json({expenses})
        
    }catch(err){
        res.status(500).json({message: "Error fetching expenses ",details:err})
    }
};

exports.deleteExpense=async(req,res,next)=>{
    try{
        const {id}=req.params
        const userIncome=await finduserIncome(req.user.id)
        const expensetodel=await Expense.findByPk(id)
        console.log("Expense to be deleted: ",expensetodel);
        
        userIncome.totalsaving+=expensetodel.amount
        delamount=expensetodel.amount
        await userIncome.save()
        await expensetodel.destroy()
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
        let oldAmount=0
        const {amount,description,category}=req.body
        const preExpenses=await Expense.findAll({
            where:{userId:req.user.id},
            order:[['createdAt','DESC']],
            limit:1 
            })
        console.log("PreExpenses:: ",preExpenses);
        
        const userIncome=await finduserIncome(req.user.id)

        const expense=await Expense.findByPk(id)
        
            console.log(expense); 
            oldAmount=expense.amount
            console.log("Old Amount",oldAmount);
            userIncome.totalsaving=preExpenses[0].currentsaving+oldAmount
            await userIncome.save()
            if (!expense) {
                return res.status(404).json({ error: 'Expense not found' });
            }
            await expense.destroy()
            expense.amount=amount;
            expense.description=description;
            expense.category=category;

                       
             await expense.save()
             
             res.status(200).json({message:'Updated expense',editexpense:expense})
        
        
        // .then(result=>{
        //     console.log("Expense to be edited removed from db");
            
        // })
        // .catch(err=>console.log(err))
        
         // Update fields
         
        
       
        
    }catch(err){
        res.status(500).json({ error: 'Failed to edit expense', details: err.message });
    }
}