const { Sequelize } = require('sequelize')
const sequelize=require('../util/database')
const Collection = sequelize.define('collection', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull:false
    },
    collectionName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdby: {
        type: Sequelize.INTEGER, 
        allowNull: false
    },
    creatorname: {
        type: Sequelize.STRING,
        allowNull:false
    },
    shared: {
        type: Sequelize.STRING,
        allowNull: false
    }
}, { timestamps: true })

module.exports=Collection