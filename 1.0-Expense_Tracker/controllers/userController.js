const User = require('../models/user')
const ResetPassword = require('../models/forgotPasswordReq')
const { v4: uuidv4 } = require('uuid');
const { jwtAuthMiddleware, generateToken } = require('../jwtmiddleware');
const { Sequelize, Op } = require('sequelize');
require('dotenv').config()
const bcrypt = require('bcryptjs')
const Sib = require('sib-api-v3-sdk')
const client=Sib.ApiClient.instance
const apiKey=client.authentications['api-key']
apiKey.apiKey = process.env.BREVO_API_KEY
const tranEmailApi = new Sib.TransactionalEmailsApi()




exports.postAddUser = async (req, res, next) => {

    console.log("request body!! ", req.body);

    try {
        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const user = await User.findOne({ where: { email: email } })
        if (user) {
            return res.status(400).json({ message: "User already exists. Please log in." });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        const newUser = await User.create({
            name: name,
            email: email,
            phone: phone,
            password: hashedPassword
        })
        const token = generateToken({ id: newUser.id, email: newUser.email, phone: newUser.phone }) //we call this function when the user has successfully logged in
        console.log("New User Created: ", newUser, "Token :", token);

        return res.status(200).json({ message: "New user created ", userdetail: newUser, token: token })

    } catch (err) {
        console.log("Error in postAddUser:", err);

        res.status(500).json({ error: "Failed to create a new user", details: err })

    }
}

exports.getUser = async (req, res, next) => {
    try {
        const email = req.body.email
        const password = req.body.password
        const user = await User.findOne({ where: { email: email } })
        if (!user) {
            return res.status(400).json({ message: "Not a user. Kindly signup" });
        }
        console.log("users contact:: ", typeof (user.contact));

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            console.log("passowrd mismatch ", email);
            return res.status(401).json({ message: "Password is incorrect" })

        }
        const token = generateToken({ id: user.id, email: user.email, phone: user.phone })
        console.log("Existing User:", user, "Token: ", token);
        return res.status(200).json({ message: "Login successful", existinguser: user, token })
        // console.log("New user: ",newUser);

    } catch (err) {
        console.log("Error in getUser:", err);
        res.status(500).json({ error: "Failed to fetch user", details: err });
    }
}

exports.forgotPassword = async (req, res, next) => {
    try {
        const newEmail = req.body.email
        const user = await User.findOne({ where: { email: newEmail } })
        if (!user) {
            alert("Not a user. Kindly Signup")
            // return res.status(400).json({ message: "Not a user. Kindly signup" })
        }
        const userId = user.id
        const resetId=uuidv4()
        const resetPassRequest = await user.createResetPassword({
            id:resetId,
            isActive:true,
        })
        const resetLink =`http://localhost:5000/password/resetpassword/form/${resetId}`
        const sender = {
            email: 'chandrikaagarwal086@gmail.com'
        }
        const receivers = [
            {
                email: newEmail
            }
        ]
        const response=await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: "Password resetting",
            textContent: `Click on the link to reset your password: ${resetLink}`
        })
        
        console.log("Reset password mail sent:", response);
        res.status(200).json({message:"Email sent",email:newEmail,request:resetPassRequest})
    } catch (err) {
        console.log("failed to send email: ", err);
        res.status(500).json({ error: "Failed to send email", details: err });
        
    }
}

exports.checkActiveStatus = async (req, res, next) => {
    try { 
        const requestId = req.params.reqId //bcoz requestId ek object hai
        const isPresent = await ResetPassword.findOne({ where: { id: requestId } })
        if (isPresent && isPresent.isActive === true) {
            res.status(200).json({ message: "Reset password link is active", details: isPresent,active:true })
        } else {
            res.status(400).json({ message: "Reset password link is not active", details: null, active: false })
        }
    } catch (err) {
        console.log("error checking status of request: ", err);
        res.status(500).json({ error: "Failed to check status of request", details: err })
        
     }
}