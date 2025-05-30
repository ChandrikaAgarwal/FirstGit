const Book = require('../models/books')
const User=require('../models/users')
const mongoose = require('mongoose')
const message = require('../models/message')
const Followers = require('../models/followUsers')
const Ratings=require('../models/ratings')

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

const sellerRating = async (req, res) => {
    try { 
        let { starRating, totalRating, sellerId, comment } = req.body
        const userId = new mongoose.Types.ObjectId(req.user.id)
        sellerId = new mongoose.Types.ObjectId(sellerId)
        const user=await User.findById(userId)
        const seller=await User.findById(sellerId)
        const existingRating = await Ratings.findOne({
            userId,
            sellerId
        })
           
        if (existingRating) {
            return res.status(400).json({ message: "You have already rated this seller once" })
        }
        const newRating = new Ratings({
            userId: userId,
            userName: user.name,
            sellerId: sellerId,
            sellerName: seller.name,
            rating: starRating,
            comment
        })
        await newRating.save()
        const totalRatings = await Ratings.countDocuments({
            sellerId
        })
       
        const avgResult = await Ratings.aggregate([
            {
                $group: {
                    _id: sellerId,
                    avgValue:{$avg:'$rating'}
                }
            }
        ])
        console.log(`Average value: ${avgResult[0].avgValue}`);
        console.log("total Ratings: ", totalRatings);
        const updatedUser = await User.findByIdAndUpdate(
            {_id: sellerId } ,
            {
                avgRating: avgResult[0].avgValue,
                totalRating:totalRatings
            },
            { new: true }
        )
        return res.status(200).json({message:"Rating: ",newRating,totalRatings,updatedUser})
    } catch (err) {
        console.log("Error generating a rating for seller : ", err);
        return res.status(500).json({ message: "Error generating a rating for seller: ", details: err })
    }
}
module.exports={
    getAllSellers,
    followSeller,
    sellerRating
}