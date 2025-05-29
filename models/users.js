const mongoose=require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    avgRating: {
        type: mongoose.Schema.Types.Decimal128,
        default: 0.0,
        required:true
    },
}, { timestamps: true })

module.exports=mongoose.model('User',userSchema)