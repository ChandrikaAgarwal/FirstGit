const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')

const Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    order_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
    },
    customer_email: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    order_status: {
        type: Sequelize.STRING, // ENUM for order status
        allowNull: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, {
    timestamps: true
})

module.exports = Order;