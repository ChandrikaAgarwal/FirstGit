const User = require('../models/users')
const bcrypt = require('bcrypt')
const {generateToken}= require('../jwtmiddleware')

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
            password: hashedPassword
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
            return res.status(400).json({message:"User not found, please sign up"})
        }
        const isValid = await bcrypt.compare(password, existingUser.password)
        if (!isValid) {
            return res.status(400).json({message:"Incorrect password"})
        }
        const token = generateToken(existingUser)
        return res.status(200).json({message:"Login successful"})
        
    } catch (err) {
        console.log("error while getting user: ", err);
        res.status(500).json({ message: "Failed to log in", details: err })
    }
}