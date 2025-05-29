const mongoose=require("mongoose")
const Schema = mongoose.Schema
const followSchema = new Schema({
    followingId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    followingName: {
        type: String,
        required:true
    },
    followerId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    followerName: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports=mongoose.model('Followers',followSchema)