const mongoose = require('mongoose')
const Schema=mongoose.Schema

const expenseSchema=new Schema({
    amount: {
        type:Number,
        required:true
    },
    description: {
        type: String,
        required:true
    },
    category: {
        type: String,
        required:true
    },
    currentsaving: {
        type: Number,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }

});

module.exports = mongoose.model('Expense',expenseSchema);