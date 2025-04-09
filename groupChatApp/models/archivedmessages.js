const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')
const archivedChats = sequelize.define('archivedchat', {
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
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, { timestamps: true })
module.exports = archivedChats;