const User = require('../models/user')
const { jwtAuthMiddleware, generateToken } = require('../jwtmiddleware');
const { Sequelize, Op } = require('sequelize');
const bcrypt = require('bcryptjs')


exports.postAddUser = async (req, res, next) => {

    console.log("request body!! ", req.body);

    try {
        const name = req.body.name
        const email = req.body.email
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
            password: hashedPassword
        })
        const token = generateToken({ id: newUser.id, email: newUser.email })
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

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            console.log("passowrd mismatch ", email);
            return res.status(401).json({ message: "Password is incorrect" })

        }
        const token = generateToken({ id: user.id, email: user.email })
        console.log("Existing User:", user, "Token: ", token);
        return res.status(200).json({ message: "Login successful", existinguser: user, token })
        // console.log("New user: ",newUser);

    } catch (err) {
        console.log("Error in getUser:", err);
        res.status(500).json({ error: "Failed to fetch user", details: err });
    }
}