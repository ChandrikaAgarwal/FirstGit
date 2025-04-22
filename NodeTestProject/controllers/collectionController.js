const Collection = require('../models/collections');
const Usercollection = require('../models/userCollection');
const Recipe = require('../models/recipes')
const User = require('../models/users')
const { Sequelize, Op } = require('sequelize');


exports.newCollection = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { cName, share, members } = req.body
        const newCollection = await Collection.create({
            collectionName: cName,
            createdby: user.id,
            creatorname: user.name,
            shared: share
        })
        await user.addCollection(newCollection, {
            through: {
                collectionName: cName,
                username: user.name
            }
        })
        await Promise.all(members.map(async (m) => {
            const member = await User.findByPk(m.id)
            if (member) {
                await member.addCollection(newCollection, {
                    through: {
                        collectionName: cName,
                        username: member.name
                    }
                })
            }
        }))
        return res.status(200).json({ message: "new collection", newCollection })

    } catch (err) {
        console.log("error creating a new collection: ", err);
        return res.status(500).json({ message: "error in creating a new collection:", details: err })

    }
}

exports.getMyCollections = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        let mycollections = await Usercollection.findAll({
            where: {
                userId: user.id
            },
        })
        console.log("my collections: ", mycollections);
        return res.status(200).json({ message: "my collection", mycollections })
    } catch (err) {
        console.log("error getting your collections: ", err);
        return res.status(500).json({ message: "error in getting your collections:", details: err })

    }
}

exports.getRecipesInCollection = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const { collectionId } = req.params
        const recipesinCollection = await Collection.findAll({
            where: {
                id: collectionId
            },
            include: Recipe
        })
        console.log("recipes in collection: ", recipesinCollection);
        res.status(200).json({ message: "All recipes in the collection: ", recipesinCollection })
    } catch (err) {
        console.log("error getting your recipes in collections:", err);

        return res.status(500).json({ message: "error in getting your recipes in collections:", details: err })
    }
}