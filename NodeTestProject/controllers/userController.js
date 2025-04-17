const User = require('../models/users')
const bcrypt = require('bcrypt')
const {generateToken}= require('../jwtmiddleware')
const { Sequelize, Op } = require('sequelize');
const sequelize = require('../util/database');
const Collection = require('../models/collections');
const Usercollection = require('../models/userCollection');
const Recipe=require('../models/recipes')

exports.signupUser = async (req, res, next) => {
    try {
        console.log("request body: ",req);
        
        const { name, email, phone, password } = req.body
        const saltRounds = 10
        const existingUser = await User.findOne({ where: { email: email } })
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists, please log in' })
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const newUser = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            isLoggedIn:false,
        })
        const token = generateToken(newUser)
        console.log("token recieved: ",token);
        
        return res.status(200).json({message:"Signup successful. Please log in",token,newUser})
    } catch (err) {
        console.log("error while signing up: ",err);
        
        res.status(500).json({message:"Failed to create a new user",details:err})
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const { email, password } = req.body
        
        const existingUser = await User.findOne({ where: { email: email } })
        if (!existingUser) { 
            return res.status(404).json({message:"User not found, please sign up"})
        }
        const isValid = await bcrypt.compare(password, existingUser.password)
        if (!isValid) {
            return res.status(401).json({message:"Incorrect password"})
        }
        
        existingUser.isLoggedIn = true;
        existingUser.save();
        const token = generateToken(existingUser)
        return res.status(200).json({message:"Login successful",token})
        
    } catch (err) {
        console.log("error while getting user: ", err);
        res.status(500).json({ message: "Failed to log in", details: err })
    }
}

exports.editUser = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { name, email, phone, password } = req.body
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        user.name = name
        user.email = email
        user.phone = phone
        user.password = hashedPassword
        user.save()
        return res.status(200).json({message:"profile edited successfully"})
    } catch (err) {
        console.log("error editing profile: ", err);
        res.status(500).json({ message: "Failed to edit profile", details: err })
        
    }
}

exports.getAuthors = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const allAuthors = await User.findAll()
        return res.status(200).json({message:"All authors: ",allAuthors})
    } catch (err) {
        console.log("error getting all authors: ",err);
        return res.status(500).json({message:"Error getting all authors: ",details:err})
        
    }
}

exports.newCollection = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { cName, share, members } = req.body
        const newCollection = await Collection.create({
            collectionName: cName,
            createdby: user.id,
            creatorname: user.name,
            shared:share
        })
        await user.addCollection(newCollection, {
            through: {
                collectionName: cName,
                username:user.name
            }
        })
        await Promise.all(members.map(async (m) => {
            const member = await User.findByPk(m.id)
            if (member) {
                await member.addCollection(newCollection, {
                    through: {
                        collectionName: cName,
                        username: member.name
                }})
            }
        }))
        return res.status(200).json({message:"new collection",newCollection})
        
    } catch (err) {
        console.log("error creating a new collection: ", err);
        return res.status(500).json({message:"error in creating a new collection:", details:err})
        
    }
}

exports.getMyCollections = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        let mycollections = await Usercollection.findAll({
            where: {
                userId:user.id
            },
        })
        console.log("my collections: ",mycollections);
        return res.status(200).json({ message: "my collection", mycollections })
    } catch (err) {
        console.log("error getting your collections: ", err);
        return res.status(500).json({ message: "error in getting your collections:", details: err })
        
    }
}

exports.getRecipesInCollection = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { collectionId } = req.params
        const recipesinCollection = await Collection.findAll({
            where: {
                id:collectionId
            },
            include:Recipe
        })
        console.log("recipes in collection: ",recipesinCollection);
        res.status(200).json({message:"All recipes in the collection: ",recipesinCollection})
     } catch (err) {
        console.log("error getting your recipes in collections:", err);
        
        return res.status(500).json({ message: "error in getting your recipes in collections:", details: err })
    }
}