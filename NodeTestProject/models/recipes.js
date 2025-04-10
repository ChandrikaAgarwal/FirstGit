const { Sequelize } = require('sequelize')
const sequelize = require('../util/database')
const Recipe = sequelize.define('recipe', {
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
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    ingredients: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    method: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    cuisine: {
        type: Sequelize.STRING,
        allowNull: false
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },
    cookingTime: {
        type: Sequelize.STRING,
        allowNull: false
    },
    marinationTime: {
        type: Sequelize.STRING,
        allowNull: false
    },
    serves: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    mainingrediant: {
        type: Sequelize.STRING,
        allowNull: false
    },
    recipetype: {
        type: Sequelize.STRING,
       allowNull:false 
    },
    recipeImg: {
        type: Sequelize.JSON,
        allowNull: true
    }

}, { timestamps: true })

module.exports = Recipe;