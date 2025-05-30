const mongoose=require('mongoose')
const Schema = mongoose.Schema

const ratingSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        ref: "User",
        required:true
    },
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerName: {
        type: String,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required:true
    },
    comment: {
        type: String,
        required:false
    }
}, { timestamps: true })

module.exports=mongoose.model("Ratings",ratingSchema)