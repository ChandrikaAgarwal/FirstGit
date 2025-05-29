const mongoose=require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
    recieverId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    recieverName: {
        type: String,
        required: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required:true
    },
    bookId: {
        type: Schema.Types.ObjectId,
        ref: 'Book',
        required:true
    },
    bookName: {
        type: String,
        ref: 'Book',
        required:true
    }
}, { timestamps: true })

module.exports=mongoose.model('Message',messageSchema)