const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new Schema( {
    order_id: {
        type: String,
        required: false,
        unique: true
    },
    customer_email: {
        type: String,
        required: false,
    },
    order_status: {
        type:String, // ENUM for order status
        required: false
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

module.exports = mongoose.model('Order',OrderSchema);