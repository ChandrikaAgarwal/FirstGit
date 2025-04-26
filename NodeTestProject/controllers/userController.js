const User = require('../models/users')
const bcrypt = require('bcrypt')
const {generateToken}= require('../jwtmiddleware')
const { Sequelize, Op } = require('sequelize');
const sequelize = require('../util/database');
const FollowUsers = require('../models/followUsers');
const Admin = require('../models/admin');


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
            isLoggedIn: false,
            isAdmin:false
        })
        if (newUser.email === 'chandrikaagarwal2@gmail.com') {
            newUser.isAdmin = true
            await newUser.save()
        }
        const token = generateToken(newUser)
        // console.log("token recieved: ",token);
        
        return res.status(200).json({message:"Signup successful. Please log in",token,newUser})
    } catch (err) {
        console.log("error while signing up: ",err);
        
        res.status(500).json({message:"Failed to create a new user",details:err})
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const { email, password,role } = req.body
        const existingUser = await User.findOne({ where: { email: email } })
        if (!existingUser) { 
            return res.status(404).json({message:"User not found, please sign up"})
        }
        const isValid = await bcrypt.compare(password, existingUser.password)
        if (!isValid) {
            return res.status(401).json({message:"Incorrect password"})
        }
        
        if (role === 'admin') {
            if (existingUser.isAdmin === false) {
                return res.status(400).json({message:"Access denied!, you are not an admin"})
            }
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

exports.makeAdmin = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        if (!user.isAdmin === false) {
            return res.status(500).json({ message: "you are not authorized to be an admin" })
        }
        const { email, password } = req.body
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)

        const newAdmin = await Admin.create({
            name: user.name,
            email,
            password:hashedPassword
        })
        return res.status(200).json({message:"Admin credentials are set",newAdmin})
    } catch (err) {
        console.log("error setting admin credentials ", err);
        return res.status(500).json({ message:"error setting admin credentials", details:err})
        
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
        const allAuthors = await User.findAll({
            where: {
                id: { [Op.not]:user.id}
            }
        })
        const following = await FollowUsers.findAll({
            where: {
                followerId:user.id
            }
        })
        return res.status(200).json({message:"All authors: ",allAuthors,following})
    } catch (err) {
        console.log("error getting all authors: ",err);
        return res.status(500).json({message:"Error getting all authors: ",details:err})
        
    }
}

exports.followUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { followingId,followingName } = req.body
        console.log("followingId: ",followingId);
        const createFollower = await FollowUsers.create({
            followingId,
            followerId: user.id,
            followingName
        })
        return res.status(200).json({message:"You follow this user now",createFollower})
    } catch (err) {
        console.log("error creating follower: ", err);
        return res.status(500).json({ message: "Error creating follower: ", details: err })
        
    }
}

exports.getFollowers = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const followers = await FollowUsers.findAll({
            where: {
                followerId:user.id
            }
        })
        return res.status(200).json({message:"Follower list",followers})
    } catch (err) {
        console.log("error fetching the followers list: ", err);
        return res.status(500).json({message:"Error fetching followers list: ",details:err})
        
    }
}