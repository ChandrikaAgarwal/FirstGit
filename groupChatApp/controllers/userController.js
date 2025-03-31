const User = require('../models/users')
const bcrypt = require('bcrypt')
const {generateToken}= require('../jwtmiddleware')
const { Sequelize, Op } = require('sequelize');
const sequelize=require('../util/database')
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

exports.getLoggedInUsers = async (req, res, next) => {
    try {
        let currentUser = true
        const existingUser = await User.findByPk(req.user.id)
        console.log("req.user.id: ",req.user.id);
        
        if (!existingUser) {
            currentUser=false
            return res.status(404).json({ message: "User not found, please sign up" })
        }
        const allLoggedInUsers = await User.findAll({
            where: {
               isLoggedIn: true,
               id: {[Op.not]: req.user.id },
             },
            attributes:["id","name"],
            order: [["id", "ASC"]]
        })
        console.log("loggedIn users :",allLoggedInUsers);
        
        return res.status(200).json({ message: "Logged in users", currentUser, loggedInUsers: allLoggedInUsers })
    } catch (err) {
        console.log("error getting login Users from backend: ", err);
        return res.status(500).json({message:"Error in getting loggedIn users ",details:err})
        
    }
}

exports.userLogout = async (req, res, next) => {
    try { 
        const existingUser = await User.findByPk(req.user.id)
        if (!existingUser) {
            return res.status(404).json({message:"user not found"})
        }
        existingUser.isLoggedIn = false;
        existingUser.save();
        return res.status(200).json({message:"Logout successful"})
    } catch (err) { 
        console.log("error while logging out: ", err);
        return res.status(500).json({message:"Error in logging out",details:err})
    }
}