const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')
const UserControls = sequelize.define('usercontrol', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull:false
    },
    adminId: {
        type: Sequelize.INTEGER,
        allowNull:false
    },
    action: {
        type: Sequelize.STRING,
        allowNull:false
    },
    reason: {
        type: Sequelize.TEXT,
        allowNull:false
    },
}, { timestamps: true })

module.exports = UserControls;