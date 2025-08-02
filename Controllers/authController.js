const User = require('../Models/Users')
const bcrypt=require('bcryptjs')
const jwt = require('jsonwebtoken')

const registerUser = async (req, res) => {
    const { username, email, password } = req.body
    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) return res.status(400).json({ message: 'User already exists' });
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await new User({
            username,
            email, 
            password:hashedPassword
        })
        await newUser.save()
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
        return res.status(200).json({message:"User registered successfully",newUser,token})
    } catch (err) {
        console.log("Error registering User: ",err);
        return res.status(400).json({ message: 'Something went wrong. Please try again!',details:err });
        
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body
    try {
        const user=await User.findOne({email})
        if (!user) return res.status(400).json({ message: "Invalid email or password" })
        
        const match = await bcrypt.compare(password, user.password)
        if (!match) return res.status(400).json({ message:"Invalid email or password"})
        
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'2h'})
        res.status(200).json({message:"Login successful",token,user})
    } catch (err) {
        console.log("Error logging in: ",err);
        res.status(500).json({ message: 'Error logging in', error: err.message });
        
    }
}
module.exports = {
    registerUser,
    loginUser
}