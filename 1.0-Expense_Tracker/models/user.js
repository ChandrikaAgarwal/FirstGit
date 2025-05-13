const mongoose = require('mongoose') //this is sequelize constructor or class
const Schema = mongoose.Schema //this is the sequelize object
const userSchema = new Schema({
    name: {
        type: String,
        required:true,
    },
    email: {
        type: String,
        required:true,
        unique: true
    },

    password: {
        type: String,
        required:true
    },
    phone: {
        type: String,
        required:true
    },
    totalExpense: {
        type: Number,
        default: 0
    },
    premium: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default:Date.now()
    }
});

module.exports = mongoose.model('User',userSchema);