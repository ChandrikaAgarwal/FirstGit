const { Sequelize } = require('sequelize');
const Company=require('../models/companyReview')

exports.postAddReview=async(req,res,next)=>{
console.log("Request: ",req.body);

    try{
        const name=req.body.name
        const pros=req.body.pros
        const cons=req.body.cons
        const rating=req.body.rating
        const newCompany=await Company.create({
            name:name,
            pros:pros,
            cons:cons,
            rating:rating
        })
        console.log("new Company ",newCompany);
        res.status(201).json({message:"New company created ",companyreview:newCompany})
    }catch(err){
        res.status(500).json({error:"Failed to create a new player",details:err})
    }
}

exports.getCompanyReview=async(req,res,next)=>{
    const {name}=req.params

    if(!name){
        return res.status(400).json({error:"Please provide a name"})
    }

    try{
        const companies=await Company.findAll({where:{name},
        attributes:[
            'name',
            [Sequelize.fn('AVG',Sequelize.col('rating')),'averageRating']
        ],
    })
    
        if (companies.length>0){
            console.log("Companiess!!!",companies);
            res.status(200).json({
                message: "Company found",
                companies: companies,
                averageRating: companies[0].dataValues.averageRating 
        });
        
        }else{
            return res.status(404).json({ error: "No company found with the given name" });
        }
    }catch(err){
        console.log(err);
        
        res.status(404).json({error:"Failed to search company ",details:err})
    }
}