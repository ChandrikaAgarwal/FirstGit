const User = require('../models/users')
const Message=require('../models/messages')
const sequelize = require('../util/database')
const { Sequelize, Op } = require('sequelize')

exports.postAddMsg = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { message } = req.body
        const newMsg = await user.createMessage({
            name:user.name,
            message,
        })
        return res.status(200).json({message:"Message send",username:user.name,newMsg})
    } catch (err) {
        console.log("error sending Message: ", err);
        return res.status(500).json({message:"Error sending message",details:err})
    }
}

exports.getAllMsgs = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({message:"User not found"})
        }
        const allMsgs = await Message.findAll({
            attributes: ["userId","name","message"],
            order:[["id","ASC"]]
        })
        console.log("all messages: ", allMsgs);
        return res.status(200).json({message:"getting all messages ",allMsgs, currUser:user.id})
        
    } catch (err) {
        console.log("error in getting all messages: ", err);
        return res.status(500).json({message:"Error occurred in getting all messages"})
        
    }
}