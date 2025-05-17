const mongoose=require('mongoose')
const Schema=mongoose.Schema
const IncomeSchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    description: {
        type:String,
        required: true
    },
    totalsaving: {
        type: Number,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Income',IncomeSchema)