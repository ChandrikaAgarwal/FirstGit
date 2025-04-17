const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')
const RecipeCollection = sequelize.define('recipecollect', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey:true
    },
    collectionName: {
        type: Sequelize.STRING,
        allowNull:false
    }

},{timestamps:true})

module.exports = RecipeCollection;