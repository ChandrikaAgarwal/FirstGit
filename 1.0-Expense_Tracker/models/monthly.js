const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')

const Month = sequelize.define('month', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    monthNum: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    year: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    totalIncome: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    totalExpense: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    carryForward: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    balance: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
},{ timestamps: true })

module.exports = Month;