const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')
const Income = sequelize.define('income', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    amount: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true
    },
    totalsaving: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
}, { timestamps: true }) // automatically adds `createdAt` and `updatedAt

module.exports = Income;