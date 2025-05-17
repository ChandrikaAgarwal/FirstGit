const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MonthSchema = new Schema({
    monthNum: {
        type: Number,
        required: false
    },
    year: {
        type: Number,
        required: false
    },
    totalIncome: {
        type: Number,
        required: false
    },
    totalExpense: {
        type: Number,
        required: false
    },
    carryForward: {
        type: Number,
        required: false
    },
    balance: {
        type: Number,
        required: false
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

module.exports = mongoose.model('Month',MonthSchema);