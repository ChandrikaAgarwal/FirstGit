const Book = require('../models/books')
const User=require('../models/users')
const mongoose = require('mongoose')
const message = require('../models/message')
const Followers = require('../models/followUsers')


const followSeller = async (req, res) => {
    try {
        let { followingId, followingName } = req.body
        followingId = new mongoose.Types.ObjectId(followingId)
        const userId = new mongoose.Types.ObjectId(req.user.id)
        const followingUser = await User.findById(followingId)
        const followerUser = await User.findById(userId)
        const newFollower = new Followers({
            followingId,
            followingName: followingUser.name,
            followerId: userId,
            followerName: followerUser.name
        })
        await newFollower.save()
        return res.status(200).json({ message: "new follower: ", newFollower })
    } catch (err) {
        console.log("Error creating a new follower", err);
        res.status(500).json({ error: "Error creating a new follower", details: err });

    }
}
const getAllSellers = async (req, res) => {
    try {
        let sellerIds = await Book.distinct('sellerId')
        let allSellers = await User.find({ _id: { $in: sellerIds } })
        let currentUser = new mongoose.Types.ObjectId(req.user.id)
        
        const following = await Followers.find({
            followerId:currentUser
        })
        return res.status(200).json({ message: "Sellers list", allSellers, currentUser,following })

    } catch (err) {
        console.log("Error getting all sellers : ", err);
        return res.status(500).json({ message: "Error fetching all sellers: ", details: err })

    }
}
module.exports={
    getAllSellers,
    followSeller
}