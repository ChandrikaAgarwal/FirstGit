const {Sequelize}=require('sequelize')
const sequelize = require('../util/database')

const FileUrl = sequelize.define('fileurl', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    url: {
        type:Sequelize.STRING(255)
    },
},{timestamps:true})

module.exports = FileUrl;
