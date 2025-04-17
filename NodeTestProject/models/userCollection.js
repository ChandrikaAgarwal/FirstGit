const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')
const Usercollection = sequelize.define('usercollection', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    }, 
    collectionName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, { timestamps: true })

module.exports = Usercollection;