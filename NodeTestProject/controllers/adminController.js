const { Sequelize } = require('sequelize')
const User = require('../models/users')
const Recipe = require('../models/recipes')
const DeletedRecipes = require('../models/adminDeletedRec')
const UserControls = require('../models/adminUserControl')
const Admin = require('../models/admin');
const bcrypt = require('bcrypt')
const { generateToken } = require('../jwtmiddleware')
exports.makeAdmin = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        if (user.isAdmin === false) {
            return res.status(500).json({ message: "you are not authorized to be an admin" })
        }
        const existingAdmin = await Admin.findOne({
            where: {
                userId:user.id
            }
        })

        const { email, password } = req.body
        const saltRounds = 10
        const hashedPassword = await bcrypt.hash(password, saltRounds)
        if (existingAdmin) {
            existingAdmin.email = email
            existingAdmin.password = hashedPassword
            existingAdmin.save()
            return res.status(200).json({ message: "Your Admin credentials are reset" })
        } else {
            const newAdmin = await Admin.create({
                name: user.name,
                email,
                password: hashedPassword,
                userId: user.id
            })
            return res.status(200).json({ message: "Admin credentials are set", newAdmin })
        }
    } catch (err) {
        console.log("error setting admin credentials ", err);
        return res.status(500).json({ message: "error setting admin credentials", details: err })

    }
}
exports.loginAdmin = async (req, res, next) => {
    try {
        const { email, password, role } = req.body
        const existingAdmin = await Admin.findOne({ where: { email: email } })
        if (!existingAdmin) {
            return res.status(404).json({ message: "Admin not found" })
        }
        const isValid = await bcrypt.compare(password, existingAdmin.password)
        if (!isValid) {
         return res.status(401).json({message:"Incorrect password"})
        }
        const token = generateToken(existingAdmin)
        return res.status(200).json({ message: "Login successful", token })
        
    } catch (err) {
        console.log("error while getting admin: ", err);
        res.status(500).json({ message: "Failed to log in", details: err })
    }
}
exports.countUsersRecipes = async (req, res) => {
    try {
        const user = await Admin.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({message:"User not found"})
        }
        const allUsers = await User.findAll({
            attributes: [
                [Sequelize.fn('COUNT', Sequelize.col('id')), 'totalusers']
            ],
            raw:true
        })

        const allRecipes = await Recipe.findAll({
            where: {
              isDeleted:false  
            },
            attributes: [
                [Sequelize.fn('COUNT',Sequelize.col('id')),'totalRecipes']
            ],
            raw:true
        })
        let totalUsers = allUsers[0].totalusers
        let totalRecipes = allRecipes[0].totalRecipes
        return res.status(200).json({message:"All users and recipes: ",totalRecipes,totalUsers})
    } catch {
        console.log("error getting total users and recipes: ",err);
        return res.status(500).json({message:"error getting all users qand recipes", details:err})
    }
}
exports.getAllRecipes = async (req, res, next) => {
    try {
        const user = await Admin.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "Admin not found" })
        }
        const recipes = await Recipe.findAll({
            // where: {
            //     userId: { [Op.not]: user.id }
            // },
        })
        return res.status(200).json({ message: "All recipes: ", recipes, user })
    } catch (err) {
        console.log("error fetching all recipes: ", err);
        return res.status(500).json({ message: "Error fetching all recipes" })
    }
}
exports.deleteRecipe = async (req, res) => {
    try {
        const user=await Admin.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({message:"Admin not found"})
        }
        let { reason, recipeId } = req.body.recipe
        recipeId=parseInt(recipeId)
        const recipetoDel = await Recipe.findByPk(recipeId)
        console.log("recipetoDel: ", recipetoDel);
        recipetoDel.isDeleted=true
        await recipetoDel.save()
        let newDeletedRec = await DeletedRecipes.create({
            recipeId,
            creatorId: recipetoDel.userId,
            deletedBy: user.id,
            reason
        })
        return res.status(200).json({message:"recipe deleted successfully",newDeletedRec})
    } catch (err) {
        console.log("error deleting a recipe: ",err);
        return res.status(500).json({ message: "error deleting recipes", details: err })
    }
}

exports.getAuthors = async (req, res, next) => {
    try {
        const user = await Admin.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "Admin not found" })
        }
        const allAuthors = await User.findAll({
            // where: {
            //     id: { [Op.not]: user.id }
            // }
        })
        
        return res.status(200).json({ message: "All authors: ", allAuthors })
    } catch (err) {
        console.log("error getting all authors: ", err);
        return res.status(500).json({ message: "Error getting all authors: ", details: err })

    }
}
exports.actionOnUser = async (req, res) => {
    try {
        const user = await Admin.findByPk(req.user.id)
        let actionTaken
        if (!user) {
            return res.status(404).json({ message: "Admin not found" })
        }
        const { reason, control, userid } = req.body
        console.log("request body: ", req.body);
        let userId=parseInt(userid)
        const targetUser = await User.findByPk(userId)
        if (!reason && control === 'make-admin') {
            if (targetUser) {
                if (targetUser.isAdmin !== true && targetUser.isBanned===false) {
                    targetUser.isAdmin = true
                    await targetUser.save()
                } else {
                    if (!targetUser) {
                        return res.status(404).json({ message: "User not found" })
                    } else if (targetUser.isAdmin === true) {
                        return res.status(500).json({ message: "User is already an admin" })
                    }
                }
            }
        } else if (control === 'ban-author') {
            if (targetUser) {
                targetUser.isBanned = true
                await targetUser.save()
            } else if (!targetUser) {
                return res.status(404).json({ message: "User not found" })
            } else if (targetUser.isBanned === true) {
                return res.status(500).json({ message: "User is already banned" })
            }
            actionTaken = await UserControls.create({
                userId,
                adminId: user.id,
                action: control,
                reason
            })
        } else {
            if (targetUser) {
               await targetUser.destroy()
            } else if (!targetUser) {
                return res.status(404).json({ message: "User not found" })
            }
            actionTaken = await UserControls.create({
                userId,
                adminId: user.id,
                action: control,
                reason
            })
        }
        

        return res.status(200).json({ message: "action taken successfully"})
    } catch (err) {
        console.log("error in taking action on user: ", err);
        return res.status(500).json({ message:"error in taking action on user",details:err })
        
    }
}