const mongoose = require('mongoose') 
const Schema = mongoose.Schema
const forgotPassReqSchema = new Schema({
    isActive: {
        type: Boolean,
        default: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('resetPassword',forgotPassReqSchema);