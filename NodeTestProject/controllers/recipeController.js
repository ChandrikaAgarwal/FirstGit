const User = require('../models/users')
const multer = require('multer')
const Recipe = require('../models/recipes')
const {v4:uuidv4}=require('uuid')
const AWS = require('aws-sdk')
const { Sequelize, Op } = require('sequelize')
const Rating = require('../models/ratings')

exports.newRecipe = async (req, res, next) => {
    try {
        
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "No user found" })
        }
        const files = req.files;
         const { name, description, ingredients, method, cuisine, category, cookingTime, marinationTime, serves, mainingrediant, recipetype } = req.body;
        
        console.log("recipeType: ", recipetype);
        console.log("mainingredient: ",mainingrediant);
        console.log("category: ",category);
       
    
        const newRecipe = await user.createRecipe({
            name,
            description,
            ingredients,
            method,
            cuisine,
            category,
            cookingTime,
            marinationTime,
            serves,
            mainingrediant,
            recipetype
        })
        console.log("files: ",files);
        const fileUrls=await Promise.all(files.map(file=>uploadToS3(file)))
        newRecipe.recipeImg = fileUrls
       await newRecipe.save()
        res.status(201).json({ message: "Recipe created successfully", newRecipe })
    } catch (err) {
        console.log("error in uploading recipe: ", err);
        res.status(500).json({ message: "Error in uploading recipe", details: err })
    }
}

function uploadToS3(file) {
    try {
        const BUCKET_NAME = process.env.BUCKET_NAME
        const IAM_USER_KEY = process.env.IAM_USER_KEY
        const IAM_ACCESS_KEY = process.env.IAM_ACCESS_KEY
    
        const s3bucket = new AWS.S3({
            accessKeyId: IAM_USER_KEY,
            secretAccessKey: IAM_ACCESS_KEY,
            region: 'ap-south-1'
        })

        var params = {
            Bucket: BUCKET_NAME,
            Key: `${uuidv4()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        }
        return new Promise((resolve, reject) => {
            s3bucket.upload(params, (err, data) => {
                if (err) {
                    console.log("something went wrong while uploading files to s3: ", err);
                    reject(err)
                } else {
                    console.log("file uploaded successfully to s3: ", data);
                    resolve(data.Location)
                }
            })
        })
    } catch (err) {
        console.log("error uploading to s3: ",err);
        throw new Error("s3 upload failed: "+err.message)
    }
}

exports.getAllRecipes = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const recipes = await Recipe.findAll({
            where: {
                userId: { [Op.not]: user.id }
            },
        })
        return res.status(200).json({message:"All recipes: ",recipes})
    } catch (err) { 
        console.log("error fetching all recipes: ", err);
        return res.status(500).json({ message: "Error fetching all recipes" })
     }
}

exports.getMyRecipes = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "No user found" })
        }
        const myrecipes = await Recipe.findAll({
            where: {
                userId:user.id
            },
        })
        console.log("my recipes: ",myrecipes);
        
        return res.status(200).json({ message: "All recipes: ", myrecipes })
    } catch (err) {
        console.log("error fetching all recipes: ", err);
        return res.status(500).json({ message: "Error fetching your recipes" })
    }
}

exports.getSearchResults = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "No user found" })
        }
        const { name, cuisine, category, ingredients, type } = req.query
        console.log("name: ",name);
        console.log("category: ", category);
        console.log("cuisine: ",cuisine);
        console.log("ingredients: ",ingredients);
        console.log("type: ", type);

        const searchConditions = [];
        if (name) searchConditions.push({ name: { [Op.like]: `%${name}%` } });
        if (cuisine) searchConditions.push({ cuisine: { [Op.like]: `%${cuisine}%` } });
        if (category) searchConditions.push({ category: { [Op.like]: `%${category}%` } });
        if (ingredients) searchConditions.push({ mainingrediant: { [Op.like]: `%${ingredients}%` } });
        if (type) searchConditions.push({ recipetype: { [Op.like]: `%${type}%` } });
        console.log("search Conditions: ",searchConditions);
        
        const matchedRecipe = await Recipe.findAll({
            where: {
                [Op.or]: searchConditions
            }
        })
        console.log("matched recipes: ",matchedRecipe);
        return res.status(200).json({message:"Matched Recipes: ",matchedRecipe})
    } catch (err) {
        console.log("error fetching matching recipes: ", err);
        return res.status(500).json({ message: "Error fetching matching recipes" })
    }
}

exports.getThisRecipe = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { recipeId } = req.params
        const recipe = await Recipe.findByPk(recipeId)
        console.log("recipe: ", recipe);
        return res.status(200).json({message:"Recipe found",recipe})
    } catch (err) {
        console.log("error fetching requested recipe: ",err);
        return res.status(500).json({message:"Recipe not found ",details:err})
    }
}

exports.recipeRatings = async (req, res, next) => {
    try {
        const { selectedRating,totalRating,recipeId }=req.body
        const user = await User.findByPk(req.user.id)
        if (!user||!selectedRating||!recipeId) {
            return res.status(404).json({ message: "Missing Data" })
        }
        const existingRating = await Rating.findOne({
            where: {
                userId: req.user.id,
                recipeId
            }
        })
        if (existingRating) {
            return res.status(400).json({ message: "You have already rated this recipe once" })
        }
        const newRating = await Rating.create({
            userId: req.user.id,
            recipeId: recipeId,
            rating: selectedRating
        })

        const allRecipes = await Rating.findAll({
            where: {
                recipeId,
            },
            attributes:[
            [Sequelize.fn('AVG', Sequelize.col('rating')), 'avgRating'],
            [Sequelize.fn('COUNT', Sequelize.col('rating')), 'totalRating'],
            ],
            raw:true
        })
        await newRating.update(
        
            {
                totalRatings: allRecipes[0].totalRating,
                avgRating: allRecipes[0].avgRating
             },
        )
        await newRating.save()
        const recipe = await Recipe.findByPk(recipeId)
        recipe.avgRating = allRecipes[0].avgRating
        recipe.totalRatings = allRecipes[0].totalRating
        recipe.save()
        console.log("allRecipes: ", recipe);
        console.log("newrating: ",newRating);
        
        return res.status(200).json({message:"Recipe rated",recipe})
    } catch (err) {
        console.log("error fetching recipe ratings: ",err);
    }
}