const User = require('../models/users')
const Message = require('../models/messages')
const Groupmessage=require('../models/groupmessages')
const sequelize = require('../util/database')
const { Sequelize, Op } = require('sequelize')
const Group = require('../models/groups')
const Usergroup = require('../models/userGroup')
const archivedChats = require('../models/archivedmessages')
const cron=require('node-cron')


exports.postAddMsg = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        console.log("user: ",user);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { message } = req.body
        const newMsg = await user.createMessage({
            name:user.name,
            message,
        })
        req.app.get('wss').clients.forEach(client => {
            if (client.readyState === require('ws').OPEN) {
                console.log("client: ",client);
                
                client.send(JSON.stringify({
                    event: 'new-message',
                    message: message,
                    msgId:newMsg.id,
                    name: user.name,
                    userId: newMsg.userId,
                }));
            }
        });
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
            // where: {
            //     // id:{[Op.not]:user.id}
            //     id: user.id
            // },
            attributes: ["id","userId","name","message"],
            order:[["id","ASC"]]
        })
        console.log("all messages: ", allMsgs);
        
        return res.status(200).json({message:"getting all messages ",allMsgs, currUser:user.id})
        
    } catch (err) {
        console.log("error in getting all messages: ", err);
        return res.status(500).json({message:"Error occurred in getting all messages"})
        
    }
}

exports.getNewMsg = async (req, res, next) => {
    try { 
        const user = await User.findByPk(req.user.id)
        if (!user) { 
            return res.status(404).json({message:"No user found"})
        }
        const newMsg = await Message.findOne({
            where: {
                userId:{[Op.not]:user.id}
            },
            order: [["id", "DESC"]],
            limit:1
        })
        return res.status(200).json({message:"New message received",newMsg})
    } catch (err) {
        console.log("error in getting new message ", err);
        return res.status(500).json({message:"Error occurred in getting new message",details:err})
        
    }
}

exports.createGrpMsg = async (req, res, next) => {
    try {
        const { groupId } = req.params
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "No user found" })
        }
        const group = await Group.findByPk(groupId)
        if (!group) {
            return res.status(404).json({message:"group not found"})
        }
        const { message } = req.body
        const usersofGrp = await Usergroup.findAll({
            where: {
                groupId: groupId
            }
        })
        const newgrpMsg = await group.createGroupmessage({
            name: user.name,
            message: message,
            userId: user.id
        })
        req.app.get('wss').clients.forEach(client => {
            if (client.readyState === require('ws').OPEN) {
                console.log("group client: ", client);
                console.log("client user id in group message: ", client.userId);
                if (usersofGrp.some(u => parseInt(u.userId) === client.userId)) {
                    console.log("entering if of websocket");
                    client.send(JSON.stringify({
                        event: 'new-group-msg',
                        message: message,
                        msgId: newgrpMsg.id,
                        name: newgrpMsg.name,
                        userId: newgrpMsg.userId,
                        groupId: newgrpMsg.groupId
                    }));
                }
            }
        });
        return res.status(200).json({message:"new message received in group ",newgrpMsg})
    } catch (err) {
        console.log("error in creating new message ", err);
        return res.status(500).json({ message: "Error occurred in creating new message", details: err })
    }
}

exports.getAllGroupMsgs = async (req, res, next) => {
    try {
        console.log("entering getAllGroupMsgs function");
        
        const { groupId } = req.params
        console.log("groupId: ",groupId);
        
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const allMsgs = await Groupmessage.findAll({
            where: {
                // id:{[Op.not]:user.id}
                groupId:groupId
            },
            // attributes: ["id", "userId", "name", "message"],
            // order: [["id", "ASC"]]
        })
        console.log("all groupmessages: ", allMsgs);
        
        return res.status(200).json({ message: "getting all groupmessages ", allMsgs, currUser: user.id })

    } catch (err) {
        console.log("error in getting all groupmessages: ", err);
        return res.status(500).json({ message: "Error occurred in getting all groupmessages" })

    }
}

cron.schedule("0 0 * * *", async () => {

    const yesterDay = new Date();
    yesterDay.setDate(yesterDay.getDate() - 1);
    const oldMessages = await Groupmessage.findAll({
        where: {
            createdAt: {
                [Op.gt]: new Date(yesterDay.setHours(0, 0, 0, 0)),
                [Op.lt]: new Date(yesterDay.setHours(23, 59, 0, 0)),
            }
        }
    })
    console.log("old messages: ", oldMessages);

    oldMessages.forEach(async (oldmsg) => {
        console.log("oldmsg: ", oldmsg);
        const exists = await archivedChats.findOne({
            where: { message: oldmsg.message, userId: oldmsg.userId, groupId: oldmsg.groupId }
        });
        if (!exists) {
            const newarchivemsg = await archivedChats.create({
                name: oldmsg.name,
                message: oldmsg.message,
                userId: oldmsg.userId,
                groupId: oldmsg.groupId,
            })

            if (newarchivemsg) {
                console.log("destroying old message");
                
                await oldmsg.destroy()
            }
        }    
    })
    console.log("Archiving done for yesterday's messages");
})