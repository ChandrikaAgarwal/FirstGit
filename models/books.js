const mongoose=require('mongoose')
const Schema = mongoose.Schema
const bookSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    location: {
        type: String,
        contentType:String,
        required: true
    },
    bookImg: {
        type: [String],
        required:false
    },
    status: {
        type: String,
        default: "available",
        required:false
    },
    experience: {
        type: String,
        required:false
    },
    price: {
        type: Number,
        required:true
    },
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    }
},{timestamps:true})

module.exports=mongoose.model("Book",bookSchema)