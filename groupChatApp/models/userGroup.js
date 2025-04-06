const {Sequelize}=require('sequelize')
const sequelize=require('../util/database')

const Usergroup = sequelize.define('usergroup', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    groupname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    isLoggedIn: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
    },
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
}, { timestamps: true })

module.exports = Usergroup;