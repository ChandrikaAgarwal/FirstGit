const { generateToken, jwtAuthMiddleware } = require("../middlewares/jwtmiddleware")
const User = require("../models/users")
const bcrypt=require('bcryptjs')
const userSignUp = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body
        const user = await User.findOne({ email: email })
        if (user) {
            return res.status(400).json({ message:"User already exists. Please log in."})
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const newUser = new User({
            name: name,
            email: email,
            phone: phone,
            password:hashedPassword
        })
        await newUser.save()
        return res.status(200).json({message:"New User created ",newUser})
     } catch (err) {
        console.log("Error in creating a new user: ",err);
        res.status(500).json({error:"Failed to create a new user",details:err})
        
    }
}

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.status(404).json({message:"User not found. Please SignUp!"})
        }
        const isValidPassword=await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return res.status(401).json({message:"Incorrect Password"})
        }
        const token = generateToken(user)
        
        return res.status(200).json({message:"Login Successful!",token})
     } catch (err) {
        console.log("Error in getUser:", err);
        res.status(500).json({ error: "Failed to fetch user", details: err });
    }
}

module.exports = {
    userSignUp,
    userLogin
}