const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')
const Groupmessage = sequelize.define('groupmessage', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    message: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

}, { timestamps: true })
module.exports = Groupmessage;