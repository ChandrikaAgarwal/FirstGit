const { Sequelize } = require('sequelize')
const sequelize=require('../util/database')
const Message = sequelize.define('message', {
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

}, { timestamps: true })
module.exports = Message;