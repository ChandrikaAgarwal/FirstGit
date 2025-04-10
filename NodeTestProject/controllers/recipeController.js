const User = require('../models/users')
const multer = require('multer')
const Recipe = require('../models/recipes')
const {v4:uuidv4}=require('uuid')
const AWS=require('aws-sdk')
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