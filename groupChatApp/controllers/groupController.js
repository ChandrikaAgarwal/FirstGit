const User = require('../models/users')
const Usergroup = require('../models/userGroup')
const Group = require('../models/groups')
const { Op } = require('sequelize')

exports.createGroup = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { grpName, users } = req.body
        console.log(grpName, users);
        const newGrp = await Group.create({
            name: grpName,
            createdby:user.id
        })
        //Add the creator (yourself) to the group
        await user.addGroup(newGrp, { through: { groupname: grpName, isLoggedIn: 0, username: user.name } })
        
        await Promise.all(users.map(async (u) => {
            const member = await User.findByPk(u.id)
            if (member) {
                await member.addGroup(newGrp, { through: { groupname: grpName,isLoggedIn:0,username:member.name } })
            }
        }));
             
        req.app.get('wss').clients.forEach(client => {
            if (client.readyState === require('ws').OPEN) {
                console.log("group client: ", client);
                console.log("ckient user id: ",client.userId);
                if (users.some(u => parseInt(u.id) === client.userId)) {
                    console.log("entering if of websocket");
                    client.send(JSON.stringify({
                        event: 'new-group',
                        groupId: newGrp.id,
                        groupname: grpName,
                        admin: user.name,
                        members: users
                    }));
                }
            }
        });
        return res.status(200).json({message:"new group created",newGrp})
    } catch (err) {
        console.log("error creating a group",err);
        return res.status(500).json({message:"Error creating a new group ",details:err})
        
    }
}

exports.getGroups = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const groups = await Usergroup.findAll({
            where: {
                userId: user.id
            },
        })

        
        return res.status(200).json({message:"you are a part of these groups",groups})
    } catch (err) {
        console.log("error getting groups", err);
        return res.status(500).json({ message: "Error getting groups", details: err })
    }
}

exports.getUsersofGroup = async (req, res, next) => {
    const { groupId } = req.params
    try { 
        const user = await User.findByPk(req.user.id)
        if (!user) { 
            return res.status(404).json({ message: "User not found" })
        }
        const group = await Group.findByPk(groupId)
        if (!group) { 
            return res.status(404).json({ message: "Group not found" })
        }
        let allusersofGrp = await Usergroup.findAll({
            where: {
                groupId: groupId
            },
            attributes:["userId"]
        })
        console.log("all users of group: ",allusersofGrp);
        
        const joinedUser = await Usergroup.findOne({
            where: {
                groupId: groupId,
                userId: user.id
            },
        })
        joinedUser.isLoggedIn = true
        joinedUser.save()
        console.log("joined user: ",joinedUser);
        console.log("req.app.get('wss')", req.app.get('wss'));
        console.log("req.app.get('wss').clients: ", req.app.get('wss').clients);

        req.app.get('wss').clients.forEach(client => {
            if (client.readyState === require('ws').OPEN) {
                console.log("client user id: ", client.userId);
                if (allusersofGrp.some(u => parseInt(u.userId) === client.userId)) {
                    console.log("Sending groupmember-joined event...")
                    client.send(JSON.stringify({
                        event: 'groupmember-joined',
                        userId: user.id,
                        name: user.name,
                        groupId: groupId
                    }));
                }
            }
        });
        return res.status(200).json({ message: "User logged in",joinedUser})
    } catch (err) {
        console.log("error getting users of group", err);
        return res.status(500).json({ message: "Error getting users of group", details: err })
    }
}

exports.getAllLoggedInusers = async (req, res, next) => {
    try { 
        const { groupId } = req.params
            const user = await User.findByPk(req.user.id)
            if (!user) {
                return res.status(404).json({ message: "User not found" })
            }
        const loggedInMembers = await Usergroup.findAll({
            where: {
                groupId: groupId,
                isLoggedIn: true
            },
            attributes:["userId","username"]
        })
        console.log("loggedInMembers ", loggedInMembers);
        return res.status(200).json({ message: "All group members ", currentUser:user.id,loggedInMembers})
        } catch (err) {
        console.log("Error getting logged in users of group: ",err);
        return res.status(500).json({ message: "Error getting loggedin users of group", details: err })
    }
}

exports.searchUsers = async (req, res, next) => {
    try {
        const { searchQ } = req.query
        const { groupId } = req.params
        const user = await User.findByPk(req.user.id)
        if (!user) { 
            return res.status(404).json({ message: "User not found" })
        }
        const group = await Group.findByPk(groupId)
        if (!group) { 
            return res.status(404).json({ message: "Group not found" })
        }
        if (user.id !== group.createdby) {
            return res.status(403).json({ message: "You are not the admin"})
        }
        const matchedUsers = await User.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${searchQ}%` } },
                    { email: { [Op.like]: `%${searchQ}%` } },
                    {phone:{[Op.like]:`%${searchQ}%`}}
                ]
            },
            attributes: ['id', 'name', 'email', 'phone'],
        })
        console.log("mathedUsers: ",matchedUsers);
        
        const groupMembers = await Usergroup.findAll({
            where: { groupId },
            attributes: ['userId']
        });
        const memberIds = groupMembers.map(member => member.userId);
        console.log("memberIds: ",memberIds);
        
        const usersNotInGroup = matchedUsers.filter(user => !memberIds.includes(user.id));
        console.log("usersNot in group: ",usersNotInGroup);
        
        // res.status(200).json({ users: usersNotInGroup });
        res.status(200).json({ users: matchedUsers });
    } catch (err) {
        console.log("Error searching users: ", err);
    }
}

exports.addNewMember = async (req, res, next) => {
    try { 
        const { groupId } = req.params
        const user = await User.findByPk(req.user.id)
        let addNewMember;
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const group = await Group.findByPk(groupId)
        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }
        const { inputVal, inputId } = req.body
        const existingMember = await Usergroup.findOne({
            where: {
                groupId: groupId,
                userId:inputId
            }
        })
        if (!existingMember) {
            addNewMember = await Usergroup.create({
                groupname: group.name,
                username: inputVal,
                userId: inputId,
                groupId
            })
            req.app.get('wss').clients.forEach(client => {
                if (client.readyState === require('ws').OPEN) {
                    console.log("group client: ", client);
                    console.log("client user id: ", client.userId);
                    if (parseInt(inputId) === client.userId) {
                        console.log("entering if of websocket");
                        client.send(JSON.stringify({
                            event: 'new-member',
                            groupId: groupId,
                            groupname: group.name,
                            admin: user.name,
                            memberId: inputId
                        }));
                    }
                }
            });
            console.log("new member added: ", addNewMember);
            return res.status(200).json({ message: "new member added to the group ", addNewMember })
        } else {
            console.log("user alredy exists");
            return res.status(500).json({ message: "Member already exists" })
        }
       
    } catch (err) {
        console.log("error adding new member to the group: ", err);
        return res.status(500).json({message:"error adding the new member to group",details:err})
        
    }
}

exports.deleteMember = async (req, res, next) => {
    try {
        const { groupId } = req.params
        const {userId}=req.query
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const group = await Group.findByPk(groupId)
        if (!group) {
            return res.status(404).json({ message: "Group not found" })
        }
        
        const existingMember = await Usergroup.findOne({
            where: {
                groupId: groupId,
                userId
            }
        })
        if (existingMember) {
            await existingMember.destroy()
            console.log("member deleted");
            return res.status(200).json({ message: "member removed from the group ", existingMember })
        } else {
            console.log("member not found");
            return res.status(500).json({ message: "Member does not exist" })
        }
    } catch (err) {
        console.log("error removing member from the group: ", err);
        return res.status(500).json({ message: "error removing member from group", details: err })

    }
}