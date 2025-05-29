const mongoose=require('mongoose')
const Schema = mongoose.Schema
const interestSchema = new Schema({
    sellerEmail: {
        type: String,
        required:true
    },
    sellerName: {
        type: String,
        required: true
    },
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required:true
    },
    buyerName: {
        type: String,
        required: true
    },
    buyerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bookId: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    bookTitle: {
        type: String,
        ref: 'Book',
        required:true
    }
}, { timestamps: true })

module.exports=mongoose.model('Interest',interestSchema)