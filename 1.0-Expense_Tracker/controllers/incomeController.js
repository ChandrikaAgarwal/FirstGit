const Income=require('../models/income')
const User=require('../models/user')
const Expense=require('../models/expense')
let savings=0
exports.postAddIncome=async (req,res,next)=>{
    try{
        const prevExp=await Expense.findAll({
            where:{userId:req.user.id},
            order:[['createdAt','DESC']],
            limit:1
})
        const preIncome=await Income.findAll({
            where:{userId:req.user.id},
            order:[['createdAt','DESC']],
            limit:1
        })
        let amount=req.body.amount
        let description=req.body.description
        
        const user=await User.findByPk(req.user.id)
        if(!user){
            return res.status(404).json({message:"User not found"})
           }
           if(prevExp.length===0){
            savings=amount
           }else if(preIncome[0]){
            console.log(prevExp[0].savings);
            amount=preIncome[0].totalsaving+req.body.amount
            console.log("amount",amount);
            savings=preIncome[0].totalsaving+req.body.amount
            console.log("Savings after new income: ",savings);
            
        }
        const newIncome=await user.createIncome({
            amount,
            description,
            totalsaving:savings
        })  
        

        console.log("New Income:",newIncome);
        res.status(200).json({message:"New income created ", incomedetail:newIncome})
    }catch(err){
        res.status(500).json({error:"Failed to create an income ",details:err})
    }
}

exports.getIncome= async (req,res,next)=>{
    try{
        const income=await Income.findOne({where:{userId:req.user.id},
        order:[['createdAt','DESC']],
        limit:1
})
        console.log("savings testing ",savings);
        
        res.status(200).json({income,savings:savings})

    }catch(err){
        res.status(500).json({error:"Failed to get income",details:err})

    }
}