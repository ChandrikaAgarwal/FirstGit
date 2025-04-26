const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')
const FollowUsers = sequelize.define('followers', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    followingId: {
        type: Sequelize.INTEGER,
        allowNull:false
    },
    followingName: {
        type: Sequelize.STRING,
        allowNull:false
    },
    followerId: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
}, { timestamps: true })

module.exports = FollowUsers;